'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { 
  UserCircleIcon, 
  ShoppingBagIcon, 
  HeartIcon, 
  MapPinIcon, 
  EnvelopeIcon, 
  PhoneIcon 
} from '@heroicons/react/24/outline';
import ProfileEditModal from '@/components/ProfileEditModal';

export default function ProfilePage() {
  const { user, loading, updateUser } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
          <UserCircleIcon className="mx-auto h-16 w-16 text-gray-400" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Please sign in</h2>
            <p className="mt-2 text-gray-600">Access your account to view your profile and orders.</p>
          </div>
          <Link
            href="/login"
            className="w-full inline-flex justify-center py-3 px-6 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const profileStats = [
    { name: 'My Orders', icon: ShoppingBagIcon, href: '/profile/orders', count: 'View history', color: 'bg-blue-50 text-blue-600' },
    { name: 'Wishlist', icon: HeartIcon, href: '/wishlist', count: `${user.wishlist?.length || 0} items`, color: 'bg-pink-50 text-pink-600' },
  ];

  const handleUpdateProfile = async (data) => {
    await updateUser(data);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-32 bg-gradient-to-r from-indigo-600 to-violet-600"></div>
            <div className="px-6 pb-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-end -mt-12 sm:space-x-5">
                <div className="flex">
                  <div className="h-24 w-24 rounded-2xl ring-4 ring-white bg-white flex items-center justify-center shadow-md overflow-hidden">
                    {user.image ? (
                      <img src={user.image} alt={user.full_name} className="h-full w-full object-cover" />
                    ) : (
                      <UserCircleIcon className="h-20 w-20 text-gray-300" />
                    )}
                  </div>
                </div>
                <div className="mt-6 sm:mt-0 flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">{user.full_name || user.username}</h1>
                  <p className="text-gray-500 font-medium">@{user.username}</p>
                </div>
                <div className="mt-6 sm:mt-0 flex space-x-3">
                  <button 
                    onClick={() => setIsEditModalOpen(true)}
                    className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all"
                  >
                    Edit Profile
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column: Stats/Links */}
            <div className="space-y-6">
              {profileStats.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-xl ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">{item.name}</p>
                      <p className="text-lg font-bold text-gray-900">{item.count}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Column: User Details */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-50">
                  <h3 className="text-lg font-bold text-gray-900">Personal Information</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex items-start space-x-3">
                      <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email Address</p>
                        <p className="text-sm font-semibold text-gray-900">{user.email || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone Number</p>
                        <p className="text-sm font-semibold text-gray-900">{user.phone || 'Not provided'}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3 sm:col-span-2">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">Saved Addresses</p>
                        {user.addresses && user.addresses.length > 0 ? (
                          <div className="space-y-2">
                            {user.addresses.map((address, index) => (
                              <div key={index} className="p-3 rounded-xl bg-gray-50 border border-gray-100 text-sm font-semibold text-gray-900 flex justify-between items-center group">
                                <span>{address}</span>
                                <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Address {index + 1}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">No addresses saved</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Account Security</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <p className="text-sm font-medium text-gray-700">Password last changed 2 months ago</p>
                  </div>
                  <button className="text-sm font-bold text-indigo-600 hover:text-indigo-500">
                    Change
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ProfileEditModal 
        user={user} 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSave={handleUpdateProfile}
      />
    </div>
  );
}

