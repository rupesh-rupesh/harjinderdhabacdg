import React, { useState, useEffect } from 'react';
import { Mail, Eye, EyeOff, RefreshCw, CheckCircle2, Send, ShieldCheck, ArrowLeft, User } from 'lucide-react';
import toast from 'react-hot-toast';
import OtpInput from './OtpInput';

interface StaffLoginModalProps {
  role: 'admin' | 'manager';
  onSuccess: (info: any) => void;
}

export default function StaffLoginModal({ role, onSuccess }: StaffLoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [staffId, setStaffId] = useState<number | null>(null);

  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState(false);

  const accentColor = '#C89B3C';
  const bgDark = 'rgba(26,16,8,0.95)';
  const bgCard = 'rgba(12,8,5,0.85)';

  const maskEmail = (e: string) => {
    if (!e || !e.includes('@')) return e;
    const [name, domain] = e.split('@');
    if (name.length <= 2) return `${name}***@${domain}`;
    return `${name.substring(0, 2)}***@${domain}`;
  };

  const [isSetupMode, setIsSetupMode] = useState(false);
  const [setupName, setSetupName] = useState('');

  useEffect(() => {
    if (role === 'admin') {
      fetch('/api/staff/admin-exists')
        .then(res => res.json())
        .then(data => {
          if (data.exists === false) {
            setIsSetupMode(true);
            toast('Admin setup required. Please create the master account.', { icon: '🛡️' });
          }
        })
        .catch(() => {});
    }
  }, [role]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingOtp) return;
    setError(null);
    setSendingOtp(true);
    try {
      const response = await fetch('/api/staff/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: setupName, email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Failed to create admin');
        setSendingOtp(false);
        return;
      }
      toast.success('Admin account created successfully!');
      setIsSetupMode(false);
      // After setup, automatically log them in by triggering handleSendOtp
      await handleSendOtp(e);
    } catch (err) {
      setError('Connection failed. Please try again.');
      setSendingOtp(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpSent) return;
    
    setError(null);
    setSendingOtp(true);
    
    try {
      const response = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });
      
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || data.error || 'Invalid credentials');
        setSendingOtp(false);
        return;
      }
      
      setStaffId(data.staffId);
      if (data.devOtp) {
        setOtp(data.devOtp);
      }
      setOtpSent(true);
      toast.success('OTP sent to your email');
    } catch (err) {
      setError('Connection failed. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpSent) {
      return handleSendOtp(e);
    }
    
    setOtpError(null);
    setVerifying(true);
    
    try {
      const response = await fetch('/api/staff/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ staffId, otp })
      });
      
      const data = await response.json();
      if (!response.ok) {
        setOtpError(data.message || data.error || 'Invalid OTP');
        setVerifying(false);
        return;
      }
      
      setOtpSuccess(true);
      toast.success(`Welcome back, ${data.name || 'Staff'}!`);
      setTimeout(() => onSuccess(data), 600);
      
    } catch (err) {
      setOtpError('Connection failed. Please try again.');
      setVerifying(false);
    }
  };

  const resetForm = () => {
    setOtpSent(false);
    setOtp('');
    setError(null);
    setOtpError(null);
    setOtpSuccess(false);
    setStaffId(null);
  };

  return (
    <div 
      className="fixed inset-0 z-[999] flex items-center justify-center p-4 font-sans overflow-hidden bg-[#1a1008]" 
    >
      {/* Main Background Image */}
      <div 
        className="absolute inset-0"
        style={{ backgroundImage: 'url(/loginbg22.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
      ></div>
      
      {/* Dark Overlay to ensure text legibility */}
      <div className="absolute inset-0 bg-black/50 sm:bg-black/40"></div>
      
      {/* Animated Glowing Orbs (mix-blend-screen ensures they lighten the background image) */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#C89B3C]/30 blur-[120px] animate-pulse mix-blend-screen pointer-events-none" style={{ animationDuration: '8s' }}></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-[#ff7300]/20 blur-[120px] animate-pulse mix-blend-screen pointer-events-none" style={{ animationDuration: '12s', animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16 px-4 h-full py-12 overflow-y-auto">
        
        {/* Branding Section (Hidden on small mobile) */}
        <div className="flex-1 text-center lg:text-left hidden md:flex flex-col justify-center max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 border border-[#C89B3C]/30 backdrop-blur-md mb-8 w-fit mx-auto lg:mx-0 shadow-lg">
            <div className="w-2 h-2 rounded-full bg-[#C89B3C] animate-pulse"></div>
            <span className="text-xs font-medium tracking-widest text-[#C89B3C] uppercase">Secure Gateway</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-2xl">
            Harjinder Tourist <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C89B3C] to-amber-300">Dhaba</span>
          </h1>
          
          <p className="text-stone-400 text-lg lg:text-xl font-light leading-relaxed mb-10 drop-shadow-md">
            Welcome to the centralized management portal. Access operational controls, monitor analytics, and manage daily tasks efficiently.
          </p>

          <div className="flex flex-wrap items-center gap-6 text-sm text-stone-300 font-medium">
            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-[#C89B3C]" />
              <span>Encrypted Access</span>
            </div>
            <div className="flex items-center gap-3 bg-black/30 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-sm">
              <EyeOff className="w-5 h-5 text-[#C89B3C]" />
              <span>Private Network</span>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <div 
          className="w-full max-w-md rounded-[2rem] overflow-hidden relative backdrop-blur-2xl shrink-0 my-auto transform transition-all duration-500 hover:shadow-[0_0_80px_rgba(200,155,60,0.15)] shadow-2xl"
          style={{ background: 'rgba(20,14,10,0.65)', border: `1px solid rgba(200,155,60,0.2)`, boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 0 0 20px rgba(200,155,60,0.05)` }}
        >
          {/* Subtle flare inside card */}
          <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#C89B3C]/20 to-transparent pointer-events-none opacity-60 mix-blend-screen"></div>
          
          <div className="p-10 relative z-10">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-[#1a1008] to-[#0a0604] text-[#C89B3C] rounded-2xl flex items-center justify-center mb-6 border border-[#C89B3C]/30 shadow-[0_0_20px_rgba(200,155,60,0.15)]">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-serif font-bold text-white mb-2 tracking-tight">
                {isSetupMode ? 'System Initialization' : role === 'admin' ? 'Admin Portal' : 'Manager Portal'}
              </h2>
              <p className="text-[#C89B3C]/80 text-sm font-medium tracking-wide uppercase text-xs">
                {isSetupMode ? 'Create Master Account' : 'Secure Authentication'}
              </p>
            </div>

          <form onSubmit={isSetupMode ? handleSetup : otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-5">
            {error && (
              <div className="p-3 rounded-lg text-sm bg-red-950/50 border border-red-500/50 text-red-200">
                {error}
              </div>
            )}
            {otpError && (
              <div className="p-3 rounded-lg text-sm bg-red-950/50 border border-red-500/50 text-red-200">
                {otpError}
              </div>
            )}

            {!otpSent && (
              <div className="space-y-6">
                {isSetupMode && (
                  <div className="space-y-2 relative group/input">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C] ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C89B3C]/40 group-focus-within/input:text-[#C89B3C] group-focus-within/input:drop-shadow-[0_0_8px_rgba(200,155,60,0.5)] transition-all duration-300" />
                      <input
                        type="text" 
                        value={setupName} 
                        onChange={e => setSetupName(e.target.value)}
                        placeholder="Master Admin" 
                        required 
                        disabled={sendingOtp}
                        className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm bg-black/30 border border-[#C89B3C]/20 outline-none focus:border-[#C89B3C] focus:bg-black/60 focus:ring-4 focus:ring-[#C89B3C]/15 transition-all duration-300 placeholder:text-stone-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md font-medium"
                      />
                    </div>
                  </div>
                )}
                
                <div className="space-y-2 relative group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C] ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#C89B3C]/40 group-focus-within/input:text-[#C89B3C] group-focus-within/input:drop-shadow-[0_0_8px_rgba(200,155,60,0.5)] transition-all duration-300" />
                    <input
                      type="email" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com" 
                      required 
                      disabled={sendingOtp}
                      className="w-full pl-11 pr-4 py-4 rounded-2xl text-white text-sm bg-black/30 border border-[#C89B3C]/20 outline-none focus:border-[#C89B3C] focus:bg-black/60 focus:ring-4 focus:ring-[#C89B3C]/15 transition-all duration-300 placeholder:text-stone-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2 relative group/input">
                  <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-[#C89B3C] ml-1">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'} 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Enter your password" 
                      required 
                      disabled={sendingOtp}
                      className="w-full px-4 py-4 pl-4 pr-12 rounded-2xl text-white text-sm bg-black/30 border border-[#C89B3C]/20 outline-none focus:border-[#C89B3C] focus:bg-black/60 focus:ring-4 focus:ring-[#C89B3C]/15 transition-all duration-300 placeholder:text-stone-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.6)] backdrop-blur-md font-medium tracking-wide"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-[#C89B3C]/40 hover:text-[#C89B3C] transition-all duration-300 rounded-full hover:bg-[#C89B3C]/10 focus:outline-none"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={sendingOtp || !email || !password || (isSetupMode && !setupName)}
                  className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(200,155,60,0.3)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group mt-10 shadow-[0_5px_20px_rgba(200,155,60,0.15)] border border-[#e8c05f] backdrop-blur-md"
                  style={{ background: `linear-gradient(135deg, #d4af37 0%, ${accentColor} 50%, #b08835 100%)`, color: '#1a1008' }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                  {sendingOtp ? <RefreshCw className="w-4 h-4 animate-spin relative z-10" /> : <Send className="w-4 h-4 relative z-10 drop-shadow-md" />}
                  <span className="relative z-10 uppercase tracking-widest text-[12px] drop-shadow-sm font-extrabold">{isSetupMode ? 'Initialize System' : 'Send Verification Code'}</span>
                </button>
              </div>
            )}

            {otpSent && (
              <div className="space-y-5 animate-in fade-in zoom-in duration-300">
                <div className="text-center space-y-2">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-stone-900 border border-stone-800 mb-2">
                    <ShieldCheck className="w-6 h-6 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Check your email</h3>
                  <p className="text-stone-400 text-sm max-w-[250px] mx-auto">
                    We sent a verification code to <strong className="text-stone-200">{maskEmail(email)}</strong>
                  </p>
                </div>

                <div className="space-y-2 pt-2">
                  <OtpInput
                    value={otp}
                    onChange={setOtp}
                    disabled={verifying || otpSuccess}
                    isSuccess={otpSuccess}
                  />
                </div>

                {!otpSuccess && (
                  <button
                    type="submit"
                    disabled={verifying || otp.length < 6}
                    className="w-full py-4 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-1 hover:shadow-[0_8px_20px_rgba(200,155,60,0.25)] disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none relative overflow-hidden group mt-6"
                    style={{ background: `linear-gradient(135deg, ${accentColor}, #d4af37)`, color: '#000' }}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    {verifying ? <RefreshCw className="w-4 h-4 animate-spin relative z-10" /> : <CheckCircle2 className="w-4 h-4 relative z-10" />}
                    <span className="relative z-10 uppercase tracking-wider text-[13px]">Verify & Sign In</span>
                  </button>
                )}
                
                {otpSuccess && (
                  <div className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 bg-green-600 text-white shadow-[0_0_20px_rgba(22,163,74,0.4)]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verified! Redirecting...</span>
                  </div>
                )}

                <button 
                  type="button"
                  onClick={resetForm}
                  className="w-full py-2 flex items-center justify-center gap-2 text-xs text-stone-500 hover:text-stone-300 transition-colors mt-2"
                >
                  <ArrowLeft className="w-3 h-3" /> Use different credentials
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  </div>
  );
}

