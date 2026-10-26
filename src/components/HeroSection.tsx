import React from 'react';
import { ArrowRight } from 'lucide-react';

interface HeroSectionProps {
  onAnalyzeClick: () => void;
  onHowItWorksClick: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onAnalyzeClick,
  onHowItWorksClick,
}) => {
  return (
    <section
      id="home"
      className="scroll-mt-20 pt-16 pb-20 md:pt-24 md:pb-24 px-6 bg-[#FFFFFF] border-b border-[#E5E7EB]"
    >
      <div className="max-w-[780px] mx-auto text-center">
        <p className="text-xs font-semibold tracking-wider text-[#6D5EF7] mb-4">
          AI-Powered Resume Analysis
        </p>

        <h1
          className="text-4xl sm:text-5xl md:text-[54px] font-bold tracking-tight text-[#172033] leading-[1.12] mb-6"
          style={{ textWrap: 'balance' }}
        >
          Make Your Resume Stand Out.
        </h1>

        <p
          className="text-base sm:text-lg text-[#64748B] leading-relaxed max-w-[600px] mx-auto mb-9"
          style={{ textWrap: 'balance' }}
        >
          Discover your strengths, identify skill gaps, and align your resume with your next opportunity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
          <button
            type="button"
            onClick={onAnalyzeClick}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-[#6D5EF7] hover:bg-[#5B4CE1] rounded-[12px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6D5EF7]"
          >
            <span>Analyze My Resume</span>
            <ArrowRight className="w-4 h-4 shrink-0" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={onHowItWorksClick}
            className="w-full sm:w-auto inline-flex items-center justify-center px-5 py-3.5 text-sm font-medium text-[#172033] hover:text-[#6D5EF7] transition-colors cursor-pointer rounded-[12px]"
          >
            How it works
          </button>
        </div>

        {/* Three short benefits rendered as clean unboxed metadata with typographic separators */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-y-2 sm:gap-x-4 text-sm text-[#64748B] pt-2">
          <span className="font-medium text-[#172033]">Resume-job matching</span>
          <span aria-hidden="true" className="hidden sm:inline text-[#E5E7EB]">•</span>
          <span className="font-medium text-[#172033]">Skill gap analysis</span>
          <span aria-hidden="true" className="hidden sm:inline text-[#E5E7EB]">•</span>
          <span className="font-medium text-[#172033]">Actionable suggestions</span>
        </div>
      </div>
    </section>
  );
};
