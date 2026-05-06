'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: 'Dhaka',
    region: 'Dhaka',
  });

  const [shippingFee, setShippingFee] = useState(60); // Default Dhaka fee
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (cartItems.length === 0 && !loading) {
      router.push('/shop');
    }
  }, [cartItems, router, loading]);

  useEffect(() => {
    // Shipping logic: Dhaka = 60, Outside = 120 (Assuming X=60)
    setShippingFee(formData.region === 'Dhaka' ? 60 : 120);
  }, [formData.region]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          size: item.selectedSize,
          image: item.images[0]
        })),
        shipping_address: formData,
        subtotal: cartTotal,
        shipping_fee: shippingFee,
        total: cartTotal + shippingFee,
      };

      const { data } = await api.post('/orders', orderData);
      clearCart();
      router.push(`/order-success?id=${data._id}`);
    } catch (error) {
      alert(error.response?.data?.detail || 'Order failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || cartItems.length === 0) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-10">Checkout</h1>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-lg font-medium text-gray-900">Shipping Information</h2>
              
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input
                    type="text"
                    name="full_name"
                    required
                    value={formData.full_name}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Address</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">City</label>
                  <input
                    type="text"
                    name="city"
                    required
                    value={formData.city}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <select
                    name="region"
                    value={formData.region}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border"
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Outside Dhaka">Outside Dhaka</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h2>
                <div className="flex items-center">
                  <input
                    id="cod"
                    name="payment"
                    type="radio"
                    checked
                    readOnly
                    className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                  />
                  <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                    Cash on Delivery (COD)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <section className="mt-16 bg-white rounded-lg px-4 py-6 sm:p-6 lg:col-span-5 lg:mt-0 lg:p-8 shadow-sm">
            <h2 className="text-lg font-medium text-gray-900">Order summary</h2>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.selectedSize}`} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <img src={item.images[0]} alt={item.name} className="w-12 h-12 rounded object-cover mr-4" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-500">Size: {item.selectedSize} x {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-gray-900">৳{item.price * item.quantity}</p>
                </div>
              ))}
            </div>

            <dl className="mt-6 space-y-4 border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Subtotal</dt>
                <dd className="text-sm font-medium text-gray-900">৳{cartTotal}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm text-gray-600">Shipping</dt>
                <dd className="text-sm font-medium text-gray-900">৳{shippingFee}</dd>
              </div>
              <div className="border-t border-gray-200 pt-4 flex items-center justify-between">
                <dt className="text-base font-medium text-gray-900">Order total</dt>
                <dd className="text-base font-medium text-gray-900">৳{cartTotal + shippingFee}</dd>
              </div>
            </dl>

            <div className="mt-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Processing...' : 'Confirm Order (COD)'}
              </button>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
