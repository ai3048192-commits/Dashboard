import React, { useState, useEffect } from "react";
import { LayoutDashboard, Trash2, Plus, Loader2, Edit3, Sparkles, Image as ImageIcon } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const ProDashboard = () => {
  const [projects, setProjects] = useState([]); // قائمة المشاريع من قاعدة البيانات
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    const savedId = localStorage.getItem("selectedProjectId");
    return savedId ? parseInt(savedId) : 1;
  });

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadingItemImg, setUploadingItemImg] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);

  const [itemInput, setItemInput] = useState({
    project_id: selectedProjectId,
    name: "",
    description: "",
    image_url: "",
    hero_image: "",
    category: "Brand Identity",
  });

  const categories = [
    "Brand Identity",
    "Social Media Design",
    "Print Design",
    "Packaging Design",
    "Photo Manipulation",
    "Presentation Design",
  ];

  // 1. جلب قائمة المشاريع الأساسية من جدول portfolio_projects عند تحميل الصفحة
  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase.from("portfolio_projects").select("id, title");
      if (error) throw error;
      setProjects(data || []);
      
      // إذا كان الـ ID الحالي غير موجود، اختر أول مشروع متاح تلقائياً
      if (data && data.length > 0 && !data.some(p => p.id === selectedProjectId)) {
        const firstId = data[0].id;
        setSelectedProjectId(firstId);
        localStorage.setItem("selectedProjectId", firstId);
      }
    } catch (error) {
      console.error("❌ خطأ في جلب المشاريع:", error);
    }
  };

  // 2. تحديث الـ localStorage والحقل عند تغيير المشروع من القائمة المنسدلة
  const handleProjectChange = (e) => {
    const newId = parseInt(e.target.value);
    setSelectedProjectId(newId);
    localStorage.setItem("selectedProjectId", newId);
    setItemInput(prev => ({ ...prev, project_id: newId }));
  };

  // 3. جلب العناصر المرتبطة بالمشروع المحدد
  useEffect(() => {
    if (selectedProjectId) {
      fetchAllData();
      setItemInput(prev => ({ ...prev, project_id: selectedProjectId }));
    }
  }, [selectedProjectId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .eq("project_id", selectedProjectId)
        .order("id", { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);
    } catch (error) {
      console.error("❌ خطأ:", error);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileToSupabase = async (e, setUploadingState, onSuccess) => {
    try {
      setUploadingState(true);
      const file = e.target.files[0];
      if (!file) return;

      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("portfolio-bucket")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from("portfolio-bucket")
        .getPublicUrl(filePath);

      onSuccess(data.publicUrl);
      alert("✅ تم الرفع بنجاح!");
    } catch (error) {
      alert("❌ خطأ أثناء الرفع: " + error.message);
    } finally {
      setUploadingState(false);
    }
  };

  const handleSaveItem = async () => {
    if (!itemInput.name.trim() || !itemInput.description.trim() || !itemInput.image_url.trim()) {
      alert("⚠️ يرجى ملء جميع الحقول المطلوبة ورفع الصورة الرئيسية");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        project_id: selectedProjectId,
        name: itemInput.name,
        description: itemInput.description,
        image_url: itemInput.image_url,
        hero_image: itemInput.hero_image,
        category: itemInput.category,
      };

      if (editingItemId) {
        const { error } = await supabase.from("items").update(payload).eq("id", editingItemId);
        if (error) throw error;
        alert("✅ تم تحديث السجل بنجاح!");
        setEditingItemId(null);
      } else {
        const { error } = await supabase.from("items").insert([payload]);
        if (error) throw error;
        alert("✅ تمت إضافة السجل بنجاح!");
      }

      setItemInput({
        project_id: selectedProjectId,
        name: "",
        description: "",
        image_url: "",
        hero_image: "",
        category: "Brand Identity",
      });
      fetchAllData();
    } catch (error) {
      alert("❌ خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const startEditItem = (item) => {
    setEditingItemId(item.id);
    setItemInput({
      project_id: selectedProjectId,
      name: item.name || "",
      description: item.description || "",
      image_url: item.image_url || "",
      hero_image: item.hero_image || "",
      category: item.category || "Brand Identity",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteItem = async (table, id) => {
    if (!window.confirm("⚠️ هل أنت متأكد من حذف هذا العنصر؟")) return;

    try {
      setLoading(true);
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      alert("✅ تم الحذف بنجاح!");
      fetchAllData();
    } catch (error) {
      alert("❌ خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen text-white space-y-10 p-4 sm:p-8" dir="rtl">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* العنوان */}
        <div className="flex flex-col items-center py-10 px-6 rounded-3xl bg-[#121216] border border-blue-500/20 text-center shadow-xl">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl border border-blue-500/20 mb-3">
            <LayoutDashboard size={28} />
          </div>
          <h1 className="text-3xl font-black text-white mb-2">
            لوحة إدارة تفاصيل المشروع <span className="text-blue-400">(المعرف: {selectedProjectId})</span>
          </h1>
          <p className="text-stone-400 text-sm flex items-center gap-1.5">
            <Sparkles size={14} className="text-blue-400" /> اختر المشروع المراد إدارته وعرض تفاصيله مباشرة
          </p>
        </div>

        {/* نموذج الإضافة والتعديل */}
        <div className="bg-[#121216] p-6 sm:p-8 rounded-3xl border border-white/10 space-y-6 shadow-2xl">
          <h2 className="text-xl font-bold text-white flex items-center gap-2.5 pb-4 border-b border-white/5">
            <LayoutDashboard size={20} className="text-blue-400" /> 
            {editingItemId ? "تعديل بيانات السجل الحالي" : "إضافة سجل جديد للمشروع المختار"}
          </h2>

          <div className="space-y-5">
            
            {/* القائمة المنسدلة لاختيار الـ ID واسم المشروع من قاعدة البيانات */}
            <div>
              <label className="text-stone-300 text-sm mb-1.5 block font-semibold">
                اختر المشروع (Project ID & Name) <span className="text-blue-400">*</span>
              </label>
              <select
                value={selectedProjectId}
                onChange={handleProjectChange}
                className="w-full bg-black p-4 rounded-xl border border-white/10 text-white outline-none cursor-pointer focus:border-blue-500 transition"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id} className="bg-black text-white">
                    ID: {proj.id} - {proj.title || "مشروع بدون عنوان"}
                  </option>
                ))}
              </select>
              <span className="text-xs text-stone-500 mt-1 block">يتم جلب هذه القائمة مباشرة من جدول المشاريع في قاعدة البيانات.</span>
            </div>

            {/* اسم العنصر / القسم */}
            <div>
              <label className="text-stone-300 text-sm mb-1.5 block font-semibold">اسم العنصر / القسم الفرعي <span className="text-blue-400">*</span></label>
              <input
                type="text"
                placeholder="مثال: الهوية البصرية..."
                value={itemInput.name}
                onChange={(e) => setItemInput({ ...itemInput, name: e.target.value })}
                className="w-full bg-black p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-500 transition"
              />
            </div>

            {/* الوصف */}
            <div>
              <label className="text-stone-300 text-sm mb-1.5 block font-semibold">الوصف <span className="text-blue-400">*</span></label>
              <textarea
                placeholder="اكتب وصفاً تفصيلياً..."
                value={itemInput.description}
                onChange={(e) => setItemInput({ ...itemInput, description: e.target.value })}
                className="w-full bg-black p-4 rounded-xl border border-white/10 text-white outline-none focus:border-blue-500 min-h-[120px] resize-none transition"
              />
            </div>

            {/* رفع الصورة */}
            <div>
              <label className="text-stone-300 text-sm mb-1.5 block font-semibold">صورة القسم الرئيسية <span className="text-blue-400">*</span></label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => uploadFileToSupabase(e, setUploadingItemImg, (url) => setItemInput({ ...itemInput, image_url: url }))}
                className="w-full bg-black p-3.5 rounded-xl border border-white/10 text-stone-400 text-sm cursor-pointer hover:border-blue-500/50 transition"
              />
              {itemInput.image_url && <p className="text-xs text-emerald-400 mt-1.5 font-medium">تم رفع الصورة بنجاح ✅</p>}
            </div>

            {/* التصنيف (Brand Identity وغيرها) */}
            <div>
              <label className="text-stone-300 text-sm mb-1.5 block font-semibold">التصنيف (Category)</label>
              <select
                value={itemInput.category}
                onChange={(e) => setItemInput({ ...itemInput, category: e.target.value })}
                className="w-full bg-black p-4 rounded-xl border border-white/10 text-white outline-none cursor-pointer focus:border-blue-500 transition"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat} className="bg-black text-white">{cat}</option>
                ))}
              </select>
            </div>

            {/* زر الحفظ */}
            <button
              onClick={handleSaveItem}
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center justify-center gap-2.5 shadow-lg shadow-blue-600/30 transition"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
              <span>{editingItemId ? "تحديث السجل الحالي" : "حفظ وإضافة السجل الجديد"}</span>
            </button>
          </div>
        </div>

        {/* عرض العناصر الحالية */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ImageIcon size={18} className="text-blue-400" /> العناصر المسجلة للمشروع (ID: {selectedProjectId}): {items.length}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div key={item.id} className="bg-[#121216] p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-4 shadow-xl hover:border-blue-500/30 transition">
                {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-44 object-cover rounded-xl border border-white/5" />}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-blue-500/20 text-blue-300 px-2.5 py-0.5 rounded-full font-bold">{item.category}</span>
                    <span className="text-xs text-stone-500">ID: {item.id}</span>
                  </div>
                  <h4 className="font-bold text-lg text-white">{item.name}</h4>
                  <p className="text-xs text-stone-400 line-clamp-2">{item.description}</p>
                </div>
                <div className="flex gap-2 pt-3 border-t border-white/5">
                  <button onClick={() => startEditItem(item)} className="flex-1 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition">
                    <Edit3 size={15} /> تعديل
                  </button>
                  <button onClick={() => deleteItem("items", item.id)} className="py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition">
                    <Trash2 size={15} /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default ProDashboard;