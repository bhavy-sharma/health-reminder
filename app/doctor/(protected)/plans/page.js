// app/doctor/(protected)/plans/page.jsx
"use client";

import { useState, useEffect } from "react";
import { Bell, Shield, Zap, Crown, Check, X as XIcon, CreditCard, Lock, Download, X, Loader2, Clock } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";

export default function PlansAndBilling() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState({
    currentPlan: 'free',
    bookingsThisMonth: 0,
    bookingsRemaining: 0,
    planLimit: 10,
    isUnlimited: false,
    hasReachedLimit: false,
    doctorName: '',
    doctorEmail: '',
    doctorPhone: '',
    subscription: null,
    paymentHistory: [],
    pricing: {
      monthly: { pro: 349, premium: 699 },
      annual: { pro: 799, premium: 1999 },
    }
  });

  const proPrice = isAnnual ? planData.pricing.annual.pro : planData.pricing.monthly.pro;
  const premiumPrice = isAnnual ? planData.pricing.annual.premium : planData.pricing.monthly.premium;

  // Fetch doctor and plan data
  useEffect(() => {
    fetchPlanData();
  }, []);

  const fetchPlanData = async () => {
    try {
      setLoading(true);
      setError(null);

      // First get doctor profile
      const profileRes = await fetch('/api/doctor/profile');
      const profileResult = await profileRes.json();

      if (!profileRes.ok) {
        throw new Error(profileResult.error || 'Failed to fetch profile');
      }

      // Then get plan data
      const planRes = await fetch('/api/doctor/plans');
      const planResult = await planRes.json();

      if (!planRes.ok) {
        throw new Error(planResult.error || 'Failed to fetch plan data');
      }

      if (planResult.success) {
        const data = planResult.data;
        setPlanData({
          currentPlan: data.currentPlan || 'free',
          bookingsThisMonth: data.bookingsThisMonth || 0,
          bookingsRemaining: data.bookingsRemaining || 0,
          planLimit: data.planLimit || 10,
          isUnlimited: data.isUnlimited || false,
          hasReachedLimit: data.hasReachedLimit || false,
          doctorName: profileResult.data?.fullName || '',
          doctorEmail: profileResult.data?.email || '',
          doctorPhone: profileResult.data?.phone || '',
          subscription: data.subscription || null,
          paymentHistory: data.paymentHistory || [],
          pricing: data.pricing || {
            monthly: { pro: 349, premium: 699 },
            annual: { pro: 799, premium: 1999 },
          }
        });
      }
    } catch (err) {
      console.error('Error fetching plan data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = async (plan, billingCycle) => {
    try {
      setProcessing(true);
      setError(null);

      // 1. Create order
      const orderResponse = await fetch('/api/doctor/plans/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle }),
      });

      const orderResult = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderResult.error || 'Failed to create order');
      }

      const { orderId, amount, currency, keyId, subscriptionId } = orderResult.data;

      // 2. Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'FamilyHealth',
        description: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan - ${billingCycle}`,
        order_id: orderId,
        handler: async function (response) {
          try {
            const verifyResponse = await fetch('/api/doctor/plans/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                subscriptionId,
                plan,
                billingCycle,
              }),
            });

            const verifyResult = await verifyResponse.json();

            if (verifyResponse.ok) {
              toast.success('Plan upgraded successfully!');
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              throw new Error(verifyResult.error || 'Payment verification failed');
            }
          } catch (err) {
            toast.error(err.message || 'Payment verification failed');
            setError(err.message);
          }
        },
        prefill: {
          name: planData.doctorName,
          email: planData.doctorEmail,
          contact: planData.doctorPhone,
        },
        theme: {
          color: '#0D1B2A',
        },
        modal: {
          ondismiss: function () {
            setProcessing(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (err) {
      console.error('Upgrade error:', err);
      setError(err.message);
      toast.error(err.message || 'Failed to process upgrade');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 pb-24 h-screen overflow-y-auto relative">
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-[var(--color-navy)] animate-spin mx-auto mb-4" />
            <p className="text-gray-500">Loading plan details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    if (error.includes('pending') || error.includes('verification')) {
      return (
        <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)]">
          <div className="text-center max-w-md bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Profile is Under Verification</h2>
            <p className="text-gray-500 mb-6 text-sm leading-relaxed">
              Your profile is under verification. Premium plans can be purchased after your account has been approved.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors"
            >
              Refresh Status
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex items-center justify-center h-[calc(100vh-200px)]">
        <div className="max-w-4xl mx-auto p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      </div>
    );
  }

  const isCurrentPlan = (plan) => planData.currentPlan === plan;

  return (
    <div className="p-8 pb-24 h-screen overflow-y-auto relative">
      <Toaster position="top-right" />
      
      {/* Top Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] font-medium">
          <span>Doctor Portal</span>
          <span>/</span>
          <span className="text-[var(--color-navy)] font-bold">Plans & Billing</span>
        </div>
        <button className="relative p-2 text-[var(--color-navy)] hover:bg-white/50 rounded-full transition-colors">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[var(--color-pulse-red)] rounded-full border-2 border-[var(--color-cream)]"></span>
        </button>
      </div>

      {/* Page Title & Subtitle */}
      <div className="mb-8">
        <h1 className="font-fraunces text-4xl font-bold text-[var(--color-navy)] mb-2">Plans & Billing</h1>
        <p className="text-[var(--color-text-muted)] font-medium">Upgrade to reach more patients and grow your practice</p>
      </div>

      {/* Current Plan Summary Card */}
      <div className="bg-white rounded-[var(--radius-card-lg)] border border-[var(--color-border)] p-6 mb-10 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#efebe4] rounded-xl flex items-center justify-center text-[var(--color-text-secondary)]">
            <Shield size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-navy)]">
              {planData.currentPlan.charAt(0).toUpperCase() + planData.currentPlan.slice(1)} Plan — Active
            </h3>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">
              {planData.bookingsThisMonth} / {planData.isUnlimited ? '∞' : planData.planLimit} bookings used this month
              {planData.hasReachedLimit && (
                <span className="text-red-500 ml-2 font-bold">⚠️ Limit reached</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#e6f4ef] text-[#4a9e7f] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4a9e7f]"></span> Active
          </div>
          {planData.hasReachedLimit && planData.currentPlan !== 'premium' && (
            <Link 
              href="/doctor/plans"
              className="bg-amber-500 text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-amber-600 transition-colors"
            >
              Upgrade
            </Link>
          )}
        </div>
      </div>

      {/* Pricing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-10">
        <span className={`font-bold text-sm ${!isAnnual ? 'text-[var(--color-navy)]' : 'text-[var(--color-text-muted)]'}`}>Monthly</span>
        <button
          onClick={() => setIsAnnual(!isAnnual)}
          className="w-12 h-6 bg-[var(--color-border)] rounded-full relative transition-colors"
        >
          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-300 ${isAnnual ? 'left-7' : 'left-1'}`}></div>
        </button>
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${isAnnual ? 'text-[var(--color-navy)]' : 'text-[var(--color-text-muted)]'}`}>Annual</span>
          <span className="bg-[#e6f4ef] text-[#4a9e7f] px-2 py-0.5 rounded-md text-xs font-bold">Save 20%</span>
        </div>
      </div>



      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto space-y-8">

        {/* FREE PLAN */}
        <div className={`bg-[#efebe4] rounded-[2rem] border border-[var(--color-border)] p-8 ${isCurrentPlan('free') ? 'ring-2 ring-[#4a9e7f]' : ''}`}>
          <div className="flex flex-col gap-6 mb-8">
            <h2 className="font-fraunces text-3xl font-bold text-[var(--color-navy)] flex items-center gap-2">
              <Shield size={28} className="text-[var(--color-text-secondary)]" /> Free
              {isCurrentPlan('free') && (
                <span className="text-xs font-bold text-[#4a9e7f] flex items-center gap-1 font-sans ml-2"><Check size={14} /> Current Plan</span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Basic profile listing</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Up to 10 bookings / month</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Patient reviews & ratings</div>
            {/* <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Standard search placement</div> */}
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Priority search placement</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Analytics dashboard</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Verified badge boost</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> WhatsApp appointment reminders</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Video consultation support</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Dedicated account manager</div>
          </div>

          <button disabled className="w-full bg-[#e2ddd5] text-[var(--color-text-secondary)] font-bold py-3.5 rounded-xl cursor-not-allowed">
            {isCurrentPlan('free') ? 'Current Plan' : 'Downgrade to Free'}
          </button>
        </div>

        {/* PRO PLAN */}
        <div className={`bg-white rounded-[2rem] border-2 ${isCurrentPlan('pro') ? 'border-[#4a9e7f]' : 'border-[var(--color-navy)]'} overflow-hidden shadow-lg ${isCurrentPlan('pro') ? 'ring-2 ring-[#4a9e7f] ring-offset-2' : ''}`}>
          <div className={`${isCurrentPlan('pro') ? 'bg-[#4a9e7f]' : 'bg-[var(--color-navy)]'} p-8 text-white relative`}>
            <h2 className="font-fraunces text-3xl font-bold flex items-center gap-3 mb-2">
              <Zap size={28} className="text-white" /> Pro
              <span className="bg-white/20 text-white text-xs px-3 py-1 rounded-full font-sans tracking-wide">Most Popular</span>
            </h2>
            <div className="flex items-baseline gap-1">
              <span className="font-fraunces text-5xl font-bold">₹{proPrice}</span>
              <span className="text-white/70 font-medium">/month</span>
            </div>
            {isAnnual && <p className="text-white/80 text-sm mt-1 font-bold">Billed annually (₹{proPrice * 12}/yr)</p>}
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Everything in Free</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Up to 50 bookings / month</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Priority search placement</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Verified badge boost</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Basic analytics dashboard</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> WhatsApp appointment reminders</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Video consultation support</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Unlimited bookings</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Advanced analytics</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Dedicated account manager</div>
            </div>

            <button 
              onClick={() => handleUpgrade('pro', isAnnual ? 'annual' : 'monthly')}
              disabled={processing || isCurrentPlan('pro')}
              className={`w-full font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2
                ${isCurrentPlan('pro') 
                  ? 'bg-[#e6f4ef] text-[#4a9e7f] cursor-not-allowed' 
                  : 'bg-[var(--color-navy)] hover:bg-opacity-90 text-white'
                }`}
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isCurrentPlan('pro') ? 'Current Plan' : 'Upgrade to Pro →'}
            </button>
          </div>
        </div>

        {/* PREMIUM PLAN */}
        <div className={`bg-white rounded-[2rem] border ${isCurrentPlan('premium') ? 'border-[#df9b3a]' : 'border-[var(--color-warm-amber)]'} overflow-hidden shadow-md mb-12 ${isCurrentPlan('premium') ? 'ring-2 ring-[#df9b3a] ring-offset-2' : ''}`}>
          <div className={`${isCurrentPlan('premium') ? 'bg-[#df9b3a]' : 'bg-[#fef8f0]'} p-8 relative`}>
            <h2 className={`font-fraunces text-3xl font-bold flex items-center gap-3 mb-2 ${isCurrentPlan('premium') ? 'text-white' : 'text-[var(--color-navy)]'}`}>
              <Crown size={28} className={`${isCurrentPlan('premium') ? 'text-white' : 'text-[var(--color-warm-amber)]'}`} /> Premium
              <span className={`${isCurrentPlan('premium') ? 'bg-white/20 text-white' : 'bg-[var(--color-warm-amber)] text-white'} text-xs px-3 py-1 rounded-full font-sans tracking-wide`}>Best Value</span>
            </h2>
            <div className={`flex items-baseline gap-1 ${isCurrentPlan('premium') ? 'text-white' : 'text-[var(--color-navy)]'}`}>
              <span className="font-fraunces text-5xl font-bold">₹{premiumPrice}</span>
              <span className={`${isCurrentPlan('premium') ? 'text-white/80' : 'text-[var(--color-text-secondary)]'} font-medium`}>/month</span>
            </div>
            {isAnnual && <p className={`${isCurrentPlan('premium') ? 'text-white/80' : 'text-[var(--color-warm-amber)]'} text-sm mt-1 font-bold`}>Billed annually (₹{premiumPrice * 12}/yr)</p>}
            <Crown size={64} className={`absolute right-8 top-8 ${isCurrentPlan('premium') ? 'text-white/10' : 'text-[var(--color-warm-amber)] opacity-20'}`} />
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Everything in Pro</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> 150 bookings</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Top placement — disease searches</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Advanced analytics</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Video consultation</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Dedicated account manager</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Priority customer support</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Multi-location support</div>
              {/* <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Patient follow-up automation</div> */}
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Verified Doctor badge</div>
            </div>

            <button 
              onClick={() => handleUpgrade('premium', isAnnual ? 'annual' : 'monthly')}
              disabled={processing || isCurrentPlan('premium')}
              className={`w-full font-bold py-4 rounded-xl transition-colors flex items-center justify-center gap-2
                ${isCurrentPlan('premium') 
                  ? 'bg-[#fef8f0] text-[#df9b3a] cursor-not-allowed border border-[#df9b3a]' 
                  : 'bg-[#df9b3a] hover:bg-[#cf8b2a] text-white shadow-sm'
                }`}
            >
              {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
              {isCurrentPlan('premium') ? 'Current Plan' : 'Upgrade to Premium →'}
            </button>
          </div>
        </div>

      </div>

      {/* Billing History */}
      <div className="max-w-4xl mx-auto mt-16 mb-8">
        <h2 className="font-fraunces text-2xl font-bold text-[var(--color-navy)] mb-6">Billing History</h2>

        <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-sm p-2">
          {planData.paymentHistory.length > 0 ? (
            planData.paymentHistory.map((invoice, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 hover:bg-[#efebe4]/30 rounded-2xl transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-[#efebe4] rounded-xl flex items-center justify-center text-[var(--color-text-secondary)]">
                    <CreditCard size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-navy)] text-sm">
                      {invoice.plan.charAt(0).toUpperCase() + invoice.plan.slice(1)} Plan
                    </p>
                    <p className="text-xs text-[var(--color-text-muted)] font-medium">
                      {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                    invoice.status === 'Active' 
                      ? 'bg-[#e6f4ef] text-[#4a9e7f]' 
                      : 'bg-[#efebe4] text-[var(--color-text-secondary)]'
                  }`}>
                    {invoice.status}
                  </span>
                  <span className="font-bold text-[var(--color-navy)] w-12 text-right">₹{invoice.amount}</span>
                  <button className="text-[var(--color-text-muted)] hover:text-[var(--color-navy)] transition-colors">
                    <Download size={18} />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-[var(--color-text-muted)]">
              No payment history yet
            </div>
          )}
        </div>
      </div>

      {/* Upgrade Modal Overlay */}
      {upgradePlan && (
        <div className="fixed inset-0 bg-[var(--color-navy)]/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setUpgradePlan(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
              <h3 className="font-fraunces text-xl font-bold text-[var(--color-navy)]">Complete Upgrade</h3>
              <button onClick={() => setUpgradePlan(null)} className="text-[var(--color-text-muted)] hover:text-[var(--color-navy)]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="bg-[#fefaf3] rounded-2xl p-5 mb-6 flex justify-between items-center border border-[var(--color-border)]">
                <div>
                  <p className="font-bold text-[var(--color-navy)]">{upgradePlan === 'pro' ? 'Pro Plan' : 'Premium Plan'}</p>
                  <p className="text-sm text-[var(--color-text-muted)]">{isAnnual ? 'Billed annually' : 'Billed monthly'}</p>
                </div>
                <div className="text-right">
                  <p className="font-fraunces text-2xl font-bold text-[var(--color-navy)] flex items-baseline justify-end gap-1">
                    ₹{upgradePlan === 'pro' ? proPrice : premiumPrice} <span className="text-sm font-sans text-[var(--color-text-muted)]">/mo</span>
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Card Number</label>
                  <div className="relative">
                    <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                    <input type="text" placeholder="4242 4242 4242 4242" className="w-full bg-[#fefaf3] rounded-xl py-3 pl-12 pr-4 outline-none border border-transparent focus:border-[var(--color-navy)] text-sm font-medium text-[var(--color-navy)]" />
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">Expiry</label>
                    <input type="text" placeholder="MM / YY" className="w-full bg-[#fefaf3] rounded-xl py-3 px-4 outline-none border border-transparent focus:border-[var(--color-navy)] text-sm font-medium text-[var(--color-navy)]" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-[10px] font-bold text-[var(--color-text-muted)] uppercase tracking-wider mb-2">CVV</label>
                    <input type="password" placeholder="•••" className="w-full bg-[#fefaf3] rounded-xl py-3 px-4 outline-none border border-transparent focus:border-[var(--color-navy)] text-sm font-medium text-[var(--color-navy)]" />
                  </div>
                </div>
              </div>

              <button 
                onClick={() => handleUpgrade(upgradePlan, isAnnual ? 'annual' : 'monthly')}
                disabled={processing}
                className="w-full bg-[var(--color-navy)] text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2 mb-4 disabled:opacity-50"
              >
                {processing ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                {processing ? 'Processing...' : `Pay ₹${upgradePlan === 'pro' ? proPrice : premiumPrice} via Razorpay`}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-[var(--color-text-secondary)] font-medium">
                <Lock size={12} className="text-[var(--color-warm-amber)]" /> Secured by Razorpay · Cancel anytime
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}