import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { 
  FileText, 
  Trash2, 
  Sparkles, 
  Mail, 
  Phone, 
  Link as LinkIcon, 
  Briefcase,
  AlertCircle,
  FileCheck,
  CheckCircle,
  TrendingUp,
  Cpu,
  Loader
} from 'lucide-react';
import { Dropzone } from '../components/Dropzone';
import { ScoreMeter } from '../components/ScoreMeter';

export const ResumeScanner: React.FC = () => {
  const { mockMode, addNotification } = useAuth();
  const [resumes, setResumes] = useState<any[]>([]);
  const [selectedResume, setSelectedResume] = useState<any | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Job apply mock trigger
  const [jobs, setJobs] = useState<any[]>([]);
  const [applyingJobId, setApplyingJobId] = useState<string>("");
  const [applySuccess, setApplySuccess] = useState(false);

  // Fallback Mock Resumes
  const mockResumes = [
    {
      id: 10,
      filename: "John_Doe_Developer_CV.pdf",
      score: 85.0,
      created_at: "2026-06-28T14:22:00Z",
      parsed_data: {
        name: "John Doe",
        email: "john.doe@gmail.com",
        phone: "+1-555-0199",
        links: { github: "https://github.com/johndoe", linkedin: "https://linkedin.com/in/johndoe" },
        skills: ["React", "TypeScript", "FastAPI", "Python", "Docker", "PostgreSQL", "Tailwind CSS", "Git"],
        experience_years: 4.5,
        resume_quality_score: 85.0,
        grammar_score: 95.0,
        keyword_density: { React: 2.5, Python: 1.8, Docker: 1.2 },
        sections: { experience: "Built high scale dashboards...", education: "B.S. in Computer Science", projects: "NextGen ATS..." }
      }
    }
  ];

  const fetchResumes = async () => {
    if (mockMode) {
      setResumes(mockResumes);
      return;
    }
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/resumes');
      setResumes(res.data);
    } catch {
      setResumes(mockResumes);
    }
  };

  const fetchJobs = async () => {
    if (mockMode) {
      setJobs([
        { id: 1, title: "Senior React Developer" },
        { id: 2, title: "Backend Python Engineer" }
      ]);
      return;
    }
    try {
      const res = await axios.get('http://127.0.0.1:8000/api/v1/jobs');
      setJobs(res.data);
    } catch {
      setJobs([
        { id: 1, title: "Senior React Developer" },
        { id: 2, title: "Backend Python Engineer" }
      ]);
    }
  };

  useEffect(() => {
    fetchResumes();
    fetchJobs();
  }, [mockMode]);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadError(null);

    // Simulated progress tracking
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    if (mockMode) {
      setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);
        setUploadSuccess(true);
        setIsUploading(false);
        
        // Add mock resume
        const newR = {
          id: Math.floor(Math.random() * 1000) + 20,
          filename: file.name,
          score: 78.0,
          created_at: new Date().toISOString(),
          parsed_data: {
            name: "Alexander Reed",
            email: "alexander@reed.co",
            phone: "+1-415-555-2345",
            links: { github: "https://github.com/alexreed", linkedin: "https://linkedin.com/in/alexreed" },
            skills: ["React", "JavaScript", "HTML", "CSS", "Git", "Redux"],
            experience_years: 2.0,
            resume_quality_score: 78.0,
            grammar_score: 88.0,
            keyword_density: { React: 1.5, JavaScript: 2.0 },
            sections: { experience: "Frontend engineer at local agency...", education: "Self taught developer", projects: "Portfolio webpage..." }
          }
        };
        setResumes([newR, ...resumes]);
        setSelectedResume(newR);
        addNotification("SYSTEM", `Resume '${file.name}' parsed successfully (Mock).`);
      }, 1500);
      return;
    }

    // Live backend upload
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post('http://127.0.0.1:8000/api/v1/resumes/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      clearInterval(interval);
      setUploadProgress(100);
      setUploadSuccess(true);
      
      const newResume = res.data;
      setResumes([newResume, ...resumes]);
      setSelectedResume(newResume);
      addNotification("SYSTEM", `Resume '${file.name}' uploaded successfully. Analyzing embedding...`);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.response?.data?.detail || "Parsing failed. Make sure it is a valid PDF or DOCX file containing text.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (mockMode) {
      setResumes(prev => prev.filter(r => r.id !== id));
      if (selectedResume?.id === id) setSelectedResume(null);
      addNotification("SYSTEM", "Resume deleted.");
      return;
    }
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/resumes/${id}`);
      setResumes(prev => prev.filter(r => r.id !== id));
      if (selectedResume?.id === id) setSelectedResume(null);
      addNotification("SYSTEM", "Resume deleted successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to delete resume on live backend.");
    }
  };

  const handleApplyToJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJobId || !selectedResume) return;

    if (mockMode) {
      setApplySuccess(true);
      addNotification("SYSTEM", "Application submitted successfully (Mock).");
      setTimeout(() => setApplySuccess(false), 3000);
      return;
    }

    try {
      await axios.post(`http://127.0.0.1:8000/api/v1/jobs/${applyingJobId}/apply?resume_id=${selectedResume.id}`);
      setApplySuccess(true);
      addNotification("SYSTEM", "Application submitted successfully.");
      setTimeout(() => setApplySuccess(false), 3000);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Application failed. You might have already applied for this job.");
    }
  };

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-black">AI Resume Parsing & Scoring</h1>
        <p className="text-slate-400 text-xs mt-1">Upload PDF or DOCX resumes to extract skills, contact details, and evaluate overall ATS scores.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Dropzone & Uploaded List */}
        <div className="flex flex-col gap-4">
          <span className="font-bold text-sm">Upload Resume</span>
          <Dropzone 
            onFileSelect={handleFileSelect} 
            isUploading={isUploading} 
            uploadProgress={uploadProgress}
            error={uploadError}
            success={uploadSuccess}
          />

          <span className="font-bold text-sm mt-4">Scored Resumes Pool ({resumes.length})</span>
          <div className="flex flex-col gap-2.5 max-h-96 overflow-y-auto">
            {resumes.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No resumes processed.</div>
            ) : (
              resumes.map((res) => (
                <div
                  key={res.id}
                  onClick={() => setSelectedResume(res)}
                  className={`glass-card p-3.5 flex items-center justify-between cursor-pointer border ${
                    selectedResume?.id === res.id 
                      ? 'border-brand-500 ring-1 ring-brand-500/10' 
                      : 'border-slate-200/50 dark:border-slate-800/40 hover:border-slate-350 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <FileText className="w-5 h-5 text-slate-400 shrink-0" />
                    <div className="truncate flex flex-col gap-0.5">
                      <span className="font-bold text-xs truncate">{res.filename}</span>
                      <span className="text-[10px] text-slate-400">
                        {res.parsed_data?.name || "Processing..."}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-brand-500">{res.score}%</span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteResume(res.id);
                      }}
                      className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-dark-800"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Parsed details & AI Scoring */}
        <div className="lg:col-span-2">
          {selectedResume ? (
            <div className="glass-card p-6 flex flex-col gap-6">
              
              {/* Header: Name and Quality scores */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/50 dark:border-slate-800/40 pb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedResume.parsed_data?.name || "Parsing Profile Name..."}</h2>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mt-1.5 flex-wrap">
                    {selectedResume.parsed_data?.email && (
                      <span className="flex items-center gap-1 font-mono">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{selectedResume.parsed_data.email}</span>
                      </span>
                    )}
                    {selectedResume.parsed_data?.phone && (
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{selectedResume.parsed_data.phone}</span>
                      </span>
                    )}
                    {selectedResume.parsed_data?.links?.github && (
                      <a href={selectedResume.parsed_data.links.github} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-brand-500">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span>GitHub</span>
                      </a>
                    )}
                  </div>
                </div>
                
                {/* Score meters */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">ATS Quality</span>
                    <span className="text-xl font-black text-brand-500">{selectedResume.score}%</span>
                  </div>
                  <ScoreMeter score={selectedResume.score} size={64} strokeWidth={6} />
                </div>
              </div>

              {/* Skills Index */}
              <div>
                <span className="font-bold text-sm block mb-3">Extracted Competencies</span>
                <div className="flex flex-wrap gap-2">
                  {selectedResume.parsed_data?.skills?.map((skill: string) => (
                    <span key={skill} className="px-3 py-1 bg-brand-500/10 border border-brand-500/25 text-brand-500 dark:text-brand-400 rounded-full text-xs font-semibold">
                      {skill}
                    </span>
                  ))}
                  {(!selectedResume.parsed_data?.skills || selectedResume.parsed_data.skills.length === 0) && (
                    <span className="text-xs text-slate-400">No skills identified. Update file or format details.</span>
                  )}
                </div>
              </div>

              {/* Apply to Job Widget */}
              <div className="p-4 bg-slate-50 dark:bg-dark-900/30 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl">
                <span className="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-3">Apply to Job Listing (Vector Match Scoring)</span>
                <form onSubmit={handleApplyToJob} className="flex gap-2 flex-col sm:flex-row">
                  <select
                    className="flex-1 glass-input text-xs bg-white dark:bg-dark-900"
                    value={applyingJobId}
                    onChange={e => setApplyingJobId(e.target.value)}
                    required
                  >
                    <option value="">-- Choose active job posting --</option>
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title}</option>
                    ))}
                  </select>
                  <button 
                    type="submit" 
                    className="btn-primary py-2 text-xs font-bold shrink-0"
                  >
                    Apply Now
                  </button>
                </form>
                {applySuccess && (
                  <div className="text-emerald-500 text-xs font-bold mt-2 flex items-center gap-1 animate-fade-in">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Application submitted successfully! Recruiter notified via WebSockets.</span>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="glass-card p-12 text-center flex flex-col items-center gap-4 justify-center h-full min-h-[400px]">
              <FileText className="w-12 h-12 text-slate-350 dark:text-slate-700" />
              <div>
                <span className="font-bold text-sm block">No Resume Inspected</span>
                <span className="text-xs text-slate-400 mt-1 block font-medium">Select a cv from the left list, or drop a new PDF/DOCX to kick off parsing.</span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
