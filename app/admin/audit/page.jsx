"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../hooks/useRequireAuth";
import { apiFetch } from "../../../lib/api";
import Link from "next/link";

export default function AuditLogsPage() {
  const router = useRouter();
  const { loading: authLoading } = useRequireAuth(["admin", "super"]);
  const [logs, setLogs] = useState([]);
  const [adminMap, setAdminMap] = useState({}); // { id or email: fullName }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    
    setLoading(true);
    
    Promise.allSettled([
      apiFetch("/v1/admin/audit"),
      apiFetch("/v1/admin/users?role=admin"),
      apiFetch("/v1/admin/users?role=super_admin"),
      apiFetch("/v1/admin/users?role=staff"),
      apiFetch("/v1/admin/users") // Fallback for all users
    ]).then(([auditRes, adminRes, superRes, staffRes, allRes]) => {
      // 1. Process Audit Logs
      if (auditRes.status === "fulfilled") {
        const body = auditRes.value;
        setLogs(body?.data?.items ?? body?.items ?? body ?? []);
      }

      // 2. Build Admin Name Map
      const map = {};
      const allStaff = [
        ...(adminRes.status === "fulfilled" ? (adminRes.value?.data?.items ?? adminRes.value?.items ?? adminRes.value ?? []) : []),
        ...(superRes.status === "fulfilled" ? (superRes.value?.data?.items ?? superRes.value?.items ?? superRes.value ?? []) : []),
        ...(staffRes.status === "fulfilled" ? (staffRes.value?.data?.items ?? staffRes.value?.items ?? staffRes.value ?? []) : []),
        ...(allRes.status === "fulfilled" ? (allRes.value?.data?.items ?? allRes.value?.items ?? allRes.value ?? []) : [])
      ];

      allStaff.forEach(s => {
        const id = s._id || s.id;
        const name = s.fullName || s.name;
        if (id && name) map[id] = name;
        if (s.email && name) map[s.email] = name;
      });
      setAdminMap(map);
      
      setLoading(false);
    }).catch(err => {
      setError(err.message);
      setLoading(false);
    });
  }, [authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 pb-24">
      <header className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined">arrow_back</span>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
             <span className="text-primary italic">SYSTEM AUDIT</span> LOGS
          </h1>
          <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-1">Chronological history of admin actions</p>
        </div>
      </header>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-6 flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="space-y-4 max-w-5xl">
        {logs.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-white/10 rounded-3xl">
             <span className="material-symbols-outlined text-5xl text-white/10 mb-4">visibility_off</span>
             <p className="text-white/30 font-medium">No audit logs found yet.</p>
          </div>
        ) : (
          logs.map((log, i) => (
            <div key={log._id || i} className="group relative bg-[#141414] border border-white/5 p-6 rounded-[2rem] hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl flex items-center justify-center ${
                    log.action === 'CREATE' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.action === 'DELETE' ? 'bg-rose-500/10 text-rose-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    <span className="material-symbols-outlined">
                      {log.action === 'CREATE' ? 'add_circle' : log.action === 'DELETE' ? 'delete_forever' : 'edit_square'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-black text-sm uppercase tracking-widest text-white/80">{log.action}</span>
                      <span className="text-xs font-bold px-2 py-0.5 bg-white/5 rounded border border-white/10 text-white/40">{log.entity}</span>
                    </div>
                    <p className="text-sm font-medium text-white/60 mt-1">
                      Action on <span className="text-white font-bold">{log.entityId}</span>
                    </p>
                  </div>
                </div>

                <div className="text-left md:text-right border-l md:border-l-0 md:border-r border-white/5 pl-4 md:pl-0 md:pr-4">
                  <p className="text-[10px] font-black uppercase text-white/20 tracking-widest mb-1">Performed By</p>
                  <p className="text-sm font-bold text-white group-hover:text-primary transition-colors">
                    {adminMap[log.adminId] || 
                     adminMap[log.admin_id] || 
                     adminMap[log.userId] || 
                     adminMap[log.user_id] || 
                     adminMap[log.adminEmail] || 
                     adminMap[log.admin_email] || 
                     log.adminEmail || 
                     log.admin_email || 
                     log.adminId || 
                     log.admin_id || 
                     'System Auto'}
                  </p>
                  <p className="text-[10px] text-white/40 mt-1 font-mono">{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>

              {log.payload && (
                <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                   <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-black uppercase text-white/20 tracking-widest">Payload Data</span>
                      <span className="material-symbols-outlined text-white/10 text-sm">terminal</span>
                   </div>
                   <pre className="text-[11px] text-white/40 font-mono overflow-x-auto">
                     {JSON.stringify(log.payload, null, 2)}
                   </pre>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        body { font-family: var(--font-plus-jakarta-sans), sans-serif; }
      `}</style>
    </div>
  );
}
