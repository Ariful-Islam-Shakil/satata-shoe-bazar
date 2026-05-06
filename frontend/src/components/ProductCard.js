import Link from 'next/link';
import { HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { useAuth } from '@/context/AuthContext';

export default function ProductCard({ product }) {
  const { user, toggleWishlist } = useAuth();
  const isWishlisted = user?.wishlist?.includes(product._id);

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white">
      <div className="aspect-h-4 aspect-w-3 bg-gray-200 sm:aspect-none group-hover:opacity-75 sm:h-96 relative">
        <img
          src={product.images[0] || 'https://via.placeholder.com/400x500?text=No+Image'}
          alt={product.name}
          className="h-full w-full object-cover object-center sm:h-full sm:w-full"
        />
        <button
          onClick={(e) => {
            e.preventDefault();
            toggleWishlist(product._id);
          }}
          className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm hover:bg-gray-100 z-10"
        >
          {isWishlisted ? (
            <HeartIconSolid className="h-5 w-5 text-red-500" />
          ) : (
            <HeartIcon className="h-5 w-5 text-gray-400" />
          )}
        </button>
      </div>
      <div className="flex flex-1 flex-col space-y-2 p-4">
        <h3 className="text-sm font-medium text-gray-900">
          <Link href={`/product/${product._id}`}>
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
