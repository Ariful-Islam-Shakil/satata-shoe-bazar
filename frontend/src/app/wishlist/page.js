'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function WishlistPage() {
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWishlist() {
      if (user) {
        try {
          const { data } = await api.get('/users/wishlist');
          setItems(data);
        } catch (error) {
          console.error("Failed to fetch wishlist", error);
        } finally {
          setLoading(false);
        }
      } else if (!authLoading) {
        setLoading(false);
      }
    }
    fetchWishlist();
  }, [user, authLoading]);

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Please login to view your wishlist</h2>
        <Link href="/login" className="bg-indigo-600 text-white px-6 py-2 rounded-md">Login</Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">My Wishlist</h1>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {items.map((product) => (
              <ProductCard key={product._id || product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-gray-200 rounded-lg">
            <p className="text-lg text-gray-500 mb-4">Your wishlist is empty.</p>
            <Link href="/shop" className="text-indigo-600 font-medium hover:text-indigo-500">
              Continue shopping &rarr;
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
