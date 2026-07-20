import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { ImageIcon, Share2, Info, Trash2, Save, Loader2 } from "lucide-react";
import { FaBehance, FaInstagram, FaLinkedin, FaYoutube, FaFacebook, FaTiktok, FaWhatsapp } from "react-icons/fa";

// مكون فرعي للحقول (نظيف وقابل لإعادة الاستخدام)
const SettingField = ({ label, value, onChange, placeholder }) => (
  <div className="mb-4">
    <label className="text-[11px] font-bold text-blue-300 mb-1 flex items-center gap-1 uppercase tracking-wider">
      <Info size={10} /> {label}
    </label>
    <input
      value={value || ""}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#050505] p-3 rounded-xl border border-white/10 text-sm focus:border-blue-500 outline-none transition-all text-white"
    />
  </div>
);

// مكون القسم الموحد
const ProSection = ({ title, icon: Icon, children }) => (
  <div className="bg-[#0a0a0a] p-7 my-8 rounded-3xl border border-white/5">
    <h2 className="text-lg font-bold flex items-center gap-2 mb-6 text-blue-100">
      <Icon size={20} className="text-blue-400" /> {title}
    </h2>
    {children}
  </div>
);

// خريطة لأيقونات السوشيال ميديا لعرضها بجانب السجلات
const socialIconMap = {
  instagram: FaInstagram,
  behance: FaBehance,
  linkedin: FaLinkedin,
  whatsapp: FaWhatsapp,
  youtube: FaYoutube,
  facebook: FaFacebook,
  tiktok: FaTiktok,
};

