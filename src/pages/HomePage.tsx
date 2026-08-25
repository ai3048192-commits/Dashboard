import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Mail,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Loader2,
  Inbox,
  Clock
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const AdminDashboard = () => {
  const [data, setData] = useState({ comments: [], contacts: [] });
  const [stats, setStats] = useState({ totalComments: 0, pendingComments: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [{ data: comments, error: cErr }, { data: contacts, error: mErr }] = await Promise.all([
        supabase.from("comments").select("*").order("created_at", { ascending: false }),
        supabase.from("contacts").select("*").order("created_at", { ascending: false }),
      ]);

      if (cErr || mErr) console.error("Error fetching data:", cErr || mErr);

      const safeComments = comments || [];
      const safeContacts = contacts || [];

      setData({
        comments: safeComments,
        contacts: safeContacts,
      });

      setStats({
        totalComments: safeComments.length,
        pendingComments: safeComments.filter((c) => !c.approved).length,
        messages: safeContacts.length,
      });
    } catch (error) {
      console.error("Unexpected error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("schema-db-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "contacts" }, () => {
        fetchData();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "comments" }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleAction = async (id, table, action) => {
    if (action === "delete") {
      if (!window.confirm("هل أنت متأكد من الحذف النهائي؟")) return;
      await supabase.from(table).delete().eq("id", id);
    } else if (action === "approve") {
      await supabase.from(table).update({ approved: true }).eq("id", id);
    }
    fetchData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center gap-4" dir="rtl">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-slate-400 text-sm">جاري تحميل لوحة التحكم...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen  text-slate-100 " dir="rtl">
      
      {/* رأس الصفحة */}
      <div className="relative flex flex-col items-center justify-center py-10 px-6 mb-10 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-28 bg-indigo-500/10 blur-3xl pointer-events-none" />
        <h1 className="text-3xl md:text-4xl font-bold text-slate-100 mb-3 relative z-10 text-center">
          لوحة الإدارة المركزية
        </h1>
        <div className="text-slate-400 text-xs bg-slate-800/80 px-4 py-2 rounded-full border border-slate-700/60 flex items-center gap-2 relative z-10">
          <BarChart3 size={16} className="text-indigo-400" /> إدارة المحتوى وتواصل العملاء
        </div>
      </div>

      {/* بطاقات الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {[
          { title: "إجمالي التعليقات", val: stats.totalComments, icon: MessageSquare, color: "text-indigo-400", bg: "bg-indigo-500/10" },
          { title: "تعليقات قيد المراجعة", val: stats.pendingComments, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" },
          { title: "رسائل العملاء", val: stats.messages, icon: Mail, color: "text-blue-400", bg: "bg-blue-500/10" },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div
              key={i}
              className="p-6 bg-slate-900 rounded-3xl border border-slate-800 shadow-lg flex items-center justify-between"
            >
              <div>
                <p className="text-slate-400 text-xs font-medium mb-2">
                  {s.title}
                </p>
                <h3 className="text-3xl font-bold text-slate-100">{s.val}</h3>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${s.bg} flex items-center justify-center ${s.color}`}>
                <Icon size={24} />
              </div>
            </div>
          );
        })}
      </div>

      {/* المحتوى الرئيسي */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* قسم التعليقات */}
        <section className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={18} /> التعليقات الواردة
            </h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              {data.comments.length} تعليق
            </span>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {data.comments.map((c) => (
              <div
                key={c.id}
                className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{c.name}</h4>
                    <span className="text-[11px] text-slate-500">
                      {new Date(c.created_at).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
                    {!c.approved ? (
                      <button
                        onClick={() => handleAction(c.id, "comments", "approve")}
                        className="text-emerald-400 hover:bg-emerald-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                        title="قبول التعليق"
                      >
                        <CheckCircle2 size={16} />
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs px-2 py-0.5 bg-emerald-500/10 rounded-lg">
                        <ShieldCheck size={14} /> معتمد
                      </span>
                    )}
                    <button
                      onClick={() => handleAction(c.id, "comments", "delete")}
                      className="text-rose-400 hover:bg-rose-500/10 p-1.5 rounded-lg transition-colors cursor-pointer"
                      title="حذف التعليق"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-300 text-sm bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/60">
                  "{c.text}"
                </p>
              </div>
            ))}

            {data.comments.length === 0 && (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                <Inbox size={40} className="text-slate-600" />
                <p className="text-sm">لا توجد تعليقات متاحة حالياً</p>
              </div>
            )}
          </div>
        </section>

        {/* قسم رسائل اتصل بنا */}
        <section className="bg-slate-900 p-6 rounded-3xl border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
            <h2 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Mail className="text-blue-500" size={18} /> رسائل اتصل بنا
            </h2>
            <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-700">
              {data.contacts.length} رسالة
            </span>
          </div>

          <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
            {data.contacts.map((m) => (
              <div
                key={m.id}
                className="p-5 bg-slate-950/60 rounded-2xl border border-slate-800/80 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-slate-100 text-sm">{m.name}</h4>
                    <a href={`mailto:${m.email}`} className="text-xs text-blue-400 hover:underline">
                      {m.email}
                    </a>
                  </div>
                  <button
                    onClick={() => handleAction(m.id, "contacts", "delete")}
                    className="text-slate-400 hover:text-rose-400 cursor-pointer p-2 bg-slate-900 hover:bg-rose-500/10 rounded-xl transition-colors border border-slate-800"
                    title="حذف الرسالة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {m.service && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[11px] text-slate-400 font-medium">الخدمة المطلوبة:</span>
                    <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-3 py-0.5 rounded-full">
                      {m.service}
                    </span>
                  </div>
                )}

                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/60">
                  <p className="text-slate-300 text-sm">
                    {m.message}
                  </p>
                </div>
              </div>
            ))}

            {data.contacts.length === 0 && (
              <div className="text-center py-16 text-slate-500 flex flex-col items-center gap-3">
                <Inbox size={40} className="text-slate-600" />
                <p className="text-sm">لا توجد رسائل جديدة حالياً</p>
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;