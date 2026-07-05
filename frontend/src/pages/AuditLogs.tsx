import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { ShieldCheck, Search, RefreshCw, Calendar, Globe, User, Clock, HardDrive, Loader } from 'lucide-react';

export const AuditLogs: React.FC = () => {
  const { mockMode } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");

  const mockLogs = [
    { id: 1, user_id: 2, email: "recruiter@nextgenats.com", action: "UPLOAD_RESUME", resource_type: "resume", resource_id: 10, metadata: { filename: "John_Doe_CV.pdf" }, ip_address: "192.168.1.45", created_at: "2026-07-01T14:22:00Z" },
    { id: 2, user_id: null, email: "system-ai", action: "CALCULATE_ATS_MATCH", resource_type: "application", resource_id: 5, metadata: { score: 94.2 }, ip_address: "127.0.0.1", created_at: "2026-07-01T14:22:05Z" },
    { id: 3, user_id: 2, email: "recruiter@nextgenats.com", action: "CHANGE_APPLICATION_STAGE", resource_type: "application", resource_id: 5, metadata: { new_status: "Interview" }, ip_address: "192.168.1.45", created_at: "2026-07-01T14:25:12Z" },
    { id: 4, user_id: 1, email: "admin@nextgenats.com", action: "CREATE_JOB", resource_type: "job", resource_id: 4, metadata: { title: "Lead Software Architect" }, ip_address: "192.168.1.10", created_at: "2026-07-01T12:05:00Z" },
    { id: 5, user_id: 3, email: "candidate@nextgenats.com", action: "LOGIN_USER", resource_type: "user", resource_id: 3, metadata: {}, ip_address: "172.56.21.99", created_at: "2026-07-01T11:45:00Z" }
  ];

  const fetchLogs = async () => {
    setLoading(true);
    if (mockMode) {
      setLogs(mockLogs);
      setLoading(false);
      return;
    }

    try {
      let url = 'http://127.0.0.1:8000/api/v1/audit?limit=50';
      if (filterAction) url += `&action=${filterAction}`;
      if (filterResource) url += `&resource_type=${filterResource}`;
      
      const res = await axios.get(url);
      setLogs(res.data);
    } catch {
      setLogs(mockLogs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [mockMode, filterAction, filterResource]);

  return (
    <div className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto max-w-7xl mx-auto w-full">
      <div>
        <h1 className="text-2xl font-black flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-brand-500" />
          <span>System Security Audit Logs</span>
        </h1>
        <p className="text-slate-400 text-xs mt-1">Real-time trails tracking system mutations, scoring modifications, applications uploads, and auth gates.</p>
      </div>

      {/* Filters Strip */}
      <div className="glass-card p-4 flex gap-4 flex-col sm:flex-row items-center justify-between">
        <div className="flex gap-2 flex-wrap items-center w-full sm:w-auto">
          <select
            className="glass-input text-xs bg-white dark:bg-dark-900 cursor-pointer"
            value={filterAction}
            onChange={e => setFilterAction(e.target.value)}
          >
            <option value="">-- All Actions --</option>
            <option value="UPLOAD_RESUME">UPLOAD_RESUME</option>
            <option value="PROCESS_RESUME">PROCESS_RESUME</option>
            <option value="CALCULATE_ATS_MATCH">CALCULATE_ATS_MATCH</option>
            <option value="CREATE_JOB">CREATE_JOB</option>
            <option value="CHANGE_APPLICATION_STAGE">CHANGE_APPLICATION_STAGE</option>
            <option value="LOGIN_USER">LOGIN_USER</option>
          </select>

          <select
            className="glass-input text-xs bg-white dark:bg-dark-900 cursor-pointer"
            value={filterResource}
            onChange={e => setFilterResource(e.target.value)}
          >
            <option value="">-- All Resources --</option>
            <option value="resume">Resume</option>
            <option value="job">Job</option>
            <option value="application">Application</option>
            <option value="user">User</option>
            <option value="interview">Interview</option>
          </select>
        </div>

        <button 
          onClick={fetchLogs} 
          className="btn-secondary text-xs flex items-center gap-1.5 shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-2 text-slate-400 text-xs">
            <Loader className="w-6 h-6 text-brand-500 animate-spin" />
            <span>Scanning transaction tables...</span>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-xs">No matching transaction logs found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-dark-900/30 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-400 select-none">
                  <th className="p-4 font-bold uppercase tracking-wider">Timestamp</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Actor</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Action</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Resource</th>
                  <th className="p-4 font-bold uppercase tracking-wider">IP Address</th>
                  <th className="p-4 font-bold uppercase tracking-wider">Metadata</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr 
                    key={log.id}
                    className="border-b border-slate-200/30 dark:border-slate-850/20 hover:bg-slate-50/50 dark:hover:bg-dark-900/10 transition-colors"
                  >
                    {/* Timestamp */}
                    <td className="p-4 text-slate-400 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                    </td>
                    
                    {/* Actor */}
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>{log.email}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="p-4">
                      <code className="text-[10px] font-bold bg-brand-500/10 border border-brand-500/20 text-brand-500 px-2 py-0.5 rounded-full select-none">
                        {log.action}
                      </code>
                    </td>

                    {/* Resource */}
                    <td className="p-4 text-slate-400 font-mono">
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>{log.resource_type} ({log.resource_id})</span>
                      </div>
                    </td>

                    {/* IP */}
                    <td className="p-4 font-medium text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5" />
                        <span>{log.ip_address}</span>
                      </div>
                    </td>

                    {/* Metadata JSON */}
                    <td className="p-4 font-mono text-[10px] text-slate-400 max-w-[200px] truncate" title={JSON.stringify(log.metadata)}>
                      {JSON.stringify(log.metadata)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
