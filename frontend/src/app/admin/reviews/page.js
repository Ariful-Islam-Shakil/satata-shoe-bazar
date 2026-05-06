'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import AdminRoute from '@/components/AdminRoute';
import { StarIcon } from '@heroicons/react/20/solid';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    try {
      // In a real app, we'd have a get all reviews endpoint. 
      // For now, we'll assume we can get them or filter them.
      // Since we don't have a global "get all reviews", we might need to add one to the backend.
      // I'll add a temporary work-around or assume the backend has it.
      const { data } = await api.get('/reviews/all'); 
      setReviews(data);
    } catch (error) {
      console.error("Failed to fetch reviews", error);
    } finally {
      setLoading(false);
    }
  }

  const handleReply = async (reviewId) => {
    try {
      await api.post(`/reviews/${reviewId}/reply`, { reply_text: replyText });
      setReplyingTo(null);
      setReplyText('');
      fetchReviews();
    } catch (error) {
      alert('Failed to send reply');
    }
  };

  return (
    <AdminRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Manage Reviews</h1>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <ul className="divide-y divide-gray-200">
            {reviews.map((review) => (
              <li key={review._id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
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
                    <p className="ml-4 text-sm font-medium text-gray-900">{review.user_name} ({review.user_email})</p>
                  </div>
                  <p className="text-sm text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
                
                <div className="mt-2">
                  <p className="text-sm text-gray-600 italic">"{review.comment}"</p>
                </div>

                {review.admin_reply ? (
                  <div className="mt-4 ml-6 bg-indigo-50 p-3 rounded-md">
                    <p className="text-xs font-bold text-indigo-900">Your Reply:</p>
                    <p className="text-sm text-indigo-800">{review.admin_reply}</p>
                    <button 
                      onClick={() => {
                        setReplyingTo(review._id);
                        setReplyText(review.admin_reply);
                      }}
                      className="mt-2 text-xs text-indigo-600 hover:text-indigo-500"
                    >
                      Edit Reply
                    </button>
                  </div>
                ) : replyingTo === review._id ? (
                  <div className="mt-4 ml-6">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Write your reply..."
                      className="block w-full rounded-md border-gray-300 shadow-sm sm:text-sm p-2 border"
                      rows={2}
                    />
                    <div className="mt-2 flex justify-end space-x-2">
                      <button onClick={() => setReplyingTo(null)} className="text-sm text-gray-500">Cancel</button>
                      <button 
                        onClick={() => handleReply(review._id)}
                        className="bg-indigo-600 text-white px-3 py-1 rounded-md text-sm"
                      >
                        Send Reply
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setReplyingTo(review._id)}
                    className="mt-4 text-sm text-indigo-600 hover:text-indigo-500"
                  >
                    Reply to review
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminRoute>
  );
}
