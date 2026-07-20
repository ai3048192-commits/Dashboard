import React, { useEffect, useState } from "react";
import { Image, Trash2, Edit } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

const ProGraphicDashboard = () => {
  const [portfolios, setPortfolios] = useState([]);
  const [newPort, setNewPort] = useState({
    id: null,
    title: "",
    desc: "",
    img: "",
  });

  const fetchPortfolios = async () => {
    const { data, error } = await supabase
      .from("portfolio_projects")
      .select("*");
    if (data) setPortfolios(data);
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const savePortfolio = async () => {
    if (!newPort.title || !newPort.img) return alert("يرجى إكمال البيانات!");

    if (newPort.id) {
      // عملية تعديل (Update)
      await supabase
        .from("portfolio_projects")
        .update({
          title: newPort.title,
          description: newPort.desc,
          image_url: newPort.img,
        })
        .eq("id", newPort.id);
    } else {
      // عملية إضافة (Insert)
      await supabase.from("portfolio_projects").insert([
        {
          title: newPort.title,
          description: newPort.desc,
          image_url: newPort.img,
        },
      ]);
    }
    setNewPort({ id: null, title: "", desc: "", img: "" });
    fetchPortfolios();
  };

  const deletePortfolio = async (id) => {
    await supabase.from("portfolio_projects").delete().eq("id", id);
    fetchPortfolios();
  };

  const [partners, setPartners] = useState([]);
  const [name, setName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [editingId, setEditingId] = useState(null); // لتحديد هل نحن في وضع تعديل

  // جلب البيانات من Supabase
  const fetchPartners = async () => {
    const { data } = await supabase.from("partners").select("*");
    if (data) setPartners(data);
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  // إضافة أو تعديل شريك
  const handleSubmit = async () => {
    if (!name || !logoUrl) return alert("يرجى تعبئة الحقول");

    if (editingId) {
      // وضع التعديل
      await supabase
        .from("partners")
        .update({ name, logo_url: logoUrl })
        .eq("id", editingId);
      setEditingId(null);
    } else {
      // وضع الإضافة
      await supabase.from("partners").insert([{ name, logo_url: logoUrl }]);
    }

    setName("");
    setLogoUrl("");
    fetchPartners();
  };

  // حذف شريك
  const handleDelete = async (id) => {
    if (!confirm("هل أنت متأكد؟")) return;
    await supabase.from("partners").delete().eq("id", id);
    fetchPartners();
  };

  // تجهيز البيانات للتعديل
  const startEdit = (p) => {
    setEditingId(p.id);
    setName(p.name);
    setLogoUrl(p.logo_url);
  };

  return (
    <div className="== max-w-9xl text-white  space-y-12">
      <div className="relative flex flex-col items-center py-16 mb-12 rounded-[1rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[80px]" />

        <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight relative z-10">
          أعمالنا الإبداعية
        </h1>

        <div className="flex items-center gap-2 mb-6">
          <div className="h-[2px] w-8 bg-blue-500 rounded-full" />
          <div className="h-[2px] w-2 bg-blue-400 rounded-full" />
          <div className="h-[2px] w-2 bg-blue-300 rounded-full" />
        </div>

        <p className="text-gray-400 font-medium text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">
          مساحة لعرض مشاريعنا المختارة
        </p>
      </div>
      
      <section className="max-w-7xl mx-auto p-6 md:p-12">
      
        {/* الفورم: تصميم بطاقة عائمة */}
        <div className="bg-[#0a0a0a]  backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-2xl mb-12">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-400">
              <Edit size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">
              {newPort.id ? "تعديل العمل الحالي" : "إضافة عمل جديد"}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <input
              placeholder="رابط الصورة (URL)"
              value={newPort.img}
              onChange={(e) => setNewPort({ ...newPort, img: e.target.value })}
              className="bg-[#0a0a0a] p-4 rounded-xl border border-white/10 text-white focus:border-blue-500 outline-none transition"
            />
            <input
              placeholder="عنوان المشروع"
              value={newPort.title}
              onChange={(e) =>
                setNewPort({ ...newPort, title: e.target.value })
              }
              className="bg-[#0a0a0a] p-4 rounded-xl border border-white/10 text-white focus:border-blue-500 outline-none transition"
            />
            <textarea
              placeholder="وصف المشروع..."
              value={newPort.desc}
              onChange={(e) => setNewPort({ ...newPort, desc: e.target.value })}
              className="md:col-span-2 bg-[#0a0a0a] p-4 rounded-xl border border-white/10 text-white focus:border-blue-500 outline-none transition h-24 resize-none"
            />

            <div className="md:col-span-2 flex gap-4">
              <button
                onClick={savePortfolio}
                className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition duration-300"
              >
                {newPort.id ? "حفظ التغييرات" : "إضافة العمل للمعرض"}
              </button>
              {newPort.id && (
                <button
                  onClick={() =>
                    setNewPort({ id: null, title: "", desc: "", img: "" })
                  }
                  className="px-6 bg-[#1a1a1a] border border-white/10 hover:border-red-500/50 text-stone-400 rounded-xl transition"
                >
                  إلغاء
                </button>
              )}
            </div>
          </div>
        </div>

        {/* السجلات: تصميم شبكة (Grid) أنيقة */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {portfolios.map((item) => (
            <div
              key={item.id}
              className="group bg-[#111111] rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-56 overflow-hidden">
                <img
                  src={item.image_url}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={item.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111111] to-transparent" />
              </div>

              <div className="p-6">
                <h3 className="text-lg font-bold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-stone-400 text-sm line-clamp-2">
                  {item.description}
                </p>

                <div className="flex gap-4 mt-6 pt-6 border-t border-white/5">
                  <button
                    onClick={() =>
                      setNewPort({
                        id: item.id,
                        title: item.title,
                        desc: item.description,
                        img: item.image_url,
                      })
                    }
                    className="text-blue-400 hover:text-blue-300 transition"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => deletePortfolio(item.id)}
                    className="text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
      <div
        className="w-full max-w-9xl mx-auto p-4 lg:p-8 min-h-screen"
        dir="rtl"
      >
        <div className="bg-[#111111] p-8  max-w-9xl rounded-3xl border border-white/10 shadow-2xl mb-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-white">
            {editingId ? "تعديل بيانات الشريك" : "إضافة شريك جديد"}
          </h2>

          <div className="space-y-4">
            <input
              className="w-full bg-[#1a1a1a] p-4 rounded-xl border border-white/10 focus:border-orange-500 outline-none text-white transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="اسم الشريك"
            />
            <input
              className="w-full bg-[#1a1a1a] p-4 rounded-xl border border-white/10 focus:border-orange-500 outline-none text-white transition-all"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="رابط الصورة (URL)"
            />
            <button
              onClick={handleSubmit}
              className="w-full bg-orange-600 hover:bg-orange-500 py-4 rounded-xl font-bold text-white transition-all transform hover:scale-[1.01] active:scale-[0.99]"
            >
              {editingId ? "حفظ التعديلات" : "إضافة للشركاء"}
            </button>
          </div>
        </div>

        {/* قسم السجلات - جدول واسع وعصري */}
        <div className="bg-[#111111] rounded-3xl p-8 border border-white/10 overflow-hidden">
          <h3 className="text-xl font-semibold mb-6 text-stone-400">
            قائمة الشركاء الحاليين
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="text-stone-500 border-b border-white/10">
                  <th className="p-4">الشعار</th>
                  <th className="p-4">الاسم</th>
                  <th className="p-4 text-left">تحكم</th>
                </tr>
              </thead>
              <tbody>
                {partners.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <div className="w-16 h-16 bg-white/5 rounded-xl flex items-center justify-center p-2 border border-white/5">
                        <img
                          src={p.logo_url}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/48?text=Error";
                          }}
                        />
                      </div>
                    </td>
                    <td className="p-4 font-bold text-lg text-white">
                      {p.name}
                    </td>
                    <td className="p-4 flex gap-4">
                      <button
                        onClick={() => startEdit(p)}
                        className="px-4 py-2 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-all"
                      >
                        تعديل
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-all"
                      >
                        حذف
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProGraphicDashboard;
