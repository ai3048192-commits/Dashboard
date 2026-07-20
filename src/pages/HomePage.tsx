import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  Trash2,
  Mail,
  MessageSquare,
  ShieldCheck,
  BarChart3,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient"; //[cite: 2, 4]

const AdminDashboard = () => {
  const [data, setData] = useState({ comments: [], contacts: [] });
  const [stats, setStats] = useState({ total: 0, pending: 0, messages: 0 });

  // دالة جلب البيانات الموحدة
  const fetchData = async () => {
    // جلب التعليقات[cite: 4]
    const { data: comments, error: cErr } = await supabase
      .from("comments")
      .select("*")
      .order("created_at", { ascending: false });

    // جلب الرسائل[cite: 4]
    const { data: contacts, error: mErr } = await supabase
      .from("contacts")
      .select("*")
      .order("created_at", { ascending: false });

    if (cErr || mErr) console.error("Error fetching data:", cErr || mErr);

    // تحديث البيانات والإحصائيات معاً[cite: 4]
    setData({
      comments: comments || [],
      contacts: contacts || [],
    });

    setStats({
      total: comments?.length || 0,
      pending: comments?.filter((c) => !c.approved).length || 0,
      messages: contacts?.length || 0,
    });
  };

  useEffect(() => {
    fetchData();

    // الاستماع للتغييرات المباشرة (Realtime) لجدولي contacts و comments
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contacts" },
        () => {
          fetchData(); // تحديث تلقائي عند وصول رسالة جديدة
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments" },
        () => {
          fetchData(); // تحديث تلقائي عند وصول تعليق جديد
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // دالة التعامل مع الأزرار (قبول أو حذف)[cite: 4]
  const handleAction = async (id, table, action) => {
    if (action === "delete") {
      if (!window.confirm("هل أنت متأكد من الحذف النهائي؟")) return;
      await supabase.from(table).delete().eq("id", id);
    } else if (action === "approve") {
      await supabase.from(table).update({ approved: true }).eq("id", id);
    }
    fetchData();
  };

  return (
    <div className="min-h-screen text-white p-6 md:p-12
     selection:bg-orange-500/30" dir="rtl">
      
      {/* الهيدر */}
      <div className="relative flex flex-col items-center py-12 mb-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[80px]" />
        <h1 className="text-4xl font-black text-white mb-4 relative z-10">
          لوحة الإدارة المركزية
        </h1>
        <p className="text-stone-400 text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1.5 rounded-full border border-white/5 flex items-center gap-2">
          <BarChart3 size={16} /> إدارة المحتوى وتواصل العملاء
        </p>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {[
          { title: "إجمالي التعليقات", val: stats.total },
          { title: "قيد المراجعة", val: stats.pending },
          { title: "رسائل العملاء", val: stats.messages },
        ].map((s, i) => (
          <div
            key={i}
            className="p-8 bg-[#0a0a0a] rounded-[2.5rem] border border-white/[0.05]"
          >
            <p className="text-stone-500 text-[10px] font-bold uppercase tracking-widest">
              {s.title}
            </p>
            <h3 className="text-5xl font-light mt-4">{s.val}</h3>
          </div>
        ))}
      </div>

      {/* المحتوى (عرض البيانات) */}
      <div className="grid lg:grid-cols-2 gap-8">
        
        {/* قسم التعليقات */}
        <section>
          <h2 className="bg-[#0a0a0a] p-5 text-xs rounded-[2.5rem] text-white border border-white/[0.05] font-bold text-stone-500 mb-8 uppercase tracking-widest flex items-center gap-2">
            <MessageSquare className="text-orange-500" /> التعليقات
          </h2>
          <div className="space-y-4">
            {data.comments.map((c) => (
              <div
                key={c.id}
                className="p-6 bg-[#0a0a0a] rounded-[2rem] border border-white/[0.03]"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-sm">{c.name}</h4>
                  <div className="flex gap-2">
                    {!c.approved ? (
                      <button
                        onClick={() =>
                          handleAction(c.id, "comments", "approve")
                        }
                        className="text-emerald-500 p-2 cursor-pointer"
                      >
                        <CheckCircle2 size={18} />
                      </button>
                    ) : (
                      <ShieldCheck className="text-emerald-500" size={18} />
                    )}
                    <button
                      onClick={() => handleAction(c.id, "comments", "delete")}
                      className="text-red-500 p-2 cursor-pointer"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>
                </div>
                <p className="text-stone-400 text-sm italic">"{c.text}"</p>
              </div>
            ))}
          </div>
        </section>

        {/* قسم رسائل اتصل بنا */}
        <section>
          <h2 className="bg-[#0a0a0a] p-5 text-xs rounded-[2.5rem] text-white border border-white/[0.05] font-bold text-stone-500 mb-8 uppercase tracking-widest flex items-center gap-2">
            <Mail className="text-blue-500" /> رسائل اتصل بنا
          </h2>
          <div className="space-y-4">
            {data.contacts.map((m) => (
              <div
                key={m.id}
                className="p-6 bg-[#0a0a0a] rounded-[2rem] border border-white/[0.03] space-y-3"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-white text-base">{m.name}</h4>
                    <span className="text-xs text-blue-400 font-mono">{m.email}</span>
                  </div>
                  <button
                    onClick={() => handleAction(m.id, "contacts", "delete")}
                    className="text-stone-600 hover:text-red-500 cursor-pointer p-2 bg-white/5 rounded-xl transition-colors"
                    title="حذف الرسالة"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* عرض الخدمات المختارة */}
                {m.service && (
                  <div className="flex items-center gap-2 flex-wrap pt-1">
                    <span className="text-[10px] text-stone-500 uppercase tracking-wider font-bold">الخدمات المطلوبة:</span>
                    <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full font-medium">
                      {m.service}
                    </span>
                  </div>
                )}

                {/* نص الرسالة */}
                <div className="bg-[#050505] p-4 rounded-xl border border-white/5">
                  <p className="text-stone-300 text-sm leading-relaxed">
                    {m.message}
                  </p>
                </div>
              </div>
            ))}
            {data.contacts.length === 0 && (
              <div className="text-center py-12 text-stone-600 text-sm bg-[#0a0a0a] rounded-[2rem] border border-white/[0.03]">
                لا توجد رسائل جديدة حالياً
              </div>
            )}
          </div>
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;