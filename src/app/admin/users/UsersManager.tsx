'use client';

import React, { useState } from 'react';
import { Search, Trash2, Check, X, Mail, Phone, Package } from 'lucide-react';

type Order = {
  id: string;
  razorpay_payment_id: string;
  total: number;
  status: string;
  items: { name: string; price: number; quantity: number }[];
  created_at: string;
};

type UserRow = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  created_at: string;
  orders: Order[];
  orderCount: number;
  totalSpent: number;
};

const STATUS_COLORS: Record<string, string> = {
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  shipped: 'bg-purple-100 text-purple-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function UsersManager({ initialUsers }: { initialUsers: UserRow[] }) {
  const [users, setUsers] = useState<UserRow[]>(initialUsers);
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch('/api/admin/delete-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: id }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error ?? 'Failed to delete user');
        return;
      }
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } finally {
      setDeletingId(null);
      setDeleteConfirm(null);
    }
  };

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (u.name ?? '').toLowerCase().includes(q) || (u.email ?? '').toLowerCase().includes(q) || (u.phone ?? '').includes(q);
  });

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-4 border-b">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-12">No users yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Orders</th>
                <th className="px-4 py-3 font-medium">Total Spent</th>
                <th className="px-4 py-3 font-medium">Signed Up</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((u) => (
                <React.Fragment key={u.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{u.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">
                      {u.email && <p className="flex items-center gap-1.5 text-xs"><Mail className="w-3.5 h-3.5" />{u.email}</p>}
                      {u.phone && <p className="flex items-center gap-1.5 text-xs mt-1"><Phone className="w-3.5 h-3.5" />{u.phone}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-block px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {u.orderCount} order{u.orderCount !== 1 ? 's' : ''}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-800">₹{u.totalSpent.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(u.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {u.orders.length > 0 && (
                          <button onClick={() => setExpanded(expanded === u.id ? null : u.id)} className="text-blue-600 hover:underline text-xs whitespace-nowrap">
                            {expanded === u.id ? 'Hide' : 'Details'}
                          </button>
                        )}
                        {deleteConfirm === u.id ? (
                          <div className="flex items-center gap-1">
                            <button onClick={() => handleDelete(u.id)} disabled={deletingId === u.id}
                              className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-50">
                              <Check className="w-4 h-4" />
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-1.5 rounded hover:bg-gray-100 text-gray-600">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setDeleteConfirm(u.id)} className="p-1.5 rounded hover:bg-red-50 text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expanded === u.id && (
                    <tr className="bg-blue-50">
                      <td colSpan={6} className="px-4 py-4">
                        <p className="font-medium mb-3 flex items-center gap-2 text-gray-800"><Package className="w-4 h-4" /> Order History</p>
                        <div className="space-y-2">
                          {u.orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-lg p-3 flex items-center justify-between text-sm">
                              <div>
                                <p className="font-mono text-xs text-gray-500">{order.razorpay_payment_id}</p>
                                <p className="text-xs text-gray-600 mt-0.5">
                                  {order.items.map((it) => `${it.name} ×${it.quantity}`).join(', ')}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {new Date(order.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  {' · '}
                                  {new Date(order.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-800">₹{Number(order.total).toFixed(2)}</p>
                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
