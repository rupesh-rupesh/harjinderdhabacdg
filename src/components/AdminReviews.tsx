import React, { useEffect, useState } from 'react';
import { Star, MessageSquare, Eye, EyeOff, Trash2, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmModal } from './ConfirmModal';

export default function AdminReviews() {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/admin/reviews');
      if (res.ok) {
        setReviews(await res.json());
      }
    } catch (e) {
      toast.error('We were unable to load the reviews at this time.');
    } finally {
      setLoading(false);
    }
  };

  const toggleVisibility = async (id: number, currentHidden: boolean) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/visibility`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isHidden: !currentHidden }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(reviews.map(r => r.id === id ? updated : r));
        toast.success(currentHidden ? 'Review is now visible' : 'Review is now hidden');
      }
    } catch (e) {
      toast.error('The requested action could not be completed.');
    }
  };

  const deleteReview = async (id: number) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Review',
      message: 'Are you sure you want to delete this review? This action cannot be undone.',
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/admin/reviews/${id}`, { method: 'DELETE' });
          if (res.ok) {
            setReviews(reviews.filter(r => r.id !== id));
            toast.success('Review deleted');
          } else {
            toast.error('The review deletion request could not be completed.');
          }
        } catch (e) {
          toast.error('The requested action could not be completed.');
        }
      }
    });
  };

  const submitReply = async (id: number) => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}/reply`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminReply: replyText }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(reviews.map(r => r.id === id ? updated : r));
        setReplyingTo(null);
        setReplyText('');
        toast.success('Reply submitted');
      }
    } catch (e) {
      toast.error('The requested action could not be completed.');
    }
  };

  if (loading) return <div className="p-8 text-center text-stone-500">Loading reviews...</div>;

  return (
    <div className="space-y-6">
      <ConfirmModal
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onClose={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
      />
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Manage Reviews</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.length === 0 ? (
          <div className="p-8 text-center text-stone-500">There are currently no reviews available to display.</div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className={`bg-white rounded-3xl p-6 shadow-sm border border-stone-100 hover:shadow-lg transition-shadow flex flex-col ${review.isHidden ? 'opacity-60 bg-stone-50' : ''}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-stone-900">{review.name}</h4>
                  <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-stone-300'}`} />
                      ))}
                    </div>
                    <span>•</span>
                    <span>{new Date(review.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => toggleVisibility(review.id, review.isHidden)}
                    className="p-2 text-stone-500 hover:text-amber-600 hover:bg-stone-100 rounded-md transition-colors"
                    title={review.isHidden ? 'Show Review' : 'Hide Review'}
                  >
                    {review.isHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="p-2 text-stone-500 hover:text-red-600 hover:bg-stone-100 rounded-md transition-colors"
                    title="Delete Review"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <p className="mt-4 text-stone-600 flex-1">{review.comment}</p>
              
              <div className="mt-6 pt-4 border-t border-stone-100 flex gap-4 text-sm text-stone-500">
                <span className="font-medium">{review.likes} Likes</span>
                <span className="font-medium">{review.dislikes} Dislikes</span>
              </div>

              {review.adminReply ? (
                <div className="mt-4 bg-amber-50 p-4 rounded-lg border border-amber-100">
                  <p className="text-sm font-bold text-amber-900 mb-1">Your Reply</p>
                  <p className="text-sm text-amber-800">{review.adminReply}</p>
                  <button 
                    onClick={() => { setReplyingTo(review.id); setReplyText(review.adminReply); }}
                    className="mt-2 text-xs font-medium text-amber-600 hover:text-amber-700"
                  >
                    Edit Reply
                  </button>
                </div>
              ) : replyingTo !== review.id ? (
                <button 
                  onClick={() => { setReplyingTo(review.id); setReplyText(''); }}
                  className="mt-4 flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
                >
                  <MessageSquare className="w-4 h-4" /> Reply to Review
                </button>
              ) : null}

              {replyingTo === review.id && (
                <div className="mt-4 flex gap-2">
                  <input 
                    type="text" 
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    placeholder="Type your reply..."
                    className="flex-1 px-3 py-2 text-sm border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button 
                    onClick={() => submitReply(review.id)}
                    className="px-3 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 flex items-center gap-1 text-sm"
                  >
                    <Send className="w-4 h-4" /> Send
                  </button>
                  <button 
                    onClick={() => setReplyingTo(null)}
                    className="px-3 py-2 bg-stone-200 text-stone-700 rounded-md hover:bg-stone-300 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
