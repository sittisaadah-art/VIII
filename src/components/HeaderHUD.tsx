import React from 'react';
import {
  RotateCcw,
  RotateCw,
  Orbit,
  ZoomIn,
  ZoomOut,
  LayoutGrid,
  Brain,
  Utensils,
  Hammer,
  GraduationCap,
  FileSpreadsheet,
  Volume2,
  VolumeX,
  Settings,
  Eye,
  Globe,
  Sparkles
} from 'lucide-react';
import { playSFX } from '../utils/audio';

interface HeaderHUDProps {
  schoolName: string;
  onRotateCamera: (delta: number) => void;
  onZoomCamera: (delta: number) => void;
  isAutoOrbit: boolean;
  onToggleAutoOrbit: () => void;
  isSplitScreen: boolean;
  onToggleSplitScreen: () => void;
  cameraFocus: 'ALL' | number;
  onSetCameraFocus: (focus: 'ALL' | number) => void;
  isAudioOn: boolean;
  onToggleAudio: () => void;
  onOpenQuiz: () => void;
  onOpenCanteen: () => void;
  onOpenBuilder: () => void;
  onOpenTeacher: () => void;
  onOpenRecap: () => void;
  onOpenHosting: () => void;
  onOpenMainMenu: () => void;
  playerCount: number;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  schoolName,
  onRotateCamera,
  onZoomCamera,
  isAutoOrbit,
  onToggleAutoOrbit,
  isSplitScreen,
  onToggleSplitScreen,
  cameraFocus,
  onSetCameraFocus,
  isAudioOn,
  onToggleAudio,
  onOpenQuiz,
  onOpenCanteen,
  onOpenBuilder,
  onOpenTeacher,
  onOpenRecap,
  onOpenHosting,
  onOpenMainMenu,
  playerCount,
}) => {
  return (
    <>
      {/* Top Header Bar */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex justify-between items-start pointer-events-auto z-20 flex-wrap gap-2">
        
        {/* Branding Title */}
        <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-xl border-2 border-amber-400 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-xl flex items-center justify-center text-white shadow-inner font-bold text-xl">
            🏙️
          </div>
          <div>
            <h1 className="font-heading text-base md:text-lg font-bold text-slate-800 leading-none flex items-center gap-1.5">
              Edublox City
              <span className="text-[11px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded-md font-sans font-bold">
                By Sitty
              </span>
            </h1>
            <p className="text-[11px] font-bold text-slate-500 mt-0.5 truncate max-w-[180px] md:max-w-xs">
              {schoolName} • Algoritma & Berpikir Komputasional
            </p>
          </div>
        </div>

        {/* Quick Action Navigation Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          
          {/* Orbit & Zoom Controls */}
          <div className="bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-xl border border-slate-200 flex items-center gap-1 text-slate-700">
            <button
              onClick={() => { playSFX('click'); onRotateCamera(-0.2); }}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center btn-blox bg-slate-50 text-slate-700"
              title="Putar Kiri"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { playSFX('click'); onRotateCamera(0.2); }}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center btn-blox bg-slate-50 text-slate-700"
              title="Putar Kanan"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => { playSFX('click'); onToggleAutoOrbit(); }}
              className={`px-2.5 h-8 rounded-xl flex items-center gap-1 text-xs font-bold btn-blox ${
                isAutoOrbit ? 'bg-amber-300 text-amber-900 border-b-2 border-amber-500' : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
              }`}
              title="Putar 360 Otomatis"
            >
              <Orbit className="w-3.5 h-3.5" /> 360°
            </button>
            <button
              onClick={() => { playSFX('click'); onZoomCamera(-10); }}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center btn-blox bg-slate-50 text-slate-700"
              title="Perbesar"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => { playSFX('click'); onZoomCamera(10); }}
              className="w-8 h-8 rounded-xl hover:bg-slate-100 flex items-center justify-center btn-blox bg-slate-50 text-slate-700"
              title="Perkecil"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          {/* Hosting & Domain Button - Highlighted for User Prompt */}
          <button
            onClick={() => { playSFX('click'); onOpenHosting(); }}
            className="btn-blox bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg border-b-3 border-indigo-800"
            title="Kelola Hosting Publik & Domain"
          >
            <Globe className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            <span>Hosting & Domain</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          </button>

          {/* Split Screen Toggle */}
          <button
            onClick={() => { playSFX('click'); onToggleSplitScreen(); }}
            className={`btn-blox px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg ${
              isSplitScreen ? 'btn-blox-yellow text-slate-900' : 'btn-blox-purple text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Layar Bagi 4:</span> {isSplitScreen ? 'ON' : 'OFF'}
          </button>

          {/* Quiz Button */}
          <button
            onClick={() => { playSFX('click'); onOpenQuiz(); }}
            className="btn-blox btn-blox-yellow text-slate-950 px-3.5 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-lg animate-pulse"
          >
            <Brain className="w-4 h-4 text-purple-700" />
            <span>Kuis Serentak!</span>
          </button>

          {/* Canteen Button */}
          <button
            onClick={() => { playSFX('click'); onOpenCanteen(); }}
            className="btn-blox btn-blox-pink text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <Utensils className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Kantin Jajan</span>
          </button>

          {/* Builder Button */}
          <button
            onClick={() => { playSFX('click'); onOpenBuilder(); }}
            className="btn-blox btn-blox-green text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <Hammer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">+ Ornamen & Literasi</span>
          </button>

          {/* Teacher AI & Custom Button */}
          <button
            onClick={() => { playSFX('click'); onOpenTeacher(); }}
            className="btn-blox btn-blox-blue text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Custom & AI Soal</span>
          </button>

          {/* Recap Button */}
          <button
            onClick={() => { playSFX('click'); onOpenRecap(); }}
            className="btn-blox bg-amber-500 hover:bg-amber-400 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg border-b-3 border-amber-700"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden lg:inline">Rekap Spreadsheet</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleAudio}
            className="w-9 h-9 rounded-xl bg-white/95 backdrop-blur-md shadow-xl border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm btn-blox"
            title={isAudioOn ? 'Matikan Suara' : 'Nyalakan Suara'}
          >
            {isAudioOn ? <Volume2 className="w-4 h-4 text-emerald-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
          </button>

          {/* Settings / Main Menu */}
          <button
            onClick={() => { playSFX('click'); onOpenMainMenu(); }}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-white shadow-xl flex items-center justify-center font-bold text-sm btn-blox"
            title="Pengaturan Kelas & Pemain"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera Focus Selector Sub-bar */}
      <div className="absolute top-16 left-2.5 pointer-events-auto z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-200 shadow-md text-xs">
        <span className="font-bold text-slate-500 px-1 flex items-center gap-1 text-[11px]">
          <Eye className="w-3 h-3 text-slate-400" /> Fokus:
        </span>
        <button
          onClick={() => { playSFX('click'); onSetCameraFocus('ALL'); }}
          className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
            cameraFocus === 'ALL' ? 'bg-slate-800 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Semua
        </button>
        {Array.from({ length: playerCount }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => { playSFX('click'); onSetCameraFocus(idx); }}
            className={`px-2 py-0.5 rounded-lg font-bold text-[11px] transition ${
              cameraFocus === idx
                ? 'bg-amber-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            P{idx + 1}
          </button>
        ))}
      </div>
    </>
  );
};
