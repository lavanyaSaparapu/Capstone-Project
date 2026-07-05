import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  FileSearch, 
  History, 
  Sparkles, 
  Settings,
  ShieldCheck
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const getLinks = () => {
    const role = user.role;
    
    const baseLinks = [
      { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
    ];

    if (role === "Admin" || role === "Recruiter") {
      baseLinks.push(
        { to: "/jobs", label: "Job Postings", icon: <Briefcase className="w-5 h-5" /> },
        { to: "/resumes", label: "Resume Pool", icon: <FileText className="w-5 h-5" /> },
        { to: "/ai-assistant", label: "AI tools", icon: <Sparkles className="w-5 h-5" /> }
      );
    }

    if (role === "Candidate") {
      baseLinks.push(
        { to: "/resume-scanner", label: "Scan Resume", icon: <FileSearch className="w-5 h-5" /> },
        { to: "/ai-assistant", label: "AI Suite", icon: <Sparkles className="w-5 h-5" /> }
      );
    }

    if (role === "Admin") {
      baseLinks.push(
        { to: "/audit-logs", label: "Audit Logs", icon: <ShieldCheck className="w-5 h-5" /> }
      );
    }

    return baseLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 glass-card h-[calc(100vh-80px)] m-4 p-4 sticky top-24 hidden md:flex flex-col gap-6 select-none">
      <div className="px-3">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
          Navigation
        </span>
      </div>
      <nav className="flex flex-col gap-1.5 flex-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                isActive
                  ? 'bg-brand-500 text-white shadow-glow-violet shadow-brand-500/10'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dark-800'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-slate-200/50 dark:border-slate-800/40 pt-4 flex flex-col gap-2">
        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-3">
          Session Info
        </span>
        <div className="px-3 text-xs flex flex-col gap-1">
          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate max-w-full">
            {user.email}
          </span>
          <span className="text-slate-400">
            Role: <span className="font-medium text-brand-500">{user.role}</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
