import { useState } from 'react';
import Link from 'next/link';
import { HeartIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';

export default function ProductCard({ product }) {
  const { user, toggleWishlist } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  const productId = product._id || product.id;
  const isWishlisted = user?.wishlist?.includes(productId);
  const images = product.images && product.images.length > 0 ? product.images : ['https://via.placeholder.com/400x500?text=No+Image'];

  const nextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none sm:h-96 relative overflow-hidden">
        <img
          src={images[currentImageIndex]}
          alt={product.name}
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-gray-800 shadow-md hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 focus:outline-none"
              aria-label="Previous image"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 text-gray-800 shadow-md hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 focus:outline-none"
              aria-label="Next image"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 z-30">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 w-1.5 rounded-full transition-all duration-300 ${
                    idx === currentImageIndex ? 'bg-indigo-600 w-4' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(productId);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-100 z-30 transition-colors duration-200"
        >
          {isWishlisted ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-400" />
          )}
        </button>
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-gray-900">
          <Link href={`/product/${productId}`}>
            <span aria-hidden="true" className="absolute inset-0" />
            {product.name}
          </Link>
        </h3>
        <p className="text-sm text-gray-500">{product.brand}</p>
        <div className="flex flex-1 flex-col justify-end">
          <p className="text-sm italic text-gray-500">{product.category}</p>
          <p className="text-base font-medium text-gray-900">৳{product.price}</p>
        </div>
        {product.stock <= 0 && (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
            Out of Stock
          </span>
        )}
      </div>
    </div>
  );
}
