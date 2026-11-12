import React, { useState } from 'react';
import { ORNAMENT_CATALOG } from '../data/initialCurriculum';
import { Hammer, MapPin, Quote, Sparkles } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface BuilderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrnament: (typeId: string, pos: { x: number; z: number }, text: string) => void;
  playerPos: { x: number; z: number };
}

export const BuilderModal: React.FC<BuilderModalProps> = ({
  isOpen,
  onClose,
  onPlaceOrnament,
  playerPos,
}) => {
  const [placementMode, setPlacementMode] = useState<'CLICK' | 'ZONE' | 'COORD'>('ZONE');
  const [selectedZone, setSelectedZone] = useState('UTARA');
  const [coordX, setCoordX] = useState(0);
  const [coordZ, setCoordZ] = useState(25);
  const [literacyQuote, setLiteracyQuote] = useState(
    'Berpikir Komputasional & Algoritma adalah kunci memecahkan masalah masa depan!'
  );

  if (!isOpen) return null;

  const handleSelectOrnament = (typeId: string) => {
    let targetX = 0;
    let targetZ = 0;

    if (placementMode === 'ZONE') {
      if (selectedZone === 'UTARA') { targetX = 0; targetZ = -35; }
      else if (selectedZone === 'SELATAN') { targetX = 0; targetZ = 35; }
      else if (selectedZone === 'TIMUR') { targetX = 35; targetZ = 0; }
      else if (selectedZone === 'BARAT') { targetX = -35; targetZ = 0; }
      else if (selectedZone === 'KARAKTER') { targetX = playerPos.x + 6; targetZ = playerPos.z + 6; }
    } else if (placementMode === 'COORD') {
      targetX = Number(coordX) || 0;
      targetZ = Number(coordZ) || 0;
    } else {
      // CLICK mode places near character by default or last clicked
      targetX = playerPos.x + 8;
      targetZ = playerPos.z + 8;
    }

    playSFX('correct');
    onPlaceOrnament(typeId, { x: targetX, z: targetZ }, literacyQuote);
    alert(`Ornamen ${typeId} berhasil dipasang di area koordinat (${targetX}, ${targetZ})!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-emerald-400 p-5 md:p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-xl shadow-lg">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-slate-800">
                Builder Ornamen & Gazebo Literasi 3D
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Hias Kota Algoritma dengan Gazebo literasi, mading informasi, dan dekorasi taman!
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

        {/* Placement Mode Selection */}
        <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200">
          <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 mb-2">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" /> Metode & Lokasi Penempatan:
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer font-bold transition ${
              placementMode === 'ZONE' ? 'bg-white text-emerald-800 border-emerald-400 shadow-sm' : 'bg-white/60 text-slate-600'
            }`}>
              <input
                type="radio"
                name="b-mode"
                checked={placementMode === 'ZONE'}
                onChange={() => setPlacementMode('ZONE')}
              />
              Zona Taman Kota
            </label>
            <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer font-bold transition ${
              placementMode === 'CLICK' ? 'bg-white text-emerald-800 border-emerald-400 shadow-sm' : 'bg-white/60 text-slate-600'
            }`}>
              <input
                type="radio"
                name="b-mode"
                checked={placementMode === 'CLICK'}
                onChange={() => setPlacementMode('CLICK')}
              />
              Samping Karakter P1
            </label>
            <label className={`flex items-center gap-2 p-2 rounded-xl border cursor-pointer font-bold transition ${
              placementMode === 'COORD' ? 'bg-white text-emerald-800 border-emerald-400 shadow-sm' : 'bg-white/60 text-slate-600'
            }`}>
              <input
                type="radio"
                name="b-mode"
                checked={placementMode === 'COORD'}
                onChange={() => setPlacementMode('COORD')}
              />
              Input Koordinat (X, Z)
            </label>
          </div>

          {placementMode === 'ZONE' && (
            <div className="mt-2.5">
              <select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                className="w-full text-xs font-bold p-2 bg-white border border-emerald-300 rounded-xl text-slate-800"
              >
                <option value="UTARA">Taman Utara Kota (Dekat Monumen)</option>
                <option value="SELATAN">Taman Selatan Kota</option>
                <option value="TIMUR">Taman Timur Kota</option>
                <option value="BARAT">Taman Barat Kota</option>
                <option value="KARAKTER">Tepat Di Samping Posisi Karakter Anda</option>
              </select>
            </div>
          )}

          {placementMode === 'COORD' && (
            <div className="mt-2.5 grid grid-cols-2 gap-2">
              <input
                type="number"
                value={coordX}
                onChange={(e) => setCoordX(Number(e.target.value))}
                placeholder="Koordinat X (-110 s.d 110)"
                className="text-xs font-bold p-2 bg-white border border-emerald-300 rounded-xl"
              />
              <input
                type="number"
                value={coordZ}
                onChange={(e) => setCoordZ(Number(e.target.value))}
                placeholder="Koordinat Z (-110 s.d 110)"
                className="text-xs font-bold p-2 bg-white border border-emerald-300 rounded-xl"
              />
            </div>
          )}
        </div>

        {/* Custom Literacy Quote Input */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mb-1">
            <Quote className="w-3.5 h-3.5 text-blue-500" /> Pesan / Teks Literasi (Untuk Gazebo & Mading):
          </label>
          <input
            type="text"
            value={literacyQuote}
            onChange={(e) => setLiteracyQuote(e.target.value)}
            className="w-full text-xs font-bold p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          />
        </div>

        {/* Catalog Grid */}
        <div>
          <h4 className="font-heading font-bold text-xs text-slate-700 uppercase mb-2">
            Pilih Ornamen Yang Ingin Dipasang:
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {ORNAMENT_CATALOG.map((orn) => (
              <div
                key={orn.id}
                className="bg-emerald-50/70 p-3 rounded-2xl border-2 border-emerald-200 flex flex-col items-center text-center justify-between gap-1.5 hover:bg-emerald-50 transition"
              >
                <span className="text-3xl">{orn.emoji}</span>
                <h5 className="font-heading font-bold text-xs text-slate-800">{orn.name}</h5>
                <button
                  onClick={() => handleSelectOrnament(orn.id)}
                  className="btn-blox btn-blox-green text-white text-xs px-3 py-1.5 rounded-xl font-bold w-full mt-1"
                >
                  Pasang Ornamen
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
