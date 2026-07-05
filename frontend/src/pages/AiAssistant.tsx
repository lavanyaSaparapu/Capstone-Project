import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  Sparkles, 
  FileText, 
  Briefcase, 
  ChevronRight, 
  HelpCircle, 
  ListTodo,
  FileCheck,
  CheckCircle,
  TrendingUp,
  Loader
} from 'lucide-react';

export const AiAssistant: React.FC = () => {
  const { mockMode, addNotification } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'cover_letter' | 'interview_prep' | 'optimization'>('cover_letter');

  // Outputs
  const [coverLetter, setCoverLetter] = useState("");
  const [questions, setQuestions] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<any>(null);

  const mockCoverLetter = `Dear Hiring Manager,

I am writing to express my enthusiastic interest in the backend position. With a strong background in software engineering and practical skills in Python, FastAPI, Docker, and PostgreSQL, I am confident in my ability to make an immediate impact on your engineering department.

Throughout my career, I have consistently focused on building scalable, clean, and highly maintainable software applications. I take pride in understanding system architecture, refining user experiences, and collaborating in team environments to ship features rapidly.

Thank you for your time.

Sincerely,
Alexander Reed`;

  const mockQuestions = [
    "Technical: Can you walk us through how you would apply FastAPI to architect a high-scale service?",
    "Scenario-Based: In your previous work, how did you handle integration hurdles?",
    "Deep-dive: Explain a complex project where you leveraged Docker.",
    "Culture: Why are you interested in joining our team?",
    "Behavioral: Tell me about a time you had a technical disagreement with a team member."
  ];

  const mockSuggestions = {
    grammar_score: 95,
    missing_skills: ["AWS", "Redis", "Kubernetes"],
    suggestions: [
      "Increase keyword prominence for missing core competencies: AWS, Redis.",
      "Quantify project achievements to demonstrate engineering impact.",
      "Refine the profile summary to emphasize system architecture experience."
    ]
  };

  const fetchData = async () => {
    if (mockMode) {
      setResumes([{ id: 10, filename: "Alexander_CV.pdf" }]);
      setJobs([{ id: 1, title: "Backend Python Engineer" }]);
      setSelectedResumeId("10");
      setSelectedJobId("1");
      return;
    }

    try {
      const [resRes, jobRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/resumes'),
        axios.get('http://127.0.0.1:8000/api/v1/jobs')
      ]);
      setResumes(resRes.data);
      setJobs(jobRes.data);
      if (resRes.data.length > 0) setSelectedResumeId(resRes.data[0].id.toString());
      if (jobRes.data.length > 0) setSelectedJobId(jobRes.data[0].id.toString());
    } catch {
      setResumes([{ id: 10, filename: "Alexander_CV.pdf" }]);
      setJobs([{ id: 1, title: "Backend Python Engineer" }]);
      setSelectedResumeId("10");
      setSelectedJobId("1");
    }
  };

  useEffect(() => {
    fetchData();
  }, [mockMode]);

  const handleGenerate = async () => {
    if (!selectedResumeId || !selectedJobId) {
      alert("Please select both a resume and a job listing.");
      return;
    }
    
    setLoading(true);
    setCoverLetter("");
    setQuestions([]);
    setSuggestions(null);

    if (mockMode) {
      setTimeout(() => {
        setLoading(false);
        if (activeTab === 'cover_letter') setCoverLetter(mockCoverLetter);
        else if (activeTab === 'interview_prep') setQuestions(mockQuestions);
        else setSuggestions(mockSuggestions);
        addNotification("SYSTEM", `AI successfully compiled resources.`);
      }, 1200);
      return;
    }

    try {
      if (activeTab === 'cover_letter') {
        const res = await axios.post('http://127.0.0.1:8000/api/v1/resumes/generate-cover-letter', {
          resume_id: parseInt(selectedResumeId),
          job_id: parseInt(selectedJobId)
        });
        setCoverLetter(res.data.cover_letter);
      } else if (activeTab === 'interview_prep') {
        const res = await axios.post('http://127.0.0.1:8000/api/v1/resumes/generate-interview-prep', {
          resume_id: parseInt(selectedResumeId),
          job_id: parseInt(selectedJobId)
        });
        setQuestions(res.data.questions);
      } else {
        const res = await axios.post(`http://127.0.0.1:8000/api/v1/resumes/optimize-suggestions?resume_id=${selectedResumeId}&job_id=${selectedJobId}`);
        setSuggestions(res.data);
      }
    } catch (err) {
      console.error(err);
      alert("API request failed. Falling back to local model suggestions.");
      // Fallback
      if (activeTab === 'cover_letter') setCoverLetter(mockCoverLetter);
      else if (activeTab === 'interview_prep') setQuestions(mockQuestions);
      else setSuggestions(mockSuggestions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-black">NextGen AI Assistant Suite</h1>
        <p className="text-slate-400 text-xs mt-1">Leverage LLM and NLP parsing models to draft custom materials or audit resume keywords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form Configurations */}
        <div className="glass-card p-5 flex flex-col gap-5 h-fit">
          <span className="font-bold text-sm block border-b border-slate-200/50 dark:border-slate-800/40 pb-2">Configuration</span>
          
          <div className="flex flex-col gap-4">
            {/* Resume Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Select Resume Profile</label>
              <select
                className="glass-input text-xs bg-white dark:bg-dark-900 cursor-pointer"
                value={selectedResumeId}
                onChange={e => setSelectedResumeId(e.target.value)}
              >
                <option value="">-- Choose Resume --</option>
                {resumes.map(r => (
                  <option key={r.id} value={r.id}>{r.filename}</option>
                ))}
              </select>
            </div>

            {/* Job Selection */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Target Job Listing</label>
              <select
                className="glass-input text-xs bg-white dark:bg-dark-900 cursor-pointer"
                value={selectedJobId}
                onChange={e => setSelectedJobId(e.target.value)}
              >
                <option value="">-- Choose Job --</option>
                {jobs.map(j => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>

            {/* Run Button */}
            <button
              onClick={handleGenerate}
              disabled={loading || !selectedResumeId || !selectedJobId}
              className="btn-primary py-3 font-semibold text-xs flex items-center justify-center gap-1.5 mt-2"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute AI Task</span>
                </>
              )}
            </button>

          </div>
        </div>

        {/* Right Column: Dynamic Outputs tabs */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Tabs header */}
          <div className="flex bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-slate-800 p-1 rounded-full select-none w-fit">
            <button 
              onClick={() => { setActiveTab('cover_letter'); setCoverLetter(""); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'cover_letter' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400'}`}
            >
              Cover Letter
            </button>
            <button 
              onClick={() => { setActiveTab('interview_prep'); setQuestions([]); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'interview_prep' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400'}`}
            >
              Interview Prep
            </button>
            <button 
              onClick={() => { setActiveTab('optimization'); setSuggestions(null); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeTab === 'optimization' ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-400'}`}
            >
              Resume suggestions
            </button>
          </div>

          {/* Tab Outputs Content */}
          <div className="glass-card p-6 flex-1 min-h-[300px] flex flex-col">
            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center gap-3">
                <Loader className="w-7 h-7 text-brand-500 animate-spin" />
                <span className="text-xs text-slate-400">Consulting AI NLP engines...</span>
              </div>
            ) : (
              <>
                {/* 1. Cover Letter Output */}
                {activeTab === 'cover_letter' && (
                  coverLetter ? (
                    <div className="flex flex-col gap-4">
                      <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/40 pb-3">
                        <span className="font-bold text-sm text-slate-700 dark:text-slate-300">Generated Cover Letter</span>
                        <button 
                          onClick={() => { navigator.clipboard.writeText(coverLetter); alert("Copied!"); }}
                          className="text-[10px] bg-slate-100 dark:bg-dark-800 px-2 py-1 rounded text-slate-400 hover:text-white"
                        >
                          Copy Letter
                        </button>
                      </div>
                      <pre className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans whitespace-pre-line p-4 rounded-xl bg-slate-50 dark:bg-dark-900/30 border border-slate-200/30 dark:border-slate-800/30">
                        {coverLetter}
                      </pre>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 py-12">
                      <FileText className="w-10 h-10 text-slate-350 dark:text-slate-750" />
                      <span className="text-xs">Select options and run 'Execute AI Task' to generate a cover letter.</span>
                    </div>
                  )
                )}

                {/* 2. Interview Prep Questions */}
                {activeTab === 'interview_prep' && (
                  questions.length > 0 ? (
                    <div className="flex flex-col gap-4">
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">Tailored Interview Questions</span>
                      <div className="flex flex-col gap-3">
                        {questions.map((q, idx) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-dark-900/30 border border-slate-200/30 dark:border-slate-800/30 flex gap-3 text-xs">
                            <HelpCircle className="w-5 h-5 text-brand-500 shrink-0" />
                            <p className="leading-relaxed text-slate-600 dark:text-slate-300">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 py-12">
                      <ListTodo className="w-10 h-10 text-slate-350 dark:text-slate-750" />
                      <span className="text-xs">Select parameters to compile prep questions.</span>
                    </div>
                  )
                )}

                {/* 3. Resume Optimization Suggestions */}
                {activeTab === 'optimization' && (
                  suggestions ? (
                    <div className="flex flex-col gap-5">
                      <span className="font-bold text-sm text-slate-700 dark:text-slate-300 border-b border-slate-200/50 dark:border-slate-800/40 pb-3">ATS Audit & Suggestions</span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Grammar Rating</span>
                          <span className="text-xl font-black text-emerald-500">{suggestions.grammar_score}%</span>
                        </div>
                        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center flex flex-col gap-1">
                          <span className="text-[10px] uppercase font-bold text-slate-400">Missing Key Competencies</span>
                          <span className="text-sm font-bold text-rose-500 truncate max-w-full">
                            {suggestions.missing_skills?.length > 0 ? suggestions.missing_skills.slice(0, 3).join(', ') : "None"}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2.5 mt-2">
                        <span className="font-semibold text-xs">Recommended Fixes:</span>
                        {suggestions.suggestions?.map((sug: string, i: number) => (
                          <div key={i} className="p-3 bg-slate-50 dark:bg-dark-900/30 border border-slate-200/30 dark:border-slate-800/30 rounded-xl text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {sug}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 py-12">
                      <TrendingUp className="w-10 h-10 text-slate-350 dark:text-slate-750" />
                      <span className="text-xs">Compile keyword density and audit recommendations.</span>
                    </div>
                  )
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
