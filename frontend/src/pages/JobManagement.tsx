import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Briefcase, 
  Plus, 
  Users, 
  MapPin, 
  ChevronRight, 
  Search,
  Sparkles,
  Calendar,
  FolderMinus,
  CheckCircle,
  FileCheck,
  TrendingUp,
  Mail,
  Loader
} from 'lucide-react';
import { ScoreMeter } from '../components/ScoreMeter';

export const JobManagement: React.FC = () => {
  const { mockMode, addNotification } = useAuth();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [loadingApplicants, setLoadingApplicants] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // Forms states
  const [title, setTitle] = useState("");
  const [dept, setDept] = useState("");
  const [desc, setDesc] = useState("");
  const [reqs, setReqs] = useState("");

  // Interview scheduler state
  const [schedulingAppId, setSchedulingAppId] = useState<number | null>(null);
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewType, setInterviewType] = useState("Technical");

  // Fallback Mock data
  const mockJobs = [
    { id: 1, title: "Senior React Developer", department: "Frontend", status: "Open", recruiter_id: 2, created_at: "2026-06-20", description: "Design next-gen user interfaces...", requirements: "React, TypeScript, CSS, Tailwind, Framer Motion" },
    { id: 2, title: "Backend Python Engineer", department: "Core Backend", status: "Open", recruiter_id: 2, created_at: "2026-06-22", description: "Maintain FastAPI service layers and database routers...", requirements: "Python, FastAPI, PostgreSQL, SQLAlchemy, Docker" },
    { id: 3, title: "Machine Learning Researcher", department: "AI/ML Lab", status: "Open", recruiter_id: 2, created_at: "2026-06-25", description: "Compute vector models and semantic search embeddings...", requirements: "Python, spaCy, Sentence Transformers, PyTorch, Pytest" }
  ];

  const mockApplicantsForJob = (jobId: number) => {
    if (jobId === 1) {
      return [
        { application_id: 101, status: "Screening", score: 94.2, created_at: "2026-06-26", candidate: { id: 10, full_name: "Sarah Jenkins", email: "sarah@gmail.com" }, resume: { filename: "Sarah_Resume.pdf", parsed_data: { skills: ["React", "TypeScript", "Tailwind", "Git", "Redux"] } } },
        { application_id: 102, status: "Applied", score: 78.5, created_at: "2026-06-27", candidate: { id: 11, full_name: "David Miller", email: "david@yahoo.com" }, resume: { filename: "David_Vite_CV.pdf", parsed_data: { skills: ["React", "JavaScript", "HTML", "CSS"] } } }
      ];
    } else {
      return [
        { application_id: 103, status: "Interview", score: 89.8, created_at: "2026-06-25", candidate: { id: 12, full_name: "Alex Rivera", email: "alex@mit.edu" }, resume: { filename: "Alex_AI_Resume.docx", parsed_data: { skills: ["Python", "FastAPI", "SQL", "Docker", "Pytest"] } } },
        { application_id: 104, status: "Rejected", score: 42.1, created_at: "2026-06-26", candidate: { id: 13, full_name: "Emma Watson", email: "emma@act.org" }, resume: { filename: "Emma_CV.pdf", parsed_data: { skills: ["Java", "Spring Boot", "MySQL"] } } }
      ];
    }
  };

  const fetchJobs = async () => {
    setLoadingJobs(true);
    if (mockMode) {
      setJobs(mockJobs);
      setLoadingJobs(false);
      return;
    }
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/jobs');
      setJobs(res.data);
    } catch {
      setJobs(mockJobs);
    } finally {
      setLoadingJobs(false);
    }
  };

  const fetchApplicants = async (jobId: number) => {
    setLoadingApplicants(true);
    if (mockMode) {
      setApplicants(mockApplicantsForJob(jobId));
      setLoadingApplicants(false);
      return;
    }
    try {
      const res = await axios.get(`http://127.0.0.1:8000/api/v1/jobs/${jobId}/applicants`);
      setApplicants(res.data);
    } catch {
      setApplicants(mockApplicantsForJob(jobId));
    } finally {
      setLoadingApplicants(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [mockMode]);

  const selectJob = (job: any) => {
    setSelectedJob(job);
    fetchApplicants(job.id);
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !dept) return;

    if (mockMode) {
      const newJ = {
        id: jobs.length + 1,
        title,
        department: dept,
        status: "Open",
        recruiter_id: 2,
        created_at: new Date().toISOString().split('T')[0],
        description: desc,
        requirements: reqs
      };
      setJobs([newJ, ...jobs]);
      setShowModal(false);
      addNotification("SYSTEM", `Job Posting Created: ${title}`);
      return;
    }

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/jobs', {
        title,
        department: dept,
        description: desc,
        requirements: reqs,
        status: "Open"
      });
      setJobs([res.data, ...jobs]);
      setShowModal(false);
      addNotification("SYSTEM", `Job Posting Created: ${title}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create job on live backend.");
    }
  };

  const handleUpdateStage = async (appId: number, nextStage: string) => {
    if (mockMode) {
      setApplicants(prev => prev.map(a => a.application_id === appId ? { ...a, status: nextStage } : a));
      addNotification("SYSTEM", `Applicant status updated to ${nextStage}`);
      return;
    }
    try {
      await axios.put(`http://127.0.0.1:8000/api/v1/applications/${appId}/stage`, {
        status: nextStage,
        notes: `Advanced to ${nextStage} stage.`
      });
      setApplicants(prev => prev.map(a => a.application_id === appId ? { ...a, status: nextStage } : a));
      addNotification("SYSTEM", `Applicant status updated to ${nextStage}`);
    } catch (err) {
      console.error(err);
      alert("Failed to update applicant stage on live backend.");
    }
  };

  const handleScheduleInterview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!schedulingAppId || !interviewDate) return;

    if (mockMode) {
      setApplicants(prev => prev.map(a => a.application_id === schedulingAppId ? { ...a, status: "Interview" } : a));
      addNotification("SYSTEM", `Interview scheduled for applicant.`);
      setSchedulingAppId(null);
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/applications/${schedulingAppId}/interviews`, {
        application_id: schedulingAppId,
        scheduled_at: new Date(interviewDate).toISOString(),
        status: "Scheduled",
        type: interviewType,
        notes: "Automated scheduler entry."
      });
      setApplicants(prev => prev.map(a => a.application_id === schedulingAppId ? { ...a, status: "Interview" } : a));
      addNotification("SYSTEM", `Interview scheduled successfully.`);
      setSchedulingAppId(null);
    } catch (err) {
      console.error(err);
      alert("Failed to schedule interview on live backend.");
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black">Recruitment & Job Postings</h1>
          <p className="text-slate-400 text-xs mt-1">Configure listings and review candidates ranked by L2 normalized cosine similarity.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-1 text-xs font-bold"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Job Postings List */}
        <div className="flex flex-col gap-4">
          <span className="font-bold text-sm">Active Openings ({jobs.length})</span>
          {loadingJobs ? (
            <div className="text-center py-12 text-xs text-slate-400">Loading jobs...</div>
          ) : (
            <div className="flex flex-col gap-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  onClick={() => selectJob(job)}
                  className={`glass-card p-4 flex flex-col gap-3 cursor-pointer transition-all border ${
                    selectedJob?.id === job.id 
                      ? 'border-brand-500 ring-1 ring-brand-500/20' 
                      : 'border-slate-200/50 dark:border-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-slate-800 dark:text-white">{job.title}</h3>
                    <span className="text-[9px] bg-brand-500/10 border border-brand-500/20 text-brand-500 px-2 py-0.5 rounded-full font-bold select-none">
                      {job.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{job.department}</span>
                    <span>&bull;</span>
                    <span>Created: {job.created_at.split('T')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Applicants list for selected Job */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {selectedJob ? (
            <div className="glass-card p-6 flex flex-col gap-5">
              
              {/* Selected Job Header */}
              <div className="flex justify-between items-start border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
                <div>
                  <h2 className="text-lg font-bold">{selectedJob.title}</h2>
                  <p className="text-xs text-slate-400 mt-1">Department: {selectedJob.department} &bull; Requirements: <code className="bg-slate-100 dark:bg-dark-800 px-1 py-0.5 rounded font-mono text-[10px] text-brand-500">{selectedJob.requirements}</code></p>
                </div>
              </div>

              {/* Applicants list */}
              <div>
                <span className="font-bold text-sm block mb-4">Ranked Candidates</span>
                {loadingApplicants ? (
                  <div className="text-center py-12 flex flex-col items-center gap-2 text-slate-400 text-xs">
                    <Loader className="w-5 h-5 animate-spin text-brand-500" />
                    <span>Scoring candidates with Sentence Transformers...</span>
                  </div>
                ) : applicants.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 text-xs">No active applications for this posting.</div>
                ) : (
                  <div className="flex flex-col gap-4">
                    {applicants.map((app, idx) => (
                      <div 
                        key={app.application_id}
                        className="p-4 rounded-2xl bg-slate-50/50 dark:bg-dark-900/30 border border-slate-200/50 dark:border-slate-800/40 flex flex-col sm:flex-row justify-between gap-4"
                      >
                        {/* Candidate Basic Info */}
                        <div className="flex gap-4 items-start">
                          <span className="text-xs font-black text-slate-400 bg-slate-200/50 dark:bg-dark-800 w-6 h-6 rounded-full flex items-center justify-center select-none shrink-0">
                            {idx + 1}
                          </span>
                          <div className="flex flex-col gap-1">
                            <h4 className="font-bold text-sm text-slate-800 dark:text-white">{app.candidate.full_name}</h4>
                            <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                              <Mail className="w-3.5 h-3.5" />
                              <span>{app.candidate.email}</span>
                            </span>
                            <div className="flex items-center gap-1.5 flex-wrap mt-2">
                              {app.resume.parsed_data?.skills?.slice(0, 5).map((skill: string) => (
                                <span key={skill} className="text-[9px] bg-slate-200/50 dark:bg-dark-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full font-semibold">
                                  {skill}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Candidate ATS Score & Actions */}
                        <div className="flex items-center sm:items-end justify-between sm:justify-start gap-4 sm:flex-col shrink-0">
                          
                          {/* Score widget */}
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">ATS Match</span>
                              <span className="text-lg font-black text-brand-500">{app.score}%</span>
                            </div>
                            <ScoreMeter score={app.score} size={48} strokeWidth={4} />
                          </div>

                          {/* Action triggers */}
                          <div className="flex items-center gap-1.5">
                            {app.status === "Applied" && (
                              <button 
                                onClick={() => handleUpdateStage(app.application_id, "Screening")}
                                className="px-2.5 py-1.5 rounded-lg bg-brand-500/10 text-brand-500 text-[10px] font-bold border border-brand-500/20 hover:bg-brand-500/20 transition-all"
                              >
                                Accept Screening
                              </button>
                            )}
                            {app.status === "Screening" && (
                              <button 
                                onClick={() => setSchedulingAppId(app.application_id)}
                                className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 text-[10px] font-bold border border-emerald-500/20 hover:bg-emerald-500/20 transition-all flex items-center gap-1"
                              >
                                <Calendar className="w-3 h-3" />
                                <span>Schedule Interview</span>
                              </button>
                            )}
                            {app.status === "Interview" && (
                              <div className="flex gap-1">
                                <button 
                                  onClick={() => handleUpdateStage(app.application_id, "Offered")}
                                  className="px-2 py-1 rounded bg-emerald-600 text-white text-[9px] font-bold"
                                >
                                  Offer
                                </button>
                                <button 
                                  onClick={() => handleUpdateStage(app.application_id, "Rejected")}
                                  className="px-2 py-1 rounded bg-rose-600 text-white text-[9px] font-bold"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            <span className={`text-[10px] px-2 py-1 rounded font-extrabold select-none uppercase ${
                              app.status === "Offered" ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' :
                              app.status === "Rejected" ? 'bg-rose-500/20 text-rose-500 border border-rose-500/30' : 'text-slate-400'
                            }`}>
                              {app.status}
                            </span>
                          </div>

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center gap-4 justify-center h-full min-h-[300px]">
              <Briefcase className="w-10 h-10 text-slate-300 dark:text-slate-700" />
              <div>
                <span className="font-bold text-sm block">No Posting Selected</span>
                <span className="text-xs text-slate-400 mt-1 block">Click an active opening on the sidebar list to inspect candidates and match scores.</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Post Job Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-lg glass-card p-6 flex flex-col gap-5 animate-scale-up">
            <h3 className="text-lg font-black">Configure Job Opening</h3>
            <form onSubmit={handleCreateJob} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Title</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Frontend Engineer" 
                    className="glass-input text-xs" 
                    value={title} 
                    onChange={e => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Department</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Engineering" 
                    className="glass-input text-xs" 
                    value={dept} 
                    onChange={e => setDept(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Core Skills Requirements (Comma Separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. Python, FastAPI, Docker, SQL" 
                  className="glass-input text-xs" 
                  value={reqs} 
                  onChange={e => setReqs(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Job Description</label>
                <textarea 
                  rows={4}
                  placeholder="Describe roles, duties, and technology stack..." 
                  className="glass-input text-xs" 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)}
                  required
                />
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-2 text-xs"
                >
                  Publish Posting
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {schedulingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm glass-card p-6 flex flex-col gap-5 animate-scale-up">
            <h3 className="text-lg font-black">Schedule Interview</h3>
            <form onSubmit={handleScheduleInterview} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Date & Time</label>
                <input 
                  type="datetime-local" 
                  className="glass-input text-xs" 
                  value={interviewDate}
                  onChange={e => setInterviewDate(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interview Type</label>
                <select 
                  className="glass-input text-xs bg-white dark:bg-dark-900"
                  value={interviewType}
                  onChange={e => setInterviewType(e.target.value)}
                >
                  <option value="Technical">Technical (Coding & Architecture)</option>
                  <option value="HR">HR & Cultural Alignment</option>
                  <option value="Managerial">Managerial Round</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                <button 
                  type="button" 
                  onClick={() => setSchedulingAppId(null)}
                  className="btn-secondary py-2 text-xs"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary py-2 text-xs"
                >
                  Confirm Interview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
