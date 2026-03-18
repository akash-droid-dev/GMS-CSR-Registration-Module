'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SUPPORT_NOTE } from '@/lib/constants';

interface AadhaarAuthProps {
  route: 'athlete' | 'others';
  onSuccess: (aadhaarRef: string) => void;
}

export default function AadhaarAuth({ route, onSuccess }: AadhaarAuthProps) {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'aadhaar' | 'otp'>('aadhaar');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const formatAadhaar = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 12);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const handleAadhaarSubmit = () => {
    const digits = aadhaarNumber.replace(/\s/g, '');
    if (digits.length !== 12) {
      setError('Please enter a valid 12-digit Aadhaar number');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate OTP send
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
    }, 1500);
  };

  const handleOtpVerify = () => {
    if (otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      const digits = aadhaarNumber.replace(/\s/g, '');
      onSuccess(digits);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex flex-col">
      <header className="bg-[#1e3a5f] text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link href="/" className="flex items-center gap-3">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold">GMS — CSR Registration</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="card p-8">
            {/* Route Indicator */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${
                route === 'athlete' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {route === 'athlete' ? 'Athlete Registration' : 'Others Registration'}
              </div>
              <h2 className="text-2xl font-bold text-[#1e3a5f]">Aadhaar Authentication</h2>
              <p className="text-slate-500 text-sm mt-2">
                Verify your identity to proceed with registration
              </p>
            </div>

            {/* Aadhaar Input */}
            {step === 'aadhaar' && (
              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    Aadhaar Number <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input text-center text-lg tracking-widest ${error ? 'error' : ''}`}
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarNumber}
                    onChange={(e) => {
                      setAadhaarNumber(formatAadhaar(e.target.value));
                      setError('');
                    }}
                    maxLength={14}
                  />
                  {error && <p className="form-error">{error}</p>}
                </div>
                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={handleAadhaarSubmit}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending OTP...
                    </span>
                  ) : 'Send OTP'}
                </button>
              </div>
            )}

            {/* OTP Input */}
            {step === 'otp' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700 text-center">
                  OTP sent to Aadhaar-linked mobile number
                </div>
                <div>
                  <label className="form-label">
                    Enter OTP <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-input text-center text-xl tracking-[0.5em] ${error ? 'error' : ''}`}
                    placeholder="------"
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
                      setError('');
                    }}
                    maxLength={6}
                  />
                  {error && <p className="form-error">{error}</p>}
                </div>
                <button
                  className="btn btn-primary w-full btn-lg"
                  onClick={handleOtpVerify}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Verifying...
                    </span>
                  ) : 'Verify & Proceed'}
                </button>
                <button
                  className="btn btn-outline w-full"
                  onClick={() => { setStep('aadhaar'); setOtp(''); setError(''); }}
                >
                  Change Aadhaar Number
                </button>
              </div>
            )}

            {/* Support Note */}
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-amber-800">{SUPPORT_NOTE}</p>
              </div>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-700 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <Link href="/user/login" className="text-sm text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
              Already registered? Login here
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
