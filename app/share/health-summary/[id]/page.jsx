'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  FileText, Loader2, AlertCircle, Download, User, Calendar, Clock, Stethoscope, MapPin, Building
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

export default function SharedHealthSummaryPage() {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [records, setRecords] = useState([]);
  const [downloadingFile, setDownloadingFile] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/share/health-summary/${params.id}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load');
      }

      if (result.success) {
        setData(result.data);
        setRecords(result.data.healthRecords || []);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (record) => {
    if (!record.id) {
      toast.error('Invalid record');
      return;
    }

    try {
      setDownloadingFile(record.id);
      
      const response = await fetch(`/api/share/health-summary/${params.id}?recordId=${record.id}`);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.manualDownload && data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
          toast.success('File opened in new tab. Right-click and select "Save As" to download.');
          setDownloadingFile(null);
          return;
        }
        throw new Error(data.error || 'Download failed');
      }
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      let ext = 'pdf';
      if (record.mimeType === 'application/pdf') ext = 'pdf';
      else if (record.mimeType?.startsWith('image/')) ext = record.mimeType.split('/')[1] || 'jpg';
      
      link.download = `${record.title || 'document'}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('Downloaded!');
    } catch (error) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to download');
    } finally {
      setDownloadingFile(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0D1B2A] animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  const { patient, doctor, visit } = data || {};

  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">🏥 Health Summary</h1>
          <p className="text-gray-500 text-sm mt-1">
            Shared on {new Date().toLocaleString()}
          </p>
        </div>

        {/* Patient Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-gray-400" />
            Patient Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Name</span>
              <span className="font-semibold text-gray-900">{patient?.name || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Age</span>
              <span className="font-semibold text-gray-900">{patient?.age || 'N/A'} years</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Gender</span>
              <span className="font-semibold text-gray-900">{patient?.gender || 'N/A'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Blood Group</span>
              <span className="font-semibold text-gray-900">{patient?.bloodGroup || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Allergies</span>
              <span className="font-semibold text-gray-900">
                {patient?.allergies && patient.allergies.length > 0 
                  ? patient.allergies.join(', ') 
                  : 'None reported'}
              </span>
            </div>
          </div>
        </div>

        {/* Doctor Information */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-gray-400" />
            Doctor Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Name</span>
              <span className="font-semibold text-gray-900">{doctor?.name || 'Not specified'}</span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Specialty</span>
              <span className="font-semibold text-gray-900">{doctor?.specialty || 'N/A'}</span>
            </div>
            {doctor?.hospital && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Hospital</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-gray-400" />
                  {doctor.hospital}
                </span>
              </div>
            )}
            {doctor?.city && (
              <div className="flex justify-between border-b border-gray-100 pb-2">
                <span className="text-gray-500 text-sm">Location</span>
                <span className="font-semibold text-gray-900 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  {doctor.city}
                </span>
              </div>
            )}
            {doctor?.consultationFee > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-500 text-sm">Consultation Fee</span>
                <span className="font-semibold text-gray-900">₹{doctor.consultationFee}</span>
              </div>
            )}
          </div>
        </div>

        {/* Visit Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            Visit Details
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Date</span>
              <span className="font-semibold text-gray-900">
                {visit?.date ? new Date(visit.date).toLocaleDateString() : 'Not specified'}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-100 pb-2">
              <span className="text-gray-500 text-sm">Time</span>
              <span className="font-semibold text-gray-900">{visit?.time || 'Not specified'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Reason</span>
              <span className="font-semibold text-gray-900">{visit?.reason || 'Not specified'}</span>
            </div>
          </div>
        </div>

        {/* Health Records */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="text-lg font-serif font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            Health Records ({records.length})
          </h2>
          
          {records.length > 0 ? (
            <div className="space-y-3">
              {records.map((record) => (
                <div 
                  key={record.id}
                  className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border hover:border-gray-300 transition"
                >
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{record.title || 'Untitled'}</p>
                    <p className="text-xs text-gray-500">
                      {record.category || 'General'} • {record.date ? new Date(record.date).toLocaleDateString() : 'No date'}
                    </p>
                    {record.fileSizeKB && (
                      <p className="text-xs text-gray-400">Size: {record.fileSizeKB} KB</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDownload(record)}
                    disabled={downloadingFile === record.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0D1B2A] hover:bg-[#1a2e44] text-white text-xs font-medium rounded-lg transition disabled:opacity-50"
                  >
                    {downloadingFile === record.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Download className="w-3.5 h-3.5" />
                    )}
                    {downloadingFile === record.id ? '...' : 'Download'}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No health records found.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-400">
          <p>Generated by Family Health • This document is for informational purposes only</p>
          <p className="mt-1">Please consult your healthcare provider for medical advice</p>
        </div>
      </div>
    </div>
  );
}