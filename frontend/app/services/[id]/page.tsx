'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { 
  Star, Clock, ShieldCheck, Zap, Calendar, MapPin, 
  CreditCard, CheckCircle2, ChevronRight, AlertCircle, ArrowRight,
  QrCode, Smartphone, Building2, Banknote, Tag, Sparkles
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params.id as string;
  const { isAuthenticated, user } = useAuthStore();

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Booking Flow State
  const [bookingType, setBookingType] = useState<'SCHEDULED' | 'QUICK_SERVICE'>('SCHEDULED');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('10:00');
  const [streetAddress, setStreetAddress] = useState<string>('742 Evergreen Heights');
  const [city, setCity] = useState<string>('Bangalore');
  const [notes, setNotes] = useState<string>('');

  // Payment Options State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'PAY_AFTER_SERVICE'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'qr'>('gpay');
  const [upiId, setUpiId] = useState('user@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('888');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  
  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState<string | null>(null);

  const [bookingStep, setBookingStep] = useState<'DETAILS' | 'PAYMENT' | 'CONFIRMED'>('DETAILS');
  const [createdBooking, setCreatedBooking] = useState<any>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadService() {
      try {
        const res = await apiClient.get(`/services/${serviceId}`);
        setService(res.data.data);
      } catch (err) {
        console.error('Failed to load service:', err);
      } finally {
        setLoading(false);
      }
    }
    if (serviceId) loadService();
  }, [serviceId]);

  const handleStartBooking = (type: 'SCHEDULED' | 'QUICK_SERVICE') => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/services/${serviceId}`);
      return;
    }
    setBookingType(type);
    setIsBookingModalOpen(true);
    setBookingStep('DETAILS');
    setErrorMessage(null);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponCode.toUpperCase() === 'URBAN100' || couponCode.toUpperCase() === 'WELCOME100') {
      setCouponDiscount(100);
      setCouponMessage('✅ Coupon applied: ₹100 instant discount added!');
    } else {
      setCouponDiscount(0);
      setCouponMessage('❌ Invalid coupon code. Try URBAN100');
    }
  };

  const calculateFinalAmount = () => {
    if (!service) return 0;
    const base = service.base_price || 499;
    const discounted = Math.max(base - couponDiscount, 99);
    return discounted;
  };

  const handleProceedToPayment = async () => {
    setErrorMessage(null);
    const finalAmount = calculateFinalAmount();
    try {
      if (bookingType === 'QUICK_SERVICE') {
        // Quick service dispatch
        const res = await apiClient.post('/quick-services', {
          service_id: serviceId,
          street_address: streetAddress,
          city,
          notes: notes || '⚡ 10-Minute Urgent Flash Service Request',
        });
        setCreatedBooking(res.data.data);
        setBookingStep('PAYMENT');
      } else {
        // Scheduled booking creation
        const res = await apiClient.post('/bookings', {
          service_id: serviceId,
          street_address: streetAddress,
          city,
          booking_type: 'SCHEDULED',
          scheduled_date: selectedDate,
          scheduled_time: selectedTime,
          notes,
          total_amount: finalAmount,
        });
        setCreatedBooking(res.data.data);
        setBookingStep('PAYMENT');
      }
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Failed to initiate booking. Please verify your address.');
    }
  };

  const handleSimulatePayment = async () => {
    if (!createdBooking) return;
    setProcessingPayment(true);
    setErrorMessage(null);

    try {
      if (paymentMethod === 'PAY_AFTER_SERVICE') {
        // Doorstep cash/UPI on completion
        setBookingStep('CONFIRMED');
        return;
      }

      // 1. Create order
      await apiClient.post('/payments/create-order', {
        booking_id: createdBooking.id,
        gateway: 'RAZORPAY',
      });

      // 2. Simulate gateway authorization & signature verification
      const txnId = 'pay_rzp_' + Math.random().toString(36).substring(2, 12);
      await apiClient.post('/payments/verify', {
        booking_id: createdBooking.id,
        gateway_transaction_id: txnId,
        payment_status: 'COMPLETED',
      });

      setBookingStep('CONFIRMED');
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Payment processing failed. Please retry.');
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center gradient-soothing-bg">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen pt-32 text-center px-4 gradient-soothing-bg">
        <h2 className="text-2xl font-bold text-stone-900 mb-4">Service Not Found</h2>
        <Link href="/services" className="text-emerald-700 font-semibold hover:underline">
          Return to Services Catalog
        </Link>
      </div>
    );
  }

  const supportsQuick = service.service_type === 'QUICK' || service.service_type === 'BOTH';

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 gradient-soothing-bg">
      <div className="container mx-auto max-w-5xl">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-xs text-stone-500 mb-6 font-medium">
          <Link href="/" className="hover:text-emerald-700 font-medium transition-colors">Home</Link>
          <ChevronRight size={12} className="text-stone-400" />
          <Link href="/services" className="hover:text-emerald-700 font-medium transition-colors">Services</Link>
          <ChevronRight size={12} className="text-stone-400" />
          <span className="text-stone-900 font-bold">{service.name}</span>
        </div>

        {/* Hero Card */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-medium border border-emerald-100 mb-10 relative overflow-hidden">
          {/* Subtle decorative glows */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            <div className="md:col-span-2">
              <div className="flex flex-wrap items-center gap-2.5 mb-4">
                <span className="px-3.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 font-bold text-xs tracking-wide">
                  {service.category_name}
                </span>
                {supportsQuick && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-black text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full animate-pulse shadow-xs">
                    <Zap size={14} className="text-amber-600 fill-amber-500" /> ⚡ 10-Min Flash Service Guarantee
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-stone-900 mb-4 leading-tight tracking-tight">
                {service.name}
              </h1>

              <p className="text-stone-600 text-base md:text-lg leading-relaxed mb-8">
                {service.description}
              </p>

              {/* Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-6 border-t border-stone-200/80 text-stone-800 text-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center shrink-0">
                    <Clock className="text-emerald-700" size={18} />
                  </div>
                  <span className="font-semibold text-stone-800">Est. {service.estimated_duration_minutes} Mins</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100/80 flex items-center justify-center shrink-0">
                    <Star className="text-amber-600 fill-amber-500" size={18} />
                  </div>
                  <span className="font-semibold text-stone-800">4.9 / 5.0 Rating</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100/80 flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-emerald-700" size={18} />
                  </div>
                  <span className="font-semibold text-stone-800">Verified & Insured</span>
                </div>
              </div>
            </div>

            {/* Pricing & Booking Card */}
            <div className="bg-gradient-to-br from-stone-50 via-emerald-50/25 to-amber-50/20 rounded-3xl p-6 md:p-8 border border-emerald-200/80 flex flex-col justify-between shadow-soft">
              <div>
                <span className="text-xs font-bold text-stone-500 tracking-wider uppercase block mb-1">
                  Baseline Pricing
                </span>
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl md:text-5xl font-black text-stone-900">
                    ₹{service.base_price}
                  </span>
                  <span className="text-stone-500 text-xs font-medium">All taxes included</span>
                </div>

                <div className="space-y-3 text-xs text-stone-700 mb-8 font-medium">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Background-verified professional</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>100% satisfaction guarantee</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>Free cancellation anytime before service</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleStartBooking('SCHEDULED')}
                  id="book-scheduled-service-btn"
                  className="w-full py-4 btn-primary rounded-2xl font-bold text-sm tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <Calendar size={18} /> Schedule Appointment (₹{service.base_price})
                </button>

                {supportsQuick && (
                  <button
                    onClick={() => handleStartBooking('QUICK_SERVICE')}
                    id="book-quick-service-btn"
                    className="w-full py-3.5 btn-accent rounded-2xl font-bold text-sm tracking-wide transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Zap size={18} /> ⚡ Instant Service in 10 Mins
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Booking Wizard Modal */}
      {isBookingModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-strong border border-stone-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-stone-200">
              <div>
                <h3 className="text-xl font-bold text-stone-900">
                  {bookingStep === 'DETAILS' && (bookingType === 'QUICK_SERVICE' ? '⚡ 10-Minute Flash Service Request' : '📅 Schedule Service')}
                  {bookingStep === 'PAYMENT' && '💳 Complete Payment'}
                  {bookingStep === 'CONFIRMED' && '🎉 Service Confirmed!'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">{service.name}</p>
              </div>
              {bookingStep !== 'CONFIRMED' && (
                <button
                  onClick={() => setIsBookingModalOpen(false)}
                  className="text-stone-400 hover:text-stone-700 p-2 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-2xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {errorMessage}
              </div>
            )}

            {/* STEP 1: DETAILS */}
            {bookingStep === 'DETAILS' && (
              <div className="space-y-4">
                {bookingType === 'SCHEDULED' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">Date</label>
                      <input
                        type="date"
                        id="booking-date-input"
                        value={selectedDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-800 mb-1.5">Time Slot</label>
                      <select
                        id="booking-time-select"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none"
                      >
                        <option value="09:00">09:00 AM - 11:00 AM</option>
                        <option value="11:30">11:30 AM - 01:30 PM</option>
                        <option value="14:00">02:00 PM - 04:00 PM</option>
                        <option value="16:30">04:30 PM - 06:30 PM</option>
                      </select>
                    </div>
                  </div>
                )}

                {bookingType === 'QUICK_SERVICE' && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 leading-relaxed space-y-1.5">
                    <div className="flex items-center gap-2 font-black text-amber-950">
                      <Zap size={16} className="text-amber-600 fill-amber-500" />
                      <span>⚡ 10-Minute Priority Arrival Guarantee</span>
                    </div>
                    <p className="text-amber-800/90 text-[11px]">
                      Our nearest verified technician is located within 2 km. An instant audio-dispatch ping has been queued for immediate arrival at your door.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">Service Address (Street & House/Flat)</label>
                  <div className="flex items-center px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200">
                    <MapPin size={16} className="text-emerald-700 mr-2 shrink-0" />
                    <input
                      type="text"
                      id="booking-street-address"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      placeholder="e.g. 42 Palm Grove, 4th Cross"
                      className="bg-transparent flex-1 text-sm outline-none text-stone-900"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">City</label>
                  <input
                    type="text"
                    id="booking-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none text-stone-900"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">Instructions / Problem Details</label>
                  <textarea
                    id="booking-notes"
                    rows={2}
                    placeholder="Describe specific issues or gate instructions for the pro..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-50 border border-stone-200 text-sm outline-none text-stone-900"
                  />
                </div>

                <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-stone-500 block">Total Amount</span>
                    <span className="text-2xl font-black text-stone-900">
                      ₹{service.base_price}
                    </span>
                  </div>
                  <button
                    onClick={handleProceedToPayment}
                    id="proceed-to-payment-btn"
                    className="px-6 py-3 btn-primary rounded-xl font-bold text-sm tracking-wide transition-all shadow-md cursor-pointer"
                  >
                    {bookingType === 'QUICK_SERVICE' ? 'Dispatch in 10 Mins' : 'Proceed to Payment'}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: PAYMENT OVERHAUL */}
            {bookingStep === 'PAYMENT' && (
              <div className="space-y-4">
                {/* Booking Order Pill */}
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] text-stone-500 font-bold uppercase tracking-wider block">Booking Reference</span>
                      <span className="font-mono font-extrabold text-stone-900 text-sm">{createdBooking?.booking_number}</span>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                      {bookingType === 'QUICK_SERVICE' ? '⚡ 10-Min Flash' : 'Scheduled'}
                    </span>
                  </div>
                </div>

                {/* Payment Methods Selection */}
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-2">Select Payment Method</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <button
                      type="button"
                      id="pay-tab-upi"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'UPI'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <Smartphone size={18} className="mx-auto mb-1 text-emerald-600" />
                      <span className="text-xs font-bold block">UPI</span>
                    </button>

                    <button
                      type="button"
                      id="pay-tab-card"
                      onClick={() => setPaymentMethod('CARD')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'CARD'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <CreditCard size={18} className="mx-auto mb-1 text-teal-600" />
                      <span className="text-xs font-bold block">Cards</span>
                    </button>

                    <button
                      type="button"
                      id="pay-tab-netbanking"
                      onClick={() => setPaymentMethod('NETBANKING')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'NETBANKING'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <Building2 size={18} className="mx-auto mb-1 text-amber-600" />
                      <span className="text-xs font-bold block">NetBanking</span>
                    </button>

                    <button
                      type="button"
                      id="pay-tab-cash"
                      onClick={() => setPaymentMethod('PAY_AFTER_SERVICE')}
                      className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                        paymentMethod === 'PAY_AFTER_SERVICE'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-900 shadow-xs'
                          : 'border-stone-200 text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      <Banknote size={18} className="mx-auto mb-1 text-emerald-700" />
                      <span className="text-xs font-bold block">Pay Later</span>
                    </button>
                  </div>
                </div>

                {/* Sub-panels for each method */}
                {paymentMethod === 'UPI' && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-800 block">Choose UPI Mode</span>
                    <div className="grid grid-cols-4 gap-2">
                      {[
                        { id: 'gpay', name: 'Google Pay' },
                        { id: 'phonepe', name: 'PhonePe' },
                        { id: 'paytm', name: 'Paytm' },
                        { id: 'qr', name: 'Scan QR' },
                      ].map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => setSelectedUpiApp(u.id as any)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedUpiApp === u.id
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {u.name}
                        </button>
                      ))}
                    </div>

                    {selectedUpiApp === 'qr' ? (
                      <div className="bg-white p-4 rounded-2xl border border-stone-200 text-center space-y-2">
                        <div className="w-32 h-32 mx-auto bg-stone-100 rounded-xl border border-dashed border-emerald-600 flex items-center justify-center">
                          <QrCode size={80} className="text-emerald-800" />
                        </div>
                        <p className="text-[11px] text-stone-500">Scan QR using any UPI app (GPay, PhonePe, Paytm, BHIM)</p>
                      </div>
                    ) : (
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Enter UPI VPA ID</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          placeholder="yourname@okhdfcbank"
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 outline-none text-stone-900 font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

                {paymentMethod === 'CARD' && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-800 block">Credit / Debit Card (Visa, Mastercard, RuPay)</span>
                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 outline-none text-stone-900 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 outline-none text-stone-900 font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">CVV</label>
                        <input
                          type="password"
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl bg-white border border-stone-200 outline-none text-stone-900 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NETBANKING' && (
                  <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <span className="text-xs font-bold text-stone-800 block">Select Your Bank</span>
                    <div className="grid grid-cols-3 gap-2">
                      {['HDFC', 'ICICI', 'SBI', 'Axis', 'Kotak', 'PNB'].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setSelectedBank(b)}
                          className={`p-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                            selectedBank === b
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {b} Bank
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'PAY_AFTER_SERVICE' && (
                  <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-2 text-xs text-emerald-900">
                    <div className="flex items-center gap-2 font-black text-sm text-emerald-950">
                      <CheckCircle2 size={16} className="text-emerald-700" />
                      <span>Zero Advance Payment Required</span>
                    </div>
                    <p className="leading-relaxed">
                      Pay the professional directly upon completion of service using Cash or technician's UPI QR Code. Only pay if 100% satisfied.
                    </p>
                  </div>
                )}

                {/* Promo Code input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter Coupon (e.g. URBAN100)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-stone-50 border border-stone-200 uppercase font-bold outline-none text-stone-900"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    Apply
                  </button>
                </form>
                {couponMessage && (
                  <span className="text-[11px] font-semibold text-emerald-700 block">{couponMessage}</span>
                )}

                {/* Price Breakdown */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs space-y-1.5">
                  <div className="flex justify-between text-stone-600">
                    <span>Base Fare:</span>
                    <span className="font-semibold text-stone-800">₹{service.base_price}</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>GST (18% included):</span>
                    <span className="font-semibold text-stone-800">₹{Math.round(service.base_price * 0.18)}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Promo Discount (URBAN100):</span>
                      <span>-₹{couponDiscount}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-stone-200 flex justify-between font-black text-stone-900 text-sm">
                    <span>Net Payable:</span>
                    <span>₹{calculateFinalAmount()}</span>
                  </div>
                </div>

                <button
                  onClick={handleSimulatePayment}
                  id="simulate-payment-btn"
                  disabled={processingPayment}
                  className="w-full py-4 btn-primary disabled:opacity-50 text-white rounded-2xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  {processingPayment
                    ? 'Processing Payment...'
                    : paymentMethod === 'PAY_AFTER_SERVICE'
                    ? 'Confirm Booking (Pay Later at Doorstep)'
                    : `Authorize & Pay ₹${calculateFinalAmount()}`}
                </button>
              </div>
            )}

            {/* STEP 3: CONFIRMED */}
            {bookingStep === 'CONFIRMED' && (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-2xl font-black text-stone-900">
                  {bookingType === 'QUICK_SERVICE' ? '⚡ 10-Min Flash Dispatch Active!' : 'Booking Confirmed!'}
                </h4>
                <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
                  {bookingType === 'QUICK_SERVICE'
                    ? 'Our certified technician has accepted your request and is en route! Estimated arrival in 10 minutes.'
                    : `Your booking #${createdBooking?.booking_number} is locked in. Verified technician assigned.`}
                </p>

                <div className="pt-4 flex flex-col gap-2">
                  <Link
                    href="/bookings"
                    id="go-to-my-bookings-btn"
                    className="w-full py-3.5 btn-primary font-bold rounded-2xl transition-all text-sm flex items-center justify-center shadow-md"
                  >
                    View Live Tracking in My Bookings
                  </Link>
                  <button
                    onClick={() => setIsBookingModalOpen(false)}
                    className="text-xs text-stone-500 hover:text-stone-800 py-2 cursor-pointer font-medium"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
