'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { MapPinIcon, PlusIcon, UserCircleIcon, PhoneIcon } from '@heroicons/react/24/outline';

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

  const [selectedAddressIndex, setSelectedAddressIndex] = useState(-1);
  const [isNewAddress, setIsNewAddress] = useState(true);
  const [shippingFee, setShippingFee] = useState(60); // Default Dhaka fee
  const [loading, setLoading] = useState(false);
  const [orderSuccessful, setOrderSuccessful] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (user) {
      const hasAddresses = user.addresses && user.addresses.length > 0;
      setFormData(prev => ({
        ...prev,
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: hasAddresses ? user.addresses[0] : '',
      }));
      if (hasAddresses) {
        setSelectedAddressIndex(0);
        setIsNewAddress(false);
      } else {
        setIsNewAddress(true);
        setSelectedAddressIndex(-1);
      }
    }
  }, [user]);

  useEffect(() => {
    if (cartItems.length === 0 && !loading && !orderSuccessful) {
      router.push('/shop');
    }
  }, [cartItems, router, loading, orderSuccessful]);

  useEffect(() => {
    // Shipping logic: Dhaka = 60, Outside = 120
    setShippingFee(formData.region === 'Dhaka' ? 60 : 120);
  }, [formData.region]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddressSelect = (index) => {
    setSelectedAddressIndex(index);
    setIsNewAddress(false);
    setFormData({ ...formData, address: user.addresses[index] });
  };

  const handleNewAddress = () => {
    setIsNewAddress(true);
    setSelectedAddressIndex(-1);
    setFormData({ ...formData, address: '' });
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
      setOrderSuccessful(true);
      clearCart();
      router.push(`/order-success?id=${data._id}`);
    } catch (error) {
      alert(error.response?.data?.detail || 'Order failed. Please try again.');
      setLoading(false);
    }
  };

  if (authLoading || (cartItems.length === 0 && !orderSuccessful)) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-10">Checkout</h1>

        <form onSubmit={handleSubmit} className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          <div className="lg:col-span-7">
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-8 border border-gray-100">
              {/* Address Selection */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
                  Shipping Address
                </h2>
                
                {user?.addresses && user.addresses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    {user.addresses.map((addr, idx) => (
                      <div 
                        key={idx}
                        onClick={() => handleAddressSelect(idx)}
                        className={`cursor-pointer p-4 rounded-xl border-2 transition-all ${
                          selectedAddressIndex === idx && !isNewAddress 
                          ? 'border-indigo-600 bg-indigo-50' 
                          : 'border-gray-100 hover:border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs font-bold text-gray-400 uppercase">Address {idx + 1}</span>
                          {selectedAddressIndex === idx && !isNewAddress && (
                            <div className="h-4 w-4 rounded-full bg-indigo-600 flex items-center justify-center">
                              <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-gray-900 line-clamp-2">{addr}</p>
                      </div>
                    ))}
                    <div 
                      onClick={handleNewAddress}
                      className={`cursor-pointer p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center space-y-2 ${
                        isNewAddress 
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-600' 
                        : 'border-gray-200 hover:border-indigo-300 text-gray-400 hover:text-indigo-500'
                      }`}
                    >
                      <PlusIcon className="h-6 w-6" />
                      <span className="text-sm font-bold">Add New Address</span>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <UserCircleIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="full_name"
                        required
                        value={formData.full_name}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 pl-10 border"
                        placeholder="John Doe"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <PhoneIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 pl-10 border"
                        placeholder="+880123456789"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Address {isNewAddress ? '(Enter details)' : ''}</label>
                    <textarea
                      name="address"
                      required
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      readOnly={!isNewAddress}
                      className={`block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border ${!isNewAddress ? 'bg-gray-50' : ''}`}
                      placeholder="House No, Road, Area..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">City</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">Region</label>
                    <select
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      className="block w-full rounded-xl border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-3 border"
                    >
                      <option value="Dhaka">Dhaka</option>
                      <option value="Outside Dhaka">Outside Dhaka</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 mb-4 uppercase tracking-wider">Payment Method</h2>
                <div className="flex items-center p-4 bg-indigo-50 rounded-xl border-2 border-indigo-200">
                  <div className="h-5 w-5 rounded-full border-4 border-indigo-600 mr-3"></div>
                  <label htmlFor="cod" className="block text-sm font-bold text-indigo-900">
                    Cash on Delivery (COD)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order summary */}
          <section className="mt-16 bg-white rounded-2xl p-6 lg:col-span-5 lg:mt-0 lg:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider">Order summary</h2>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 no-scrollbar mb-6">
              {cartItems.map((item) => (
                <div key={`${item._id}-${item.selectedSize}`} className="flex items-center justify-between group">
                  <div className="flex items-center">
                    <div className="relative">
                      <img src={item.images[0]} alt={item.name} className="w-16 h-16 rounded-xl object-cover mr-4 shadow-sm group-hover:scale-105 transition-transform" />
                      <span className="absolute -top-2 -right-1 bg-indigo-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{item.name}</p>
                      <p className="text-xs font-bold text-gray-500">Size: {item.selectedSize}</p>
                      <p className="text-xs text-gray-400 font-medium">৳{item.price} x {item.quantity}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">৳{item.price * item.quantity}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Total</p>
                  </div>
                </div>
              ))}
            </div>

            <dl className="space-y-4 border-t border-gray-100 pt-6">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider">Subtotal</dt>
                <dd className="text-sm font-bold text-gray-900">৳{cartTotal}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-bold text-gray-500 uppercase tracking-wider">Shipping</dt>
                <dd className="text-sm font-bold text-gray-900">৳{shippingFee}</dd>
              </div>
              <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                <dt className="text-lg font-bold text-gray-900 uppercase">Order total</dt>
                <dd className="text-lg font-bold text-indigo-600">৳{cartTotal + shippingFee}</dd>
              </div>
            </dl>

            <div className="mt-8">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 border border-transparent rounded-xl shadow-lg py-4 px-4 text-base font-bold text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Confirm Order (COD)'}
              </button>
              <p className="mt-4 text-center text-xs text-gray-400 font-medium">
                By placing your order, you agree to our Terms of Service.
              </p>
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