const ProSettingsPage = () => {
  const [logoLink, setLogoLink] = useState("");
  const [logoLogs, setLogoLogs] = useState([]);
  const [socialData, setSocialData] = useState({
    facebook: "",
    instagram: "",
    linkedin: "",
    behance: "",
    youtube: "",
    tiktok: "",
    whatsapp: "",
  });
  const [socialLogs, setSocialLogs] = useState([]);
  const [savingPlatform, setSavingPlatform] = useState(null);

  // جلب البيانات (يتم استدعاؤها بعد كل عملية حفظ أو حذف)
  const fetchData = async () => {
    // 1. جلب اللوجو
    const { data: logoData } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "logo_url");
    if (logoData)
      setLogoLogs(logoData.map((l) => ({ id: l.id, text: l.value })));

    // 2. جلب السوشيال ميديا
    const { data: socialRes } = await supabase.from("social_links").select("*");
    if (socialRes) {
      setSocialLogs(socialRes);
      const formatted = {};
      socialRes.forEach((item) => {
        if (item.platform) {
          formatted[item.platform.toLowerCase()] = item.url || "";
        }
      });
      setSocialData((prev) => ({ ...prev, ...formatted }));
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- دوال اللوجو ---
  const saveLogo = async () => {
    if (!logoLink.trim()) return;
    const { error } = await supabase
      .from("site_settings")
      .insert({ key: "logo_url", value: logoLink });
    
    if (error) {
      alert("خطأ أثناء حفظ اللوجو: " + error.message);
      return;
    }

    setLogoLink("");
    fetchData();
  };

  const deleteLogo = async (id) => {
    await supabase.from("site_settings").delete().eq("id", id);
    fetchData();
  };

  // --- دوال السوشيال ميديا ---
  const handleSaveSocial = async (platform, url) => {
    if (!url || !url.trim()) {
      alert("الرابط فارغ!");
      return;
    }

    setSavingPlatform(platform);

    try {
      // 1. نبحث هل المنصة موجودة مسبقاً في الجدول أم لا
      const { data: existing } = await supabase
        .from("social_links")
        .select("id")
        .eq("platform", platform.toLowerCase())
        .single();

      let error;

      if (existing) {
        // إذا كانت موجودة، نقوم بتحديث الرابط بناءً على الـ id
        const res = await supabase
          .from("social_links")
          .update({ url: url.trim() })
          .eq("id", existing.id);
        error = res.error;
      } else {
        // إذا لم تكن موجودة، نقوم بإضافتها كجديدة
        const res = await supabase
          .from("social_links")
          .insert({ platform: platform.toLowerCase(), url: url.trim() });
        error = res.error;
      }

      if (error) throw error;

      alert(`تم حفظ رابط ${platform} بنجاح`);
      await fetchData(); // تحديث القائمة فوراً
    } catch (error) {
      console.error("خطأ في الحفظ:", error);
      alert("حدث خطأ أثناء الحفظ: " + error.message);
    } finally {
      setSavingPlatform(null);
    }
  };

  const deleteSocial = async (platform) => {
    const { error } = await supabase
      .from("social_links")
      .delete()
      .eq("platform", platform);

    if (error) {
      alert("خطأ أثناء الحذف: " + error.message);
      return;
    }

    setSocialData((prev) => ({ ...prev, [platform]: "" }));
    fetchData();
  };

  return (
    <div className="max-w-9xl mx-auto text-white min-h-screen p-4">
      <div className="relative flex flex-col items-center py-12 mb-12 rounded-[2rem] bg-[#0a0a0a] border border-white/5 shadow-2xl overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-blue-500/10 blur-[80px]" />
        <h1 className="text-4xl font-black text-white mb-4 relative z-10">
          الاعدادت
        </h1>
        <p className="text-gray-400 text-xs uppercase tracking-[0.3em] bg-white/5 px-4 py-1 rounded-full border border-white/5">
          إدارة المواقع
        </p>
      </div>

      {/* قسم اللوجو */}
      <ProSection title="الهيدر واللوجو" icon={ImageIcon}>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <SettingField
              label="رابط اللوجو"
              value={logoLink}
              onChange={(e) => setLogoLink(e.target.value)}
              placeholder="https://..."
            />
          </div>
          {logoLink && (
            <img
              src={logoLink}
              className="h-12 w-12 rounded-lg object-cover border border-white/10"
              alt="preview"
            />
          )}
        </div>
        <button
          onClick={saveLogo}
          className="w-full bg-blue-600 hover:bg-blue-700 transition-all py-3 rounded-xl font-bold text-sm cursor-pointer"
        >
          حفظ اللوجو
        </button>

        <div className="mt-6 space-y-2">
          {logoLogs.map((log) => (
            <div
              key={log.id}
              className="flex justify-between items-center bg-black p-3 rounded-lg border border-white/5 text-xs"
            >
              <div className="flex items-center gap-3">
                <img
                  src={log.text}
                  className="h-6 w-6 rounded object-cover"
                  alt="logo"
                />
                <span className="truncate max-w-[200px]">{log.text}</span>
              </div>
              <button
                onClick={() => deleteLogo(log.id)}
                className="text-red-400 hover:text-red-300 cursor-pointer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </ProSection>

      {/* قسم السوشيال ميديا */}
      <ProSection title="روابط السوشيال ميديا" icon={Share2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.keys(socialData).map((key) => (
            <div key={key} className="flex items-end gap-2">
              <div className="flex-1">
                <SettingField
                  label={key}
                  value={socialData[key]}
                  onChange={(e) =>
                    setSocialData((prev) => ({
                      ...prev,
                      [key]: e.target.value,
                    }))
                  }
                  placeholder={`رابط ${key}`}
                />
              </div>
              <button
                onClick={() => handleSaveSocial(key, socialData[key])}
                disabled={savingPlatform === key}
                className="mb-4 p-3 bg-blue-600 rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center cursor-pointer min-h-[46px] min-w-[46px]"
              >
                {savingPlatform === key ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Save size={18} />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* عرض السجلات مع الأيقونة والرابط وزر الحذف */}
        <div className="mt-8 space-y-3">
          <h3 className="font-bold mb-4 text-sm text-gray-400 uppercase">
            السجلات المسجلة (Logs):
          </h3>
          {socialLogs.length === 0 ? (
            <p className="text-stone-500 text-xs">لا توجد روابط مسجلة حتى الآن.</p>
          ) : (
            socialLogs.map((log) => {
              const PlatformIcon = socialIconMap[log.platform?.toLowerCase()] || Share2;
              return (
                <div
                  key={log.id || log.platform}
                  className="flex justify-between items-center bg-black p-4 rounded-xl border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-blue-400">
                      <PlatformIcon size={16} />
                    </div>
                    <span className="text-blue-400 uppercase font-bold text-xs">
                      {log.platform}
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <span className="text-[11px] text-gray-400 truncate max-w-[200px]">
                      {log.url}
                    </span>
                    <button
                      onClick={() => deleteSocial(log.platform)}
                      className="text-red-400 hover:text-red-300 cursor-pointer p-1"
                      title="حذف"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ProSection>
    </div>
  );
};

export default ProSettingsPage;