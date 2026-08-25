// استبدل محتوى Work.tsx بهذا الكود المحدث
import React, { useEffect, useState } from "react";
import { Image, Trash2, Edit, Upload, Loader2, History, Activity } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const ProGraphicDashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [newPort, setNewPort] = useState({
    id: "", 
    title: "",
    desc: "",
    img: "",
    category: "Brand Identity",
    isEditing: false,
  });

  const [logs, setLogs] = useState([]);

  const categories = [
    "Brand Identity",
    "Social Media Design",
    "Print Design",
    "Packaging Design",
    "Photo Manipulation",
    "Presentation Design",
  ];

  const logAction = async (actionText) => {
    const newLog = {
      id: Date.now(),
      action: actionText,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  const fetchPortfolios = async () => {
    const { data } = await supabase.from("portfolio_projects").select("*");
    if (data) setPortfolios(data);
  };

  useEffect(() => {
    fetchPortfolios();
    fetchPartners();
  }, []);

  const handleImageUpload = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `portfolio-images/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-bucket")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("portfolio-bucket")
        .getPublicUrl(filePath);

      setNewPort({ ...newPort, img: data.publicUrl });
      alert("✅ تم رفع الصورة بنجاح!");
    } catch (error) {
      alert("❌ خطأ أثناء رفع الصورة: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const savePortfolio = async () => {
    if (!newPort.title || !newPort.img) return alert("يرجى إكمال البيانات ورفع الصورة!");

    const portfolioData = {
      title: newPort.title,
      description: newPort.desc,
      image_url: newPort.img,
      category: newPort.category,
    };

    let savedId = newPort.id;

    if (newPort.id && !isNaN(newPort.id)) {
      const customId = parseInt(newPort.id);
      portfolioData.id = customId;

      if (newPort.isEditing) {
        await supabase
          .from("portfolio_projects")
          .update(portfolioData)
          .eq("id", customId);
        logAction(`تم تعديل المشروع: ${newPort.title}`);
      } else {
        const { error } = await supabase.from("portfolio_projects").insert([portfolioData]);
        if (error) {
          alert("خطأ في إضافة الـ ID: " + error.message);
          return;
        }
        logAction(`تم إضافة مشروع جديد برقم ID: ${customId} (${newPort.title})`);
      }
    } else {
      // إدخال بدون ID محدد ودعه يتولد تلقائياً مع جلب الـ ID الجديد
      const { data, error } = await supabase.from("portfolio_projects").insert([portfolioData]).select();
      if (error) {
        alert("خطأ في إضافة المشروع: " + error.message);
        return;
      }
      if (data && data.length > 0) {
        savedId = data[0].id;
      }
      logAction(`تم إضافة مشروع جديد: ${newPort.title}`);
    }

    // حفظ الـ ID في localStorage لتوحيده في كل الملفات Details و PortfolioAndPdfForm
    if (savedId) {
      localStorage.setItem("selectedProjectId", savedId);
    }

    setNewPort({ id: "", title: "", desc: "", img: "", category: "Brand Identity", isEditing: false });
    fetchPortfolios();
    alert("✅ تم الحفظ بنجاح وتحديث الموقع وتثبيت الـ ID في النظام!");
  };

  const deletePortfolio = async (id) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    await supabase.from("portfolio_projects").delete().eq("id", id);
    logAction(`تم حذف المشروع برقم ID: ${id}`);
    fetchPortfolios();
  };

  const [partners, setPartners] = useState([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [editingId, setEditingId] = useState(null);

  const fetchPartners = async () => {
    const { data } = await supabase.from("partners").select("*");
    if (data) setPartners(data);
  };

  const handlePartnerLogoUpload = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const fileExt = file.name.split(".").pop();
      const fileName = `partner-${Math.random()}.${fileExt}`;
      const filePath = `partners-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-bucket")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("portfolio-bucket")
        .getPublicUrl(filePath);

      setLogoUrl(data.publicUrl);
      alert("✅ تم رفع شعار الشريك بنجاح!");
    } catch (error) {
      alert("❌ خطأ أثناء رفع الشعار: " + error.message);
    }
  };

  const handleSubmitPartner = async () => {
    if (!name || !logoUrl) return alert("يرجى تعبئة الحقول ورفع الشعار");

    if (editingId) {
      await supabase
        .from("partners")
        .update({ name, logo_url: logoUrl })
        .eq("id", editingId);
      logAction(`تم تعديل بيانات الشريك: ${name}`);
      setEditingId(null);
    } else {
      await supabase.from("partners").insert([{ name, logo_url: logoUrl }]);
      logAction(`تم إضافة شريك جديد: ${name}`);
    }

    setName("");
    setLogoUrl("");
    fetchPartners();
    alert("✅ تم حفظ الشريك بنجاح!");
  };

  const deletePartner = async (id) => {
    if (!confirm("هل أنت متأكد من حذف هذا الشريك؟")) return;
    await supabase.from("partners").delete().eq("id", id);
    logAction(`تم حذف الشريك برقم ID: ${id}`);
    fetchPartners();
  };

  const startEditPartner = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setLogoUrl(p.logo_url);
  };

  return (
    <div className="max-w-9xl mx-auto p-6 text-white space-y-12" dir="rtl">
      {/* بقية الواجهة الخاصة بـ Work */}
      <div className="bg-[#0a0a0a] p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 text-emerald-400">
          <Activity size={20} /> سجل العمليات والنشاطات الحية
        </h3>
        <div className="bg-black p-4 rounded-2xl border border-white/5 max-h-48 overflow-y-auto space-y-2">
          {logs.length === 0 ? (
            <p className="text-stone-500 text-sm text-center py-2">لا توجد عمليات مسجلة حتى الآن في هذه الجلسة.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between text-sm py-2 px-3 bg-white/5 rounded-xl border border-white/5">
                <span className="text-stone-200">{log.action}</span>
                <span className="text-xs text-stone-400 bg-black/40 px-2 py-1 rounded-md">{log.time}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <h3 className="text-2xl font-bold flex items-center gap-3">
          <Edit className="text-blue-400" />
          {newPort.isEditing ? "تعديل المشروع الحالي" : "إضافة مشروع جديد للمعرض"}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="number"
            placeholder="معرف المشروع (ID) - اختياري"
            value={newPort.id}
            onChange={(e) => setNewPort({ ...newPort, id: e.target.value })}
            className="bg-black p-4 rounded-xl border border-white/10 text-white outline-none"
          />
          <input
            placeholder="عنوان المشروع"
            value={newPort.title}
            onChange={(e) => setNewPort({ ...newPort, title: e.target.value })}
            className="bg-black p-4 rounded-xl border border-white/10 text-white outline-none"
          />
          <select
            value={newPort.category}
            onChange={(e) => setNewPort({ ...newPort, category: e.target.value })}
            className="md:col-span-2 bg-black p-4 rounded-xl border border-white/10 text-white outline-none"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <div className="md:col-span-2 bg-black p-4 rounded-xl border border-white/10 flex flex-col gap-2">
            <label className="text-stone-400 text-sm">صورة المشروع:</label>
            <label className="flex items-center justify-center gap-2 bg-blue-600/20 text-blue-400 p-4 rounded-xl cursor-pointer border border-blue-500/30">
              {uploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
              <span>{uploading ? "جاري الرفع..." : "اختر ملف الصورة"}</span>
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {newPort.img && <span className="text-xs text-emerald-400">✅ تم رفع الصورة بنجاح</span>}
          </div>
          <textarea
            placeholder="وصف المشروع..."
            value={newPort.desc}
            onChange={(e) => setNewPort({ ...newPort, desc: e.target.value })}
            className="md:col-span-2 bg-black p-4 rounded-xl border border-white/10 text-white h-24 resize-none outline-none"
          />
          <button
            onClick={savePortfolio}
          className="md:col-span-2 bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold text-white transition"
          >
            {newPort.isEditing ? "حفظ التعديلات" : "إضافة للموقع فوراً وتثبيت الـ ID"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-white/10">
          {portfolios.map((item) => (
            <div key={item.id} className="bg-black p-4 rounded-2xl border border-white/10 space-y-3">
              <img src={item.image_url} alt={item.title} className="w-full h-36 object-cover rounded-xl" />
              <h4 className="font-bold text-white">{item.title} (ID: {item.id})</h4>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => setNewPort({ id: item.id, title: item.title, desc: item.description, img: item.image_url, category: item.category, isEditing: true })}
                  className="text-blue-400 p-2 bg-blue-500/10 rounded-lg hover:bg-blue-500/20 transition"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => deletePortfolio(item.id)}
                  className="text-red-400 p-2 bg-red-500/10 rounded-lg hover:bg-red-500/20 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProGraphicDashboard;