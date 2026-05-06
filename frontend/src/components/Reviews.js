'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { StarIcon } from '@heroicons/react/20/solid';
import { useAuth } from '@/context/AuthContext';

export default function Reviews({ productId }) {
  const { user, isAuthenticated } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  async function fetchReviews() {
    try {
      const { data } = await api.get(`/reviews/product/${productId}`);
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/reviews', { ...formData, product_id: productId });
      setFormData({ rating: 5, comment: '' });
      setShowForm(false);
      fetchReviews(); // Refresh list
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to submit review');
    }
  };

  return (
    <div className="mt-16 border-t border-gray-200 pt-10">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Customer Reviews</h2>
        {isAuthenticated && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
          >
            Write a review
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Share your thoughts</h3>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Rating</label>
            <div className="flex items-center mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  onClick={() => setFormData({ ...formData, rating: star })}
                  className={`h-6 w-6 cursor-pointer ${
                    formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Comment</label>
            <textarea
              required
              rows={3}
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
            >
              Submit Review
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 italic">Note: You can only review products you have successfully purchased.</p>
        </form>
      )}

      <div className="mt-6 space-y-10 divide-y divide-gray-200 border-b border-gray-200 pb-10">
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div key={review._id} className="pt-10">
              <div className="flex items-center">
                <div className="mr-4">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        className={`h-4 w-4 ${
                          review.rating >= star ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-sm font-bold text-gray-900">{review.user_name}</p>
                </div>
                <div className="ml-4 border-l border-gray-200 pl-4 text-sm text-gray-500">
                  {new Date(review.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="mt-4 text-sm italic text-gray-600">
                <p>{review.comment}</p>
              </div>

              {review.admin_reply && (
                <div className="mt-6 ml-6 bg-indigo-50 p-4 rounded-md border-l-4 border-indigo-500">
                  <p className="text-xs font-bold text-indigo-900 mb-1">Store Reply:</p>
                  <p className="text-sm text-indigo-800">{review.admin_reply}</p>
                </div>
              )}
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 py-6">No reviews yet. Be the first to review this product!</p>
        )}
      </div>
    </div>
  );
}
