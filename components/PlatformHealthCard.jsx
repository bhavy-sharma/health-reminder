import React from 'react';

export default function PlatformHealthCard({ healthStats, title = "Platform Health", rightElement }) {
  if (!healthStats || healthStats.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        {rightElement && <div>{rightElement}</div>}
      </div>
      <ul className="space-y-3">
        {healthStats.map(({ label, value, valueColor }) => (
          <li key={label} className="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
            <span className="text-xs sm:text-sm text-gray-500">{label}</span>
            <span className={`text-xs sm:text-sm font-bold ${valueColor || 'text-gray-900'}`}>{value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
