'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCartIcon, UserIcon, HeartIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { cartCount } = useCart();
  const pathname = usePathname();

  const isActive = (path) => pathname === path;
  const isProfileActive = pathname.startsWith('/profile');

  return (
    <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-indigo-600 tracking-tight">
              SATATA SHOE BAZAR
            </Link>
          </div>

          <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link 
              href="/" 
              className={`${
                isActive('/') 
                  ? 'border-indigo-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
            >
              Home
            </Link>
            <Link 
              href="/shop" 
              className={`${
                isActive('/shop') 
                  ? 'border-indigo-500 text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors duration-200`}
            >
              Shop
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link 
              href="/wishlist" 
              className={`p-2 relative transition-colors duration-200 ${
                isActive('/wishlist') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <HeartIcon className="h-6 w-6" />
              {user?.wishlist?.length > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-indigo-500 ring-2 ring-white text-[10px] text-white text-center leading-4">
                  {user.wishlist.length}
                </span>
              )}
            </Link>
            <Link 
              href="/cart" 
              className={`p-2 relative transition-colors duration-200 ${
                isActive('/cart') ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              <ShoppingCartIcon className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 ring-2 ring-white text-[10px] text-white text-center leading-4">
                  {cartCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <Link 
                  href="/profile" 
                  className={`p-2 transition-colors duration-200 ${
                    isProfileActive ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-500'
                  }`}
                >
                  <UserIcon className="h-6 w-6" />
                </Link>
                {user?.role === 'ADMIN' && (
                  <Link href="/admin" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                    Admin
                  </Link>
                )}
                <button
                  onClick={logout}
                  className="text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
