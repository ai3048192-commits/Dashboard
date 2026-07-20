import { Menu, Bell, User, Search } from 'lucide-react';

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="bg-[#0a0a0a] p-4 flex items-center justify-between shadow-md sticky top-0 z-40 border-b border-[#1f1f1f]">
      
      {/* زر القائمة - لون أزرق صلب */}
      <button 
        onClick={toggleSidebar} 
        className="lg:hidden p-2 bg-[#1a1a1a] text-blue-500 rounded-xl hover:bg-[#252525] transition-all border border-[#333]"
      >
        <Menu size={22} />
      </button>

      {/* شريط البحث - خلفية صلبة داكنة */}
      <div className="hidden md:flex items-center bg-[#121212] px-4 py-2 rounded-xl border border-[#1f1f1f]">
        <Search size={18} className="text-gray-500" />
        <input 
          type="text" 
          placeholder="بحث في الطلبات..." 
          className="bg-transparent border-none outline-none mr-3 text-sm text-white placeholder:text-gray-600 w-64"
        />
      </div>

      {/* العنوان للموبايل */}
      <h1 className="text-lg font-bold text-white lg:hidden">لوحة التحكم</h1>

      {/* الجانب الأيمن */}
      <div className="flex items-center gap-4">
        
   
        
        {/* الملف الشخصي - خلفية صلبة */}
        <div className="flex items-center gap-3 border-r border-[#1f1f1f] pr-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">أحمد إسماعيل</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Administrator</p>
          </div>
          
          {/* Avatar - لون أزرق صلب */}
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
            <User size={20} />
          </div>
        </div>
      </div>
    </header>
  );
}