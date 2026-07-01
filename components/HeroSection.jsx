'use client';

import { useEffect, useState } from "react";
import Link from "next/link";

const colorMap = [
  { bg: 'bg-teal-50', border: 'border-teal-200', avatar: 'bg-teal-500', dot: 'bg-teal-500' },
  { bg: 'bg-amber-50', border: 'border-amber-200', avatar: 'bg-amber-500', dot: 'bg-amber-500' },
  { bg: 'bg-blue-50', border: 'border-blue-200', avatar: 'bg-blue-500', dot: 'bg-blue-500' },
  { bg: 'bg-purple-50', border: 'border-purple-200', avatar: 'bg-purple-500', dot: 'bg-purple-500' },
  { bg: 'bg-rose-50', border: 'border-rose-200', avatar: 'bg-rose-500', dot: 'bg-rose-500' },
];

function getInitials(name = '') {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if logged in
        const meRes = await fetch('/api/auth/me');
        if (!meRes.ok) {
          setLoading(false);
          return;
        }
        const meData = await meRes.json();
        setIsLoggedIn(true);
        setUser(meData.user);

        // Try to get family members if they have an active family
        const profileRes = await fetch('/api/user/profile');
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          const activeFamilyId = profileData.user?.activeFamilyId?._id || profileData.user?.activeFamilyId;

          if (activeFamilyId) {
            const membersRes = await fetch(`/api/family/members?familyId=${activeFamilyId}`);
            if (membersRes.ok) {
              const membersData = await membersRes.json();
              setMembers(membersData.members || []);
            }
          }
        }
      } catch {
        // Not logged in or error — silently fall through to guest view
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Build cards: logged-in user first, then family members (max 2 visible)
  const buildCards = () => {
    const cards = [];
    if (user) {
      cards.push({
        name: `${user.fullName} (You)`,
        initials: getInitials(user.fullName),
        subtitle: 'Registered patient · Account active',
        color: colorMap[0],
      });
    }
    members.slice(0, 1).forEach((m, i) => {
      cards.push({
        name: m.name,
        initials: getInitials(m.name),
        subtitle: m.relationship ? `${m.relationship} · Member added` : 'Family member',
        color: colorMap[i + 1] || colorMap[1],
      });
    });
    return cards;
  };

  // Guest preview cards (illustrative, clearly demo)
  const guestCards = [
    {
      name: 'Your Name (You)',
      initials: '?',
      subtitle: 'Sign up to see your health overview',
      color: colorMap[0],
    },
    {
      name: 'Add a Family Member',
      initials: '+',
      subtitle: 'Track health records for everyone',
      color: colorMap[1],
    },
  ];

  const cards = isLoggedIn ? buildCards() : guestCards;

  return (
    <section className="px-8 py-16 md:py-24 max-w-7xl mx-auto">
      <div className="grid md:grid-cols-2 gap-12 items-center">
        {/* Left Content */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-full">
            <div className="w-2 h-2 bg-teal-500 rounded-full"></div>
            <span className="text-sm text-teal-700 font-medium">
              For every Indian family
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-bold text-gray-900 leading-[1.1]">
            Where is your mother&apos;s last blood test report right now?
          </h1>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="bg-gray-900 text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors text-center"
                >
                  Go to Dashboard →
                </Link>
                <Link
                  href="/family-members"
                  className="px-8 py-4 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 transition-colors text-center"
                >
                  Manage family →
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="bg-gray-900 text-white px-8 py-4 rounded-lg text-base font-medium hover:bg-gray-800 transition-colors text-center"
                >
                  Start free — no card needed
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 rounded-lg text-base font-medium text-gray-700 hover:text-gray-900 transition-colors text-center"
                >
                  Sign in →
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Right Content — Dynamic Cards */}
        <div className="space-y-4">
          {loading ? (
            // Loading skeleton
            <>
              <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-6 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/2" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                </div>
              </div>
              <div className="bg-gray-100 border-2 border-gray-200 rounded-2xl p-6 flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-300 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
              </div>
            </>
          ) : (
            cards.map((card, i) => (
              <div
                key={i}
                className={`${card.color.bg} border-2 ${card.color.border} rounded-2xl p-6 flex items-center gap-4`}
              >
                <div className={`w-12 h-12 ${card.color.avatar} rounded-full flex items-center justify-center text-white font-semibold text-sm`}>
                  {card.initials}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{card.name}</h3>
                  <p className="text-sm text-gray-600">{card.subtitle}</p>
                </div>
                <div className={`w-3 h-3 ${card.color.dot} rounded-full`}></div>
              </div>
            ))
          )}

          {/* Add member prompt when logged in but no members */}
          {isLoggedIn && !loading && members.length === 0 && (
            <Link
              href="/family-members"
              className="block border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
            >
              + Add a family member to track their health
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
