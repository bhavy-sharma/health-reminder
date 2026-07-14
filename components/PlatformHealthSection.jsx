import React from 'react';
import { connectToDatabase } from '@/lib/db';
import Settings from '@/models/Settings';
import { getAverageRating, getResponseRate, getAppointmentsToday } from '@/lib/healthStats';
import PlatformHealthCard from '@/components/PlatformHealthCard';

export default async function PlatformHealthSection() {
  await connectToDatabase();
  
  const settings = await Settings.findOne();
  if (!settings?.homepage?.showPlatformHealth) {
    return null;
  }

  const [
    avgRating,
    responseRate,
    appointmentsToday,
  ] = await Promise.all([
    getAverageRating(),
    getResponseRate(),
    getAppointmentsToday(),
  ]);

  const healthStats = [
    { label: "Avg Doctor Rating", value: `${avgRating.toFixed(1)} ★`, valueColor: "text-amber-500" },
    { label: "Review Response Rate", value: `${responseRate}%`, valueColor: "text-gray-900" },
    { label: "Appointments Today", value: appointmentsToday >= 1000 ? (appointmentsToday / 1000).toFixed(1) + 'k' : appointmentsToday.toString(), valueColor: "text-gray-900" },
  ];

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold font-fraunces text-gray-900 mb-4">
              A Thriving Platform
            </h2>
            <p className="text-lg text-gray-500 mb-6">
              Our community of trusted doctors and patients is growing rapidly. We maintain high standards of care, reflected in our platform metrics.
            </p>
          </div>
          <div className="max-w-md mx-auto w-full">
            <PlatformHealthCard healthStats={healthStats} title="Current Platform Health" />
          </div>
        </div>
      </div>
    </section>
  );
}
