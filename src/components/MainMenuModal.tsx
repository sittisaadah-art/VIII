import React from 'react';
import { Player } from '../types/game';
import { AVATAR_OPTIONS } from '../data/initialCurriculum';
import { School, Users, Plus, Play, Sparkles } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface MainMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolName: string;
  onUpdateSchoolName: (name: string) => void;
  arenaTitle: string;
  onUpdateArenaTitle: (title: string) => void;
  players: Player[];
  onUpdatePlayer: (idx: number, updated: Partial<Player>) => void;
  onAddPlayer: () => void;
  onStartGame: () => void;
}

export const MainMenuModal: React.FC<MainMenuModalProps> = ({
  isOpen,
  onClose,
  schoolName,
  onUpdateSchoolName,
  arenaTitle,
  onUpdateArenaTitle,
  players,
  onUpdatePlayer,
  onAddPlayer,
  onStartGame,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-amber-400 p-5 md:p-7 flex flex-col gap-5">
        
        {/* Branding Title */}
        <div className="text-center border-b pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-2xl text-white text-3xl shadow-lg mb-2">
            🏙️
          </div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-800">
            Edublox City <span className="text-xs font-normal text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">By Sitty</span>
          </h2>
          <p className="text-xs md:text-sm font-semibold text-slate-500 mt-1">
            Game Edukasi 3D Informatika Kelas VIII (Bab 2 Berpikir Komputasional)
          </p>
        </div>

        {/* School & Arena Settings */}
        <div className="bg-amber-50 p-4 rounded-2xl border border-amber-200">
          <h3 className="font-heading text-base font-bold text-amber-900 flex items-center gap-2">
            <School className="w-5 h-5 text-amber-600" /> Pengaturan Kelas & Arena 3D
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2.5">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Nama Kelas / Instansi Sekolah:
              </label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => onUpdateSchoolName(e.target.value)}
                placeholder="Informatika Kelas VIII"
                className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Judul Arena 3D Kota:
              </label>
              <input
                type="text"
                value={arenaTitle}
                onChange={(e) => onUpdateArenaTitle(e.target.value)}
                placeholder="Kota Algoritma Edublox"
                className="w-full px-3 py-2 bg-white rounded-xl border border-amber-300 font-bold text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Players Squad Customization */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-heading text-base font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-500" /> Skuad Pemain Co-op ({players.length} Pemain)
            </h3>
            {players.length < 4 && (
              <button
                onClick={() => { playSFX('click'); onAddPlayer(); }}
                className="btn-blox btn-blox-green text-xs px-3 py-1.5 rounded-xl font-bold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Tambah Pemain (P{players.length + 1})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {players.map((p, idx) => (
              <div
                key={p.id}
                className="bg-slate-50 p-3 rounded-2xl border-2 flex flex-col gap-2"
                style={{ borderColor: p.colorHex }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-700">Pemain #{idx + 1}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-bold">Warna Baju:</span>
                    <input
                      type="color"
                      value={p.colorHex}
                      onChange={(e) => {
                        const hex = e.target.value;
                        onUpdatePlayer(idx, {
                          colorHex: hex,
                          color: parseInt(hex.replace('#', '0x'), 16),
                        });
                      }}
                      className="w-6 h-6 rounded cursor-pointer border border-slate-300"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={p.name}
                  onChange={(e) => onUpdatePlayer(idx, { name: e.target.value })}
                  placeholder={`Nama Pemain ${idx + 1}`}
                  className="p-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-800"
                />

                <select
                  value={p.avatar}
                  onChange={(e) => onUpdatePlayer(idx, { avatar: e.target.value })}
                  className="p-2 bg-white border border-slate-300 rounded-xl font-bold text-xs text-slate-800"
                >
                  {AVATAR_OPTIONS.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.emoji} {a.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Start Game Button */}
        <div className="border-t pt-4">
          <button
            onClick={() => { playSFX('victory'); onStartGame(); }}
            className="btn-blox btn-blox-yellow text-slate-950 text-sm md:text-base px-8 py-3.5 rounded-2xl font-extrabold shadow-xl flex items-center justify-center gap-2 w-full"
          >
            <Play className="w-5 h-5 fill-current" />
            MASUK KE KOTA 3D EDUBLOX
          </button>
        </div>

      </div>
    </div>
  );
};
