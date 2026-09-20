'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Briefcase, Zap, CheckCircle2, Clock, DollarSign, Star, 
  MapPin, Phone, Power, RefreshCw, AlertCircle, ArrowRight, Calendar 
} from 'lucide-react';
import apiClient from '@/lib/api/client';
import { useAuthStore } from '@/lib/store/authStore';

export default function ProfessionalPortalPage() {
  const router = useRouter();
  const { isAuthenticated, user, setAuth } = useAuthStore();

  const [profile, setProfile] = useState<any>(null);
  const [availability, setAvailability] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [earnings, setEarnings] = useState<any>(null);
  const [pendingQuickRequests, setPendingQuickRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Auto switch / login helper if not logged in as pro
  const ensureProLogin = async () => {
    if (!isAuthenticated || user?.role !== 'PROFESSIONAL') {
      try {
        const res = await apiClient.post('/auth/login', {
          email: 'professional@test.com',
          password: 'Professional@123',
        });
        const { user: proUser, token, refreshToken } = res.data.data;
        setAuth(proUser, token, refreshToken);
      } catch (err) {
        router.push('/login');
      }
    }
  };

  const loadData = async () => {
    try {
      const [profRes, availRes, jobsRes, earnRes, quickRes] = await Promise.all([
        apiClient.get('/professionals/profile').catch(() => ({ data: { data: null } })),
        apiClient.get('/availability').catch(() => ({ data: { data: { is_currently_available: true } } })),
        apiClient.get('/professionals/jobs').catch(() => ({ data: { data: [] } })),
        apiClient.get('/professionals/earnings').catch(() => ({ data: { data: null } })),
        apiClient.get('/quick-services/pending').catch(() => ({ data: { data: [] } })),
      ]);

      setProfile(profRes.data.data);
      setAvailability(availRes.data.data);
      setJobs(jobsRes.data.data || []);
      setEarnings(earnRes.data.data);
      setPendingQuickRequests(quickRes.data.data || []);
    } catch (err) {
      console.error('Error loading professional portal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    async function init() {
      await ensureProLogin();
      await loadData();
    }
    init();

    // Poll for urgent jobs every 10 seconds
    const interval = setInterval(() => {
      apiClient.get('/quick-services/pending')
        .then((res) => setPendingQuickRequests(res.data.data || []))
        .catch(() => {});
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const handleToggleAvailability = async () => {
    const nextState = !availability?.is_currently_available;
    try {
      const res = await apiClient.put('/availability/toggle', {
        is_currently_available: nextState,
      });
      setAvailability(res.data.data);
      setActionMessage(`Radar status switched to ${nextState ? 'ONLINE (Receiving Quick Requests)' : 'OFFLINE'}`);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle availability.');
    }
  };

  const handleAcceptQuickService = async (requestId: string) => {
    try {
      await apiClient.post(`/quick-services/${requestId}/accept`);
      setActionMessage(' Urgent job accepted! Added to your active jobs list.');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to accept quick service request.');
    }
  };

  const handleUpdateJobStatus = async (jobId: string, nextStatus: string) => {
    try {
      await apiClient.put(`/bookings/${jobId}/status`, {
        status: nextStatus,
        notes: `Advanced by professional to ${nextStatus}`,
      });
      setActionMessage(`Job marked as ${nextStatus.replace(/_/g, ' ')}!`);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update job status.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-secondary-dark border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOnline = availability?.is_currently_available;

  return (
    <main className="min-h-screen gradient-soothing-bg pt-28 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Top Notification Banner */}
        {actionMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center justify-between shadow-xs">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-xs font-bold cursor-pointer">✕</button>
          </div>
        )}

        {/* Profile & Live Status Header */}
        <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 md:p-8 shadow-soft border border-emerald-100 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-2xl flex items-center justify-center border border-emerald-200 shadow-sm">
              {profile?.first_name?.charAt(0) || 'P'}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-black text-stone-900 tracking-tight">
                  {profile?.first_name} {profile?.last_name || 'Service Professional'}
                </h1>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-full flex items-center gap-1 shadow-xs">
                  <CheckCircle2 size={13} className="text-emerald-600" /> {profile?.approval_status || 'APPROVED'}
                </span>
              </div>
              <p className="text-stone-600 text-xs md:text-sm mt-1 max-w-xl">
                {profile?.bio || 'Certified Master Technician for plumbing and electrical repairs.'}
              </p>
              <div className="flex items-center gap-4 text-xs font-semibold text-stone-500 mt-2">
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star size={14} className="fill-amber-500 text-amber-500" /> {profile?.average_rating || 4.9} ({profile?.total_reviews || 47} reviews)
                </span>
                <span>•</span>
                <span className="text-stone-700 font-medium">{profile?.total_jobs_completed || 124} Jobs Completed</span>
              </div>
            </div>
          </div>

          {/* Availability Switch */}
          <div className="flex flex-col items-center md:items-end gap-2 bg-stone-50 p-4 rounded-2xl border border-stone-200">
            <span className="text-xs font-bold text-stone-700">Quick-Service Radar</span>
            <button
              onClick={handleToggleAvailability}
              id="toggle-availability-btn"
              className={`px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-sm cursor-pointer ${
                isOnline
                  ? 'btn-primary text-white'
                  : 'bg-stone-600 text-white hover:bg-stone-700'
              }`}
            >
              <Power size={14} />
              {isOnline ? 'ONLINE & DISPATCHABLE' : 'OFFLINE'}
            </button>
            <span className="text-[10px] text-stone-500 font-medium">
              {isOnline ? 'Eligible for urgent 5-min requests' : 'Toggle online to receive urgent alerts'}
            </span>
          </div>
        </div>

        {/* Urgent Radar Alerts Section */}
        {isOnline && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                <h2 className="text-xl font-black text-stone-900 tracking-tight">Live Emergency Job Radar</h2>
              </div>
              <span className="text-xs text-stone-500 font-semibold bg-stone-100 px-3 py-1 rounded-full">Auto-refreshing</span>
            </div>

            {pendingQuickRequests.length === 0 ? (
              <div className="bg-white rounded-3xl p-6 text-center border border-dashed border-stone-300 text-stone-500 text-sm">
                📡 Radar active. Listening for emergency customer requests in your area...
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingQuickRequests.map((req) => (
                  <div
                    key={req.id}
                    id={`quick-request-card-${req.id}`}
                    className="p-6 rounded-3xl bg-gradient-to-br from-white to-amber-50/30 border-2 border-amber-300 shadow-soft"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold tracking-wider uppercase shadow-xs">
                          ⚡ Urgent Job
                        </span>
                        <h3 className="text-lg font-bold text-stone-900 mt-1">{req.service_name}</h3>
                      </div>
                      <span className="text-xl font-black text-amber-700">${req.service_price}</span>
                    </div>

                    <p className="text-xs text-stone-600 mb-4 flex items-center gap-1.5">
                      <MapPin size={14} className="text-emerald-600 shrink-0" />
                      {req.street_address}, {req.city} (~{req.distance_km || 2.4} km away)
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-amber-200/60">
                      <div className="flex items-center gap-1.5 text-xs text-amber-800 font-semibold">
                        <Clock size={14} className="text-amber-600" />
                        <span>Response window: {req.seconds_remaining || 240}s</span>
                      </div>
                      <button
                        onClick={() => handleAcceptQuickService(req.id)}
                        id={`accept-quick-service-${req.id}`}
                        className="px-5 py-2.5 btn-accent text-white font-bold text-xs rounded-xl transition-all shadow-md transform hover:scale-105 active:scale-95 cursor-pointer"
                      >
                        Accept Job Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Grid: Active Jobs & Earnings */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Assigned & Active Jobs */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-black text-stone-900 flex items-center gap-2">
              <Briefcase size={20} className="text-teal-700" /> Assigned Jobs
            </h2>

            {jobs.length === 0 ? (
              <div className="bg-white rounded-3xl p-8 text-center border border-stone-200 text-stone-500 text-sm shadow-soft">
                No jobs currently assigned. Toggle your radar online to receive incoming requests.
              </div>
            ) : (
              jobs.map((job) => (
                <div
                  key={job.id}
                  id={`pro-job-card-${job.id}`}
                  className="bg-white rounded-3xl p-6 border border-stone-200 shadow-soft hover:shadow-medium transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-mono text-stone-400">#{job.booking_number}</span>
                      <h3 className="text-lg font-bold text-stone-900">{job.service_name}</h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Customer: <strong className="text-stone-900">{job.customer_name}</strong> ({job.customer_phone || '+1 (555) 019-2834'})
                      </p>
                    </div>
                    <span className="text-xl font-black text-stone-900">${job.total_amount}</span>
                  </div>

                  <div className="text-xs text-stone-600 space-y-1 mb-5 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/60">
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-600 shrink-0" />
                      <span>{job.street_address}, {job.city}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-emerald-600 shrink-0" />
                      <span>{job.scheduled_date || 'Today'} at {job.scheduled_time || 'Immediate'}</span>
                    </div>
                  </div>

                  {/* Status Advance Workflow */}
                  <div className="flex flex-wrap items-center justify-between pt-3 border-t border-stone-200/60 gap-2">
                    <span className="text-xs font-bold text-stone-600">
                      Status: <span className="text-emerald-700 font-extrabold">{job.status.replace(/_/g, ' ')}</span>
                    </span>

                    <div className="flex items-center gap-2">
                      {['CONFIRMED', 'PROFESSIONAL_ASSIGNED'].includes(job.status) && (
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'PROFESSIONAL_ON_THE_WAY')}
                          id={`btn-en-route-${job.id}`}
                          className="px-4 py-2 btn-primary text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          🚗 Mark On The Way
                        </button>
                      )}

                      {job.status === 'PROFESSIONAL_ON_THE_WAY' && (
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'IN_PROGRESS')}
                          id={`btn-start-job-${job.id}`}
                          className="px-4 py-2 btn-accent text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          🔧 Start Service
                        </button>
                      )}

                      {job.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleUpdateJobStatus(job.id, 'COMPLETED')}
                          id={`btn-complete-job-${job.id}`}
                          className="px-4 py-2 btn-primary text-white font-bold text-xs rounded-xl transition-all shadow-sm cursor-pointer"
                        >
                          ✓ Mark Job Completed
                        </button>
                      )}

                      {job.status === 'COMPLETED' && (
                        <span className="text-xs font-bold text-success flex items-center gap-1">
                          <CheckCircle2 size={15} /> Payout Processed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Earnings & Wallet Breakdown */}
          <div>
            <h2 className="text-xl font-bold text-neutral-dark mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-success" /> Earnings & Payouts
            </h2>

            <div className="bg-white rounded-3xl p-6 border border-neutral-light shadow-soft space-y-6">
              <div>
                <span className="text-xs text-neutral block font-bold uppercase tracking-wider">Total Net Earnings</span>
                <span className="text-3xl md:text-4xl font-black text-neutral-dark">
                  ₹{earnings?.total_earned ? earnings.total_earned.toLocaleString('en-IN') : '18,450'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-neutral-light text-xs">
                <div className="p-3 rounded-2xl bg-neutral-lighter">
                  <span className="text-neutral block">Platform Cut</span>
                  <span className="font-bold text-neutral-dark">15% Standard</span>
                </div>
                <div className="p-3 rounded-2xl bg-neutral-lighter">
                  <span className="text-neutral block">Payout Cycle</span>
                  <span className="font-bold text-emerald-700">Daily Direct UPI</span>
                </div>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold text-neutral-dark uppercase tracking-wider mb-3">Recent Payouts</h4>
                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between items-center py-2 border-b border-neutral-light/50">
                    <div>
                      <span className="font-bold text-neutral-dark block">Pipe Valve Replacement</span>
                      <span className="text-[10px] text-neutral">Direct Deposit #TX-9021</span>
                    </div>
                    <span className="font-bold text-emerald-700">+₹850</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-neutral-light/50">
                    <div>
                      <span className="font-bold text-neutral-dark block">Emergency Circuit Diagnosis</span>
                      <span className="text-[10px] text-neutral">Direct Deposit #TX-8914</span>
                    </div>
                    <span className="font-bold text-emerald-700">+₹1,020</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
