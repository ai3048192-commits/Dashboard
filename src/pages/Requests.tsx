import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  Building2,
  Phone,
  Palette,
  Target,
  Calendar,
  Link,
  Loader2,
  FileText,
  Users,
  Type,
  Hexagon,
  MessageCircle,
  CheckCircle,
  Archive,
} from "lucide-react";

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [archive, setArchive] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("خطأ في جلب البيانات:", error);
    }
    if (data) {
      const activeRequests = data.filter((item) => item.status !== "completed");
      const archivedRequests = data.filter((item) => item.status === "completed");
      
      setRequests(activeRequests);
      setArchive(archivedRequests);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();

    const channel = supabase
      .channel("realtime-projects")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "projects" },
        () => {
          fetchRequests();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleConfirmAndArchive = async (id) => {
    const { error } = await supabase
      .from("projects")
      .update({ status: "completed" })
      .eq("id", id);

    if (error) {
      alert("حدث خطأ أثناء تحديث حالة الطلب");
      console.error(error);
    } else {
      fetchRequests();
    }
  };

  if (loading)
    return (
      <div className="text-white p-10 text-center">
        <Loader2 className="animate-spin inline" /> جاري التحميل...
      </div>
    );

  return (
    <div className="min-h-screen text-white p-6 max-w-7xl mx-auto">
      <div className="relative flex flex-col items-center py-12 mb-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[80px]" />
        <h1 className="text-4xl font-black text-white mb-4 relative z-10">
          الطلبات الواردة
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">
          إدارة المشاريع
        </p>
      </div>

      {/* قسم الطلبات الحالية (الواردة) */}
      <h2 className="text-2xl font-bold mb-6 text-orange-500">الطلبات الجديدة</h2>
      {requests.length === 0 ? (
        <p className="text-stone-500 text-sm mb-12 bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 text-center">لا توجد طلبات جديدة حالياً.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">
          {requests.map((req) => (
            <RequestCard 
              key={req.id} 
              req={req} 
              onConfirm={handleConfirmAndArchive} 
              isArchived={false} 
            />
          ))}
        </div>
      )}

      {/* قسم الأرشيف (بنفس الحجم والتفاصيل والديزاين) */}
      <div className="mt-20 border-t border-white/10 pt-12">
        <h2 className="text-2xl font-bold mb-6 text-stone-400 flex items-center gap-2">
          <Archive size={22} /> الأرشيف (الطلبات المؤكدة)
        </h2>
        {archive.length === 0 ? (
          <p className="text-stone-600 text-sm bg-[#0a0a0a] p-6 rounded-2xl border border-white/5 text-center">لا توجد طلبات مؤكدة في الأرشيف حالياً.</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {archive.map((req) => (
              <RequestCard 
                key={req.id} 
                req={req} 
                isArchived={true} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// مكون موحد لكارد الطلب لضمان تطابق الديزاين والحجم تماماً بين الجديد والأرشيف
function RequestCard({ req, onConfirm, isArchived }) {
  return (
    <div
      className={`bg-[#0a0a0a] p-8 rounded-[2rem] border transition-all shadow-2xl flex flex-col justify-between ${
        isArchived 
          ? "border-emerald-500/20 opacity-85 hover:opacity-100" 
          : "border-white/5 hover:border-orange-500/30"
      }`}
    >
      <div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="font-black text-xl">{req.client_name}</h3>
            <p className="text-orange-500 text-xs font-bold uppercase">
              {req.activity || "مشروع جديد"}
            </p>
          </div>
          <span className={`px-4 py-1.5 bg-black border rounded-full text-[10px] font-black uppercase ${
            isArchived 
              ? "border-emerald-500/30 text-emerald-400" 
              : "border-white/10 text-amber-500"
          }`}>
            {isArchived ? "completed" : (req.status || "pending")}
          </span>
        </div>

        {/* عرض جميع الحقول الـ 13 */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <InfoItem icon={<Link size={14} />} label="الموقع" value={req.website} />
          <InfoItem icon={<Phone size={14} />} label="الهاتف" value={req.phone} />
          <InfoItem icon={<Palette size={14} />} label="الألوان" value={req.colors} />
          <InfoItem icon={<Hexagon size={14} />} label="الشعار" value={req.has_logo} />
          <InfoItem icon={<Type size={14} />} label="الخطوط" value={req.fonts} />
          <InfoItem icon={<Target size={14} />} label="الشعور" value={req.feeling} />
          <InfoItem icon={<Users size={14} />} label="الجمهور" value={req.audience} />
          <InfoItem icon={<Building2 size={14} />} label="المنافسون" value={req.competitors} />
          <InfoItem icon={<Target size={14} />} label="الميزانية" value={req.budget} />
          <InfoItem icon={<Calendar size={14} />} label="التسليم" value={req.deadline} />
        </div>

        {/* الملاحظات الإضافية */}
        <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/5">
          <p className="text-[10px] text-stone-500 uppercase font-bold mb-1">
            ملاحظات إضافية
          </p>
          <p className="text-xs text-stone-300">
            {req.additional_notes || "لا توجد ملاحظات."}
          </p>
        </div>

        {req.file_url && (
          <a
            href={req.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all"
          >
            <FileText size={16} /> عرض الملف المرفق
          </a>
        )}
      </div>

      {/* أزرار الإجراءات */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-white/5">
        {req.phone && (
          <a
            href={`https://wa.me/${req.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`مرحباً ${req.client_name}، بخصوص طلبك لتصميم "${req.activity || 'المشروع'}"...`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all"
          >
            <MessageCircle size={16} /> تواصل واتساب
          </a>
        )}
        
        {!isArchived && (
          <button
            onClick={() => onConfirm(req.id)}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-600 text-white rounded-xl text-xs font-bold hover:bg-orange-700 transition-all cursor-pointer"
          >
            <CheckCircle size={16} /> تأكيد ونقل للأرشيف
          </button>
        )}
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }) {
  return (
    <div className="flex items-center gap-2 text-stone-400">
      <span className="text-orange-500">{icon}</span>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[9px] uppercase text-stone-600 font-bold">
          {label}
        </span>
        <span className="text-white text-xs truncate">{value || "---"}</span>
      </div>
    </div>
  );
}

export default Requests;