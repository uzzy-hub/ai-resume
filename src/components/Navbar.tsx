import React, { useState } from 'react';
import { FileSearch, Menu, X } from 'lucide-react';

interface NavbarProps {
  onNavigate: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(sectionId);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FFFFFF]/95 backdrop-blur-xs border-b border-[#E5E7EB]">
      <div className="max-w-[1160px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Title (One line) */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, 'home')}
          className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-[#172033] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#6D5EF7] rounded-md"
        >
          <FileSearch className="w-5 h-5 text-[#6D5EF7] shrink-0" aria-hidden="true" />
          <span>ResumeIQ</span>
        </a>

        {/* Zone 2: 4 Single-line Navigation Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 text-sm font-medium text-[#64748B]">
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="hover:text-[#172033] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Home
          </a>
          <a
            href="#analyze-workspace"
            onClick={(e) => handleNavClick(e, 'analyze-workspace')}
            className="hover:text-[#172033] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            Analyze Resume
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className="hover:text-[#172033] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            How It Works
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            className="hover:text-[#172033] transition-colors whitespace-nowrap shrink-0 py-1"
          >
            About
          </a>
        </nav>

        {/* Zone 3: 1 Primary Action + Mobile Menu Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={(e) => handleNavClick(e, 'analyze-workspace')}
            className="hidden sm:inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE1] rounded-[10px] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D5EF7]"
          >
            Analyze My Resume
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center w-10 h-10 text-[#172033] hover:bg-[#F8FAFC] rounded-[10px] border border-[#E5E7EB] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Responsive Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <nav
          aria-label="Mobile Navigation"
          className="md:hidden bg-[#FFFFFF] border-b border-[#E5E7EB] px-6 py-4 flex flex-col gap-3"
        >
          <a
            href="#home"
            onClick={(e) => handleNavClick(e, 'home')}
            className="py-2 text-sm font-medium text-[#172033] hover:text-[#6D5EF7] transition-colors"
          >
            Home
          </a>
          <a
            href="#analyze-workspace"
            onClick={(e) => handleNavClick(e, 'analyze-workspace')}
            className="py-2 text-sm font-medium text-[#172033] hover:text-[#6D5EF7] transition-colors"
          >
            Analyze Resume
          </a>
          <a
            href="#how-it-works"
            onClick={(e) => handleNavClick(e, 'how-it-works')}
            className="py-2 text-sm font-medium text-[#172033] hover:text-[#6D5EF7] transition-colors"
          >
            How It Works
          </a>
          <a
            href="#about"
            onClick={(e) => handleNavClick(e, 'about')}
            className="py-2 text-sm font-medium text-[#172033] hover:text-[#6D5EF7] transition-colors"
          >
            About
          </a>
          <button
            type="button"
            onClick={(e) => handleNavClick(e, 'analyze-workspace')}
            className="mt-1 w-full py-2.5 px-4 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE1] rounded-[10px] transition-colors text-center"
          >
            Analyze My Resume
          </button>
        </nav>
      )}
    </header>
  );
};
