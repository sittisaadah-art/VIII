import React from 'react';
import { Player } from '../types/game';
import { Coins, Keyboard, Bot, UserCheck } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface PlayerDocksProps {
  players: Player[];
  onPlayerMove: (pIdx: number, dx: number, dz: number) => void;
  onJump: (pIdx: number) => void;
  onToggleAuto: (pIdx: number) => void;
  onSetCameraFocus: (pIdx: number) => void;
}

export const PlayerDocks: React.FC<PlayerDocksProps> = ({
  players,
  onPlayerMove,
  onJump,
  onToggleAuto,
  onSetCameraFocus,
}) => {
  return (
    <div className="absolute bottom-2.5 left-2.5 right-2.5 pointer-events-none z-20 flex justify-between items-end gap-2 flex-wrap-reverse">
      
      {/* Player Virtual Control Cards */}
      <div className="flex items-center gap-2 pointer-events-auto flex-wrap max-w-full">
        {players.map((p, idx) => (
          <div
            key={p.id}
            className="bg-white/95 backdrop-blur-md p-2 rounded-2xl shadow-xl border-2 flex flex-col gap-1 text-xs select-none"
            style={{ borderColor: p.colorHex }}
          >
            {/* Header info */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-1">
              <span className="font-bold text-slate-800 flex items-center gap-1.5 truncate max-w-[110px]">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.colorHex }}
                />
                P{idx + 1}: {p.name}
              </span>
              <span className="font-extrabold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                <Coins className="w-3 h-3" /> {p.coins}
              </span>
            </div>

            {/* Virtual Touch D-Pad */}
            <div className="grid grid-cols-3 gap-0.5 w-24 mx-auto text-center py-0.5">
              <div></div>
              <button
                onClick={() => { playSFX('click'); onPlayerMove(idx, 0, -3); }}
                className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 p-1.5 rounded-lg font-bold text-slate-700 text-xs transition"
                title="Maju"
              >
                ▲
              </button>
              <div></div>
              
              <button
                onClick={() => { playSFX('click'); onPlayerMove(idx, -3, 0); }}
                className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 p-1.5 rounded-lg font-bold text-slate-700 text-xs transition"
                title="Kiri"
              >
                ◀
              </button>
              <button
                onClick={() => { playSFX('jump'); onJump(idx); }}
                className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-white p-1.5 rounded-lg font-bold text-xs shadow-sm transition"
                title="Lompat"
              >
                🦘
              </button>
              <button
                onClick={() => { playSFX('click'); onPlayerMove(idx, 3, 0); }}
                className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 p-1.5 rounded-lg font-bold text-slate-700 text-xs transition"
                title="Kanan"
              >
                ▶
              </button>

              <div></div>
              <button
                onClick={() => { playSFX('click'); onPlayerMove(idx, 0, 3); }}
                className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 p-1.5 rounded-lg font-bold text-slate-700 text-xs transition"
                title="Mundur"
              >
                ▼
              </button>
              <div></div>
            </div>

            {/* Sub actions */}
            <div className="flex justify-between items-center text-[10px] pt-1 border-t border-slate-100">
              <button
                onClick={() => { playSFX('click'); onToggleAuto(idx); }}
                className={`px-1.5 py-0.5 rounded font-bold transition flex items-center gap-0.5 ${
                  p.auto ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Bot className="w-2.5 h-2.5" /> Auto: {p.auto ? 'ON' : 'OFF'}
              </button>
              <button
                onClick={() => { playSFX('click'); onSetCameraFocus(idx); }}
                className="text-blue-600 font-bold hover:underline"
              >
                Fokus
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Keyboard Controls Guide */}
      <div className="bg-slate-900/85 backdrop-blur-md text-white text-xs px-3 py-2 rounded-2xl pointer-events-auto border border-slate-700 max-w-xs shadow-xl hidden md:block">
        <p className="font-bold text-amber-400 flex items-center gap-1.5 text-xs">
          <Keyboard className="w-3.5 h-3.5" /> Kontrol Keyboard Co-op:
        </p>
        <p className="mt-1 text-slate-300 text-[11px] leading-relaxed">
          <strong>P1:</strong> WASD + Spasi | <strong>P2:</strong> Panah Arah<br />
          <strong>P3:</strong> IJKL | <strong>P4:</strong> TFGH
        </p>
        <p className="text-[10px] text-amber-300 mt-1 font-semibold">
          💡 Dekati pintu Gedung A-D untuk memicu Kuis Serentak!
        </p>
      </div>

    </div>
  );
};
