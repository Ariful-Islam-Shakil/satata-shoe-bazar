'use client';

import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { TrashIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';

export default function CartPage() {
  const { user } = useAuth();
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl text-red-500 font-bold mb-4">Please login to view your cart</h2>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-md">Login</Link>
      </div>
    );
  }


  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-8">Looks like you haven't added any shoes to your cart yet.</p>
        <Link href="/shop" className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-10">Shopping Cart</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <ul className="border-t border-b border-gray-200 divide-y divide-gray-200">
              {cartItems.map((item) => (
                <li key={`${item._id}-${item.selectedSize}`} className="flex py-6">
                  <div className="flex-shrink-0">
                    <img
                      src={item.images[0] || 'https://via.placeholder.com/100'}
                      alt={item.name}
                      className="w-24 h-24 rounded-md object-center object-cover sm:w-32 sm:h-32"
                    />
                  </div>

                  <div className="ml-4 flex-1 flex flex-col justify-between sm:ml-6">
                    <div className="relative pr-9 sm:grid sm:grid-cols-2 sm:gap-x-6 sm:pr-0">
                      <div>
                        <div className="flex justify-between">
                          <h3 className="text-sm font-medium text-gray-900">
                            <Link href={`/product/${item._id}`} className="hover:text-gray-800">
                              {item.name}
                            </Link>
                          </h3>
                        </div>
                        <div className="mt-1 flex text-sm">
                          <p className="text-gray-500">{item.brand}</p>
                          <p className="ml-4 pl-4 border-l border-gray-200 text-gray-500">Size {item.selectedSize}</p>
                        </div>
                        <p className="mt-1 text-sm font-medium text-gray-900">৳{item.price}</p>
                      </div>

                      <div className="mt-4 sm:mt-0 sm:pr-9">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity - 1)}
                            className="p-1 rounded-md border border-gray-300 text-gray-400 hover:text-gray-500"
                          >
                            <MinusIcon className="h-4 w-4" />
                          </button>
                          <span className="text-gray-700 font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.selectedSize, item.quantity + 1)}
                            className="p-1 rounded-md border border-gray-300 text-gray-400 hover:text-gray-500"
                          >
                            <PlusIcon className="h-4 w-4" />
                          </button>
                        </div>

                        <div className="absolute top-0 right-0">
                          <button
                            onClick={() => removeFromCart(item._id, item.selectedSize)}
                            className="-m-2 p-2 inline-flex text-gray-400 hover:text-gray-500"
                          >
                            <span className="sr-only">Remove</span>
                            <TrashIcon className="h-5 w-5" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Order summary */}
          <section className="mt-16 bg-white rounded-lg px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

            <dl className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">৳{cartTotal}</dd>
              </div>
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">৳{cartTotal}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <Link
                href="/checkout"
                className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-center block"
              >
                Checkout
              </Link>
            </div>
            <p className="mt-4 text-xs text-center text-gray-500">
              Shipping and taxes calculated at checkout.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
