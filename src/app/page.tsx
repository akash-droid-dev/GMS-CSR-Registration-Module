'use client';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Top Bar */}
      <div className="bg-[#0f2439] text-blue-300 text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <span>Government of India | Ministry of Youth Affairs &amp; Sports</span>
          <div className="flex items-center gap-4">
            <Link href="/user/login" className="hover:text-white transition">Participant Login</Link>
            <Link href="/admin/login" className="hover:text-white transition">Admin Portal</Link>
          </div>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#1e3a5f] text-white shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-400/20">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Games Management System</h1>
                <p className="text-blue-300 text-xs sm:text-sm font-medium">Centralized Sports Repository — Registration Portal</p>
              </div>
            </div>
            <nav className="hidden md:flex items-center gap-1">
              <Link href="/user/login" className="px-4 py-2 rounded-lg text-sm font-medium text-blue-200 hover:bg-white/10 hover:text-white transition">
                Login
              </Link>
              <Link href="/admin/login" className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Admin
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1e3a5f] via-[#1a3358] to-[#0f2439]" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-amber-400/20 text-amber-300 backdrop-blur-sm border border-amber-400/30 px-4 py-1.5 rounded-full text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
              Registration Portal Open
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
              Participant<br className="sm:hidden" /> Registration
            </h2>
            <p className="text-lg sm:text-xl text-blue-200 max-w-2xl mx-auto leading-relaxed mb-10">
              Official registration portal for Athletes, Support Staff, and Technical Officials.
              Aadhaar-authenticated and secure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/register/athlete" className="btn btn-lg bg-amber-400 hover:bg-amber-500 text-[#1e3a5f] font-bold shadow-lg shadow-amber-400/25 px-8">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Register as Athlete
              </Link>
              <Link href="/register/others" className="btn btn-lg bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm px-8">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Register as Others
              </Link>
            </div>
          </div>
        </div>
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 80V30C240 60 480 0 720 30C960 60 1200 0 1440 30V80H0Z" fill="#f8fafc"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 w-full">
        <div className="text-center mb-14">
          <h3 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-3">How It Works</h3>
          <p className="text-slate-500 max-w-xl mx-auto">Complete your registration in 4 simple steps</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { step: '01', title: 'Authenticate', desc: 'Verify your identity using your 12-digit Aadhaar number and OTP', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', color: 'blue' },
            { step: '02', title: 'Fill Details', desc: 'Complete your personal, contact, address, and category-specific details', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'indigo' },
            { step: '03', title: 'Review & Submit', desc: 'Preview your application, verify all information, and submit for review', icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z', color: 'purple' },
            { step: '04', title: 'Get Verified', desc: 'Admin reviews your application. Once verified, access your participant dashboard', icon: 'M5 13l4 4L19 7', color: 'emerald' },
          ].map((item) => (
            <div key={item.step} className="relative group">
              <div className="card p-6 h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-t-4 border-t-transparent group-hover:border-t-current" style={{ borderTopColor: item.color === 'blue' ? '#2563eb' : item.color === 'indigo' ? '#6366f1' : item.color === 'purple' ? '#9333ea' : '#10b981' }}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  item.color === 'indigo' ? 'bg-indigo-100 text-indigo-600' :
                  item.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                  'bg-emerald-100 text-emerald-600'
                }`}>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} /></svg>
                </div>
                <div className="text-xs font-bold text-slate-400 mb-1">STEP {item.step}</div>
                <h4 className="text-lg font-bold text-[#1e3a5f] mb-2">{item.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center mb-14">
            <h3 className="text-2xl sm:text-3xl font-bold text-[#1e3a5f] mb-3">Registration Categories</h3>
            <p className="text-slate-500 max-w-xl mx-auto">Choose the category that applies to you</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Link href="/register/athlete" className="group">
              <div className="card p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Athletes</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">Personal details, contact info, permanent address, and kit/shoe size details</p>
                <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Register Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </Link>
            <Link href="/register/others" className="group">
              <div className="card p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-purple-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-shadow">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                </div>
                <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Support Staff</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">Personal details, designation, mobile number, and permanent address</p>
                <span className="inline-flex items-center gap-1 text-purple-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Register Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </Link>
            <Link href="/register/others" className="group">
              <div className="card p-8 h-full hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-teal-200 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-teal-500/20 group-hover:shadow-teal-500/40 transition-shadow">
                  <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                </div>
                <h4 className="text-xl font-bold text-[#1e3a5f] mb-2">Technical Officials</h4>
                <p className="text-slate-500 text-sm leading-relaxed mb-4">Personal details, designation, mobile number, and permanent address</p>
                <span className="inline-flex items-center gap-1 text-teal-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Register Now <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <div className="grid sm:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h4 className="font-bold text-[#1e3a5f] mb-1">Aadhaar Secured</h4>
            <p className="text-sm text-slate-500">OTP-based identity verification</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h4 className="font-bold text-[#1e3a5f] mb-1">Admin Verified</h4>
            <p className="text-sm text-slate-500">Every application reviewed by officials</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-14 h-14 bg-amber-100 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h4 className="font-bold text-[#1e3a5f] mb-1">Real-time Status</h4>
            <p className="text-sm text-slate-500">Track your application status anytime</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0f2439] text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid sm:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-400 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <p className="font-bold text-sm">Games Management System</p>
                  <p className="text-xs text-blue-300">Centralized Sports Repository</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">Official registration portal for managing participant registrations across all categories.</p>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3 text-slate-300">Quick Links</p>
              <div className="space-y-2 text-xs">
                <Link href="/register/athlete" className="block text-slate-400 hover:text-white transition">Athlete Registration</Link>
                <Link href="/register/others" className="block text-slate-400 hover:text-white transition">Others Registration</Link>
                <Link href="/user/login" className="block text-slate-400 hover:text-white transition">Participant Login</Link>
              </div>
            </div>
            <div>
              <p className="font-semibold text-sm mb-3 text-slate-300">Support</p>
              <div className="space-y-2 text-xs text-slate-400">
                <p>Helpline: +91-11-2345-6789</p>
                <p>Alternate: +91-11-2345-6790</p>
                <p>Email: support@gms.gov.in</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-6 text-center text-xs text-slate-500">
            <p>Games Management System — Centralized Sports Repository</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
