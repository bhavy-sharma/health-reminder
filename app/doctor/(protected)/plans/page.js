"use client";

import { useState } from "react";
import { Bell, Shield, Zap, Crown, Check, X as XIcon, CreditCard, Lock, Download, X } from "lucide-react";

export default function PlansAndBilling() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [upgradePlan, setUpgradePlan] = useState(null); // 'pro' or 'premium' or null

  const proPrice = isAnnual ? Math.floor(999 * 0.8) : 999;
  const premiumPrice = isAnnual ? Math.floor(2499 * 0.8) : 2499;

  return (
    <div className="p-8 pb-24 h-screen overflow-y-auto relative">
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
            <h3 className="text-lg font-bold text-[var(--color-navy)]">Free Plan — Active</h3>
            <p className="text-sm text-[var(--color-text-muted)] font-medium">8 / 10 bookings used this month</p>
          </div>
        </div>
        <div className="bg-[#e6f4ef] text-[#4a9e7f] px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#4a9e7f]"></span> Active
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
        <div className="bg-[#efebe4] rounded-[2rem] border border-[var(--color-border)] p-8">
          <div className="flex flex-col gap-6 mb-8">
            <h2 className="font-fraunces text-3xl font-bold text-[var(--color-navy)] flex items-center gap-2">
              <Shield size={28} className="text-[var(--color-text-secondary)]" /> Free
              <span className="text-xs font-bold text-[#4a9e7f] flex items-center gap-1 font-sans ml-2"><Check size={14} /> Active</span>
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Basic profile listing</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Up to 10 bookings / month</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Patient reviews & ratings</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Standard search placement</div>
            
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Priority search placement</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Analytics dashboard</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Verified badge boost</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> WhatsApp appointment reminders</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Video consultation support</div>
            <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Dedicated account manager</div>
          </div>
          
          <button disabled className="w-full bg-[#e2ddd5] text-[var(--color-text-secondary)] font-bold py-3.5 rounded-xl cursor-not-allowed">
            Current Plan
          </button>
        </div>

        {/* PRO PLAN */}
        <div className="bg-white rounded-[2rem] border-2 border-[var(--color-navy)] overflow-hidden shadow-lg">
          <div className="bg-[var(--color-navy)] p-8 text-white relative">
            <h2 className="font-fraunces text-3xl font-bold flex items-center gap-3 mb-2">
              <Zap size={28} className="text-[#4a9e7f]" /> Pro 
              <span className="bg-[#4a9e7f] text-white text-xs px-3 py-1 rounded-full font-sans tracking-wide">Most Popular</span>
            </h2>
            <div className="flex items-baseline gap-1">
              <span className="font-fraunces text-5xl font-bold">₹{proPrice}</span>
              <span className="text-white/70 font-medium">/month</span>
            </div>
            {isAnnual && <p className="text-[#4a9e7f] text-sm mt-1 font-bold">Billed annually (₹{proPrice * 12}/yr)</p>}
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Everything in Free</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Up to 100 bookings / month</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Priority search placement</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Verified badge boost</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Basic analytics dashboard</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> WhatsApp appointment reminders</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Video consultation support</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Unlimited bookings</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Advanced analytics</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-text-muted)] opacity-60"><XIcon size={18} /> Dedicated account manager</div>
            </div>
            
            <button onClick={() => setUpgradePlan('pro')} className="w-full bg-[var(--color-navy)] hover:bg-opacity-90 text-white font-bold py-4 rounded-xl transition-colors">
              Upgrade to Pro →
            </button>
          </div>
        </div>

        {/* PREMIUM PLAN */}
        <div className="bg-white rounded-[2rem] border border-[var(--color-warm-amber)] overflow-hidden shadow-md mb-12">
          <div className="bg-[#fef8f0] p-8 relative">
            <h2 className="font-fraunces text-3xl font-bold flex items-center gap-3 mb-2 text-[var(--color-navy)]">
              <Crown size={28} className="text-[var(--color-warm-amber)]" /> Premium 
              <span className="bg-[var(--color-warm-amber)] text-white text-xs px-3 py-1 rounded-full font-sans tracking-wide">Best Value</span>
            </h2>
            <div className="flex items-baseline gap-1 text-[var(--color-navy)]">
              <span className="font-fraunces text-5xl font-bold">₹{premiumPrice}</span>
              <span className="text-[var(--color-text-secondary)] font-medium">/month</span>
            </div>
            {isAnnual && <p className="text-[var(--color-warm-amber)] text-sm mt-1 font-bold">Billed annually (₹{premiumPrice * 12}/yr)</p>}
            <Crown size={64} className="absolute right-8 top-8 text-[var(--color-warm-amber)] opacity-20" />
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 mb-8">
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Everything in Pro</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Unlimited bookings</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Top placement — disease searches</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Advanced analytics</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Custom clinic page</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Dedicated account manager</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Priority customer support</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Multi-location support</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Patient follow-up automation</div>
              <div className="flex items-center gap-3 text-sm font-medium text-[var(--color-navy)]"><Check size={18} className="text-[#4a9e7f]" /> Featured Doctor badge</div>
            </div>
            
            <button onClick={() => setUpgradePlan('premium')} className="w-full bg-[#df9b3a] hover:bg-[#cf8b2a] text-white font-bold py-4 rounded-xl transition-colors shadow-sm">
              Upgrade to Premium →
            </button>
          </div>
        </div>

      </div>

      {/* Billing History */}
      <div className="max-w-4xl mx-auto mt-16 mb-8">
        <h2 className="font-fraunces text-2xl font-bold text-[var(--color-navy)] mb-6">Billing History</h2>
        
        <div className="bg-white rounded-3xl border border-[var(--color-border)] shadow-sm p-2">
          {[
            { plan: 'Free Plan', date: '1 Jun 2026', status: 'Active', price: '₹0' },
            { plan: 'Free Plan', date: '1 May 2026', status: 'Paid', price: '₹0' },
            { plan: 'Pro Plan', date: '1 Apr 2026', status: 'Paid', price: '₹999' },
            { plan: 'Pro Plan', date: '1 Mar 2026', status: 'Paid', price: '₹999' },
          ].map((invoice, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 hover:bg-[#efebe4]/30 rounded-2xl transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-[#efebe4] rounded-xl flex items-center justify-center text-[var(--color-text-secondary)]">
                  <CreditCard size={18} />
                </div>
                <div>
                  <p className="font-bold text-[var(--color-navy)] text-sm">{invoice.plan}</p>
                  <p className="text-xs text-[var(--color-text-muted)] font-medium">{invoice.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${invoice.status === 'Active' ? 'bg-[#e6f4ef] text-[#4a9e7f]' : 'bg-[#efebe4] text-[var(--color-text-secondary)]'}`}>
                  {invoice.status}
                </span>
                <span className="font-bold text-[var(--color-navy)] w-12 text-right">{invoice.price}</span>
                <button className="text-[var(--color-text-muted)] hover:text-[var(--color-navy)] transition-colors">
                  <Download size={18} />
                </button>
              </div>
            </div>
          ))}
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

              <button className="w-full bg-[var(--color-navy)] text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-opacity flex items-center justify-center gap-2 mb-4">
                Pay ₹{upgradePlan === 'pro' ? proPrice : premiumPrice} via Razorpay
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
