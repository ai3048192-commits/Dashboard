import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-4 px-6 text-center">
      <div className="text-sm text-gray-500">
        &copy; {new Date().getFullYear()} جميع الحقوق محفوظة لـ لوحة التحكم الخاصة بك.
      </div>
    </footer>
  );
};

export default Footer;