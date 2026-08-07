import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[#e8dcc4] bg-[#f6efe1]/95 px-4 py-6">
      <div className="mx-auto flex max-w-screen-xl flex-col gap-3 text-center text-sm text-[#6b5a34] md:flex-row md:items-center md:justify-between md:text-left">
        <p className="font-medium text-[#4f4124]">
          © {year} JapaWise. Lagos route help made simple.
        </p>
        <p>
          Built for danfo, keke, and okada commuters.
        </p>
      </div>
    </footer>
  );
};

export default Footer;