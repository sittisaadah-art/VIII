import React, { useState, useEffect } from 'react';
import { BuildingData, Player, RecapItem } from './types/game';
import { INITIAL_BUILDINGS } from './data/initialCurriculum';
import { ThreeCanvas } from './components/ThreeCanvas';
import { HeaderHUD } from './components/HeaderHUD';
import { PlayerDocks } from './components/PlayerDocks';
import { QuizModal } from './components/QuizModal';
import { CanteenModal } from './components/CanteenModal';
import { BuilderModal } from './components/BuilderModal';
import { TeacherModal } from './components/TeacherModal';
import { RecapModal } from './components/RecapModal';
import { HostingDomainModal } from './components/HostingDomainModal';
import { MainMenuModal } from './components/MainMenuModal';
import { isAudioEnabled, toggleAudioState, playSFX } from './utils/audio';

export default function App() {
  // Game & School Configuration
  const [schoolName, setSchoolName] = useState('Informatika Kelas VIII');
  const [arenaTitle, setArenaTitle] = useState('Kota Algoritma Edublox');

  // Buildings State
  const [buildings, setBuildings] = useState<Record<string, BuildingData>>(INITIAL_BUILDINGS);

  // Players Squad State (default 1 player, expandable up to 4)
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 0,
      name: 'Pemain 1',
      color: 0xef4444,
      colorHex: '#ef4444',
      avatar: 'raja',
      score: 0,
      coins: 60,
      pos: { x: 0, z: 12 },
      rot: 0,
      auto: false,
    },
  ]);

  // Recap & Placed Ornaments
  const [recapData, setRecapData] = useState<RecapItem[]>([]);
  const [placedOrnaments, setPlacedOrnaments] = useState<
    Array<{ id: string; type: string; pos: { x: number; z: number }; text?: string }>
  >([
    {
      id: 'default_gazebo',
      type: 'gazebo',
      pos: { x: 0, z: -35 },
      text: 'Pojok Literasi Algoritma & Berpikir Komputasional',
    },
    {
      id: 'default_mading',
      type: 'mading',
      pos: { x: 35, z: 0 },
      text: 'Papan Mading Informatika Bab 2 SMP/MTs',
    },
  ]);

  // Camera & View Controls
  const [cameraFocus, setCameraFocus] = useState<'ALL' | number>('ALL');
  const [cameraAngle, setCameraAngle] = useState(Math.PI / 4);
  const [cameraDistance, setCameraDistance] = useState(115);
  const [isAutoOrbit, setIsAutoOrbit] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(true);

  // Modals Visibility
  const [isMainMenuOpen, setIsMainMenuOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [currentQuizBuilding, setCurrentQuizBuilding] = useState<string | null>(null);
  const [isCanteenOpen, setIsCanteenOpen] = useState(false);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [isTeacherOpen, setIsTeacherOpen] = useState(false);
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [isHostingOpen, setIsHostingOpen] = useState(false);

  // Check URL query parameters for direct triggers (e.g., ?building=A, ?hosting=true)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const buildingParam = params.get('building');
      const hostingParam = params.get('hosting');

      if (buildingParam && buildings[buildingParam.toUpperCase()]) {
        setCurrentQuizBuilding(buildingParam.toUpperCase());
        setIsQuizOpen(true);
      } else if (hostingParam === 'true' || hostingParam === '1') {
        setIsHostingOpen(true);
      }
    }
  }, []);

  // Player Movement Handler
  const handlePlayerMove = (pIdx: number, newPos: { x: number; z: number }) => {
    setPlayers((prev) => {
      const copy = [...prev];
      if (copy[pIdx]) {
        copy[pIdx] = { ...copy[pIdx], pos: newPos };
      }
      return copy;
    });
  };

  const handleManualMoveDelta = (pIdx: number, dx: number, dz: number) => {
    setPlayers((prev) => {
      const copy = [...prev];
      const p = copy[pIdx];
      if (!p) return prev;
      const newX = Math.max(-115, Math.min(115, p.pos.x + dx));
      const newZ = Math.max(-115, Math.min(115, p.pos.z + dz));
      copy[pIdx] = { ...p, pos: { x: newX, z: newZ } };
      return copy;
    });
  };

  const handleJump = (pIdx: number) => {
    playSFX('jump');
  };

  const handleToggleAuto = (pIdx: number) => {
    setPlayers((prev) => {
      const copy = [...prev];
      if (copy[pIdx]) {
        copy[pIdx] = { ...copy[pIdx], auto: !copy[pIdx].auto };
      }
      return copy;
    });
  };

  // Building Proximity Trigger
  const handleBuildingTrigger = (code: string) => {
    setCurrentQuizBuilding(code);
    setIsQuizOpen(true);
    playSFX('click');
  };

  // Score & Coin Update
  const handlePlayerScoreUpdate = (pIdx: number, addedPoints: number, addedCoins: number) => {
    setPlayers((prev) => {
      const copy = [...prev];
      if (copy[pIdx]) {
        copy[pIdx] = {
          ...copy[pIdx],
          score: copy[pIdx].score + addedPoints,
          coins: copy[pIdx].coins + addedCoins,
        };
      }
      return copy;
    });
  };

  const handleSpendCoins = (cost: number, earnedXp: number, itemName: string) => {
    setPlayers((prev) => {
      const copy = [...prev];
      if (copy[0]) {
        copy[0] = {
          ...copy[0],
          coins: Math.max(0, copy[0].coins - cost),
          score: copy[0].score + earnedXp,
        };
      }
      return copy;
    });
    alert(`Berhasil membeli ${itemName}! Skuad mendapat +${earnedXp} XP!`);
  };

  // Add Recap Record
  const handleAddRecapRecord = (item: RecapItem) => {
    setRecapData((prev) => [item, ...prev]);
  };

  // Place 3D Ornament
  const handlePlaceOrnament = (typeId: string, pos: { x: number; z: number }, text: string) => {
    setPlacedOrnaments((prev) => [
      ...prev,
      {
        id: `orn_${Date.now()}`,
        type: typeId,
        pos,
        text,
      },
    ]);
  };

  // Teacher Customizer
  const handleUpdateBuilding = (code: string, updated: Partial<BuildingData>) => {
    setBuildings((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        ...updated,
      },
    }));
  };

  const handleAddBuilding = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    const nextLetter = letters.find((l) => !buildings[l]) || `B${Object.keys(buildings).length + 1}`;
    const colors = [0x06b6d4, 0xf97316, 0x84cc16, 0x6366f1];
    const chosenColor = colors[Object.keys(buildings).length % colors.length];

    setBuildings((prev) => ({
      ...prev,
      [nextLetter]: {
        code: nextLetter,
        title: `Materi Tambahan ${nextLetter}`,
        icon: '💻',
        color: chosenColor,
        colorHex: `#${chosenColor.toString(16)}`,
        pos: {
          x: Math.round((Math.random() - 0.5) * 140),
          z: Math.round((Math.random() - 0.5) * 140),
        },
        questions: [
          {
            id: `${nextLetter}_q1`,
            submateri: `Materi ${nextLetter}`,
            q: `Pertanyaan kuis baru untuk materi tambahan ${nextLetter}...`,
            options: ['A. Pilihan A', 'B. Pilihan B', 'C. Pilihan C', 'D. Pilihan D'],
            key: 'A',
            explanation: `Pembahasan materi ${nextLetter}.`,
          },
        ],
      },
    }));
  };

  // Squad Players management in Main Menu
  const handleUpdatePlayer = (idx: number, updated: Partial<Player>) => {
    setPlayers((prev) => {
      const copy = [...prev];
      if (copy[idx]) {
        copy[idx] = { ...copy[idx], ...updated };
      }
      return copy;
    });
  };

  const handleAddSquadPlayer = () => {
    if (players.length >= 4) return;
    const newIdx = players.length;
    const colors = [
      { hex: '#ef4444', num: 0xef4444 },
      { hex: '#3b82f6', num: 0x3b82f6 },
      { hex: '#10b981', num: 0x10b981 },
      { hex: '#f59e0b', num: 0xf59e0b },
    ];
    const defaultColor = colors[newIdx] || colors[0];

    setPlayers((prev) => [
      ...prev,
      {
        id: newIdx,
        name: `Pemain ${newIdx + 1}`,
        color: defaultColor.num,
        colorHex: defaultColor.hex,
        avatar: newIdx === 1 ? 'neko' : newIdx === 2 ? 'kesatria' : 'penyihir',
        score: 0,
        coins: 50,
        pos: { x: (newIdx - 1.5) * 8, z: 12 },
        rot: 0,
        auto: false,
      },
    ]);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-900 select-none">
      
      {/* 3D Canvas Viewport */}
      <ThreeCanvas
        buildings={buildings}
        players={players}
        onPlayerMove={handlePlayerMove}
        onBuildingTrigger={handleBuildingTrigger}
        cameraFocus={cameraFocus}
        cameraAngle={cameraAngle}
        cameraDistance={cameraDistance}
        isAutoOrbit={isAutoOrbit}
        onRotateCamera={(delta) => setCameraAngle((prev) => prev + delta)}
        placedOrnaments={placedOrnaments}
      />

      {/* Split Screen 4-way Overlay Grid */}
      {isSplitScreen && (
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none z-10 border-2 border-white/40">
          <div className="border border-white/30 p-2">
            <span className="bg-red-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              P1 View (WASD)
            </span>
          </div>
          <div className="border border-white/30 p-2">
            <span className="bg-blue-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              P2 View (Panah)
            </span>
          </div>
          <div className="border border-white/30 p-2">
            <span className="bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              P3 View (IJKL)
            </span>
          </div>
          <div className="border border-white/30 p-2">
            <span className="bg-amber-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              P4 View (TFGH)
            </span>
          </div>
        </div>
      )}

      {/* Header Navigation & Tools HUD */}
      <HeaderHUD
        schoolName={schoolName}
        onRotateCamera={(delta) => setCameraAngle((prev) => prev + delta)}
        onZoomCamera={(delta) => setCameraDistance((prev) => Math.max(30, Math.min(180, prev + delta)))}
        isAutoOrbit={isAutoOrbit}
        onToggleAutoOrbit={() => setIsAutoOrbit((prev) => !prev)}
        isSplitScreen={isSplitScreen}
        onToggleSplitScreen={() => setIsSplitScreen((prev) => !prev)}
        cameraFocus={cameraFocus}
        onSetCameraFocus={setCameraFocus}
        isAudioOn={isAudioOn}
        onToggleAudio={() => setIsAudioOn(toggleAudioState())}
        onOpenQuiz={() => {
          setCurrentQuizBuilding(currentQuizBuilding || 'A');
          setIsQuizOpen(true);
        }}
        onOpenCanteen={() => setIsCanteenOpen(true)}
        onOpenBuilder={() => setIsBuilderOpen(true)}
        onOpenTeacher={() => setIsTeacherOpen(true)}
        onOpenRecap={() => setIsRecapOpen(true)}
        onOpenHosting={() => setIsHostingOpen(true)}
        onOpenMainMenu={() => setIsMainMenuOpen(true)}
        playerCount={players.length}
      />

      {/* Bottom Multi-Player Controls Dock */}
      <PlayerDocks
        players={players}
        onPlayerMove={handleManualMoveDelta}
        onJump={handleJump}
        onToggleAuto={handleToggleAuto}
        onSetCameraFocus={(pIdx) => setCameraFocus(pIdx)}
      />

      {/* Modals */}
      <HostingDomainModal
        isOpen={isHostingOpen}
        onClose={() => setIsHostingOpen(false)}
        schoolName={schoolName}
      />

      <QuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        building={currentQuizBuilding ? buildings[currentQuizBuilding] : buildings['A']}
        players={players}
        onPlayerScoreUpdate={handlePlayerScoreUpdate}
        onAddRecapRecord={handleAddRecapRecord}
        schoolName={schoolName}
      />

      <CanteenModal
        isOpen={isCanteenOpen}
        onClose={() => setIsCanteenOpen(false)}
        player={players[0]}
        onSpendCoins={handleSpendCoins}
      />

      <BuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        onPlaceOrnament={handlePlaceOrnament}
        playerPos={players[0]?.pos || { x: 0, z: 0 }}
      />

      <TeacherModal
        isOpen={isTeacherOpen}
        onClose={() => setIsTeacherOpen(false)}
        buildings={buildings}
        onUpdateBuilding={handleUpdateBuilding}
        onAddBuilding={handleAddBuilding}
      />

      <RecapModal
        isOpen={isRecapOpen}
        onClose={() => setIsRecapOpen(false)}
        recapData={recapData}
        playerCount={players.length}
      />

      <MainMenuModal
        isOpen={isMainMenuOpen}
        onClose={() => setIsMainMenuOpen(false)}
        schoolName={schoolName}
        onUpdateSchoolName={setSchoolName}
        arenaTitle={arenaTitle}
        onUpdateArenaTitle={setArenaTitle}
        players={players}
        onUpdatePlayer={handleUpdatePlayer}
        onAddPlayer={handleAddSquadPlayer}
        onStartGame={() => setIsMainMenuOpen(false)}
      />

    </div>
  );
}
