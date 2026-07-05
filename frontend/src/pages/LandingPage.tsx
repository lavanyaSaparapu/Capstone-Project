import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  ShieldCheck, 
  Search, 
  TrendingUp, 
  Zap, 
  CheckCircle,
  Plus
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const stats = [
    { value: "99.4%", label: "Parsing Accuracy" },
    { value: "85%", label: "Screening Hours Saved" },
    { value: "10x", label: "Hiring Pipeline Acceleration" },
    { value: "4.9/5", label: "G2 User Rating" }
  ];

  const features = [
    {
      icon: <Cpu className="w-6 h-6 text-brand-400" />,
      title: "Semantic Embedding Parser",
      description: "Uses L2 normalized Sentence Transformers to map applicant capabilities against job descriptions, going far beyond rigid keyword matching."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-emerald-400" />,
      title: "Real-time Recruiter Analytics",
      description: "Instant breakdowns of application funnel stages, top skills, experience clusters, and interactive KPI counters."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-400" />,
      title: "Fine-grained Access & Audits",
      description: "Full RBAC route-guards coupled with a security-hardened database audit log system tracking candidate actions, edits, and status changes."
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-400" />,
      title: "Two-stage Queue Pipeline",
      description: "Upload resumes securely with real-time feedback via WebSockets, supported by a scalable worker queue strategy keeping user actions lag-free."
    }
  ];

  const faqs = [
    { q: "How does the AI compare resumes without keyword bias?", a: "By generating semantic vector embeddings of the entire document and mapping them onto the job description. This captures context and intent (e.g. recognizing that 'FastAPI' and 'Django' are similar backend frameworks)." },
    { q: "Is the upload system secure against malicious uploads?", a: "Yes. Files are limited to 5MB, names are sanitized to prevent path-traversals, and binary magic bytes are validated to ensure genuine PDF/DOCX structure." },
    { q: "Can we integrate with external LLM platforms?", a: "Absolutely. The service layer reads environment variables to connect with OpenAI, Google Gemini, or Ollama, falling back to smart local parsers if keys are blank." }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50 dark:bg-dark-950 transition-colors duration-300">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-500/10 rounded-full glow-orb animate-pulse-slow" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-600/10 rounded-full glow-orb animate-pulse-slow" style={{ animationDelay: '2s' }} />
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        
        {/* Hero Section */}
        <section className="pt-24 pb-16 flex flex-col items-center justify-center text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/30 text-brand-600 dark:text-brand-400 text-xs font-semibold mb-8 select-none shadow-md shadow-brand-500/5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing NextGen ATS Enterprise Edition</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-4xl sm:text-6xl font-black tracking-tight leading-tight max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-slate-900 to-slate-700 dark:from-white dark:to-slate-300"
          >
            Screen Resumes with <span className="text-gradient">Semantic AI</span> & Smart Vectors
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-slate-500 dark:text-slate-400 max-w-2xl mt-6 text-base sm:text-lg leading-relaxed"
          >
            Automate screening, rank applicants with Sentence Transformer embeddings, and track recruiter activities with audit transparency. Build a SaaS recruitment pipeline today.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="flex items-center gap-4 mt-10"
          >
            <Link to="/register" className="btn-primary flex items-center gap-2 group text-base font-semibold">
              <span>Start Free Trial</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/login" className="btn-secondary text-base font-semibold">
              Book a Demo
            </Link>
          </motion.div>
        </section>

        {/* Stats Strip */}
        <section className="py-12 border-y border-slate-200/50 dark:border-slate-800/40 my-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-brand-500">{stat.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 mt-2 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20 flex flex-col gap-12">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Enterprise Infrastructure Out-of-the-Box</h2>
            <p className="text-slate-400 text-sm mt-3">Engineered for security, accuracy, and developer-grade scalability.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="glass-card glass-card-hover p-6 flex gap-4"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-dark-800 flex items-center justify-center shrink-0 border border-slate-200/30 dark:border-slate-800/30 shadow-sm">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{feature.title}</h3>
                  <p className="text-slate-400 text-sm mt-2 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20 flex flex-col items-center gap-12">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-3xl font-extrabold tracking-tight">Flexible SaaS Subscriptions</h2>
            <p className="text-slate-400 text-sm mt-3">Select the scope that fits your recruitment volume.</p>
            
            {/* Toggle Billing */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-1 rounded-full mt-8 select-none">
              <button 
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${billingPeriod === 'monthly' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400'}`}
              >
                Monthly
              </button>
              <button 
                onClick={() => setBillingPeriod('yearly')}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${billingPeriod === 'yearly' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400'}`}
              >
                Yearly <span className="text-[9px] bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 px-1 py-0.5 rounded-full font-bold ml-1">Save 20%</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
            {/* Standard Plan */}
            <div className="glass-card p-8 flex flex-col justify-between border-slate-200/40 relative">
              <div className="flex flex-col gap-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Growth Plan</h3>
                <div className="text-3xl font-extrabold">
                  ${billingPeriod === 'monthly' ? '49' : '39'} <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">Perfect for growing startups screening up to 100 applications monthly.</p>
                <div className="border-t border-slate-200/50 dark:border-slate-800/40 my-2" />
                <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> 10 Active Job Openings</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Vector Semantic Matching</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Basic Email OTP Verification</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> SQLite/SQLite DB Fallback</li>
                </ul>
              </div>
              <Link to="/register" className="btn-secondary w-full text-center py-2.5 text-xs font-bold mt-8">Get Started</Link>
            </div>

            {/* Pro Plan (Best Value) */}
            <div className="glass-card p-8 flex flex-col justify-between border-brand-500/40 relative ring-2 ring-brand-500/20">
              <span className="absolute top-4 right-4 bg-brand-500/20 border border-brand-500/40 text-brand-600 dark:text-brand-400 text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full select-none">
                Best Option
              </span>
              <div className="flex flex-col gap-4">
                <h3 className="text-brand-500 text-xs font-bold uppercase tracking-widest">SaaS Pro</h3>
                <div className="text-3xl font-extrabold">
                  ${billingPeriod === 'monthly' ? '99' : '79'} <span className="text-xs text-slate-400 font-medium">/ month</span>
                </div>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">Designed for fast-scaling companies handling high applicant inflow.</p>
                <div className="border-t border-slate-200/50 dark:border-slate-800/40 my-2" />
                <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-500" /> Unlimited Job Openings</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-500" /> L2 Normalized Vector Search</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-500" /> WebSocket Push alerts</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-500" /> AI Resume Suggestion suite</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-brand-500" /> Excel/PDF Report export</li>
                </ul>
              </div>
              <Link to="/register" className="btn-primary w-full text-center py-2.5 text-xs font-bold mt-8">Upgrade to Pro</Link>
            </div>

            {/* Enterprise Plan */}
            <div className="glass-card p-8 flex flex-col justify-between border-slate-200/40 relative">
              <div className="flex flex-col gap-4">
                <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Custom Enterprise</h3>
                <div className="text-3xl font-extrabold">Custom</div>
                <p className="text-slate-400 text-xs leading-relaxed mt-2">Tailored for large multinational firms requiring dedicated infrastructure.</p>
                <div className="border-t border-slate-200/50 dark:border-slate-800/40 my-2" />
                <ul className="flex flex-col gap-2.5 text-xs text-slate-500 dark:text-slate-400">
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Dedicated Postgres Cluster</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> SLA Response Guarantee</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Custom LLM Integrations</li>
                  <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" /> Full Audit Logs API Stream</li>
                </ul>
              </div>
              <Link to="/register" className="btn-secondary w-full text-center py-2.5 text-xs font-bold mt-8">Contact Sales</Link>
            </div>
          </div>
        </section>

        {/* FAQs */}
        <section className="py-20 w-full max-w-4xl mx-auto flex flex-col gap-10">
          <h2 className="text-3xl font-extrabold tracking-tight text-center">Frequently Asked Questions</h2>
          <div className="flex flex-col gap-4">
            {faqs.map((faq, i) => (
              <div key={i} className="glass-card p-5">
                <h4 className="font-bold text-sm text-slate-800 dark:text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-500 shrink-0" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-2 pl-6">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-slate-200/50 dark:border-slate-800/40 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4 mt-12">
          <span>&copy; 2026 NextGen ATS Corp. All rights reserved. Capstone Project.</span>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Security Architecture</a>
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">GitHub</a>
          </div>
        </footer>

      </div>
    </div>
  );
};
