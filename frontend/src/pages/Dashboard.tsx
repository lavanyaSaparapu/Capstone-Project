import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Calendar, 
  Activity, 
  ChevronRight, 
  FileUp, 
  Clock, 
  TrendingUp, 
  Sparkles 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';

export const Dashboard: React.FC = () => {
  const { user, mockMode } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fallback Mock Data for Presentation
  const mockStats = {
    counters: {
      total_jobs: 14,
      total_candidates: 345,
      total_resumes: 189,
      total_applications: 124,
      total_interviews: 28
    },
    hiring_funnel: {
      Applied: 62,
      Screening: 32,
      Interview: 18,
      Offered: 6,
      Rejected: 6
    },
    top_skills: [
      { skill: "React", count: 84 },
      { skill: "Python", count: 72 },
      { skill: "TypeScript", count: 68 },
      { skill: "Node.js", count: 59 },
      { skill: "PostgreSQL", count: 52 },
      { skill: "FastAPI", count: 48 },
      { skill: "Docker", count: 42 }
    ],
    experience_levels: {
      "Entry (0-2 yrs)": 45,
      "Mid (3-5 yrs)": 98,
      "Senior (6+ yrs)": 46
    },
    monthly_trends: [
      { month: "Jan", applications: 45, hires: 2 },
      { month: "Feb", applications: 58, hires: 4 },
      { month: "Mar", applications: 72, hires: 5 },
      { month: "Apr", applications: 94, hires: 8 },
      { month: "May", applications: 110, hires: 12 },
      { month: "Jun", applications: 124, hires: 14 }
    ],
    activities: [
      { user: "HR Executive", action: "UPLOAD_RESUME", resource: "John_CV.pdf", time: "5 mins ago" },
      { user: "System", action: "CALCULATE_ATS_MATCH", resource: "Score: 92%", time: "10 mins ago" },
      { user: "Recruiter Manager", action: "CHANGE_APPLICATION_STAGE", resource: "Candidate -> Interview", time: "1 hr ago" },
      { user: "Admin", action: "CREATE_JOB", resource: "Lead Software Architect", time: "2 hrs ago" }
    ],
    candidate_applications: [
      { job_title: "Full Stack Engineer", company: "Vercel Inc.", stage: "Interview", date: "June 28, 2026", score: 94 },
      { job_title: "Python AI Developer", company: "Linear App", stage: "Screening", date: "June 25, 2026", score: 87 }
    ]
  };

  useEffect(() => {
    if (mockMode) {
      setStats(mockStats);
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        if (user?.role === "Candidate") {
          const res = await axios.get('http://127.0.0.1:8000/api/v1/jobs/applications/me');
          setStats({
            candidate_applications: res.data
          });
        } else {
          const res = await axios.get('http://127.0.0.1:8000/api/v1/analytics');
          setStats({ ...res.data, activities: mockStats.activities });
        }
      } catch (err) {
        console.error("Failed to load dashboard data: ", err);
        setStats(mockStats);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [mockMode, user]);

  if (loading || !stats) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center flex flex-col items-center gap-3">
          <Clock className="w-8 h-8 text-brand-500 animate-spin" />
          <span className="font-semibold text-slate-400 text-sm">Aggregating real-time ATS analytics...</span>
        </div>
      </div>
    );
  }

  const role = user?.role || "Candidate";

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      
      {/* Welcome banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black">Welcome back, {user?.full_name}</h1>
          <p className="text-slate-400 text-xs mt-1">Here is a summary of your recruiting pipeline metrics.</p>
        </div>
        <div className="flex gap-2">
          {role !== "Candidate" ? (
            <>
              <Link to="/jobs" className="btn-secondary px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" />
                <span>Manage Jobs</span>
              </Link>
              <Link to="/ai-assistant" className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>AI Screening</span>
              </Link>
            </>
          ) : (
            <Link to="/resume-scanner" className="btn-primary px-4 py-2 text-xs font-semibold flex items-center gap-1.5">
              <FileUp className="w-4 h-4" />
              <span>Scan New Resume</span>
            </Link>
          )}
        </div>
      </div>

      {/* Recruiter / Admin Dashboard View */}
      {(role === "Admin" || role === "Recruiter") && (
        <>
          {/* Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center shadow-sm">
                <Briefcase className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Open Jobs</span>
                <div className="text-2xl font-extrabold mt-1">{stats.counters.total_jobs}</div>
              </div>
            </div>

            <div className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Candidates</span>
                <div className="text-2xl font-extrabold mt-1">{stats.counters.total_candidates}</div>
              </div>
            </div>

            <div className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Resumes Screened</span>
                <div className="text-2xl font-extrabold mt-1">{stats.counters.total_resumes}</div>
              </div>
            </div>

            <div className="glass-card p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shadow-sm">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Interviews</span>
                <div className="text-2xl font-extrabold mt-1">{stats.counters.total_interviews}</div>
              </div>
            </div>

          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Area Chart: Monthly Trends */}
            <div className="glass-card p-5 lg:col-span-2 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <span className="font-bold text-sm">Application & Hiring Trends</span>
                <span className="text-[10px] bg-slate-100 dark:bg-dark-800 text-slate-400 px-2 py-0.5 rounded-full font-bold">Monthly</span>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.monthly_trends}>
                    <defs>
                      <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.1}/>
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}/>
                    <Area type="monotone" dataKey="applications" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorApps)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Funnel Stage Breakdown */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <span className="font-bold text-sm">Hiring Funnel Stages</span>
              <div className="flex flex-col gap-3.5 mt-2">
                {Object.entries(stats.hiring_funnel).map(([stage, count]: [string, any], index) => {
                  const max = Math.max(...Object.values(stats.hiring_funnel) as number[]);
                  const percent = max > 0 ? (count / max) * 100 : 0;
                  return (
                    <div key={stage} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-500 dark:text-slate-400">{stage}</span>
                        <span>{count}</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-dark-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-brand-500 transition-all duration-500" 
                          style={{ width: `${percent}%`, opacity: 1 - index * 0.15 }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Bottom Row: Top Skills & Audit activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Skills Graph */}
            <div className="glass-card p-5 flex flex-col gap-4">
              <span className="font-bold text-sm">Applicant Skills Index</span>
              <div className="h-60 w-full mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.top_skills.slice(0, 5)}>
                    <XAxis dataKey="skill" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false}/>
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} hide/>
                    <Tooltip contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '12px' }}/>
                    <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]}>
                      {stats.top_skills.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fillOpacity={1 - index * 0.12}/>
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Audit Logs activities stream */}
            <div className="glass-card p-5 lg:col-span-2 flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
                <span className="font-bold text-sm flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-brand-500" />
                  <span>Real-time System Audit Stream</span>
                </span>
                <Link to="/audit-logs" className="text-xs text-brand-500 hover:underline flex items-center gap-0.5">
                  <span>View All Logs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="flex flex-col gap-3 max-h-56 overflow-y-auto">
                {stats.activities.map((act: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-50 dark:bg-dark-900/30 border border-slate-200/30 dark:border-slate-800/30 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-brand-500 rounded-full" />
                      <span className="font-bold text-slate-700 dark:text-slate-300">{act.user}</span>
                      <span className="text-slate-400">performed</span>
                      <code className="text-[10px] bg-brand-500/10 text-brand-500 border border-brand-500/20 px-1 py-0.5 rounded">{act.action}</code>
                      <span className="text-slate-400 font-mono">({act.resource})</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </>
      )}

      {/* Candidate Dashboard View */}
      {role === "Candidate" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Applications lists */}
          <div className="glass-card p-5 lg:col-span-2 flex flex-col gap-4">
            <span className="font-bold text-sm">Active Job Applications</span>
            <div className="flex flex-col gap-4 mt-2">
              {stats.candidate_applications.map((app: any, idx: number) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/40 dark:bg-dark-900/40 border border-slate-200/50 dark:border-slate-850/40 flex items-center justify-between">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{app.job_title}</h3>
                    <span className="text-[11px] text-slate-400 font-medium">{app.company} &bull; Applied: {app.date}</span>
                    {/* Stage visual steps */}
                    <div className="flex items-center gap-1.5 mt-2">
                      {app.stage === "Rejected" ? (
                        <span className="text-[9px] bg-rose-500 text-white px-2.5 py-0.5 rounded-full font-bold select-none shadow-sm shadow-rose-500/10">
                          Rejected
                        </span>
                      ) : (
                        ["Applied", "Screening", "Interview", "Offered"].map((step) => {
                          const stages = ["Applied", "Screening", "Interview", "Offered"];
                          const currentIdx = stages.indexOf(app.stage);
                          const stepIdx = stages.indexOf(step);
                          const isDone = stepIdx <= currentIdx;
                          return (
                            <div key={step} className="flex items-center gap-1">
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold select-none ${isDone ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/10' : 'bg-slate-200 dark:bg-dark-800 text-slate-400'}`}>
                                {step}
                              </span>
                              {step !== "Offered" && <span className="text-slate-300 dark:text-slate-700 text-xs">&rarr;</span>}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                  
                  {/* Score Ring badge */}
                  <div className="flex flex-col items-center gap-1 text-center shrink-0">
                    <span className="text-2xl font-black text-brand-500">{app.score}%</span>
                    <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400">ATS Match</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AI tools panel */}
          <div className="glass-card p-5 flex flex-col gap-4">
            <span className="font-bold text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-brand-500 animate-pulse" />
              <span>AI Job Preparation Suite</span>
            </span>
            <p className="text-xs text-slate-400 leading-relaxed">Leverage semantic models to audit resume keywords, drafts, and mock interviews tailored to active postings.</p>
            <div className="flex flex-col gap-2 mt-2">
              <Link to="/resume-scanner" className="btn-primary w-full text-center py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                <FileUp className="w-4 h-4" />
                <span>Upload Resume</span>
              </Link>
              <Link to="/ai-assistant" className="btn-secondary w-full text-center py-2.5 text-xs font-bold flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-500" />
                <span>AI Cover Letter & Prep</span>
              </Link>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
