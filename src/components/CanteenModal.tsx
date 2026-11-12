import React from 'react';
import { Player } from '../types/game';
import { CANTEEN_ITEMS } from '../data/initialCurriculum';
import { Utensils, Coins, Sparkles, Check } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface CanteenModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  onSpendCoins: (cost: number, earnedXp: number, itemName: string) => void;
}

export const CanteenModal: React.FC<CanteenModalProps> = ({
  isOpen,
  onClose,
  player,
  onSpendCoins,
}) => {
  if (!isOpen) return null;

  const handleBuy = (item: (typeof CANTEEN_ITEMS)[0]) => {
    if (player.coins >= item.price) {
      playSFX('coin');
      onSpendCoins(item.price, item.xp, item.name);
    } else {
      playSFX('wrong');
      alert(`Koin tidak mencukupi! ${player.name} membutuhkan ${item.price} koin. Kerjakan Kuis Serentak untuk mendapatkan koin tambahan!`);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-pink-400 p-5 md:p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-pink-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
              <Utensils className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-slate-800">
                Kantin Jajanan & Rest Area Edublox
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Tukarkan koin kuis dengan cemilan lezat untuk menambah XP dan kegembiraan skuad!
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

        {/* Player balance badge */}
        <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-700">
            Dompet Skuad: <strong>{player.name}</strong>
          </span>
          <span className="bg-amber-400 text-slate-950 font-extrabold px-3 py-1 rounded-xl shadow-sm flex items-center gap-1.5">
            <Coins className="w-4 h-4" /> {player.coins} Koin
          </span>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {CANTEEN_ITEMS.map((item) => {
            const canAfford = player.coins >= item.price;
            return (
              <div
                key={item.id}
                className="bg-pink-50/60 p-3.5 rounded-2xl border-2 border-pink-200 flex flex-col items-center text-center justify-between gap-2 transition hover:bg-pink-50"
              >
                <span className="text-4xl filter drop-shadow-sm">{item.emoji}</span>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-800">{item.name}</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
                </div>

                <div className="flex items-center justify-between w-full text-[11px] font-bold mt-1">
                  <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                    <Coins className="w-3 h-3" /> {item.price}
                  </span>
                  <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-lg flex items-center gap-0.5">
                    <Sparkles className="w-3 h-3" /> +{item.xp} XP
                  </span>
                </div>

                <button
                  onClick={() => handleBuy(item)}
                  className={`btn-blox text-xs px-3 py-1.5 rounded-xl font-bold w-full mt-1 ${
                    canAfford ? 'btn-blox-pink text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Beli Jajanan
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end border-t pt-3">
          <button
            onClick={() => { playSFX('click'); onClose(); }}
            className="btn-blox bg-slate-800 hover:bg-slate-700 text-white text-xs px-5 py-2 rounded-xl font-bold"
          >
            Kembali ke Kota
          </button>
        </div>

      </div>
    </div>
  );
};
