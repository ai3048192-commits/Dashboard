import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import HomePage from "./pages/HomePage";
import Requests from "./pages/Requests";
import About from "./pages/About";
import Services from "./pages/Services";
import Work from "./pages/Work";
import Details from "./pages/Details";
import Settings from "./pages/Settings";

import "./index.css";

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen overflow-hidden" dir="rtl">
        {/* السايدبار: نمرر له الحالة ليتحكم في الفتح والإغلاق */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* منطقة المحتوى الرئيسية */}
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          {/* الهيدر: نمرر له دالة فتح السايدبار */}
          <Header toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

          {/* المحتوى المتغير: نضع له padding ليظهر بوضوح تحت الهيدر */}
          <main className="flex-1 overflow-y-auto p-6">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/requests" element={<Requests />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/portfolio" element={<Work />} />
              <Route path="/partners" element={<Details />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
