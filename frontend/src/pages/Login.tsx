import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { KeyRound, Mail, AlertCircle, Loader } from 'lucide-react';

export const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { login, mockMode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setApiError(null);

    if (mockMode) {
      // Mock Login Mode Fallback
      setTimeout(() => {
        setLoading(false);
        const email = data.email.toLowerCase();
        let mockRole: 'Admin' | 'Recruiter' | 'Candidate' = 'Candidate';
        let fullName = "Candidate User";

        if (email.includes('admin')) {
          mockRole = 'Admin';
          fullName = 'System Administrator';
        } else if (email.includes('recruiter') || email.includes('hr')) {
          mockRole = 'Recruiter';
          fullName = 'HR Recruiter Manager';
        } else if (email.includes('john') || email.includes('doe') || email.includes('candidate')) {
          fullName = 'John Doe';
        }

        login("mock-jwt-token-xyz-123456", {
          id: Math.floor(Math.random() * 1000) + 1,
          email: data.email,
          full_name: fullName,
          role: mockRole
        });
        navigate('/dashboard');
      }, 1000);
      return;
    }

    // Live API Login Route
    try {
      const params = new URLSearchParams();
      params.append('username', data.email);
      params.append('password', data.password);

      const res = await axios.post('http://127.0.0.1:8000/api/v1/auth/login', params, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });
      
      const { access_token, user } = res.data;
      login(access_token, user);
      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.detail || "Authentication failed. Make sure backend is running or toggle 'Mock Database' in Navbar.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative">
      {/* Background radial glows */}
      <div className="absolute w-80 h-80 rounded-full bg-brand-500/10 glow-orb top-10 left-10 pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-violet-500/10 glow-orb bottom-10 right-10 pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 flex flex-col gap-6 animate-scale-up z-10">
        <div className="text-center">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:to-slate-300">
            Sign In to NextGen
          </h2>
          <p className="text-slate-400 text-xs mt-2">Enter credentials or use standard seed accounts.</p>
        </div>

        {mockMode && (
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 dark:text-amber-400 text-[11px] leading-relaxed">
            <strong>Mock Mode Active:</strong> Try typing <code className="bg-amber-500/5 dark:bg-amber-500/20 px-1 py-0.5 rounded font-mono">recruiter@nextgenats.com</code> or <code className="bg-amber-500/5 dark:bg-amber-500/20 px-1 py-0.5 rounded font-mono">admin@nextgenats.com</code> to mock role dashboards instantly.
          </div>
        )}

        {apiError && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          
          {/* Email Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="email@example.com"
                className="w-full glass-input pl-11"
                {...register("email", { required: "Email is required" })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-rose-500 font-semibold">{errors.email.message as string}</span>
            )}
          </div>

          {/* Password Input */}
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
              <a href="#" className="text-[11px] text-brand-500 hover:underline">Forgot password?</a>
            </div>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                className="w-full glass-input pl-11"
                {...register("password", { required: "Password is required" })}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-rose-500 font-semibold">{errors.password.message as string}</span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Logging in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 mt-2">
          New here? <Link to="/register" className="text-brand-500 hover:underline font-semibold">Create an account</Link>
        </div>
      </div>
    </div>
  );
};
