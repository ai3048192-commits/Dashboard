import React, { useState, useRef, useEffect } from "react";
import { User, BarChart3, Wand2, Plus, Trash2, Upload } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const ProfilePage = () => {
  // ✅ STATE MANAGEMENT
  const [basics, setBasics] = useState([]);
  const [newBasic, setNewBasic] = useState({ title: "", desc: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [statsList, setStatsList] = useState([]);
  const [newStat, setNewStat] = useState({
    exp: "",
    clients: "",
    projects: "",
  });
  useEffect(() => {
    const fetchStats = async () => {
      const { data } = await supabase
        .from("Stats")
        .select("*")
        .eq("id", 1)
        .single();
      if (data) {
        setNewStat({
          exp: data.exp.toString(),
          clients: data.clients.toString(),
          projects: data.projects.toString(),
        });
      }
    };
    fetchStats();
  }, []);
  const [visions, setVisions] = useState([]);
  const [newVision, setNewVision] = useState({
    title: "",
    desc: "",
    img: null,
  });
  const fileInputRef = useRef(null);
  const handleSaveStats = async () => {
    setLoading(true);
    setError("");

    // استخدام upsert مع id: 1 لضمان التحديث على نفس الصف دائماً
    const { data, error } = await supabase
      .from("Stats")
      .upsert(
        {
          id: 1, // هذا الـ ID يجب أن يكون موجوداً في قاعدة البيانات
          exp: parseInt(newStat.exp) || 0,
          clients: parseInt(newStat.clients) || 0,
          projects: parseInt(newStat.projects) || 0,
        },
        { onConflict: "id" },
      )
      .select();

    if (error) {
      console.error("خطأ:", error);
      setError("فشل حفظ الإحصائيات: " + error.message);
    } else {
      // تحديث القائمة المحلية فوراً بدون إضافة صفوف مكررة
      setStatsList([{ ...newStat, id: 1 }]);
      alert("✅ تم حفظ الإحصائيات بنجاح!");
    }
    setLoading(false);
  };
  // ✅ جلب البيانات الحالية من قاعدة البيانات عند التحميل
  useEffect(() => {
    fetchBasicData();
  }, []);

  const fetchBasicData = async () => {
    try {
      const { data, error } = await supabase
        .from("About")
        .select("*")
        .eq("id", 1)
        .single();

      if (error) {
        console.error("خطأ في جلب البيانات:", error);
        setError("فشل جلب البيانات من قاعدة البيانات");
        return;
      }

      if (data) {
        // ✅ تحديث الـ UI بالبيانات الموجودة
        setNewBasic({
          title: data.title || "",
          desc: data.description || "",
        });
        setBasics([data]);
      }
    } catch (err) {
      console.error("خطأ:", err);
      setError("حدث خطأ في الاتصال بقاعدة البيانات");
    }
  };

  // ✅ حفظ البيانات الأساسية مع معالجة صحيحة
  const handleSaveBasic = async () => {
    // التحقق من البيانات
    if (!newBasic.title.trim()) {
      setError("الرجاء إدخال العنوان");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.from("About").upsert(
        [
          {
            id: 1,
            title: newBasic.title.trim(),
            description: newBasic.desc.trim(),
          },
        ],
        { onConflict: "id" },
      );

      if (error) {
        console.error("خطأ في الحفظ:", error.message);
        setError("خطأ: " + error.message);
        return;
      }

      // ✅ تحديث الـ UI محلياً فوراً
      setBasics([
        {
          id: 1,
          title: newBasic.title,
          description: newBasic.desc,
        },
      ]);

      // ✅ مسح الـ form
      setNewBasic({ title: "", desc: "" });

      // ✅ إظهار رسالة نجاح
      alert("✅ تم حفظ البيانات بنجاح!");
    } catch (err) {
      console.error("خطأ غير متوقع:", err);
      setError("حدث خطأ غير متوقع");
    } finally {
      setLoading(false);
    }
  };

  // ✅ حذف البيانات الأساسية
  const handleDeleteBasic = async (id) => {
    if (!window.confirm("هل تريد حذف هذه البيانات؟")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("About").delete().eq("id", id);

      if (error) {
        setError("خطأ في الحذف: " + error.message);
        return;
      }

      setBasics(basics.filter((item) => item.id !== id));
      setNewBasic({ title: "", desc: "" });
      alert("✅ تم الحذف بنجاح!");
    } catch (err) {
      setError("حدث خطأ في الحذف");
    } finally {
      setLoading(false);
    }
  };

  // ✅ إضافة إحصائيات
  const handleAddStat = async () => {
    if (!newStat.exp || !newStat.clients || !newStat.projects) {
      setError("الرجاء ملء جميع حقول الإحصائيات");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase
        .from("Stats")
        .insert([
          {
            exp: parseInt(newStat.exp),
            clients: parseInt(newStat.clients),
            projects: parseInt(newStat.projects),
          },
        ])
        .select();

      if (error) {
        setError("خطأ في إضافة الإحصائيات: " + error.message);
        return;
      }

      if (data) {
        setStatsList([...statsList, ...data]);
        setNewStat({ exp: "", clients: "", projects: "" });
        alert("✅ تمت إضافة الإحصائيات!");
      }
    } catch (err) {
      setError("حدث خطأ في الإضافة");
    } finally {
      setLoading(false);
    }
  };

  // ✅ حذف إحصائيات
  const handleDeleteStat = async (id) => {
    if (!window.confirm("هل تريد حذف هذا السجل؟")) return;

    setLoading(true);
    try {
      const { error } = await supabase.from("Stats").delete().eq("id", id);

      if (error) {
        setError("خطأ في الحذف: " + error.message);
        return;
      }

      setStatsList(statsList.filter((item) => item.id !== id));
      alert("✅ تم الحذف بنجاح!");
    } catch (err) {
      setError("حدث خطأ في الحذف");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-9xl mx-auto space-y-12 ">
        {/* 🎨 الهيدر الفخم */}

        <div className="relative flex flex-col items-center py-12 mb-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[80px]" />
          <h1 className="text-4xl font-black text-white mb-4 relative z-10">
            الشخصية هويتي
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">
            لوحة التحكم الاحترافية | أعد صياغة واقعك المهني
          </p>
        </div>
        {/* ⚠️ رسائل الخطأ */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 text-red-200">
            {error}
          </div>
        )}

        {/* 1️⃣ قسم البيانات الأساسية */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <User className="text-emerald-500" /> البيانات الأساسية
          </h2>

          <input
            type="text"
            placeholder="العنوان"
            value={newBasic.title}
            onChange={(e) =>
              setNewBasic({ ...newBasic, title: e.target.value })
            }
            className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 mb-4 outline-none focus:border-emerald-500"
          />

          <textarea
            placeholder="الوصف"
            value={newBasic.desc}
            onChange={(e) => setNewBasic({ ...newBasic, desc: e.target.value })}
            className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 h-24 outline-none focus:border-emerald-500"
          ></textarea>

          <button
            onClick={handleSaveBasic}
            disabled={loading}
            className="mt-4 bg-emerald-500 px-6 py-2 rounded-xl text-black font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={18} /> {loading ? "جاري الحفظ..." : "حفظ في القاعدة"}
          </button>

          {/* ✅ عرض البيانات المحفوظة */}
          <div className="mt-6 space-y-2">
            {basics.map((item) => (
              <div
                key={item.id}
                className="bg-[#111111] p-4 rounded-xl border border-gray-800"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-bold text-emerald-400">{item.title}</h3>
                    <p className="text-sm text-gray-400 mt-2">
                      {item.description}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteBasic(item.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2️⃣ قسم الإحصائيات */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <BarChart3 className="text-emerald-500" /> إحصائيات الخبرة
          </h2>

          <div className="grid grid-cols-3 gap-4">
            <input
              type="number"
              placeholder="سنوات"
              value={newStat.exp}
              onChange={(e) => setNewStat({ ...newStat, exp: e.target.value })}
              className="bg-[#111111] border border-gray-800 rounded-xl p-4 outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              placeholder="عملاء"
              value={newStat.clients}
              onChange={(e) =>
                setNewStat({ ...newStat, clients: e.target.value })
              }
              className="bg-[#111111] border border-gray-800 rounded-xl p-4 outline-none focus:border-emerald-500"
            />
            <input
              type="number"
              placeholder="مشاريع"
              value={newStat.projects}
              onChange={(e) =>
                setNewStat({ ...newStat, projects: e.target.value })
              }
              className="bg-[#111111] border border-gray-800 rounded-xl p-4 outline-none focus:border-emerald-500"
            />
          </div>

          <button
            onClick={handleSaveStats}
            className="mt-4 bg-emerald-500 px-6 py-2 rounded-xl text-black font-bold flex items-center gap-2"
          >
            <Plus size={18} /> {loading ? "جاري الحفظ..." : "حفظ الإحصائيات"}
          </button>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            {statsList.map((item) => (
              <div
                key={item.id}
                className="bg-[#111111] p-4 rounded-xl border border-gray-800 flex justify-between items-center"
              >
                <span>
                  {item.exp}س | {item.clients}ع | {item.projects}م
                </span>
                <button
                  onClick={() => handleDeleteStat(item.id)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
