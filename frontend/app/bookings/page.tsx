'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, Clock, MapPin, User, Star, AlertTriangle, 
  CheckCircle2, XCircle, ChevronRight, ShieldCheck, RefreshCw 
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';

export default function BookingsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancel Modal State
  const [cancelModalBooking, setCancelModalBooking] = useState<any>(null);
  const [cancelReason, setCancelReason] = useState('Change of schedule / plans');
  const [cancelling, setCancelling] = useState(false);

  // Review Modal State
  const [reviewModalBooking, setReviewModalBooking] = useState<any>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Dispute Modal State
  const [disputeModalBooking, setDisputeModalBooking] = useState<any>(null);
  const [disputeReason, setDisputeReason] = useState('');
  const [submittingDispute, setSubmittingDispute] = useState(false);

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const res = await apiClient.get('/bookings');
      setBookings(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    fetchBookings();
  }, [isAuthenticated]);

  const confirmCancelBooking = async () => {
    if (!cancelModalBooking) return;
    setCancelling(true);
    try {
      await apiClient.put(`/bookings/${cancelModalBooking.id}/cancel`, {
        reason: cancelReason,
      });
      // Optimistic update
      setBookings((prev) =>
        prev.map((b) =>
          b.id === cancelModalBooking.id
            ? { ...b, status: 'CANCELLED' }
            : b
        )
      );
      setNotificationMsg(`Booking #${cancelModalBooking.booking_number} cancelled. Any pre-paid charges have been initiated for 100% refund.`);
      setCancelModalBooking(null);
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Unable to cancel booking. Please try again or contact support.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalBooking) return;
    setSubmittingReview(true);
    try {
      await apiClient.post('/reviews', {
        booking_id: reviewModalBooking.id,
        rating,
        comment,
      });
      setNotificationMsg('Thank you for submitting your review!');
      setReviewModalBooking(null);
      setComment('');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeModalBooking) return;
    setSubmittingDispute(true);
    try {
      await apiClient.post('/disputes', {
        booking_id: disputeModalBooking.id,
        dispute_type: 'SERVICE_QUALITY',
        description: disputeReason,
      });
      setNotificationMsg('Dispute ticket raised with admin support desk.');
      setDisputeModalBooking(null);
      setDisputeReason('');
      fetchBookings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit dispute.');
    } finally {
      setSubmittingDispute(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-full flex items-center gap-1 shadow-xs"><CheckCircle2 size={13} className="text-emerald-600" /> Completed</span>;
      case 'IN_PROGRESS':
        return <span className="px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 font-bold text-xs rounded-full flex items-center gap-1 animate-pulse shadow-xs"><RefreshCw size={13} className="text-teal-600" /> In Progress</span>;
      case 'PROFESSIONAL_ON_THE_WAY':
        return <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 font-bold text-xs rounded-full flex items-center gap-1 shadow-xs">🚗 En Route</span>;
      case 'PROFESSIONAL_ASSIGNED':
        return <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-full shadow-xs">Pro Assigned</span>;
      case 'CONFIRMED':
        return <span className="px-3 py-1 bg-stone-100 text-stone-800 border border-stone-200 font-bold text-xs rounded-full shadow-xs">Confirmed</span>;
      case 'CANCELLED':
        return <span className="px-3 py-1 bg-red-50 text-red-700 border border-red-200 font-bold text-xs rounded-full flex items-center gap-1 shadow-xs"><XCircle size={13} className="text-red-600" /> Cancelled</span>;
      case 'DISPUTED':
        return <span className="px-3 py-1 bg-orange-50 text-orange-800 border border-orange-200 font-bold text-xs rounded-full flex items-center gap-1 shadow-xs"><AlertTriangle size={13} className="text-orange-600" /> Disputed</span>;
      default:
        return <span className="px-3 py-1 bg-stone-100 text-stone-700 border border-stone-200 font-bold text-xs rounded-full">Pending</span>;
    }
  };

  return (
    <main className="min-h-screen gradient-soothing-bg pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-stone-900 tracking-tight">My Bookings</h1>
            <p className="text-stone-600 text-sm mt-1">Track live status, view receipts, and review completed services</p>
          </div>
          <Link
            href="/services"
            id="book-new-service-btn"
            className="px-6 py-3 btn-primary text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md self-start md:self-auto cursor-pointer"
          >
            + Book New Service
          </Link>
        </div>

        {notificationMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
            <span>{notificationMsg}</span>
            <button onClick={() => setNotificationMsg(null)} className="text-xs cursor-pointer font-bold">✕</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-stone-500 text-sm font-medium">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Calendar size={28} />
            </div>
            <h3 className="text-xl font-bold text-stone-900 mb-2">No Bookings Yet</h3>
            <p className="text-stone-500 text-sm mb-6 max-w-md mx-auto leading-relaxed">
              You haven't scheduled any home maintenance yet. Explore our top-rated services and book in minutes.
            </p>
            <Link
              href="/services"
              className="px-6 py-3 btn-primary text-white rounded-xl font-bold text-sm transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              Explore Services Catalog
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                id={`booking-card-${booking.id}`}
                className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-soft hover:shadow-medium transition-all"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-6 border-b border-stone-200/60 gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="font-black text-stone-900 text-lg md:text-xl">
                        {booking.service_name}
                      </span>
                      {getStatusBadge(booking.status)}
                    </div>
                    <span className="text-xs font-mono text-stone-400">#{booking.booking_number}</span>
                  </div>

                  <div className="text-left md:text-right">
                    <span className="text-2xl font-black text-stone-900">₹{booking.total_amount}</span>
                    <span className="text-[11px] text-stone-500 font-semibold block">
                      {booking.booking_type === 'QUICK_SERVICE' ? '⚡ 10-Min Flash Service' : 'Standard Scheduled'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-stone-600 mb-6">
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <Calendar size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 block">Scheduled Date & Time</span>
                      <span>{booking.scheduled_date || 'Today'} at {booking.scheduled_time || 'Immediate'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <MapPin size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 block">Service Location</span>
                      <span>{booking.street_address}, {booking.city}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <User size={15} />
                    </div>
                    <div>
                      <span className="font-bold text-stone-900 block">Assigned Technician</span>
                      <span className="text-stone-900 font-semibold">{booking.professional_name}</span>
                      {booking.professional_phone && (
                        <span className="block text-stone-500 font-mono">{booking.professional_phone}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Lifecycle Progress Bar */}
                <div className="bg-stone-50 p-4 rounded-2xl mb-6 border border-stone-200/60">
                  <div className="flex justify-between text-[11px] font-bold text-stone-500 mb-2">
                    <span className={['CONFIRMED', 'PROFESSIONAL_ASSIGNED', 'PROFESSIONAL_ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'text-emerald-700 font-extrabold' : ''}>
                      1. Confirmed
                    </span>
                    <span className={['PROFESSIONAL_ASSIGNED', 'PROFESSIONAL_ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'text-emerald-700 font-extrabold' : ''}>
                      2. Assigned
                    </span>
                    <span className={['PROFESSIONAL_ON_THE_WAY', 'IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'text-emerald-700 font-extrabold' : ''}>
                      3. En Route
                    </span>
                    <span className={['IN_PROGRESS', 'COMPLETED'].includes(booking.status) ? 'text-emerald-700 font-extrabold' : ''}>
                      4. In Progress
                    </span>
                    <span className={booking.status === 'COMPLETED' ? 'text-emerald-700 font-extrabold' : ''}>
                      5. Completed
                    </span>
                  </div>
                  <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full transition-all duration-500 gradient-primary"
                      style={{
                        width:
                          booking.status === 'COMPLETED' ? '100%' :
                          booking.status === 'IN_PROGRESS' ? '80%' :
                          booking.status === 'PROFESSIONAL_ON_THE_WAY' ? '60%' :
                          booking.status === 'PROFESSIONAL_ASSIGNED' ? '40%' :
                          booking.status === 'CONFIRMED' ? '20%' : '5%',
                      }}
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between pt-4 border-t border-stone-200/60 gap-3">
                  <div className="flex items-center gap-2">
                    {booking.status === 'COMPLETED' && !booking.review && (
                      <button
                        onClick={() => {
                          setReviewModalBooking(booking);
                          setRating(5);
                        }}
                        id={`review-btn-${booking.id}`}
                        className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Star size={14} className="fill-amber-500 text-amber-500" /> Rate & Review Professional
                      </button>
                    )}
                    {booking.status === 'COMPLETED' && booking.review && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                        <CheckCircle2 size={14} className="text-emerald-600" /> Reviewed ({booking.review.rating}★)
                      </span>
                    )}

                    {booking.status === 'CANCELLED' && (
                      <span className="text-xs font-semibold text-stone-500 flex items-center gap-1 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
                        <XCircle size={14} className="text-red-500" /> Cancelled (100% Refund Initiated)
                      </span>
                    )}

                    {['PENDING', 'CONFIRMED', 'PROFESSIONAL_ASSIGNED', 'PROFESSIONAL_ON_THE_WAY'].includes(booking.status) && (
                      <button
                        onClick={() => setCancelModalBooking(booking)}
                        id={`cancel-booking-btn-${booking.id}`}
                        className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <XCircle size={14} className="text-red-600" /> Cancel Booking
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => setDisputeModalBooking(booking)}
                    id={`dispute-btn-${booking.id}`}
                    className="text-xs text-stone-500 hover:text-stone-800 underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <AlertTriangle size={13} className="text-amber-600" /> Need Help / Open Dispute
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal (BRULE-005) */}
      {reviewModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-strong">
            <h3 className="text-xl font-bold text-neutral-dark mb-1">Rate Your Experience</h3>
            <p className="text-xs text-neutral mb-6">
              How did {reviewModalBooking.professional_name} perform on {reviewModalBooking.service_name}?
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-2">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl transition-transform hover:scale-125 ${
                        star <= rating ? 'text-warning' : 'text-neutral-light'
                      }`}
                    >
                      <Star size={28} className={star <= rating ? 'fill-warning' : ''} />
                    </button>
                  ))}
                  <span className="font-black text-lg text-neutral-dark pl-2">{rating}.0</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-dark mb-1.5">Feedback / Comments</label>
                <textarea
                  rows={3}
                  id="review-comment-input"
                  placeholder="Share details of your experience with the workmanship, punctuality, and cleanup..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-lighter border border-neutral-light text-sm outline-none"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalBooking(null)}
                  className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-xs text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-review-btn"
                  disabled={submittingReview}
                  className="flex-1 py-3 rounded-xl btn-primary text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dispute Modal */}
      {disputeModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-strong border border-stone-200">
            <h3 className="text-xl font-bold text-stone-900 mb-1">Open Dispute Ticket</h3>
            <p className="text-xs text-stone-500 mb-6">
              Our administration resolution team will investigate booking #{disputeModalBooking.booking_number}.
            </p>

            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">Issue Description</label>
                <textarea
                  rows={4}
                  id="dispute-reason-input"
                  placeholder="Explain what went wrong with the service or billing..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDisputeModalBooking(null)}
                  className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-xs text-stone-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  id="submit-dispute-btn"
                  disabled={submittingDispute}
                  className="flex-1 py-3 rounded-xl btn-accent text-white font-bold text-xs shadow-md cursor-pointer"
                >
                  {submittingDispute ? 'Submitting...' : 'File Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Interactive Cancel Booking Modal */}
      {cancelModalBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-strong border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100">
              <XCircle size={26} />
            </div>

            <h3 className="text-xl font-black text-stone-900 text-center mb-1">Cancel Booking?</h3>
            <p className="text-xs text-stone-500 text-center mb-6 leading-relaxed">
              Are you sure you want to cancel booking <strong className="text-stone-800">#{cancelModalBooking.booking_number}</strong> for {cancelModalBooking.service_name}?
            </p>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 mb-5 text-xs text-emerald-800 font-medium flex items-center gap-2">
              <ShieldCheck size={18} className="text-emerald-700 shrink-0" />
              <span>100% money-back guarantee: Any pre-paid amount (₹{cancelModalBooking.total_amount}) will be automatically refunded.</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-800 mb-1.5">Reason for Cancellation</label>
                <select
                  id="cancel-reason-select"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-xs font-semibold text-stone-800 outline-none focus:border-red-400"
                >
                  <option value="Change of schedule / plans">Change of schedule / plans</option>
                  <option value="Booked by mistake / wrong service">Booked by mistake / wrong service</option>
                  <option value="Found alternative local service">Found alternative local service</option>
                  <option value="Emergency resolved on own">Emergency resolved on own</option>
                  <option value="Technician requested cancellation">Technician requested cancellation</option>
                  <option value="Other reasons">Other reasons</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setCancelModalBooking(null)}
                  className="flex-1 py-3 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-xs text-stone-700 cursor-pointer transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  type="button"
                  id="confirm-cancel-booking-btn"
                  onClick={confirmCancelBooking}
                  disabled={cancelling}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                >
                  {cancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
