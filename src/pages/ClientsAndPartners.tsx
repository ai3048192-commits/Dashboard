import React, { useState, useEffect } from 'react';
import { Handshake, Edit3, Trash2, Save, Plus, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export default function PartnersManager() {
  const [partners, setPartners] = useState([]);
  const [name, setName] = useState('');
  const [imageFile, setImageFile] = useState(null); // ملف الصورة الحقيقي
  const [imagePreview, setImagePreview] = useState(''); // لمعاينة الصورة محلياً
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 1. جلب البيانات من Supabase عند التحميل
  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('partners').select('*').order('id', { ascending: false });
    if (error) {
      setError('فشل في جلب البيانات: ' + error.message);
    } else {
      setPartners(data || []);
    }
    setLoading(false);
  };

  // 2. التعامل مع اختيار الصورة ومعاينتها
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // 3. رفع الصورة إلى Supabase Storage والحصول على الرابط
  const uploadImageToSupabase = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('partners-images')
      .upload(filePath, file);

    if (uploadError) {
      throw new Error('فشل رفع الصورة: ' + uploadError.message);
    }

    // جلب الرابط العام للصورة
    const { data } = supabase.storage.from('partners-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // 4. الحفظ (إضافة أو تعديل)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('الرجاء إدخال اسم شريك النجاح');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let imageUrl = imagePreview; // القديمة أو المعاينة المؤقتة

      // لو فيه ملف صورة جديد تم اختياره، نرفعه للـ Storage الأول
      if (imageFile) {
        imageUrl = await uploadImageToSupabase(imageFile);
      }

      if (editId) {
        // تعديل في قاعدة البيانات (الاسم والصورة فقط)
        const { error } = await supabase
          .from('partners')
          .update({ name, image_url: imageUrl })
          .eq('id', editId);

        if (error) throw error;
        alert('✅ تم تعديل بيانات الشريك بنجاح!');
        setEditId(null);
      } else {
        // إضافة جديد في قاعدة البيانات (الاسم والصورة فقط)
        const { error } = await supabase
          .from('partners')
          .insert([{ name, image_url: imageUrl }]);

        if (error) throw error;
        alert('✅ تمت إضافة شريك النجاح بنجاح!');
      }

      // تصفير الفورم وإعادة جلب البيانات
      setName('');
      setImageFile(null);
      setImagePreview('');
      fetchPartners();

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 5. تجهيز التعديل
  const handleEdit = (partner) => {
    setEditId(partner.id);
    setName(partner.name);
    setImagePreview(partner.image_url);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 6. الحذف من قاعدة البيانات
  const handleDelete = async (id) => {
    if (!window.confirm('هل تريد حذف شريك النجاح هذا؟')) return;

    setLoading(true);
    const { error } = await supabase.from('partners').delete().eq('id', id);

    if (error) {
      setError('فشل الحذف: ' + error.message);
    } else {
      setPartners(partners.filter(p => p.id !== id));
      alert('✅ تم الحذف بنجاح!');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-9xl mx-auto space-y-12">
        
        {/* الهيدر الفخم */}
        <div className="relative flex flex-col items-center py-12 mb-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-emerald-500/10 blur-[80px]" />
          <h1 className="text-4xl font-black text-white mb-4 relative z-10">
            شركاء النجاح
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">
            لوحة التحكم الاحترافية | إدارة أسماء وشعارات شركاء النجاح
          </p>
        </div>

        {/* رسائل الخطأ */}
        {error && (
          <div className="bg-red-500/20 border border-red-500 rounded-xl p-4 text-red-200">
            {error}
          </div>
        )}

        {/* نموذج الإضافة / التعديل (الاسم والصورة فقط) */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Handshake className="text-emerald-500" /> 
            {editId ? 'تعديل شريك النجاح' : 'إضافة شريك نجاح جديد'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="w-full">
              <input
                type="text"
                placeholder="اسم الشريك (الشركة أو العلامة التجارية)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#111111] border border-gray-800 rounded-xl p-4 outline-none focus:border-emerald-500 transition text-white"
                required
              />
            </div>

            {/* رفع الصورة ومعاينتها */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
              <img 
                src={imagePreview || 'https://via.placeholder.com/150'} 
                alt="معاينة الشعار" 
                className="w-16 h-16 rounded-full object-cover border border-gray-800 shadow-md bg-black"
              />
              <div className="flex-1 w-full">
                <label className="block text-sm text-gray-400 mb-2">تحميل شعار الشريك الصافي من الجهاز</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageChange}
                  className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2.5 file:px-4
                    file:rounded-xl file:border-0
                    file:text-sm file:font-bold
                    file:bg-emerald-500/20 file:text-emerald-400
                    hover:file:bg-emerald-500/30 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              {editId && (
                <button
                  type="button"
                  onClick={() => { setEditId(null); setName(''); setImagePreview(''); setImageFile(null); }}
                  className="bg-gray-800 px-6 py-2.5 rounded-xl text-gray-300 font-bold flex items-center gap-2 hover:bg-gray-700 transition"
                >
                  <X size={18} /> إلغاء
                </button>
              )}
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 px-6 py-2.5 rounded-xl text-black font-bold flex items-center gap-2 disabled:opacity-50 hover:bg-emerald-400 transition"
              >
                {editId ? <Save size={18} /> : <Plus size={18} />}
                {loading ? "جاري الحفظ..." : editId ? "حفظ التعديلات" : "حفظ في القاعدة"}
              </button>
            </div>
          </form>
        </div>

        {/* عرض السجلات من قاعدة البيانات (الاسم والصورة فقط) */}
        <div className="bg-[#0a0a0a] border border-gray-800 p-8 rounded-3xl shadow-2xl">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Handshake className="text-emerald-500" /> سجلات شركاء النجاح ({partners.length})
          </h2>

          {partners.length === 0 ? (
            <p className="text-gray-500 text-center py-8">لا يوجد شركاء مسجلين حالياً.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {partners.map((partner) => (
                <div
                  key={partner.id}
                  className="bg-[#111111] p-4 rounded-xl border border-gray-800 flex justify-between items-center gap-4 hover:border-emerald-500/30 transition"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={partner.image_url || 'https://via.placeholder.com/150'} 
                      alt={partner.name} 
                      className="w-12 h-12 rounded-full object-cover border border-gray-800 bg-black" 
                    />
                    <div>
                      <h3 className="font-bold text-emerald-400">{partner.name}</h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(partner)}
                      disabled={loading}
                      className="p-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition"
                      title="تعديل"
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(partner.id)}
                      disabled={loading}
                      className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}