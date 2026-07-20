import React, { useState, useEffect } from "react";
import { LayoutDashboard, Image, FileText, Trash2, Plus } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const ProDashboard = () => {
  // ===== States للمشاريع =====
  const [items, setItems] = useState([]);
  const [portfolios, setPortfolios] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [loading, setLoading] = useState(false);

  // ===== Input State للمشاريع الأساسية =====
  const [itemInput, setItemInput] = useState({
    name: "",
    description: "",
    image_url: "",
    hero_image: "",
    category: "Brand Identity",
  });

  // ===== Input State للمعرض (مرتبط بالمشروع + category) =====
  const [portfolioInput, setPortfolioInput] = useState({
    project_id: null,
    description: "",
    image_url: "",
    category: "Brand Identity", // ✅ أضيفنا الـ category
  });

  // ===== Input State لـ PDF (مرتبط بالمشروع + category) =====
  const [pdfInput, setPdfInput] = useState({
    project_id: null,
    title: "",
    file_url: "",
    preview_image: "",
    category: "Brand Identity", // ✅ أضيفنا الـ category
  });

  // ===== فئات المشاريع =====
  const categories = [
    "Brand Identity",
    "Social Media Design",
    "Print Design",
    "Packaging Design",
    "Photo Manipulation",
    "Presentation Design",
  ];

  // ===== جلب البيانات عند تحميل الصفحة =====
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log("🔄 جاري جلب البيانات...");

      // جلب المشاريع
      const { data: itemsData, error: itemsError } = await supabase
        .from("items")
        .select("*")
        .order("id", { ascending: false });

      if (itemsError) throw itemsError;
      setItems(itemsData || []);

      // جلب المعرض
      const { data: portfoliosData, error: portfoliosError } = await supabase
        .from("portfolios")
        .select("*")
        .order("id", { ascending: false });

      if (portfoliosError) console.warn("خطأ في جلب المعرض:", portfoliosError);
      setPortfolios(portfoliosData || []);

      // جلب الـ PDFs
      const { data: pdfsData, error: pdfsError } = await supabase
        .from("pdfs")
        .select("*")
        .order("id", { ascending: false });

      if (pdfsError) console.warn("خطأ في جلب الـ PDFs:", pdfsError);
      setPdfs(pdfsData || []);

      console.log("✅ تم جلب البيانات بنجاح");
    } catch (error) {
      console.error("❌ خطأ:", error);
      alert("❌ خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== إضافة مشروع جديد =====
  const addItem = async () => {
    if (
      !itemInput.name.trim() ||
      !itemInput.description.trim() ||
      !itemInput.image_url.trim()
    ) {
      alert("⚠️ يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      console.log("📝 جاري إضافة مشروع...");

      const { error } = await supabase.from("items").insert([itemInput]);

      if (error) throw error;

      alert("✅ تم إضافة المشروع بنجاح!");
      setItemInput({
        name: "",
        description: "",
        image_url: "",
        hero_image: "",
        category: "Brand Identity",
      });
      fetchAllData();
    } catch (error) {
      console.error("❌ خطأ:", error);
      alert("❌ خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== إضافة للمعرض (مرتبط بالمشروع + category) =====
  const addPortfolio = async () => {
    if (!portfolioInput.project_id) {
      alert("⚠️ يرجى اختيار المشروع");
      return;
    }

    if (
      !portfolioInput.description.trim() ||
      !portfolioInput.image_url.trim()
    ) {
      alert("⚠️ يرجى ملء جميع الحقول");
      return;
    }

    try {
      setLoading(true);
      console.log("🖼️ جاري إضافة صورة للمعرض...");

      const { error } = await supabase.from("portfolios").insert([
        {
          project_id: parseInt(portfolioInput.project_id),
          description: portfolioInput.description,
          image_url: portfolioInput.image_url,
          category: portfolioInput.category, // ✅ حفظ الفئة
        },
      ]);

      if (error) throw error;

      alert("✅ تم إضافة الصورة بنجاح!");
      setPortfolioInput({
        project_id: null,
        description: "",
        image_url: "",
        category: "Brand Identity",
      });
      fetchAllData();
    } catch (error) {
      console.error("❌ خطأ:", error);
      alert("❌ خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== إضافة ملف PDF (مرتبط بالمشروع + category) =====
  const addPdf = async () => {
    if (!pdfInput.project_id) {
      alert("⚠️ يرجى اختيار المشروع");
      return;
    }

    if (!pdfInput.title.trim() || !pdfInput.file_url.trim()) {
      alert("⚠️ يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      setLoading(true);
      console.log("📄 جاري إضافة ملف PDF...");

      const { error } = await supabase.from("pdfs").insert([
        {
          project_id: parseInt(pdfInput.project_id),
          title: pdfInput.title,
          file_url: pdfInput.file_url,
          preview_image: pdfInput.preview_image || null,
          category: pdfInput.category, // ✅ حفظ الفئة
        },
      ]);

      if (error) throw error;

      alert("✅ تم إضافة الملف بنجاح!");
      setPdfInput({
        project_id: null,
        title: "",
        file_url: "",
        preview_image: "",
        category: "Brand Identity",
      });
      fetchAllData();
    } catch (error) {
      console.error("❌ خطأ:", error);
      alert("❌ خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== حذف =====
  const deleteItem = async (table, id) => {
    if (!window.confirm("⚠️ هل أنت متأكد من حذف هذا العنصر؟")) return;

    try {
      setLoading(true);
      const { error } = await supabase.from(table).delete().eq("id", id);
      if (error) throw error;
      alert("✅ تم الحذف بنجاح!");
      fetchAllData();
    } catch (error) {
      console.error("❌ خطأ:", error);
      alert("❌ خطأ: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-gradient-to-br text-white space-y-8 p-6"
      dir="rtl"
    >
      <div className="max-w-6xl mx-auto">
     
        <div className="relative flex flex-col items-center py-12 mb-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[80px]" />
        <h1 className="text-4xl font-black text-white mb-4 relative z-10">
  لوحة تحكم المشاريع{" "}
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">
إدارة مشاريعك والمعرض والملفات

        </p>
      </div>

        {/* ===== قسم المشاريع الأساسية ===== */}
        <section className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-8 text-blue-400 flex items-center gap-3">
            <LayoutDashboard size={28} /> المشاريع الأساسية
          </h2>

          <div className="bg-[#111111] p-8 rounded-2xl border border-white/5 mb-8">
            <h3 className="text-lg font-bold mb-4 text-blue-300">
              إضافة مشروع جديد
            </h3>
            <div className="grid gap-4">
              <input
                type="text"
                placeholder="اسم المشروع *"
                value={itemInput.name}
                onChange={(e) =>
                  setItemInput({ ...itemInput, name: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />

              <textarea
                placeholder="وصف المشروع *"
                value={itemInput.description}
                onChange={(e) =>
                  setItemInput({ ...itemInput, description: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-blue-500 focus:outline-none min-h-24"
              />

              <input
                type="url"
                placeholder="رابط الصورة الرئيسية *"
                value={itemInput.image_url}
                onChange={(e) =>
                  setItemInput({ ...itemInput, image_url: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />

              <input
                type="url"
                placeholder="رابط صورة البطل - اختياري"
                value={itemInput.hero_image}
                onChange={(e) =>
                  setItemInput({ ...itemInput, hero_image: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              />

              <select
                value={itemInput.category}
                onChange={(e) =>
                  setItemInput({ ...itemInput, category: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-blue-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                onClick={addItem}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> إضافة مشروع
              </button>
            </div>
          </div>

          {/* قائمة المشاريع */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-blue-300 mb-4">
              المشاريع المضافة ({items.length})
            </h3>
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start bg-[#111111] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-white">
                      {item.name}
                      <span className="text-blue-400 text-xs ml-2">
                        (ID: {item.id})
                      </span>
                    </h4>
                    <p className="text-xs text-stone-400 mt-1">
                      {item.description}
                    </p>
                    <span className="text-orange-500 text-xs mt-2 inline-block">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteItem("items", item.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-stone-400 text-center py-4">
                لا توجد مشاريع بعد
              </p>
            )}
          </div>
        </section>

        {/* ===== قسم المعرض ===== */}
        <section className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-8 text-emerald-400 flex items-center gap-3">
            <Image size={28} /> معرض المشاريع
          </h2>

          <div className="bg-[#111111] p-8 rounded-2xl border border-white/5 mb-8">
            <h3 className="text-lg font-bold mb-4 text-emerald-300">
              إضافة صورة للمعرض
            </h3>
            <div className="grid gap-4">
              <select
                value={portfolioInput.project_id || ""}
                onChange={(e) =>
                  setPortfolioInput({
                    ...portfolioInput,
                    project_id: e.target.value,
                  })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="">اختر المشروع *</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (ID: {item.id})
                  </option>
                ))}
              </select>

              <input
                type="url"
                placeholder="رابط الصورة *"
                value={portfolioInput.image_url}
                onChange={(e) =>
                  setPortfolioInput({
                    ...portfolioInput,
                    image_url: e.target.value,
                  })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
              />

              <textarea
                placeholder="وصف الصورة *"
                value={portfolioInput.description}
                onChange={(e) =>
                  setPortfolioInput({
                    ...portfolioInput,
                    description: e.target.value,
                  })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-emerald-500 focus:outline-none min-h-20"
              />

              {/* ✅ حقل الفئة للمعرض */}
              <select
                value={portfolioInput.category}
                onChange={(e) =>
                  setPortfolioInput({
                    ...portfolioInput,
                    category: e.target.value,
                  })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                onClick={addPortfolio}
                disabled={loading}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> إضافة للمعرض
              </button>
            </div>
          </div>

          {/* قائمة المعرض */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-emerald-300 mb-4">
              الصور المضافة ({portfolios.length})
            </h3>
            {portfolios.length > 0 ? (
              portfolios.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-start bg-[#111111] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-white">
                      {item.description}
                      <span className="text-emerald-400 text-xs ml-2">
                        (Project ID: {item.project_id})
                      </span>
                    </h4>
                    <span className="text-orange-500 text-xs mt-2 inline-block">
                      {item.category}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteItem("portfolios", item.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-stone-400 text-center py-4">لا توجد صور بعد</p>
            )}
          </div>
        </section>

        {/* ===== قسم ملفات PDF ===== */}
        <section className="bg-[#0a0a0a] p-8 rounded-3xl border border-white/10">
          <h2 className="text-2xl font-bold mb-8 text-purple-400 flex items-center gap-3">
            <FileText size={28} /> ملفات PDF
          </h2>

          <div className="bg-[#111111] p-8 rounded-2xl border border-white/5 mb-8">
            <h3 className="text-lg font-bold mb-4 text-purple-300">
              إضافة ملف PDF
            </h3>
            <div className="grid gap-4">
              <select
                value={pdfInput.project_id || ""}
                onChange={(e) =>
                  setPdfInput({
                    ...pdfInput,
                    project_id: e.target.value,
                  })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              >
                <option value="">اختر المشروع *</option>
                {items.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} (ID: {item.id})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="عنوان الملف *"
                value={pdfInput.title}
                onChange={(e) =>
                  setPdfInput({ ...pdfInput, title: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />

              <input
                type="url"
                placeholder="رابط ملف PDF *"
                value={pdfInput.file_url}
                onChange={(e) =>
                  setPdfInput({ ...pdfInput, file_url: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />

              <input
                type="url"
                placeholder="رابط صورة المعاينة - اختياري"
                value={pdfInput.preview_image}
                onChange={(e) =>
                  setPdfInput({ ...pdfInput, preview_image: e.target.value })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              />

              {/* ✅ حقل الفئة للـ PDF */}
              <select
                value={pdfInput.category}
                onChange={(e) =>
                  setPdfInput({
                    ...pdfInput,
                    category: e.target.value,
                  })
                }
                className="bg-[#0a0a0a] p-3 rounded-xl border border-white/10 text-white focus:border-purple-500 focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                onClick={addPdf}
                disabled={loading}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 p-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} /> إضافة PDF
              </button>
            </div>
          </div>

          {/* قائمة الـ PDF */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-purple-300 mb-4">
              الملفات المضافة ({pdfs.length})
            </h3>
            {pdfs.length > 0 ? (
              pdfs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex justify-between items-start bg-[#111111] p-4 rounded-xl border border-white/5 hover:border-white/10 transition-all"
                >
                  <div className="flex-1">
                    <h4 className="font-bold text-white">
                      {doc.title}
                      <span className="text-purple-400 text-xs ml-2">
                        (Project ID: {doc.project_id})
                      </span>
                    </h4>
                    <span className="text-orange-500 text-xs mt-2 inline-block">
                      {doc.category}
                    </span>
                    <br />
                    <a
                      href={doc.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline mt-1 block"
                    >
                      فتح الملف
                    </a>
                  </div>
                  <button
                    onClick={() => deleteItem("pdfs", doc.id)}
                    disabled={loading}
                    className="text-red-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-stone-400 text-center py-4">
                لا توجد ملفات بعد
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProDashboard;
