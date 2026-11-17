import React, { useEffect, useMemo, useState } from 'react';
import './AdminPage.css';

const STATUSES = [
  ['new', 'New'],
  ['confirmed', 'Confirmed'],
  ['processing', 'Processing'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
  ['cancelled', 'Cancelled']
];

async function readResponse(response) {
  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error('The server returned an invalid response.');
  }
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed (${response.status}).`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    credentials: 'same-origin',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  });
  return readResponse(response);
}

function formatPrice(amount) {
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(value));
}

function OrderCard({ order, onSave }) {
  const [status, setStatus] = useState(order.status);
  const [adminNote, setAdminNote] = useState(order.adminNote || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(order.status);
    setAdminNote(order.adminNote || '');
  }, [order.status, order.adminNote]);

  const save = async () => {
    setSaving(true);
    try {
      await onSave(order.id, { status, adminNote });
    } finally {
      setSaving(false);
    }
  };

  return (
    <article className="admin-order">
      <header className="admin-order__head">
        <div>
          <strong>#{order.id.slice(0, 8).toUpperCase()}</strong>
          <time dateTime={order.createdAt}>{formatDate(order.createdAt)}</time>
        </div>
        <span className={`admin-status admin-status--${order.status}`}>
          {STATUSES.find(([value]) => value === order.status)?.[1] || order.status}
        </span>
      </header>

      <div className="admin-order__grid">
        <section>
          <h3>Customer</h3>
          <p><b>{order.customer.name}</b></p>
          <p><a href={`tel:${order.customer.phone}`}>{order.customer.phone}</a></p>
          <p>
            {order.customer.address}, {order.customer.city} - {order.customer.pincode}
          </p>
          {order.customer.notes && <p className="admin-muted">Customer note: {order.customer.notes}</p>}
        </section>

        <section>
          <h3>Items</h3>
          <ul className="admin-order__items">
            {order.items.map((item, index) => (
              <li key={`${item.id}-${item.variant}-${index}`}>
                <span>{item.title} · {item.variant} × {item.quantity}</span>
                <b>{formatPrice(item.unitPrice * item.quantity)}</b>
              </li>
            ))}
          </ul>
          <p className="admin-order__total">
            Subtotal {formatPrice(order.subtotal)} · Delivery {order.deliveryFee ? formatPrice(order.deliveryFee) : 'Free'}
            <strong>Total {formatPrice(order.total)}</strong>
          </p>
        </section>
      </div>

      <div className="admin-order__manage">
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {STATUSES.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
        <label className="admin-order__note">
          Admin note
          <textarea
            value={adminNote}
            maxLength={1000}
            rows={2}
            placeholder="Internal note (not shown to customer)"
            onChange={(event) => setAdminNote(event.target.value)}
          />
        </label>
        <button type="button" className="admin-button admin-button--small" disabled={saving} onClick={save}>
          {saving ? 'Saving…' : 'Save update'}
        </button>
      </div>
    </article>
  );
}

export default function AdminPage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [adminId, setAdminId] = useState('');
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/session', { credentials: 'same-origin' })
      .then(async (response) => {
        if (response.status === 401) return { authenticated: false };
        return readResponse(response);
      })
      .then((payload) => {
        if (!active) return;
        setAuthenticated(Boolean(payload.authenticated));
        if (payload.username) setAdminId(payload.username);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) {
          setAuthenticated(false);
          setAdminId('');
          setOrders([]);
        } else {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!authenticated) return undefined;
    let active = true;
    setOrdersLoading(true);
    setError('');
    requestJson('/api/admin/orders')
      .then((payload) => {
        if (active) setOrders(payload.orders);
      })
      .catch((requestError) => {
        if (!active) return;
        if (requestError.status === 401) {
          setAuthenticated(false);
          setAdminId('');
          setOrders([]);
        } else {
          setError(requestError.message);
        }
      })
      .finally(() => {
        if (active) setOrdersLoading(false);
      });

    return () => {
      active = false;
    };
  }, [authenticated, refreshKey]);

  const filteredOrders = useMemo(() => {
    const cleanSearch = search.trim().toLowerCase();
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
      const searchable = [
        order.id,
        order.customer.name,
        order.customer.phone,
        order.customer.pincode
      ].join(' ').toLowerCase();
      return matchesStatus && (!cleanSearch || searchable.includes(cleanSearch));
    });
  }, [orders, search, statusFilter]);

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoginLoading(true);
    setError('');
    try {
      const payload = await requestJson('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      setAdminId(credentials.username);
      setCredentials({ username: '', password: '' });
      setAuthenticated(payload.authenticated);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    setError('');
    try {
      await requestJson('/api/admin/logout', { method: 'POST' });
      setAuthenticated(false);
      setOrders([]);
      setAdminId('');
    } catch (requestError) {
      if (requestError.status === 401) {
        setAuthenticated(false);
        setAdminId('');
        setOrders([]);
      } else {
        setError(requestError.message);
      }
    }
  };

  const saveOrder = async (id, changes) => {
    setError('');
    try {
      const payload = await requestJson(`/api/admin/orders/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(changes)
      });
      setOrders((current) => current.map((order) => (order.id === id ? payload.order : order)));
    } catch (requestError) {
      if (requestError.status === 401) {
        setAuthenticated(false);
        setAdminId('');
        setOrders([]);
      } else {
        setError(requestError.message);
      }
    }
  };

  const updateCredential = (event) => {
    setCredentials((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <header className="admin-topbar">
          <a className="admin-brand" href="/" aria-label="YUYK home">
            <img src="/assets/buddy-logo.svg" alt="" />
            <span>YUYK <small>Order Admin</small></span>
          </a>
          {authenticated && (
            <div className="admin-topbar__actions">
              <span>{adminId}</span>
              <button type="button" className="admin-button admin-button--quiet" onClick={handleLogout}>
                Log out
              </button>
            </div>
          )}
        </header>

        {error && <div className="admin-alert" role="alert">{error}</div>}

        {checkingSession ? (
          <div className="admin-loading" role="status">Checking admin session…</div>
        ) : !authenticated ? (
          <section className="admin-login">
            <p className="admin-eyebrow">Private access</p>
            <h1>Admin sign in</h1>
            <p>Sign in to review and manage incoming order requests.</p>
            <form onSubmit={handleLogin}>
              <label>
                Admin ID
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  required
                  value={credentials.username}
                  onChange={updateCredential}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  value={credentials.password}
                  onChange={updateCredential}
                />
              </label>
              <button type="submit" className="admin-button" disabled={loginLoading}>
                {loginLoading ? 'Signing in…' : 'Sign in'}
              </button>
            </form>
          </section>
        ) : (
          <section className="admin-dashboard">
            <div className="admin-heading">
              <div>
                <p className="admin-eyebrow">Order management</p>
                <h1>Orders</h1>
                <p>Manage WhatsApp order requests saved at checkout.</p>
              </div>
              <button
                type="button"
                className="admin-button admin-button--quiet"
                disabled={ordersLoading}
                onClick={() => setRefreshKey((key) => key + 1)}
              >
                {ordersLoading ? 'Refreshing…' : 'Refresh'}
              </button>
            </div>

            <div className="admin-stats">
              <div><span>Total requests</span><strong>{orders.length}</strong></div>
              <div><span>New</span><strong>{orders.filter((order) => order.status === 'new').length}</strong></div>
              <div><span>In progress</span><strong>{orders.filter((order) => ['confirmed', 'processing', 'shipped'].includes(order.status)).length}</strong></div>
              <div><span>Delivered</span><strong>{orders.filter((order) => order.status === 'delivered').length}</strong></div>
            </div>

            <div className="admin-filters">
              <label>
                Search
                <input
                  type="search"
                  value={search}
                  placeholder="Name, phone, pincode or order ID"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </label>
              <label>
                Status
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="all">All statuses</option>
                  {STATUSES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>

            {orders.length === 500 && (
              <p className="admin-muted">Showing the latest 500 orders.</p>
            )}
            {ordersLoading ? (
              <div className="admin-loading" role="status">Loading orders…</div>
            ) : filteredOrders.length ? (
              <div className="admin-order-list">
                {filteredOrders.map((order) => (
                  <OrderCard key={order.id} order={order} onSave={saveOrder} />
                ))}
              </div>
            ) : (
              <div className="admin-empty">
                <h2>{orders.length ? 'No matching orders' : 'No orders yet'}</h2>
                <p>{orders.length ? 'Change the search or status filter.' : 'New checkout requests will appear here.'}</p>
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
