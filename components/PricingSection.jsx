// components/PricingSection.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { useUserPlan } from '@/hooks/useUserPlan';

export default function PricingSection() {
  const router = useRouter();
  const { plan: userPlan, loading: planLoading, refetch: refetchPlan } = useUserPlan();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: null,
      popular: false,
      priceValue: 0,
      features: [
        "2 family members",
        "500 MB storage",
        "3 WhatsApp reminders/Day",
        "Basic records",
      ],
      cta: "Start Free",
      dark: false,
      planId: "free",
    },
    {
      name: "Family",
      price: "₹499",
      period: "/month",
      popular: true,
      priceValue: 499,
      features: [
        "4 Family members",
        "2 GB storage",
        "16 WhatsApp reminders/Day",
        "Doctor PDF sharing",
        "Priority support",
      ],
      cta: "Start Family Plan",
      dark: true,
      planId: "family",
    },
    {
      name: "Premium",
      price: "₹699",
      period: "/month",
      popular: false,
      priceValue: 699,
      features: [
        "8 Family members",
        "4 GB storage",
        "32 WhatsApp reminders/Day",
        "Doctor PDF sharing",
        "Dedicated support",
      ],
      cta: "Start Premium",
      dark: false,
      planId: "premium",
    },
  ];

  const isCurrentPlan = (planId) => {
    return userPlan?.plan === planId && userPlan?.isActive;
  };

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        return data.user;
      }
      return null;
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  };

  const handlePlanClick = async (plan) => {
    // Check if user is already on this plan
    if (isCurrentPlan(plan.planId)) {
      toast.success(`You're already on the ${plan.name} plan!`);
      return;
    }

    const user = await checkAuth();
    
    if (!user) {
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white shadow-lg rounded-2xl pointer-events-auto flex flex-col border border-amber-100`}>
          <div className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Login Required</p>
                <p className="text-xs text-gray-500">Please login or sign up to subscribe to a plan.</p>
              </div>
            </div>
          </div>
          <div className="flex border-t border-gray-100 bg-slate-50">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push('/login');
              }}
              className="flex-1 py-3 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 text-center border-r border-gray-100"
            >
              Login
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                router.push('/signup');
              }}
              className="flex-1 py-3 text-sm font-medium text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 text-center"
            >
              Sign Up
            </button>
          </div>
        </div>
      ), { duration: 10000 });
      return;
    }

    if (plan.planId === 'free') {
      router.push('/dashboard');
      return;
    }

    setSelectedPlan(plan);
    await initiatePayment(plan, user);
  };

  const initiatePayment = async (plan, user) => {
    try {
      setLoading(true);

      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.planId,
          amount: plan.priceValue,
          planName: plan.name,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create order');
      }

      if (typeof window === 'undefined' || !window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.async = true;
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
        
        if (!window.Razorpay) {
          throw new Error('Payment service failed to load.');
        }
      }

      const options = {
        key: result.keyId,
        amount: result.amount,
        currency: result.currency,
        name: 'Family Health',
        description: `${plan.name} Plan Subscription`,
        order_id: result.orderId,
        handler: async function(response) {
          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                planId: plan.planId,
              }),
            });

            const verifyResult = await verifyRes.json();

            if (verifyRes.ok) {
              toast.success('Payment successful! Plan activated.');
              await refetchPlan(); // Refresh plan data
              router.push('/dashboard');
            } else {
              throw new Error(verifyResult.error || 'Payment verification failed');
            }
          } catch (error) {
            toast.error(error.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.fullName || '',
          email: user.email || '',
          contact: user.mobile || '',
        },
        theme: {
          color: '#0D1B2A',
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  if (planLoading) {
    return (
      <div className="bg-[#F5F3EF] py-20 px-8 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-gray-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-gray-500 mt-2">Loading plans...</p>
        </div>
      </div>
    );
  }

  return (
    <section id="pricing" className="bg-[#F5F3EF] py-20 px-8">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 text-center mb-16">
          Simple, family-friendly pricing
        </h2>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((plan, index) => {
            const isCurrent = isCurrentPlan(plan.planId);
            return (
              <div
                key={index}
                className={`relative rounded-2xl p-8 flex flex-col ${
                  plan.dark
                    ? "bg-gray-900 text-white"
                    : "bg-white text-gray-900 shadow-sm"
                } ${isCurrent ? 'ring-2 ring-emerald-500' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-emerald-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Current Plan
                    </span>
                  </div>
                )}

                {plan.popular && !isCurrent && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-red-500 text-white px-4 py-1.5 rounded-full text-sm font-medium">
                      Most popular
                    </span>
                  </div>
                )}

                <h3 className={`text-2xl font-semibold mb-2 ${plan.dark ? "text-white" : "text-gray-900"}`}>
                  {plan.name}
                </h3>

                <div className="mb-6">
                  <span className={`text-5xl font-serif font-bold ${plan.dark ? "text-white" : "text-gray-900"}`}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className={`text-sm ml-1 ${plan.dark ? "text-gray-400" : "text-gray-500"}`}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg className={`w-5 h-5 flex-shrink-0 mt-0.5 ${plan.dark ? "text-teal-400" : "text-teal-600"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={plan.dark ? "text-gray-200" : "text-gray-700"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanClick(plan)}
                  disabled={isCurrent || (loading && selectedPlan?.planId === plan.planId)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    isCurrent
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : plan.dark
                        ? "bg-white text-gray-900 hover:bg-gray-100"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                  } ${loading && selectedPlan?.planId === plan.planId ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading && selectedPlan?.planId === plan.planId ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : isCurrent ? (
                    '✓ Current Plan'
                  ) : (
                    plan.cta
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-gray-500 text-sm mt-10">
          No credit card required for Free plan · Cancel anytime · Data never deleted
        </p>
      </div>
    </section>
  );
}