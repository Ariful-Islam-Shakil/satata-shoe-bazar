'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon, ShoppingBagIcon, MapPinIcon, ReceiptPercentIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';
import api from '@/lib/api';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (orderId) {
        try {
          const { data } = await api.get(`/orders/${orderId}`);
          setOrder(data);
        } catch (error) {
          console.error("Failed to fetch order", error);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-16 w-16 bg-gray-200 rounded-full mb-4"></div>
          <div className="h-4 w-48 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-12 text-center text-white">
            <CheckCircleIcon className="mx-auto h-20 w-20 mb-4" />
            <h2 className="text-3xl font-bold">Order Confirmed!</h2>
            <p className="mt-2 text-green-500 bg-white/10 inline-block px-4 py-1 rounded-full text-sm font-medium backdrop-blur-sm">
              Order ID: #{orderId}
            </p>
          </div>

          <div className="p-8 space-y-8">
            <div className="text-center max-w-md mx-auto">
              <p className="text-gray-600">
                Thank you for your purchase! We've received your order and will start processing it right away.
              </p>
            </div>

            {/* Order Items */}
            {order && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center">
                    <ShoppingBagIcon className="h-5 w-5 mr-2 text-indigo-600" />
                    Order Summary
                  </h3>
                  <span className="text-sm font-bold text-gray-400">{order.items.length} Items</span>
                </div>
                
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center">
                        <img src={item.image} alt={item.name} className="h-16 w-16 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                        <div className="ml-4">
                          <h4 className="text-sm font-bold text-gray-900">{item.name}</h4>
                          <p className="text-xs font-bold text-gray-400">
                            Size: {item.size} | Qty: {item.quantity}
                          </p>
                          <p className="text-xs text-gray-400 font-medium">৳{item.price} x {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-900">৳{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-2xl p-6 space-y-3">
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Subtotal</span>
                    <span>৳{order.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm font-medium text-gray-500">
                    <span>Shipping Fee</span>
                    <span>৳{order.shipping_fee}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-200">
                    <span>Total Amount</span>
                    <span className="text-indigo-600">৳{order.total}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      Shipping Address
                    </h4>
                    <p className="text-sm font-bold text-gray-900">{order.shipping_address.full_name}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{order.shipping_address.address}</p>
                    <p className="text-sm text-gray-600">{order.shipping_address.city}, {order.shipping_address.region}</p>
                  </div>
                  <div className="p-4 rounded-2xl border border-gray-100 bg-white">
                    <h4 className="text-xs font-bold text-gray-400 uppercase mb-2 flex items-center">
                      <ReceiptPercentIcon className="h-4 w-4 mr-1" />
                      Order Details
                    </h4>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Payment</span>
                        <span className="font-bold text-gray-900">COD</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Status</span>
                        <span className="font-bold text-indigo-600 px-2 py-0.5 bg-indigo-50 rounded-full text-[10px] uppercase">{order.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/profile/orders"
                className="w-full flex justify-center py-4 px-6 border border-transparent rounded-2xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all transform hover:-translate-y-1"
              >
                Track My Order
              </Link>
              <Link
                href="/"
                className="w-full flex justify-center py-4 px-6 border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 bg-white hover:bg-gray-50 transition-all transform hover:-translate-y-1"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
