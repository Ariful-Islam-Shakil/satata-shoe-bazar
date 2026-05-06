'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import api from '@/lib/api';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { HeartIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import Reviews from '@/components/Reviews';

export default function ProductDetailPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const { user, toggleWishlist } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { data } = await api.get(`/products/${id}`);
        setProduct(data);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
      } catch (error) {
        console.error("Failed to fetch product", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center">Product not found</div>;

  return (
    <div className="bg-white">
      <div className="max-w-7xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-x-8 lg:items-start">
          {/* Image gallery */}
          <div className="flex flex-col">
            <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg">
              <img
                src={product.images[0] || 'https://via.placeholder.com/600x600?text=No+Image'}
                alt={product.name}
                className="h-full w-full object-cover object-center"
              />
            </div>
            {/* Thumbnail selector could go here */}
          </div>

          {/* Product info */}
          <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">{product.name}</h1>
            <div className="mt-3">
              <h2 className="sr-only">Product information</h2>
              <p className="text-3xl tracking-tight text-gray-900">৳{product.price}</p>
            </div>

            <div className="mt-6">
              <h3 className="sr-only">Description</h3>
              <p className="text-base text-gray-700">{product.description}</p>
            </div>

            <div className="mt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Size</h3>
              </div>

              <div className="grid grid-cols-4 gap-4 mt-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`flex items-center justify-center rounded-md border py-3 px-4 text-sm font-medium uppercase hover:bg-gray-50 focus:outline-none sm:flex-1 ${
                      selectedSize === size
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-600 ring-2 ring-indigo-500'
                        : 'border-gray-200 bg-white text-gray-900'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-10 flex gap-4">
              <button
                type="button"
                onClick={() => addToCart(product, selectedSize, quantity)}
                disabled={product.stock <= 0}
                className={`flex flex-1 items-center justify-center rounded-md border border-transparent py-3 px-8 text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                  product.stock > 0 ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {product.stock > 0 ? 'Add to cart' : 'Out of Stock'}
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product._id || product.id)}
                className="flex items-center justify-center rounded-md py-3 px-3 text-gray-400 hover:bg-gray-100 hover:text-gray-500 border border-gray-200"
              >
                {user?.wishlist?.includes(product._id || product.id) ? (
                  <HeartIconSolid className="h-6 w-6 flex-shrink-0 text-red-500" aria-hidden="true" />
                ) : (
                  <HeartIcon className="h-6 w-6 flex-shrink-0" aria-hidden="true" />
                )}
                <span className="sr-only">Add to favorites</span>
              </button>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-8">
              <h3 className="text-sm font-medium text-gray-900">Details</h3>
              <div className="mt-4 space-y-2">
                <p className="text-sm text-gray-600">Brand: {product.brand}</p>
                <p className="text-sm text-gray-600">Category: {product.category}</p>
                <p className="text-sm text-gray-600">Colors: {product.colors.join(', ')}</p>
                <p className="text-sm text-gray-600">Stock: {product.stock > 0 ? `${product.stock} units available` : 'Sold out'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <Reviews productId={id} />
      </div>
    </div>
  );
}
