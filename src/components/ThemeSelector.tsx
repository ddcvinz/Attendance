import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../ThemeContext';
import { Palette, Check, Sparkles } from 'lucide-react';

export const ThemeSelector: React.FC = () => {
  const { themeId, theme, setThemeId, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        id="btn-theme-selector"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all border border-current/20 hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-amber-400"
        title="Change Classroom Attendance Theme"
      >
        <Palette className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{theme.name}</span>
        <div className="flex items-center -space-x-1">
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white/60"
            style={{ backgroundColor: theme.dotColor }}
          />
          <span
            className="w-2.5 h-2.5 rounded-full ring-1 ring-white/60"
            style={{ backgroundColor: theme.accentDot }}
          />
        </div>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl bg-white text-slate-900 shadow-2xl border border-slate-200 z-50 p-2 animate-in fade-in slide-in-from-top-2">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Classroom Theme
              </span>
            </div>
            <span className="text-[10px] text-slate-600 font-medium">Instant Switch</span>
          </div>

          <div className="mt-1 space-y-1 max-h-80 overflow-y-auto p-1">
            {availableThemes.map((t) => {
              const isSelected = t.id === themeId;
              return (
                <button
                  key={t.id}
                  id={`theme-option-${t.id}`}
                  type="button"
                  onClick={() => {
                    setThemeId(t.id);
                    setIsOpen(false);
                  }}
                  className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between group ${
                    isSelected
                      ? 'bg-slate-100 ring-1 ring-slate-300 font-bold'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center -space-x-1.5 shrink-0">
                      <div
                        className="w-5 h-5 rounded-full shadow-xs border border-white"
                        style={{ backgroundColor: t.dotColor }}
                      />
                      <div
                        className="w-5 h-5 rounded-full shadow-xs border border-white"
                        style={{ backgroundColor: t.accentDot }}
                      />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        {t.name}
                        {t.id === 'red_yellow' && (
                          <span className="text-[9px] bg-yellow-100 text-yellow-900 border border-yellow-300 px-1.5 py-0.2 rounded font-semibold">
                            Default
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-600 leading-tight">
                        {t.tagline}
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
