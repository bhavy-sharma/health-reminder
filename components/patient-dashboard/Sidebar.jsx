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
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Sidebar = () => {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [familyData, setFamilyData] = useState({
        familyName: 'Family',
        members: [],
        storageUsed: 0,
        storageTotal: 5,
        plan: 'Family Plan',
    });

    // Color mapping for avatar backgrounds
    const colorMap = [
        'bg-blue-500',
        'bg-green-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-red-500',
        'bg-amber-500',
        'bg-teal-500',
        'bg-indigo-500',
        'bg-cyan-500',
        'bg-emerald-500',
        'bg-fuchsia-500',
        'bg-rose-500',
    ];

    const getColor = (index) => {
        return colorMap[index % colorMap.length];
    };

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

    // Fetch family data on mount
    useEffect(() => {
        fetchFamilyData();
    }, []);

    const fetchFamilyData = async () => {
        try {
            setLoading(true);
            
            // First get user profile to get familyId
            const profileRes = await fetch('/api/user/profile');
            if (!profileRes.ok) throw new Error('Failed to fetch profile');
            const profileData = await profileRes.json();
            
            if (profileData.user?.activeFamilyId) {
                const familyId = profileData.user.activeFamilyId._id || profileData.user.activeFamilyId;
                
                // Fetch family details
                const familyRes = await fetch(`/api/family/details?familyId=${familyId}`);
                if (familyRes.ok) {
                    const familyData = await familyRes.json();
                    setFamilyData({
                        familyName: familyData.family?.familyName || 'Family',
                        members: familyData.members || [],
                        storageUsed: familyData.family?.storageUsed || 0,
                        storageTotal: familyData.family?.storageLimit || 5,
                        plan: familyData.family?.plan || 'Family Plan',
                    });
                } else {
                    // If family details fetch fails, try getting members only
                    const membersRes = await fetch(`/api/family/members?familyId=${familyId}`);
                    if (membersRes.ok) {
                        const membersData = await membersRes.json();
                        setFamilyData(prev => ({
                            ...prev,
                            members: membersData.members || [],
                        }));
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching family data:', error);
            // Keep default data if fetch fails
        } finally {
            setLoading(false);
        }
    };

    // Get the first 5 members for the avatar stack
    const getDisplayMembers = () => {
        const members = familyData.members || [];
        const displayed = members.slice(0, 4).map(m => ({
            name: m.name,
            initial: m.name?.charAt(0).toUpperCase() || '?',
            color: getColor(members.indexOf(m)),
            isPrimary: m.isPrimary || false,
        }));

        // If there are more than 4 members, add a +N indicator
        if (members.length > 4) {
            displayed.push({
                name: `+${members.length - 4}`,
                initial: `+${members.length - 4}`,
                color: 'bg-gray-400',
                isPrimary: false,
            });
        } else if (members.length === 0) {
            // If no members, show a placeholder
            displayed.push({
                name: 'Add members',
                initial: '+',
                color: 'bg-gray-300',
                isPrimary: false,
            });
        }

        return displayed;
    };

    const displayMembers = getDisplayMembers();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isMobile) {
            setIsOpen(false);
        }
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
        <div className="flex flex-col h-full">
            <div className="p-6 border-b border-gray-200">
                <div>
                    <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wider">Family Health</h2>
                    <div className="flex items-center gap-2 mt-0.5">
                        <h1 className="text-sm font-medium text-gray-600">
                            {loading ? 'Loading...' : familyData.familyName}
                        </h1>
                        <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                </div>

                <div className="mt-4 flex items-center -space-x-2">
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                            <span className="text-xs text-gray-400">Loading members...</span>
                        </div>
                    ) : (
                        displayMembers.map((member, index) => (
                            <div
                                key={index}
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium text-white ${member.color} border-2 border-white shadow-sm`}
                                title={member.name}
                            >
                                {member.initial}
                            </div>
                        ))
                    )}
                </div>
            </div>

            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <ul className="space-y-1">
                    {menuItems.map((item, index) => {
                        const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');

                        return (
                            <li key={index}>
                                <Link
                                    href={item.href}
                                    className={`
                                        flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200
                                        ${isActive
                                            ? 'bg-black text-white'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                                        }
                                        ${item.badge ? 'relative' : ''}
                                    `}
                                >
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                                    {item.badge && (
                                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${isActive
                                                ? 'bg-purple-700 text-white'
                                                : 'text-purple-700 bg-purple-100'
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

            <div className="p-4 border-t border-gray-200">
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-700">{familyData.plan}</h3>
                        <span className="text-xs text-gray-500">
                            {familyData.storageUsed} GB of {familyData.storageTotal} GB used
                        </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min((familyData.storageUsed / familyData.storageTotal) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Hamburger Menu Button - Mobile only, hidden when sidebar is open */}
            {!(isMobile && isOpen) && (
                <button
                    id="hamburger-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:bg-gray-50 transition"
                    aria-label="Toggle menu"
                >
                    <Menu className="w-5 h-5 text-gray-600" />
                </button>
            )}

            {/* Overlay - Mobile only */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                id="sidebar"
                className={`
                    w-[280px] h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-40 shadow-lg
                    transition-transform duration-300 ease-in-out
                    ${isMobile ? (isOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
                `}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;