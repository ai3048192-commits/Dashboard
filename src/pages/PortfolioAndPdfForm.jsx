// استبدل محتوى PortfolioAndPdfForm.jsx بالكامل بهذا الكود المحدث
import React, { useState, useEffect } from "react";
import { Plus, Upload, Loader2, Edit3, Trash2, Image as ImageIcon, FileText, Sparkles, Layers } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const PortfolioAndPdfForm = ({ projectId: externalProjectId, setProjectId: externalSetProjectId }) => {
  // قراءة الـ ID من localStorage كقيمة افتراضية لضمان عدم اختفائه أبداً ومطابقته لـ Details
  const [internalProjectId, setInternalProjectId] = useState(() => {
    const savedId = localStorage.getItem("selectedProjectId");
    return savedId ? parseInt(savedId) : "";
  });

  const projectId = externalProjectId !== undefined && externalProjectId !== "" ? externalProjectId : internalProjectId;
  
  const setProjectId = (newId) => {
    if (externalSetProjectId) {
      externalSetProjectId(newId);
    }
    setInternalProjectId(newId);
    if (newId) {
      localStorage.setItem("selectedProjectId", newId);
    }
  };

  const [projectsList, setProjectsList] = useState([]);
  const [portfolioInput, setPortfolioInput] = useState({ description: "", image_url: "" });
  const [pdfInput, setPdfInput] = useState({ title: "", file_url: "" });
  
  const [uploadingPortImg, setUploadingPortImg] = useState(false);
  const [uploadingPdfFile, setUploadingPdfFile] = useState(false);
  
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [editingPdfId, setEditingPdfId] = useState(null);
  const [loading, setLoading] = useState(false);

  const [portfoliosList, setPortfoliosList] = useState([]);
  const [pdfsList, setPdfsList] = useState([]);

  // تصحيح جلب المشاريع من جدول portfolio_projects الأساسي بدلاً من items
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase.from("portfolio_projects").select("id, title");
        if (error) throw error;
        setProjectsList(data || []);
        
        // إذا لم يكن هناك مشروع محدد، اختر الأول تلقائياً
        if (data && data.length > 0 && !projectId) {
          const firstId = data[0].id;
          setProjectId(firstId);
        }
      } catch (err) {
        console.error("خطأ في جلب المشاريع:", err.message);
      }
    };
    fetchProjects();
  }, []);

  const fetchLogs = async () => {
    try {
      let portQuery = supabase.from("portfolios").select("*");
      let pdfQuery = supabase.from("pdfs").select("*");

      if (projectId) {
        portQuery = portQuery.eq("project_id", parseInt(projectId));
        pdfQuery = pdfQuery.eq("project_id", parseInt(projectId));
      }

      const { data: portData } = await portQuery;
      setPortfoliosList(portData || []);

      const { data: pdfData } = await pdfQuery;
      setPdfsList(pdfData || []);
    } catch (err) {
      console.error("خطأ في جلب السجلات:", err.message);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchLogs();
    }
  }, [projectId]);

  const uploadFileToSupabase = async (e, setUploadingState, setUrlState) => {
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

      const { data } = supabase.storage.from("portfolio-bucket").getPublicUrl(filePath);
      setUrlState(data.publicUrl);
      alert("✅ تم رفع الملف بنجاح!");
    } catch (err) {
      alert("حدث خطأ أثناء الرفع: " + err.message);
    } finally {
      setUploadingState(false);
    }
  };

  const handleSavePortfolio = async () => {
    if (!projectId) {
      alert("الرجاء اختيار المشروع (ID) أولاً من القائمة");
      return;
    }
    if (!portfolioInput.image_url || !portfolioInput.description) {
      alert("الرجاء إدخال الصورة ووصفها");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        project_id: parseInt(projectId),
        image_url: portfolioInput.image_url,
        description: portfolioInput.description,
      };

      let error;
      if (editingPortfolioId) {
        const res = await supabase.from("portfolios").update(payload).eq("id", editingPortfolioId);
        error = res.error;
      } else {
        const res = await supabase.from("portfolios").insert([payload]);
        error = res.error;
      }

      if (error) throw error;

      alert("تم حفظ صورة المعرض بنجاح وربطها بالمشروع!");
      setPortfolioInput({ description: "", image_url: "" });
      setEditingPortfolioId(null);
      fetchLogs();
    } catch (err) {
      alert("خطأ أثناء الحفظ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPortfolio = (item) => {
    setEditingPortfolioId(item.id);
    setPortfolioInput({ description: item.description, image_url: item.image_url });
    if (item.project_id) setProjectId(item.project_id);
  };

  const handleDeletePortfolio = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذه الصورة؟")) return;
    try {
      const { error } = await supabase.from("portfolios").delete().eq("id", id);
      if (error) throw error;
      alert("تم الحذف بنجاح");
      fetchLogs();
    } catch (err) {
      alert("خطأ أثناء الحذف: " + err.message);
    }
  };

  const handleSavePdf = async () => {
    if (!projectId) {
      alert("الرجاء اختيار المشروع (ID) أولاً من القائمة");
      return;
    }
    if (!pdfInput.title || !pdfInput.file_url) {
      alert("الرجاء إدخال عنوان الملف ورابط الـ PDF");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        project_id: parseInt(projectId),
        title: pdfInput.title,
        file_url: pdfInput.file_url,
      };

      let error;
      if (editingPdfId) {
        const res = await supabase.from("pdfs").update(payload).eq("id", editingPdfId);
        error = res.error;
      } else {
        const res = await supabase.from("pdfs").insert([payload]);
        error = res.error;
      }

      if (error) throw error;

      alert("تم حفظ ملف الـ PDF بنجاح وربطه بالمشروع!");
      setPdfInput({ title: "", file_url: "" });
      setEditingPdfId(null);
      fetchLogs();
    } catch (err) {
      alert("خطأ أثناء الحفظ: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPdf = (item) => {
    setEditingPdfId(item.id);
    setPdfInput({ title: item.title, file_url: item.file_url });
    if (item.project_id) setProjectId(item.project_id);
  };

  const handleDeletePdf = async (id) => {
    if (!window.confirm("هل أنت متأكد من حذف هذا الملف؟")) return;
    try {
      const { error } = await supabase.from("pdfs").delete().eq("id", id);
      if (error) throw error;
      alert("تم الحذف بنجاح");
      fetchLogs();
    } catch (err) {
      alert("خطأ أثناء الحذف: " + err.message);
    }
  };

  return (
    <div className="space-y-12" dir="rtl">
      <div className="bg-gradient-to-r from-[#141414] to-[#1c1c1c] p-6 rounded-3xl border border-orange-500/30 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-orange-500/10 text-orange-400 rounded-2xl border border-orange-500/20">
            <Layers size={24} />
          </div>
          <div>
            <h4 className="text-white font-bold text-lg">اختر المشروع المراد إضافة الصور والملفات له</h4>
            <p className="text-stone-400 text-xs">متطابق تلقائياً مع باقي لوحات التحكم عبر (ID: {projectId || "غير محدد"})</p>
          </div>
        </div>
        <select
          value={projectId || ""}
          onChange={(e) => setProjectId(e.target.value)}
          className="w-full md:w-72 bg-[#0a0a0a] p-3.5 rounded-2xl border border-white/10 text-orange-400 font-bold text-base focus:outline-none focus:border-orange-500"
        >
          <option value="">-- اختر المشروع --</option>
          {projectsList.map((proj) => (
            <option key={proj.id} value={proj.id}>
              {proj.title || `مشروع رقم ${proj.id}`} (ID: {proj.id})
            </option>
          ))}
        </select>
      </div>

      {/* نموذج معرض الصور */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0d0d0d] p-8 sm:p-10 rounded-[2.5rem] border border-emerald-500/20 shadow-2xl space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
              <ImageIcon size={26} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {editingPortfolioId ? "تعديل صورة المعرض" : "إضافة صورة جديدة للمعرض"}
              </h3>
              <p className="text-stone-400 text-xs mt-1">مرتبط بالمشروع (ID: {projectId || "غير محدد"})</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <label className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-white/10 bg-[#0a0a0a] cursor-pointer hover:border-emerald-500">
            {uploadingPortImg ? (
              <Loader2 className="animate-spin text-emerald-400" size={32} />
            ) : portfolioInput?.image_url ? (
              <div className="flex items-center gap-3">
                <img src={portfolioInput.image_url} alt="Preview" className="w-16 h-16 object-cover rounded-xl shadow-md border border-white/10" />
                <span className="text-emerald-400 text-sm font-bold">تم اختيار الصورة بنجاح ✅</span>
              </div>
            ) : (
              <span className="text-stone-300 text-sm">اضغط لاختيار صورة المعرض</span>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadFileToSupabase(e, setUploadingPortImg, (url) => setPortfolioInput({ ...portfolioInput, image_url: url }))}
              className="hidden"
            />
          </label>

          <textarea
            placeholder="وصف الصورة..."
            value={portfolioInput?.description || ""}
            onChange={(e) => setPortfolioInput({ ...portfolioInput, description: e.target.value })}
            className="w-full bg-[#0a0a0a] p-4 rounded-2xl border border-white/10 text-white min-h-[100px]"
          />

          <button
            onClick={handleSavePortfolio}
            disabled={loading}
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-emerald-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            <span>{editingPortfolioId ? "تحديث صورة المعرض" : "حفظ صورة المعرض"}</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <h4 className="text-white font-bold text-lg">سجلات صور المعرض للمشروع الحالي ({portfoliosList.length})</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-stone-300">
              <thead className="bg-[#0a0a0a] text-stone-400 text-xs uppercase">
                <tr>
                  <th className="p-3 rounded-r-xl">ID</th>
                  <th className="p-3">Project ID</th>
                  <th className="p-3">الصورة</th>
                  <th className="p-3">الوصف</th>
                  <th className="p-3 rounded-l-xl text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {portfoliosList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-stone-500">لا توجد سجلات صور مضافة لهذا المشروع</td>
                  </tr>
                ) : (
                  portfoliosList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="p-3 font-mono">{item.id}</td>
                      <td className="p-3 font-mono text-emerald-400">{item.project_id}</td>
                      <td className="p-3">
                        <img src={item.image_url} alt="" className="w-12 h-12 object-cover rounded-lg border border-white/10" />
                      </td>
                      <td className="p-3 truncate max-w-xs">{item.description}</td>
                      <td className="p-3 flex items-center justify-center gap-2">
                        <button onClick={() => handleEditPortfolio(item)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all cursor-pointer">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeletePortfolio(item.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* نموذج ملفات PDF */}
      <div className="bg-gradient-to-b from-[#141414] to-[#0d0d0d] p-8 sm:p-10 rounded-[2.5rem] border border-purple-500/20 shadow-2xl space-y-8">
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-2xl border border-purple-500/20">
              <FileText size={26} />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                {editingPdfId ? "تعديل ملف الـ PDF" : "إضافة ملف PDF جديد"}
              </h3>
              <p className="text-stone-400 text-xs mt-1">مرتبط بالمشروع (ID: {projectId || "غير محدد"})</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <input
            type="text"
            placeholder="عنوان الملف (مثال: الكتالوج التقني)"
            value={pdfInput?.title || ""}
            onChange={(e) => setPdfInput({ ...pdfInput, title: e.target.value })}
            className="w-full bg-[#0a0a0a] p-4 rounded-2xl border border-white/10 text-white"
          />

          <label className="relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 border-dashed border-white/10 bg-[#0a0a0a] cursor-pointer hover:border-purple-500">
            {uploadingPdfFile ? (
              <Loader2 className="animate-spin text-purple-400" size={32} />
            ) : pdfInput?.file_url ? (
              <span className="text-emerald-400 text-sm font-bold">تم اختيار الملف بنجاح ✅</span>
            ) : (
              <span className="text-stone-300 text-sm">اضغط لاختيار ملف PDF</span>
            )}
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => uploadFileToSupabase(e, setUploadingPdfFile, (url) => setPdfInput({ ...pdfInput, file_url: url }))}
              className="hidden"
            />
          </label>

          <button
            onClick={handleSavePdf}
            disabled={loading}
            className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer transition-all shadow-lg shadow-purple-600/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
            <span>{editingPdfId ? "تحديث ملف الـ PDF" : "حفظ ملف الـ PDF"}</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-white/10 space-y-4">
          <h4 className="text-white font-bold text-lg">سجلات ملفات PDF للمشروع الحالي ({pdfsList.length})</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-right text-sm text-stone-300">
              <thead className="bg-[#0a0a0a] text-stone-400 text-xs uppercase">
                <tr>
                  <th className="p-3 rounded-r-xl">ID</th>
                  <th className="p-3">Project ID</th>
                  <th className="p-3">عنوان الملف</th>
                  <th className="p-3">الرابط</th>
                  <th className="p-3 rounded-l-xl text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pdfsList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-stone-500">لا توجد سجلات ملفات مضافة لهذا المشروع</td>
                  </tr>
                ) : (
                  pdfsList.map((item) => (
                    <tr key={item.id} className="hover:bg-white/5">
                      <td className="p-3 font-mono">{item.id}</td>
                      <th className="p-3 font-mono text-purple-400">{item.project_id}</th>
                      <td className="p-3 font-bold text-white">{item.title}</td>
                      <td className="p-3">
                        <a href={item.file_url} target="_blank" rel="noopener noreferrer" className="text-purple-400 underline text-xs">
                          عرض الملف
                        </a>
                      </td>
                      <td className="p-3 flex items-center justify-center gap-2">
                        <button onClick={() => handleEditPdf(item)} className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white rounded-xl transition-all cursor-pointer">
                          <Edit3 size={16} />
                        </button>
                        <button onClick={() => handleDeletePdf(item.id)} className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioAndPdfForm;