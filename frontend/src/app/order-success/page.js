'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { Suspense } from 'react';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  return (
    <div className="bg-white min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Order Placed Successfully!</h2>
        <p className="mt-2 text-sm text-gray-600">
          Thank you for shopping with Satata Shoe Bazar. Your order has been received and is being processed.
        </p>
        <div className="mt-6 p-4 bg-gray-50 rounded-md">
          <p className="text-sm font-medium text-gray-900">Order ID: <span className="text-indigo-600 font-mono">{orderId}</span></p>
          <p className="text-xs text-gray-500 mt-1">Payment Method: Cash on Delivery</p>
        </div>
        <div className="mt-8 space-y-3">
          <Link
            href="/profile/orders"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Track My Order
          </Link>
          <Link
            href="/"
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
