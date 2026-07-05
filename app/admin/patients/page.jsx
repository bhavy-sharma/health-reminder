'use client';

import React, { useState } from 'react';
import {
  Bell,
  ChevronRight,
  ShieldCheck,
  Download,
  Search,
  ChevronDown,
  MoreVertical,
  Menu,
} from 'lucide-react';
import AdminSidebar from '@/components/admin/Sidebar';

/* ── Data ──────────────────────────────────────────────────── */
const patients = [
  { initials: 'RS', color: 'bg-emerald-500', name: 'Ramesh Sharma',  email: 'ramesh@gmail.com',  city: 'Mumbai',    plan: 'Family', members: 4, status: 'active'    },
  { initials: 'AK', color: 'bg-amber-500',   name: 'Anita Kulkarni', email: 'anita@gmail.com',   city: 'Pune',      plan: 'Free',   members: 2, status: 'active'    },
  { initials: 'VP', color: 'bg-red-500',     name: 'Vijay Patel',    email: 'vijay@gmail.com',   city: 'Ahmedabad', plan: 'Family', members: 6, status: 'active'    },
  { initials: 'SR', color: 'bg-slate-700',   name: 'Sunita Rao',     email: 'sunita@gmail.com',  city: 'Bangalore', plan: 'Free',   members: 3, status: 'active'    },
  { initials: 'DM', color: 'bg-teal-600',    name: 'Deepak Mehta',   email: 'deepak@gmail.com',  city: 'Delhi',     plan: 'Family', members: 5, status: 'active'    },
  { initials: 'NB', color: 'bg-orange-400',  name: 'Nalini Bose',    email: 'nalini@gmail.com',  city: 'Kolkata',   plan: 'Free',   members: 2, status: 'suspended' },
  { initials: 'PI', color: 'bg-pink-500',    name: 'Priya Iyer',     email: 'priya@gmail.com',   city: 'Chennai',   plan: 'Family', members: 4, status: 'active'    },
  { initials: 'HA', color: 'bg-gray-800',    name: 'Harsh Agarwal',  email: 'harsh@gmail.com',   city: 'Jaipur',    plan: 'Free',   members: 1, status: 'active'    },
];

const planOptions   = ['All Plans', 'Family', 'Free', 'Pro', 'Premium'];
const statusOptions = ['All Status', 'active', 'suspended', 'inactive'];

function PlanBadge({ plan }) {
  const styles = {
    Family:  'bg-emerald-50 text-emerald-700 border-emerald-100',
    Free:    'bg-gray-100 text-gray-600 border-gray-200',
    Pro:     'bg-blue-50 text-blue-700 border-blue-100',
    Premium: 'bg-amber-50 text-amber-700 border-amber-100',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[plan] ?? styles.Free}`}>
      {plan}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    active:    'bg-emerald-50 text-emerald-600 border-emerald-100',
    suspended: 'bg-red-50 text-red-500 border-red-100',
    inactive:  'bg-gray-100 text-gray-500 border-gray-200',
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles[status] ?? styles.inactive}`}>
      {status}
    </span>
  );
}

