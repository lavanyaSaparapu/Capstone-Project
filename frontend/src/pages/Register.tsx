import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { KeyRound, Mail, User as UserIcon, ShieldAlert, Loader } from 'lucide-react';

export const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { mockMode, addNotification } = useAuth();
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setLoading(true);
    setApiError(null);

    if (mockMode) {
      setTimeout(() => {
        setLoading(false);
        addNotification("SYSTEM", "Mock registration successful! You can now log in.");
        navigate('/login');
      }, 1000);
      return;
    }

    try {
      await axios.post('http://127.0.0.1:8000/api/v1/auth/register', {
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        role: data.role
      });
      addNotification("SYSTEM", "Account registered successfully! Please log in.");
      navigate('/login');
    } catch (err: any) {
      console.error(err);
      setApiError(err.response?.data?.detail || "Registration failed. Try checking connection or toggling 'Mock Database'.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center p-6 relative">
      <div className="absolute w-80 h-80 rounded-full bg-brand-500/10 glow-orb top-10 left-10 pointer-events-none" />
      <div className="absolute w-80 h-80 rounded-full bg-violet-500/10 glow-orb bottom-10 right-10 pointer-events-none" />

      <div className="w-full max-w-md glass-card p-8 flex flex-col gap-6 animate-scale-up z-10">
        <div className="text-center">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:to-slate-300">
            Create an Account
          </h2>
          <p className="text-slate-400 text-xs mt-2">Join NextGen Applicant Tracking System.</p>
        </div>

        {apiError && (
          <div className="flex items-center gap-2 p-3 bg-rose-500/15 border border-rose-500/30 rounded-xl text-rose-600 dark:text-rose-400 text-xs animate-fade-in">
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span className="leading-relaxed">{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {/* Full Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
            <div className="relative flex items-center">
              <UserIcon className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="John Doe"
                className="w-full glass-input pl-11"
                {...register("full_name", { required: "Full name is required" })}
              />
            </div>
            {errors.full_name && (
              <span className="text-[10px] text-rose-500 font-semibold">{errors.full_name.message as string}</span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="email"
                placeholder="john@example.com"
                className="w-full glass-input pl-11"
                {...register("email", { required: "Email is required" })}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-rose-500 font-semibold">{errors.email.message as string}</span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Password</label>
            <div className="relative flex items-center">
              <KeyRound className="absolute left-4 w-4 h-4 text-slate-400" />
              <input
                type="password"
                placeholder="Min 6 characters"
                className="w-full glass-input pl-11"
                {...register("password", { 
                  required: "Password is required",
                  minLength: { value: 6, message: "Password must be at least 6 characters" }
                })}
              />
            </div>
            {errors.password && (
              <span className="text-[10px] text-rose-500 font-semibold">{errors.password.message as string}</span>
            )}
          </div>

          {/* Role Select */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Role</label>
            <select
              className="w-full glass-input bg-white dark:bg-dark-900 cursor-pointer"
              {...register("role")}
            >
              <option value="Candidate">Candidate / Job Applicant</option>
              <option value="Recruiter">HR Recruiter / Employer</option>
              <option value="Admin">System Administrator</option>
            </select>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>Registering account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-400 mt-2">
          Already registered? <Link to="/login" className="text-brand-500 hover:underline font-semibold">Sign In</Link>
        </div>
      </div>
    </div>
  );
};
