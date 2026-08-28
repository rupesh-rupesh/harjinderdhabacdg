import React, { useEffect, useState } from 'react';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  likes: number;
  dislikes: number;
  adminReply: string | null;
  createdAt: string;
}

export default function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({ name: '', rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await fetch('/api/reviews');
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.name || !newReview.comment) {
      toast.error('Please provide both a name and a comment to submit your review.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReview),
      });
      if (res.ok) {
        const added = await res.json();
        setReviews([added, ...reviews]);
        setNewReview({ name: '', rating: 5, comment: '' });
        setShowForm(false);
        toast.success('Review submitted successfully!');
      } else {
        toast.error('We were unable to process your review at this time. Please try again later.');
      }
    } catch (e) {
      toast.error('An unexpected error has occurred. Please try again later.');
    } finally {
      setSubmitting(false);
    }
  };

  const voteReview = async (id: number, type: 'like' | 'dislike') => {
    // Basic local tracking to prevent spam clicking
    if (localStorage.getItem(`voted_review_${id}`)) {
      toast.error('Your vote has already been recorded for this review.');
      return;
    }
    try {
      const res = await fetch(`/api/reviews/${id}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type }),
      });
      if (res.ok) {
        const updated = await res.json();
        setReviews(reviews.map(r => r.id === id ? updated : r));
        localStorage.setItem(`voted_review_${id}`, type);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <section className="pt-8 pb-24 bg-[var(--color-ivory)]" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
             <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
             <h2 className="text-sm font-bold text-[var(--color-gold)] tracking-[0.2em] uppercase">Reviews</h2>
             <div className="h-px w-12 bg-[var(--color-gold)]/40"></div>
          </div>
          <h3 className="text-3xl md:text-5xl font-serif font-bold text-[var(--color-brown)] mb-6 tracking-tight">Voices of Our Guests</h3>
          <p className="text-lg text-[#5A4A42]">Real stories from real people who love our food and hospitality.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
          <div className="flex items-center gap-6 bg-gradient-to-r from-[var(--color-brown)] to-[#3A2A20] border border-[var(--color-gold)]/30 text-white px-8 py-5 rounded-[1.5rem] shadow-[0_10px_30px_rgba(212,175,55,0.15)]">
            <div className="text-5xl md:text-6xl font-bold tracking-tighter text-[var(--color-gold)]">{avgRating}</div>
            <div className="w-px h-16 bg-white/20"></div>
            <div className="flex flex-col items-start">
              <div className="flex text-[var(--color-gold)] mb-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 md:w-6 md:h-6 drop-shadow-sm ${i < Math.round(Number(avgRating)) ? 'fill-current' : 'text-white/20'}`} />
                ))}
              </div>
              <span className="text-sm font-medium text-white/80">Based on {reviews.length} authentic reviews</span>
            </div>
          </div>
          
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full sm:w-auto px-8 py-[1.4rem] bg-gradient-to-r from-[var(--color-gold)] to-[#C19B2E] text-white rounded-[1.5rem] shadow-lg shadow-[var(--color-gold)]/20 hover:shadow-xl hover:shadow-[var(--color-gold)]/30 hover:-translate-y-1 transition-all duration-300 font-bold tracking-wide flex items-center justify-center gap-3 group"
          >
            <MessageSquare className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
            Share Your Experience
          </button>
        </div>
        
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-300">
          <form onSubmit={submitReview} className="bg-white p-6 md:p-8 rounded-[2rem] shadow-2xl w-full max-w-xl mx-auto transform animate-in zoom-in-95 duration-300">
            <h3 className="text-lg font-bold text-stone-800 mb-4">Share Your Experience</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Name</label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                value={newReview.name}
                onChange={e => setNewReview({ ...newReview, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-1">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReview({ ...newReview, rating: star })}
                    className={`focus:outline-none ${newReview.rating >= star ? 'text-[var(--color-gold)]' : 'text-stone-300'}`}
                  >
                    <Star className="w-8 h-8 fill-current" />
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-stone-700 mb-1">Your Review</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                value={newReview.comment}
                onChange={e => setNewReview({ ...newReview, comment: e.target.value })}
                placeholder="How was the food and service?"
              ></textarea>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-md"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-amber-600 text-white flex items-center gap-2 rounded-md hover:bg-amber-700 disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
                Submit
              </button>
            </div>
          </form>
          </div>
        )}

        {loading ? (
          <div className="text-center text-stone-500 py-10">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center text-stone-500 py-10">We do not have any reviews to display at this time.</div>
        ) : (
          <div className="flex overflow-x-auto gap-6 pb-12 pt-4 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {reviews.map(review => (
              <ReviewCard key={review.id} review={review} voteReview={voteReview} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

const ReviewCard = ({ review, voteReview }: { review: Review, voteReview: (id: number, type: 'like' | 'dislike') => void }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const maxLength = 180;
  const isLong = review.comment.length > maxLength;
  
  return (
    <div className="bg-[#FFFCF8] rounded-[2rem] p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(212,175,55,0.1)] flex-none w-[85vw] sm:w-[420px] snap-center flex flex-col h-full min-h-[340px] relative group border-t-4 border-t-[var(--color-gold)] border-x border-b border-stone-200/60">
      
      <div className="absolute top-8 right-8 text-[var(--color-gold)]/10 group-hover:text-[var(--color-gold)]/20 group-hover:scale-110 transition-all duration-500 pointer-events-none">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M14.017 21L16.417 14.591V3H23V14.591L20.583 21H14.017ZM3.017 21L5.417 14.591V3H12V14.591L9.583 21H3.017Z" />
        </svg>
      </div>

      <div className="flex items-center gap-4 relative z-10 shrink-0 mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-[var(--color-gold)] to-[#C19B2E] text-white rounded-full flex items-center justify-center font-bold text-xl shrink-0 shadow-[0_4px_10px_rgba(212,175,55,0.4)]">
          {review.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h4 className="font-bold text-[var(--color-brown)] text-lg line-clamp-1">{review.name}</h4>
          <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
            <div className="flex text-[var(--color-gold)] shrink-0">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current drop-shadow-sm' : 'text-stone-300'}`} />
              ))}
            </div>
            <span className="text-stone-300 shrink-0">•</span>
            <span className="font-medium text-stone-500 truncate">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
      
      <div className="flex-1 mt-2 relative z-10 flex flex-col justify-between">
        <div className="text-[#5A4A42] leading-relaxed text-[15px] sm:text-base font-medium">
          <p className={`${!isExpanded && isLong ? 'line-clamp-4' : ''}`}>
            "{review.comment}"
          </p>
          {isLong && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)} 
              className="text-[var(--color-gold)] hover:text-[var(--color-brown)] font-bold mt-2 focus:outline-none transition-colors text-sm inline-flex items-center border-b border-[var(--color-gold)] hover:border-[var(--color-brown)] pb-0.5"
            >
              {isExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>
        
        <div className="flex-1"></div>

        {review.adminReply && (
          <div className="bg-gradient-to-r from-[var(--color-gold)]/10 to-transparent p-5 rounded-r-2xl border-l-4 border-[var(--color-gold)] mt-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-full bg-[var(--color-gold)] flex items-center justify-center shadow-sm">
                <MessageSquare className="w-3 h-3 text-white" />
              </div>
              <p className="text-sm font-bold text-[var(--color-brown)]">Owner's Reply</p>
            </div>
            <p className={`text-sm text-[#5A4A42] font-medium leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>{review.adminReply}</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center gap-6 pt-6 border-t border-stone-200/60 relative z-10 shrink-0">
        <button
          onClick={() => voteReview(review.id, 'like')}
          className="flex items-center gap-2 text-stone-500 hover:text-[var(--color-brown)] transition-colors group/btn"
        >
          <div className="p-2 rounded-full bg-white border border-stone-200 group-hover/btn:border-stone-400 transition-colors">
            <ThumbsUp className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{review.likes > 0 ? review.likes : 'Helpful'}</span>
        </button>
        <button
          onClick={() => voteReview(review.id, 'dislike')}
          className="flex items-center gap-2 text-stone-500 hover:text-[var(--color-brown)] transition-colors group/btn"
        >
          <div className="p-2 rounded-full bg-white border border-stone-200 group-hover/btn:border-stone-400 transition-colors">
            <ThumbsDown className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium">{review.dislikes > 0 ? review.dislikes : 'Not Helpful'}</span>
        </button>
      </div>
    </div>
  );
};

