import React from 'react';
import { connectToDatabase } from '@/lib/db';
import Settings from '@/models/Settings';

export default async function PlatformHealthSection() {
  await connectToDatabase();
  
  const settings = await Settings.findOne();
  if (!settings?.homepage?.showPlatformHealth) {
    return null;
  }

  return (
    <section className="py-16 bg-white border-y border-gray-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold font-fraunces text-gray-900 mb-4">
          A Thriving Platform
        </h2>
        <p className="text-lg text-gray-500">
          Our community of trusted doctors and patients is growing rapidly. We maintain high standards of care, reflected in our platform metrics.
        </p>
      </div>
    </section>
  );
}
