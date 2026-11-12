import React, { useState } from 'react';
import { BuildingData, Question } from '../types/game';
import { Sparkles, Plus, GraduationCap, Building, Loader2, CheckCircle2 } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  buildings: Record<string, BuildingData>;
  onUpdateBuilding: (code: string, updated: Partial<BuildingData>) => void;
  onAddBuilding: () => void;
}

export const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  buildings,
  onUpdateBuilding,
  onAddBuilding,
}) => {
  const [aiPrompt, setAiPrompt] = useState(
    'Buat soal pilihan ganda Informatika kelas VIII tentang penelusuran (tracing) algoritma dan diagram alir (flowchart)'
  );
  const [targetBuilding, setTargetBuilding] = useState('A');
  const [aiMode, setAiMode] = useState<'replace' | 'append'>('replace');
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiStatusMessage, setAiStatusMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setAiStatusMessage(null);
    playSFX('click');

    try {
      const response = await fetch('/api/gemini/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: aiPrompt,
          targetBuilding,
          count: 3,
        }),
      });

      const data = await response.json();
      if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
        const currentTarget = buildings[targetBuilding];
        let newQuestions: Question[];

        if (aiMode === 'replace') {
          newQuestions = data.questions;
        } else {
          newQuestions = [...(currentTarget.questions || []), ...data.questions];
        }

        onUpdateBuilding(targetBuilding, { questions: newQuestions });
        playSFX('victory');
        setAiStatusMessage(
          `Berhasil! ${data.questions.length} soal baru telah dipasang di Gedung ${targetBuilding} (${currentTarget.title}) via ${data.source}.`
        );
      } else {
        throw new Error('Respon tidak valid');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kendala saat memproses pembuatan soal AI.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-blue-400 p-5 md:p-6 flex flex-col gap-5">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-slate-800">
                Panel Guru: Kelola Gedung & AI Generator Soal
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Kustomisasi kurikulum, ubah warna dinding 3D gedung, & buat soal baru dengan Gemini 3.8 Flash!
              </p>
            </div>
          </div>
          <button
            onClick={() => { playSFX('click'); onClose(); }}
            className="text-slate-400 hover:text-slate-700 text-3xl font-bold px-2 leading-none"
          >
            &times;
          </button>
        </div>

        {/* Gemini AI Generator Card */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-5 rounded-3xl shadow-lg border-2 border-blue-400">
          <div className="flex items-center gap-2 font-heading text-base font-bold text-amber-300">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            AI Generator Soal Kurikulum Merdeka (Gemini 3.8 Flash)
          </div>
          <p className="text-xs text-blue-200 mt-1 leading-relaxed">
            Generate otomatis bank soal Informatika SMP/MTs Kelas VIII berstandar berpikir komputasional dengan pilihan ganda, kunci jawaban, dan pembahasan mendalam.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3.5">
            <div className="md:col-span-2">
              <label className="text-[11px] font-bold text-blue-300 block mb-1">
                Topik / Perintah AI:
              </label>
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                className="w-full text-xs bg-slate-800/90 border border-blue-400 p-2.5 rounded-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="text-[11px] font-bold text-blue-300 block mb-1">
                Gedung Sasaran Soal:
              </label>
              <select
                value={targetBuilding}
                onChange={(e) => setTargetBuilding(e.target.value)}
                className="w-full text-xs bg-slate-800/90 border border-blue-400 p-2.5 rounded-xl font-bold text-white"
              >
                {Object.keys(buildings).map((code) => (
                  <option key={code} value={code}>
                    Gedung {code} - {buildings[code].title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-800 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-blue-200">
                <input
                  type="radio"
                  name="ai-m"
                  checked={aiMode === 'replace'}
                  onChange={() => setAiMode('replace')}
                />
                Ganti Soal Lama
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-bold text-blue-200">
                <input
                  type="radio"
                  name="ai-m"
                  checked={aiMode === 'append'}
                  onChange={() => setAiMode('append')}
                />
                Tambahkan ke Soal Ada
              </label>
            </div>

            <button
              onClick={handleGenerateAI}
              disabled={isGenerating}
              className="btn-blox btn-blox-yellow text-slate-950 px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> AI Sedang Membuat Soal...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-purple-700" /> Buat Soal Dengan AI Sekarang
                </>
              )}
            </button>
          </div>

          {aiStatusMessage && (
            <div className="mt-3 p-2.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 rounded-xl text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{aiStatusMessage}</span>
            </div>
          )}
        </div>

        {/* Buildings Customizer List */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-heading text-sm md:text-base font-bold text-slate-800 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" /> Kelola Gedung & Soal ({Object.keys(buildings).length} Gedung)
            </h4>
            <button
              onClick={() => { playSFX('click'); onAddBuilding(); }}
              className="btn-blox btn-blox-green text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> + Tambah Gedung Baru (E, F...)
            </button>
          </div>

          <div className="space-y-3">
            {Object.keys(buildings).map((code) => {
              const b = buildings[code];
              return (
                <div
                  key={code}
                  className="bg-slate-50 p-4 rounded-2xl border-2 space-y-2.5"
                  style={{ borderColor: b.colorHex }}
                >
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <span className="font-heading font-bold text-sm md:text-base text-slate-800 flex items-center gap-2">
                      <span className="text-xl">{b.icon}</span> Gedung {b.code} - {b.title}
                    </span>
                    <div className="flex items-center gap-2 text-xs">
                      <label className="font-bold text-slate-500">Warna Dinding:</label>
                      <input
                        type="color"
                        value={b.colorHex}
                        onChange={(e) => {
                          const hex = e.target.value;
                          onUpdateBuilding(code, {
                            colorHex: hex,
                            color: parseInt(hex.replace('#', '0x'), 16),
                          });
                        }}
                        className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                    <div>
                      <label className="font-bold text-slate-600 block mb-0.5">Judul Materi Gedung:</label>
                      <input
                        type="text"
                        value={b.title}
                        onChange={(e) => onUpdateBuilding(code, { title: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-600 block mb-0.5">Emoji Ikon:</label>
                      <input
                        type="text"
                        value={b.icon}
                        onChange={(e) => onUpdateBuilding(code, { icon: e.target.value })}
                        className="w-full p-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                      />
                    </div>
                  </div>

                  <div className="bg-white p-2.5 rounded-xl border space-y-1.5">
                    <p className="font-bold text-[11px] text-slate-600">
                      Bank Soal Aktif: {b.questions.length} Pertanyaan
                    </p>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {b.questions.map((q, idx) => (
                        <div
                          key={q.id || idx}
                          className="text-[11px] p-1.5 bg-slate-50 rounded-lg border flex justify-between items-center text-slate-700"
                        >
                          <span className="truncate max-w-md font-semibold">
                            {idx + 1}. {q.q}
                          </span>
                          <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded flex-shrink-0">
                            Kunci: {q.key}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
