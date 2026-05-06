'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AdminRoute from '@/components/AdminRoute';
import Link from 'next/link';
import { 
  ShoppingBagIcon, 
  UserGroupIcon, 
  CurrencyBangladeshiIcon, 
  ExclamationTriangleIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading stats...</div>;

  const statCards = [
    { name: 'Total Revenue', value: `৳${stats?.total_revenue}`, icon: CurrencyBangladeshiIcon, color: 'text-green-600', bg: 'bg-green-100' },
    { name: 'Total Orders', value: stats?.total_orders, icon: ShoppingBagIcon, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Orders', value: stats?.pending_orders, icon: ExclamationTriangleIcon, color: 'text-yellow-600', bg: 'bg-yellow-100' },
    { name: 'Total Products', value: stats?.total_products, icon: ShoppingBagIcon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { name: 'Low Stock Alerts', value: stats?.low_stock_alerts, icon: ExclamationTriangleIcon, color: 'text-red-600', bg: 'bg-red-100' },
  ];

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {statCards.map((item) => (
            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg border border-gray-100">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`flex-shrink-0 rounded-md p-3 ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{item.name}</dt>
                      <dd>
                        <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <Link href="/admin/products" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 shadow-sm transition-all">
            <h3 className="text-lg font-bold text-gray-900">Manage Products</h3>
            <p className="mt-2 text-sm text-gray-500">Add, edit, or remove shoe listings from the store.</p>
          </Link>
          <Link href="/admin/orders" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 shadow-sm transition-all">
            <h3 className="text-lg font-bold text-gray-900">Manage Orders</h3>
            <p className="mt-2 text-sm text-gray-500">Process orders and update delivery status.</p>
          </Link>
          <Link href="/admin/reviews" className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-indigo-500 shadow-sm transition-all">
            <h3 className="text-lg font-bold text-gray-900">Manage Reviews</h3>
            <p className="mt-2 text-sm text-gray-500">View customer feedback and reply to reviews.</p>
          </Link>
        </div>
      </div>
    </AdminRoute>
  );
}
