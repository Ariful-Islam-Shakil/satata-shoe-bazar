'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      if (user) {
        try {
          const { data } = await api.get('/orders/my-orders');
          setOrders(data);
        } catch (error) {
          console.error("Failed to fetch orders", error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    }
    fetchOrders();
  }, [user, authLoading]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Order Received': return 'bg-blue-100 text-blue-800';
      case 'Packaging': return 'bg-yellow-100 text-yellow-800';
      case 'Out for Delivery': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your orders</h2>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-md">Login</Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/profile" className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-6">
          &larr; Back to Profile
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-10">My Orders</h1>

        {orders.length > 0 ? (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white shadow overflow-hidden sm:rounded-lg border border-gray-200">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Order Placed</p>
                    <p className="text-sm text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Total Amount</p>
                    <p className="text-sm text-gray-900">৳{order.total}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-500">Order ID</p>
                    <p className="text-sm text-indigo-600 font-mono">#{order._id}</p>
                  </div>
                </div>
                
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center mb-6">
                    <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                    <p className="ml-4 text-xs text-gray-500 italic">Last updated: {new Date(order.updated_at).toLocaleString()}</p>
                  </div>

                  <ul className="divide-y divide-gray-200">
                    {order.items.map((item, idx) => (
                      <li key={idx} className="py-4 flex">
                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded object-cover" />
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-900">৳{item.price * item.quantity}</p>
                          </div>
                          <p className="text-sm text-gray-500">Size: {item.size} | Qty: {item.quantity}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-white border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-lg text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link href="/shop" className="text-indigo-600 font-medium hover:text-indigo-500">
              Go to Shop &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
