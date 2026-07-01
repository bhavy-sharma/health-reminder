'use client';

import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    HeartPulse,
    Pill,
    Stethoscope,
    Search,
    Users,
    Activity,
    Settings,
    ChevronDown,
    Sparkles,
    Menu,
    Loader2,
    LogOut,
    Home,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loggingOut, setLoggingOut] = useState(false);
    const [familyData, setFamilyData] = useState({
        familyName: 'Family Group',
        members: [],
        storageUsed: 0,
        storageTotal: 5,
        plan: 'Family Plan',
    });

    const colorMap = [
        'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
        'bg-red-500', 'bg-amber-500', 'bg-teal-500', 'bg-indigo-500',
        'bg-cyan-500', 'bg-emerald-500', 'bg-fuchsia-500', 'bg-rose-500',
    ];

    const getColor = (index) => colorMap[index % colorMap.length];

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
        { icon: HeartPulse, label: 'Health Records', href: '/health-records' },
        { icon: Pill, label: 'Medicine Tracker', href: '/medicine-tracker' },
        { icon: Stethoscope, label: 'Doctor Visit Prep', href: '/doctor-visit' },
        { icon: Search, label: 'Find Doctors', href: '/find-doctors' },
        { icon: Users, label: 'Family Members', href: '/family-members' },
        { icon: Activity, label: 'Health Insights', href: '/health-insights' },
        { icon: Sparkles, label: 'Beta', href: '/beta', badge: 'BETA' },
        { icon: Settings, label: 'Settings', href: '/settings' },
    ];

    useEffect(() => {
        fetchFamilyData();
    }, []);

    const fetchFamilyData = async () => {
        try {
            setLoading(true);
            const profileRes = await fetch('/api/user/profile');
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();

            if (profileData.user?.activeFamilyId) {
                const familyId = profileData.user.activeFamilyId._id || profileData.user.activeFamilyId;
                const familyRes = await fetch(`/api/family/details?familyId=${familyId}`);
                if (familyRes.ok) {
                    const data = await familyRes.json();
                    setFamilyData({
                        familyName: data.family?.familyName || 'Family Group',
                        members: data.members || [],
                        storageUsed: data.family?.storageUsed || 0,
                        storageTotal: data.family?.storageLimit || 5,
                        plan: data.family?.plan || 'Family Plan',
                    });
                } else {
                    const membersRes = await fetch(`/api/family/members?familyId=${familyId}`);
                    if (membersRes.ok) {
                        const membersData = await membersRes.json();
                        setFamilyData(prev => ({ ...prev, members: membersData.members || [] }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching family data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            router.push('/login');
        }
    };

    const getDisplayMembers = () => {
        const members = familyData.members || [];
        const displayed = members.slice(0, 4).map(m => ({
            name: m.name,
            initial: m.name?.charAt(0).toUpperCase() || '?',
            color: getColor(members.indexOf(m)),
        }));
        if (members.length > 4) {
            displayed.push({ name: `+${members.length - 4}`, initial: `+${members.length - 4}`, color: 'bg-gray-500' });
        } else if (members.length === 0) {
            displayed.push({ name: 'Add members', initial: '+', color: 'bg-gray-650' });
        }
        return displayed;
    };

    const displayMembers = getDisplayMembers();

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) setIsOpen(false);
    }, [pathname, isMobile]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isMobile && isOpen) {
                const sidebar = document.getElementById('sidebar');
                const hamburger = document.getElementById('hamburger-btn');
                if (sidebar && !sidebar.contains(e.target) && hamburger && !hamburger.contains(e.target)) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isMobile, isOpen]);

    const sidebarContent = (
        <div className="flex flex-col h-full bg-[#0D1B2A] text-white">
            {/* Header */}
            <div className="p-6 border-b border-slate-800">
                <div>
                    <h2 className="text-xs font-semibold text-blue-300 uppercase tracking-wider">Family Health</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <h1 className="text-sm font-semibold text-slate-100">
                            {loading ? 'Loading...' : familyData.familyName}
                        </h1>
                        <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                    </div>
                </div>

                <div className="mt-4 flex items-center -space-x-2">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-blue-300 animate-spin" />
                            <span className="text-xs text-slate-400">Loading members...</span>
                        </div>
                    ) : (
                        displayMembers.map((member, index) => (
                            <div
                                key={index}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${member.color} border-2 border-[#0D1B2A] shadow-sm`}
                                title={member.name}
                            >
                                {member.initial}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                                        isActive
                                            ? 'bg-white text-gray-900 font-semibold shadow-md'
                                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                    } ${item.badge ? 'relative' : ''}`}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-gray-900' : 'text-blue-300'}`} />
                                    <span className="flex-1 text-sm">{item.label}</span>
                                    {item.badge && (
                                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                                            isActive ? 'bg-purple-600 text-white' : 'text-purple-300 bg-purple-950 border border-purple-800'
                                        }`}>
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Storage + Bottom Buttons */}
            <div className="p-4 border-t border-slate-800 space-y-3 bg-[#0a1520]">
                {/* Storage bar */}
                <div className="bg-white/5 rounded-xl p-4 border border-slate-800/50">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-xs font-semibold text-slate-300">{familyData.plan}</h3>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {familyData.storageUsed} GB / {familyData.storageTotal} GB
                        </span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-400 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((familyData.storageUsed / familyData.storageTotal) * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Go to Homepage */}
                <Link
                    href="/"
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:bg-white/5 hover:text-white transition-all duration-200 w-full"
                >
                    <Home className="w-5 h-5 text-blue-300" />
                    <span className="text-sm font-medium">Go to Homepage</span>
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-200 w-full disabled:opacity-50"
                >
                    {loggingOut ? (
                        <Loader2 className="w-5 h-5 animate-spin text-red-400" />
                    ) : (
                        <LogOut className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm font-medium">{loggingOut ? 'Logging out...' : 'Log Out'}</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {!(isMobile && isOpen) && (
                <button
                    id="hamburger-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 p-2.5 bg-white border border-gray-200 rounded-xl shadow-lg hover:bg-gray-50 transition"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-5 h-5 text-gray-700" />
                </button>
            )}

            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside
                id="sidebar"
                className={`w-[280px] h-screen bg-[#0D1B2A] border-r border-slate-800 flex flex-col fixed left-0 top-0 z-40 shadow-xl transition-transform duration-300 ease-in-out ${
                    isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'
                }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;