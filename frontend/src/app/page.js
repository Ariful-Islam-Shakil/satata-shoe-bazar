'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await api.get('/products?limit=8');
        setNewArrivals(data);
      } catch (error) {
        console.error("Failed to fetch products", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-gray-900 h-[500px]">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=2012"
            alt="Hero background"
            className="h-full w-full object-cover object-center opacity-40"
          />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Step Into Style
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-3xl">
            Discover the finest collection of shoes in Bangladesh. From classic formals to modern sneakers, we have everything to match your style.
          </p>
          <div className="mt-10">
            <Link
              href="/shop"
              className="inline-block bg-indigo-600 border border-transparent rounded-md py-3 px-8 font-medium text-white hover:bg-indigo-700"
            >
              Shop Collection
            </Link>
          </div>
        </div>
      </div>

      {/* New Arrivals section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">New Arrivals</h2>
          <Link href="/shop" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            View all<span aria-hidden="true"> &rarr;</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-h-4 aspect-w-3 bg-gray-200 rounded-lg sm:h-96"></div>
                <div className="mt-4 h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="mt-2 h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {newArrivals.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
