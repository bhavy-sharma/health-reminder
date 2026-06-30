'use client';

import React from 'react';
import { 
  FileText, 
  Bell, 
  Upload, 
  Stethoscope, 
  AlertCircle,
  ChevronRight,
  CheckCircle,
  AlertTriangle,
  Search
} from 'lucide-react';
import Link from 'next/link';
import Sidebar from './Sidebar';

const Dashboard = () => {
  // Sample data - would come from API
  const familyMembers = [
    { 
      name: 'Rajesh', 
      age: 32, 
      lastCheckup: '12 days ago',
      status: 'normal',
      color: 'blue',
      initial: 'R'
    },
    { 
      name: 'Mother', 
      age: 58, 
      lastCheckup: '15 days ago',
      status: 'warning',
      note: 'BP medicine missed yesterday',
      color: 'yellow',
      initial: 'M'
    },
    { 
      name: 'Father', 
      age: 62, 
      lastCheckup: '45 days ago',
      status: 'danger',
      note: 'Report follow-up overdue',
      color: 'red',
      initial: 'F'
    }
  ];

  const attentionItems = [
    {
      title: "Mother's BP medicine — not confirmed yet",
      time: "Scheduled for 8:00 AM",
      status: "No response received",
      type: "warning",
      action: "Confirm"
    },
    {
      title: "Father's blood test report — upload pending",
      time: "Test completed 2 days ago",
      status: "Pending upload",
      type: "danger",
      action: "Upload"
    },
    {
      title: "Priya's medicine confirmed at 8:14 AM",
      time: "Thyroid medication taken on time",
      status: "Confirmed ✓",
      type: "success",
      action: "View"
    }
  ];

  const recentRecords = [
    {
      title: "Lab Report",
      subtitle: "HbA1c Test Results",
      person: "Father",
      date: "June 10, 2026",
      color: "blue"
    },
    {
      title: "Prescription",
      subtitle: "Blood Pressure Medication",
      person: "Mother",
      date: "June 9, 2026",
      color: "green"
    },
    {
      title: "ECG Report",
      subtitle: "Annual Checkup",
      person: "Rajesh",
      date: "June 5, 2026",
      color: "purple"
    }
  ];

  const quickActions = [
    { icon: Upload, label: 'Upload Report', color: 'blue' },
    { icon: Bell, label: 'Set Reminder', color: 'purple' },
    { icon: Stethoscope, label: 'Prepare for Doctor', color: 'green' },
    { icon: AlertCircle, label: 'Emergency Info', color: 'red' }
  ];

  const iconColorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600'
  };

  const borderColorMap = {
    blue: 'border-blue-500',
    green: 'border-green-500',
    purple: 'border-purple-500',
    yellow: 'border-yellow-500',
    red: 'border-red-500'
  };

  const textColorMap = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600'
  };

  const actionBgMap = {
    blue: 'bg-blue-600 hover:bg-blue-700',
    green: 'bg-green-600 hover:bg-green-700',
    purple: 'bg-purple-600 hover:bg-purple-700',
    yellow: 'bg-yellow-600 hover:bg-yellow-700',
    red: 'bg-red-600 hover:bg-red-700'
  };

  return (
    <div className="flex min-h-screen bg-[#f8f6f0]">
      <Sidebar />
      <div className="flex-1 ml-0 md:ml-[280px] p-4 md:p-6 pt-16 md:pt-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <h2 className="text-sm font-medium text-gray-500">Family Health</h2>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-1 gap-3 sm:gap-0">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">Good evening, Rahul</h1>
                <p className="text-sm text-gray-500">Friday, June 12, 2026</p>
              </div>
              <div className="flex items-center gap-2 md:gap-3">
                {/* Search Bar - Hidden on mobile */}
                <div className="hidden sm:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-36 md:w-48"
                  />
                </div>
                <button className="p-2 rounded-full bg-white shadow-sm hover:bg-gray-50 transition">
                  <Bell className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>

          {/* Family Health Overview - Horizontal Cards */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Family Health Overview</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {familyMembers.map((member, index) => {
                const borderColor = borderColorMap[member.color];
                const textColor = textColorMap[member.color];
                const actionBg = actionBgMap[member.color];
                const circleBg = member.color === 'blue' ? 'bg-blue-500' :
                                 member.color === 'yellow' ? 'bg-yellow-500' :
                                 'bg-red-500';
                return (
                  <div 
                    key={index} 
                    className={`p-4 rounded-lg border-2 ${borderColor} bg-white transition hover:shadow-md flex flex-col`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-sm md:text-lg font-bold text-white ${circleBg} flex-shrink-0`}>
                        {member.initial}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-800 text-sm md:text-base">{member.name}</p>
                        <p className="text-xs md:text-sm text-gray-600">{member.age} years</p>
                        <p className="text-xs text-gray-500 mt-1">Last checkup: {member.lastCheckup}</p>
                        {member.note && (
                          <p className={`text-xs font-medium mt-1 ${textColor}`}>
                            {member.note}
                          </p>
                        )}
                      </div>
                    </div>
                    {member.status === 'danger' && (
                      <button className={`mt-3 w-full py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-medium text-white ${actionBg} transition`}>
                        Take action →
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* What needs your attention today */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">What needs your attention today</h3>
            <div className="space-y-3">
              {attentionItems.map((item, index) => (
                <div key={index} className={`p-3 md:p-4 rounded-lg border-l-4 ${
                  item.type === 'danger' ? 'border-red-500 bg-red-50' :
                  item.type === 'warning' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`mt-0.5 flex-shrink-0 ${
                        item.type === 'danger' ? 'text-red-500' :
                        item.type === 'warning' ? 'text-yellow-500' :
                        'text-green-500'
                      }`}>
                        {item.type === 'danger' ? <AlertTriangle className="w-5 h-5" /> :
                         item.type === 'warning' ? <AlertCircle className="w-5 h-5" /> :
                         <CheckCircle className="w-5 h-5" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 text-sm md:text-base">{item.title}</p>
                        <p className="text-xs md:text-sm text-gray-600">{item.time}</p>
                        <p className={`text-xs md:text-sm font-medium ${
                          item.type === 'danger' ? 'text-red-600' :
                          item.type === 'warning' ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          {item.status}
                        </p>
                      </div>
                    </div>
                    <button className={`px-3 md:px-4 py-1.5 md:py-2 rounded-lg text-xs md:text-sm font-medium text-white transition whitespace-nowrap self-start sm:self-center ${
                      item.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                      item.type === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' :
                      'bg-green-600 hover:bg-green-700'
                    }`}>
                      {item.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Records - Horizontal Cards with Fixed Button Positions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6 mb-4 md:mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Recent Records</h3>
              <Link href="/health-records" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {recentRecords.map((record, index) => {
                const iconColor = iconColorMap[record.color];
                return (
                  <div 
                    key={index} 
                    className="bg-white rounded-lg p-3 md:p-4 shadow-sm border border-gray-100 hover:shadow-md transition flex flex-col h-full"
                  >
                    {/* Content - takes up available space */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg flex items-center justify-center ${iconColor} flex-shrink-0`}>
                          <FileText className="w-5 h-5 md:w-6 md:h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 font-medium">{record.title}</p>
                          <p className="text-sm md:text-base font-semibold text-gray-800">{record.subtitle}</p>
                          <p className="text-xs text-gray-400 mt-1">{record.person} · {record.date}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Buttons - always at the bottom */}
                    <div className="flex gap-2 mt-3 md:mt-4 pt-3 border-t border-gray-100">
                      <button className="flex-1 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition">
                        View
                      </button>
                      <button className="flex-1 px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white bg-gray-800 rounded-lg hover:bg-gray-900 transition">
                        Share
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h3 className="font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const colors = {
                  blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200',
                  purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200',
                  green: 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200',
                  red: 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200'
                };
                return (
                  <button 
                    key={index}
                    className={`flex flex-col items-center justify-center p-4 md:p-6 rounded-lg border-2 transition ${colors[action.color]}`}
                  >
                    <Icon className="w-6 h-6 md:w-8 md:h-8 mb-1 md:mb-2" />
                    <span className="text-xs md:text-sm font-medium text-center">{action.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;