/* ── Main ──────────────────────────────────────────────────── */
export default function AdminPatientsPage() {
  const [active, setActive] = useState('patients');
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('All Plans');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selected, setSelected] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch  = !q || p.name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
    const matchPlan    = planFilter === 'All Plans' || p.plan === planFilter;
    const matchStatus  = statusFilter === 'All Status' || p.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.includes(p.email));
  const toggleAll  = () => setSelected(allChecked ? [] : filtered.map((p) => p.email));
  const toggleOne  = (email) => setSelected((prev) => prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]);

  return (
    <div className="min-h-screen bg-[#F5F5F2] flex">
      <AdminSidebar 
        active={active} 
        setActive={setActive} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />

      <main className="flex-1 w-full md:pl-[260px]">
        {/* Topbar with mobile menu button */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-100 px-4 sm:px-8 py-3 flex items-center gap-2">
          <button 
            onClick={() => setIsMobileOpen(true)}
            className="md:hidden p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-sm text-gray-400 hidden sm:inline">Admin</span>
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 hidden sm:inline" />
          <span className="text-sm font-semibold text-gray-700">Patients</span>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-1.5 text-sm text-amber-600 font-semibold bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Staff Admin
            </div>
            <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50">
              <Bell className="w-4 h-4 text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-white text-xs font-bold">SA</div>
          </div>
        </div>

        <div className="px-4 sm:px-8 py-6 sm:py-8 max-w-[1300px] mx-auto">
          {/* Page header */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">Patients</h1>
              <p className="text-sm text-gray-400 mt-1">{patients.length} total registered families</p>
            </div>
            <button className="flex items-center justify-center gap-2 bg-white border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>

          {/* Search + filters - Responsive */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-5">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search name, email or city..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-200 shadow-sm"
              />
            </div>

            <div className="flex gap-3">
              {/* Plan filter */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer w-full"
                >
                  {planOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>

              {/* Status filter */}
              <div className="relative flex-1 sm:flex-initial">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-200 rounded-xl pl-4 pr-8 py-2.5 text-sm font-medium text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-200 cursor-pointer w-full"
                >
                  {statusOptions.map((o) => <option key={o}>{o}</option>)}
                </select>
                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Table - Responsive */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Table header - Hide on mobile */}
            <div className="hidden md:grid grid-cols-[40px_1fr_140px_100px_110px_80px_40px] items-center px-5 py-3 border-b border-gray-100 bg-gray-50">
              <input
                type="checkbox"
                checked={allChecked}
                onChange={toggleAll}
                className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
              />
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase">Patient</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-right">City</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Plan</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Members</span>
              <span className="text-xs font-bold tracking-wider text-gray-500 uppercase text-center">Status</span>
              <span />
            </div>

            {/* Rows */}
            {filtered.length === 0 && (
              <div className="py-16 text-center text-sm text-gray-400">No patients match your filters.</div>
            )}
            {filtered.map((p, i) => (
              <div
                key={p.email}
                className={`p-4 md:p-0 transition-colors ${
                  selected.includes(p.email) ? 'bg-gray-50' : 'hover:bg-gray-50'
                } ${i < filtered.length - 1 ? 'border-b border-gray-50' : ''}`}
              >
                {/* Desktop layout */}
                <div className="hidden md:grid grid-cols-[40px_1fr_140px_100px_110px_80px_40px] items-center px-5 py-4">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.email)}
                    onChange={() => toggleOne(p.email)}
                    className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer"
                  />

                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-full ${p.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.email}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 text-right pr-4">{p.city}</p>
                  <div className="flex justify-center"><PlanBadge plan={p.plan} /></div>
                  <p className="text-sm text-gray-600 text-center">{p.members} members</p>
                  <div className="flex justify-center"><StatusBadge status={p.status} /></div>

                  <div className="relative flex justify-center">
                    <button
                      onClick={() => setOpenMenu(openMenu === p.email ? null : p.email)}
                      className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>
                    {openMenu === p.email && (
                      <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36">
                        {['View profile', 'Edit details', 'Suspend', 'Delete'].map((action) => (
                          <button
                            key={action}
                            onClick={() => setOpenMenu(null)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                              action === 'Delete' ? 'text-red-500' : 'text-gray-700'
                            }`}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Mobile layout */}
                <div className="md:hidden flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selected.includes(p.email)}
                    onChange={() => toggleOne(p.email)}
                    className="w-4 h-4 rounded border-gray-300 accent-gray-900 cursor-pointer mt-1"
                  />
                  <div className={`w-10 h-10 rounded-full ${p.color} flex items-center justify-center text-white text-xs font-bold shrink-0`}>
                    {p.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400 truncate">{p.email}</p>
                      </div>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === p.email ? null : p.email)}
                          className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>
                        {openMenu === p.email && (
                          <div className="absolute right-0 top-8 z-20 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-36">
                            {['View profile', 'Edit details', 'Suspend', 'Delete'].map((action) => (
                              <button
                                key={action}
                                onClick={() => setOpenMenu(null)}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors ${
                                  action === 'Delete' ? 'text-red-500' : 'text-gray-700'
                                }`}
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{p.city}</span>
                      <PlanBadge plan={p.plan} />
                      <StatusBadge status={p.status} />
                      <span className="text-xs text-gray-500">{p.members} members</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Footer */}
            <div className="px-4 md:px-5 py-4 border-t border-gray-50 text-center">
              <p className="text-sm text-gray-400">Showing {filtered.length} of {patients.length} patients</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}