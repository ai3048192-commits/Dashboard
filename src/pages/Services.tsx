import React, { useState, useEffect } from "react";
import {
  Lightbulb,
  CheckCircle2,
  Plus,
  Trash2,
  Edit2,
  Save,
} from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const Services = () => {
  const [creativeFields, setCreativeFields] = useState([]);
  const [newField, setNewField] = useState({
    title: "",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);

  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState({ title: "", description: "" });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    // جلب المجالات
    const { data: fields } = await supabase.from("creative_fields").select("*");
    if (fields) setCreativeFields(fields);

    // جلب الأسباب
    const { data: whyChoose } = await supabase.from("why_choose").select("*");
    if (whyChoose) setReasons(whyChoose);
  };

  const addReason = async () => {
    if (!newReason.title) return alert("يرجى كتابة العنوان!");

    const { error } = await supabase.from("why_choose").insert([newReason]);
    if (error) return alert("خطأ: " + error.message);

    setNewReason({ title: "", description: "" });
    fetchFields();
  };

  // دالة الإضافة أو التحديث للمجالات
  const handleSaveField = async () => {
    if (!newField.title) return alert("يرجى كتابة العنوان على الأقل!");

    if (editingId) {
      // تحديث سجل موجود
      const { error } = await supabase
        .from("creative_fields")
        .update({
          title: newField.title,
          description: newField.description,
        })
        .eq("id", editingId);

      if (error) return alert("خطأ في التحديث: " + error.message);
      alert("تم التحديث بنجاح!");
      setEditingId(null);
    } else {
      // إضافة سجل جديد
      const { error } = await supabase
        .from("creative_fields")
        .insert([newField]);
      if (error) return alert("خطأ في الإضافة: " + error.message);
      alert("تمت الإضافة بنجاح!");
    }

    setNewField({ title: "", description: "" });
    fetchFields();
  };

  // دالة الحذف للمجالات
  const deleteField = async (id) => {
    const { error } = await supabase
      .from("creative_fields")
      .delete()
      .eq("id", id);
    if (error) return alert("خطأ في الحذف: " + error.message);
    fetchFields();
  };

  // تحضير الفورم للتعديل
  const startEdit = (field) => {
    setEditingId(field.id);
    setNewField({
      title: field.title,
      description: field.description,
    });
  };

  return (
    <div className="space-y-12">
      {/* 1. العناوين الرئيسية */}
      <div className="relative flex flex-col items-center py-12 mb-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[80px]" />
        <h1 className="text-4xl font-black text-white mb-4 relative z-10">
          الإبداع والحلول
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">
          إدارة خدمات
        </p>
      </div>

      {/* 2. الفورم المربوط بـ Supabase (لإضافة وتعديل المجالات) */}
      <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-3xl">
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <Lightbulb className="text-emerald-500" />{" "}
          {editingId ? "تعديل المجال" : "إضافة مجال جديد"}
        </h2>
        
        <div>
          <input
            placeholder="العنوان"
            value={newField.title}
            onChange={(e) =>
              setNewField({ ...newField, title: e.target.value })
            }
            className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 text-white"
          />
        </div>

        <textarea
          placeholder="الوصف"
          value={newField.description}
          onChange={(e) =>
            setNewField({ ...newField, description: e.target.value })
          }
          className="w-full mt-4 bg-[#111111] border border-gray-800 rounded-xl p-4 text-white h-24"
        />
        
        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={handleSaveField}
            className="bg-emerald-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
          >
            {editingId ? <Save size={18} /> : <Plus size={18} />}{" "}
            {editingId ? "حفظ التعديلات" : "إضافة للمجالات"}
          </button>
          
          {editingId && (
            <button
              onClick={() => {
                setEditingId(null);
                setNewField({ title: "", description: "" });
              }}
              className="text-gray-500 underline cursor-pointer"
            >
              إلغاء
            </button>
          )}
        </div>
      </div>

      {/* عرض السجلات المجلوبة من Supabase */}
      <div className="grid gap-4">
        {creativeFields.map((field) => (
          <div
            key={field.id}
            className="bg-[#111111] border border-gray-800 p-6 rounded-2xl flex justify-between items-center text-white"
          >
            <div>
              <h3 className="font-bold">{field.title}</h3>
              <p className="text-gray-400 text-sm">{field.description}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit(field)}
                className="text-blue-400 p-2 cursor-pointer"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={() => deleteField(field.id)}
                className="text-red-400 p-2 cursor-pointer"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 3. قسم "لماذا تختارني؟" */}
      <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-3xl">
        <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3">
          <CheckCircle2 className="text-emerald-500" /> لماذا تختارني؟
        </h2>
        <input
          placeholder="عنوان السبب"
          value={newReason.title}
          onChange={(e) =>
            setNewReason({ ...newReason, title: e.target.value })
          }
          className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 text-white"
        />
        <textarea
          placeholder="الوصف"
          value={newReason.description}
          onChange={(e) =>
            setNewReason({ ...newReason, description: e.target.value })
          }
          className="w-full mt-4 bg-[#111111] border border-gray-800 rounded-xl p-4 text-white h-24"
        />
        <button
          onClick={addReason}
          className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-xl font-bold flex items-center gap-2 cursor-pointer"
        >
          <Save size={18} />
          إضافة للسبب
        </button>

        {/* عرض القائمة */}
        <div className="mt-8 space-y-2">
          {reasons.map((r) => (
            <div
              key={r.id}
              className="flex justify-between items-center bg-[#111111] p-4 rounded-xl border border-gray-800 text-white"
            >
              <div>
                <p className="font-bold">{r.title}</p>
                <p className="text-gray-400 text-sm">{r.description}</p>
              </div>
              <button
                onClick={async () => {
                  await supabase.from("why_choose").delete().eq("id", r.id);
                  fetchFields();
                }}
                className="text-red-500 p-2 cursor-pointer"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;