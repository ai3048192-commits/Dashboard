import {
  LayoutGrid,
  User,
  Palette,
  Briefcase,
  Award,
  Settings,
  LogOut,
  X,
  PenTool,
  ClipboardList,
  Globe,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

// تعريف الأنواع لضمان صحة الكود (TypeScript)
interface MenuItem {
  name: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { name: "الرئيسية", icon: LayoutGrid, path: "/" },
  { name: "طلبات المشاريع", icon: ClipboardList, path: "/requests" },
  { name: "من أنا", icon: User, path: "/about" },
  { name: "خدماتي", icon: Palette, path: "/services" },
  { name: "أعمالي", icon: Briefcase, path: "/portfolio" },
  { name: " التفاصيل اعمال ", icon: Award, path: "/partners" },
  { name: "الإعدادات", icon: Settings, path: "/settings" },
  { name: "العودة للموقع", icon: Globe, path: "http://localhost:5173/" },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay للموبايل */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-screen w-72 bg-[#0a0a0a] text-white z-50 border-l border-[#1f1f1f] shadow-2xl transform transition-transform duration-500 ease-in-out lg:translate-x-0 lg:static ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="h-1 w-full bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600" />

        <div className="p-8">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                <PenTool className="text-blue-400" size={24} />
              </div>
              <h1 className="text-xl font-bold tracking-widest uppercase">
                Designer
              </h1>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden p-2 bg-[#1f1f1f] rounded-xl hover:bg-[#333] transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`group relative flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-medium text-sm ${
                    isActive
                      ? "bg-gradient-to-r from-blue-600/20 to-transparent border border-blue-500/30 text-white"
                      : "text-gray-500 hover:text-gray-200 hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <Icon
                      size={20}
                      className={
                        isActive ? "text-blue-400" : "group-hover:text-blue-300"
                      }
                    />
                    {item.name}
                  </div>

                  {item.badge && (
                    <span className="bg-blue-600 text-[10px] text-white px-2 py-0.5 rounded-full shadow-[0_0_10px_rgba(37,99,235,0.5)]">
                      {item.badge}
                    </span>
                  )}

                  {isActive && (
                    <div className="absolute left-4 w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_10px_#3b82f6]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="absolute bottom-10 w-full px-8">
          <button className="flex w-full items-center gap-4 p-4 text-gray-500 hover:text-white hover:bg-red-500/10 rounded-2xl transition-all font-bold">
            <LogOut size={20} />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
