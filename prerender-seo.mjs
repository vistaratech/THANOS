import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const rootDirectory = process.cwd();
const buildDirectory = path.join(rootDirectory, 'dist');
const template = await readFile(path.join(buildDirectory, 'index.html'), 'utf8');
const vite = await createServer({
  configFile: path.join(rootDirectory, 'vite.config.js'),
  mode: 'production',
  server: { middlewareMode: true },
  appType: 'custom'
});

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function replaceHeadTag(html, pattern, replacement, label) {
  if (!pattern.test(html)) throw new Error(`Could not find ${label} in prerender template.`);
  return html.replace(pattern, replacement);
}

function setPolicyMetadata(html, route, policy) {
  const pageUrl = `https://www.yuyk.in${route}`;
  const title = `${policy.title} — YUYK`;
  const description = policy.description;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeUrl = escapeHtml(pageUrl);

  html = replaceHeadTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${safeTitle}</title>`, 'title');
  html = replaceHeadTag(
    html,
    /<meta\s+name="description"[\s\S]*?\/>/i,
    `<meta name="description" content="${safeDescription}" />`,
    'description'
  );
  html = replaceHeadTag(
    html,
    /<link\s+rel="canonical"\s+href="[^"]+"\s*\/>/i,
    `<link rel="canonical" href="${safeUrl}" />`,
    'canonical URL'
  );
  html = replaceHeadTag(
    html,
    /<meta\s+property="og:title"[\s\S]*?\/>/i,
    `<meta property="og:title" content="${safeTitle}" />`,
    'Open Graph title'
  );
  html = replaceHeadTag(
    html,
    /<meta\s+property="og:description"[\s\S]*?\/>/i,
    `<meta property="og:description" content="${safeDescription}" />`,
    'Open Graph description'
  );
  html = replaceHeadTag(
    html,
    /<meta\s+property="og:url"[\s\S]*?\/>/i,
    `<meta property="og:url" content="${safeUrl}" />`,
    'Open Graph URL'
  );
  html = replaceHeadTag(
    html,
    /<meta\s+name="twitter:title"[\s\S]*?\/>/i,
    `<meta name="twitter:title" content="${safeTitle}" />`,
    'Twitter title'
  );
  html = replaceHeadTag(
    html,
    /<meta\s+name="twitter:description"[\s\S]*?\/>/i,
    `<meta name="twitter:description" content="${safeDescription}" />`,
    'Twitter description'
  );

  const schemaMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (!schemaMatch) throw new Error(`Could not find structured data for ${route}.`);
  const schema = JSON.parse(schemaMatch[1]);
  schema['@graph'] = schema['@graph'].filter((item) => item['@type'] !== 'Product');
  html = html.replace(
    schemaMatch[0],
    `<script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n</script>`
  );

  return html;
}

try {
  const [{ default: App }, { POLICIES }] = await Promise.all([
    vite.ssrLoadModule('/src/App.jsx'),
    vite.ssrLoadModule('/src/components/PolicyPage.jsx')
  ]);
  const routes = [
    { path: '/', initialPath: '/' },
    ...Object.entries(POLICIES).map(([key, policy]) => ({
      path: `/${key}`,
      initialPath: `/${key}`,
      policy
    }))
  ];

  for (const route of routes) {
    const markup = renderToString(React.createElement(App, { initialPath: route.initialPath }));
    let html = replaceHeadTag(
      template,
      /<div id="root"><\/div>/,
      `<div id="root">${markup}</div>`,
      'application root'
    );

    if (route.policy) {
      html = setPolicyMetadata(html, route.path, route.policy);
    }

    const outputPath = route.path === '/'
      ? path.join(buildDirectory, 'index.html')
      : path.join(buildDirectory, route.path.slice(1), 'index.html');
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, html);
  }
} finally {
  await vite.close();
}

console.log('Prerendered homepage and policy pages for search crawlers.');
