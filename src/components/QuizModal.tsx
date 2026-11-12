import React, { useState, useEffect } from 'react';
import { BuildingData, Player, Question, RecapItem } from '../types/game';
import confetti from 'canvas-confetti';
import { Brain, CheckCircle, ArrowRight, ArrowLeft, Lightbulb, Award, Users } from 'lucide-react';
import { playSFX } from '../utils/audio';

interface QuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  building: BuildingData | null;
  players: Player[];
  onPlayerScoreUpdate: (playerIndex: number, addedPoints: number, addedCoins: number) => void;
  onAddRecapRecord: (item: RecapItem) => void;
  schoolName: string;
}

export const QuizModal: React.FC<QuizModalProps> = ({
  isOpen,
  onClose,
  building,
  players,
  onPlayerScoreUpdate,
  onAddRecapRecord,
  schoolName,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [shuffledQuestions, setShuffledQuestions] = useState<Question[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // Shuffle questions and options when building changes or modal opens
  useEffect(() => {
    if (!building || !isOpen) return;

    const questions = building.questions || [];
    const shuffled = questions.map((q) => {
      // Parse options
      const parsed = q.options.map((opt) => {
        const prefix = opt.charAt(0);
        const text = opt.substring(3).trim();
        return { originalKey: prefix, text };
      });

      // Shuffle options array
      const shuffledOpts = [...parsed].sort(() => Math.random() - 0.5);
      const keys = ['A', 'B', 'C', 'D'];
      let newKey = 'A';

      const finalOptions = shuffledOpts.map((optObj, idx) => {
        const assignedKey = keys[idx];
        if (optObj.originalKey === q.key) {
          newKey = assignedKey;
        }
        return `${assignedKey}. ${optObj.text}`;
      });

      return {
        id: q.id,
        submateri: q.submateri,
        q: q.q,
        options: finalOptions,
        key: newKey,
        explanation: q.explanation,
      };
    });

    // Shuffle question order
    setShuffledQuestions(shuffled.sort(() => Math.random() - 0.5));
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsAnswerRevealed(false);
  }, [building, isOpen]);

  if (!isOpen || !building || shuffledQuestions.length === 0) return null;

  const currentQ = shuffledQuestions[currentIndex] || shuffledQuestions[0];

  const handleSelectAnswer = (playerIdx: number, optionKey: string) => {
    if (isAnswerRevealed) return;
    playSFX('click');
    setSelectedAnswers((prev) => ({
      ...prev,
      [playerIdx]: optionKey,
    }));
  };

  const handleVerifyAnswers = () => {
    if (isAnswerRevealed) return;

    const answeredCount = Object.keys(selectedAnswers).length;
    if (answeredCount === 0) {
      alert('Pilihlah minimal satu jawaban pemain sebelum memeriksa!');
      return;
    }

    setIsAnswerRevealed(true);
    let anyCorrect = false;

    players.forEach((p, pIdx) => {
      const userAns = selectedAnswers[pIdx];
      if (!userAns) return;

      const isCorrect = userAns === currentQ.key;
      if (isCorrect) {
        anyCorrect = true;
        onPlayerScoreUpdate(pIdx, 100, 15);
      }

      onAddRecapRecord({
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        school: schoolName,
        player: p.name,
        building: `Gedung ${building.code}`,
        materi: building.title,
        question: currentQ.q,
        userAns: userAns,
        key: currentQ.key,
        status: isCorrect ? 'BENAR' : 'SALAH',
        points: isCorrect ? 100 : 0,
      });
    });

    if (anyCorrect) {
      playSFX('correct');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      playSFX('wrong');
    }
  };

  const handleNextQuestion = () => {
    if (!isAnswerRevealed) {
      handleVerifyAnswers();
    }

    if (currentIndex < shuffledQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswers({});
      setIsAnswerRevealed(false);
      playSFX('click');
    } else {
      playSFX('victory');
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
      });
      alert(`🎉 Selamat! Kuis untuk Gedung ${building.code} (${building.title}) telah selesai diselesaikan bersama skuad!`);
      onClose();
    }
  };

  const handlePrevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setSelectedAnswers({});
      setIsAnswerRevealed(false);
      playSFX('click');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border-4 border-amber-400 p-5 md:p-6 flex flex-col gap-4">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-3">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 text-white rounded-2xl flex items-center justify-center text-2xl font-bold shadow-lg flex-shrink-0"
              style={{ backgroundColor: building.colorHex }}
            >
              {building.icon}
            </div>
            <div>
              <h3 className="font-heading text-lg md:text-xl font-bold text-slate-800">
                Gedung {building.code} - {building.title}
              </h3>
              <p className="text-xs text-slate-500 font-semibold">
                Kuis Serentak Multi-Pemain • Soal {currentIndex + 1} dari {shuffledQuestions.length}
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

        {/* Question Text Box */}
        <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-200">
          <span className="bg-amber-200 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider">
            {currentQ.submateri}
          </span>
          <p className="text-sm md:text-base font-bold text-slate-800 mt-2 leading-relaxed">
            {currentQ.q}
          </p>
        </div>

        {/* Player Answer Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {players.map((p, pIdx) => {
            const playerChoice = selectedAnswers[pIdx];
            return (
              <div
                key={p.id}
                className="bg-slate-50 p-3.5 rounded-2xl border-2 flex flex-col gap-2"
                style={{ borderColor: p.colorHex }}
              >
                {/* Player header */}
                <div className="flex justify-between items-center border-b border-slate-200 pb-1.5">
                  <span className="font-bold text-xs flex items-center gap-1.5" style={{ color: p.colorHex }}>
                    <Users className="w-3.5 h-3.5" /> P{pIdx + 1}: {p.name}
                  </span>
                  <span className="text-[11px] font-extrabold text-slate-600 bg-white px-2 py-0.5 rounded-md border">
                    Pilihan: {playerChoice ? playerChoice : '-'}
                  </span>
                </div>

                {/* Options List */}
                <div className="space-y-1.5 mt-0.5">
                  {currentQ.options.map((opt) => {
                    const optKey = opt.charAt(0);
                    const isSelected = playerChoice === optKey;
                    
                    let btnColorClass = 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200';
                    if (isSelected) {
                      btnColorClass = 'bg-amber-400 text-slate-950 font-bold border-amber-500 shadow-sm';
                    }
                    if (isAnswerRevealed) {
                      if (optKey === currentQ.key) {
                        btnColorClass = 'bg-emerald-500 text-white font-bold border-emerald-600 ring-2 ring-emerald-300';
                      } else if (isSelected && optKey !== currentQ.key) {
                        btnColorClass = 'bg-rose-500 text-white font-bold border-rose-600 line-through opacity-80';
                      }
                    }

                    return (
                      <button
                        key={optKey}
                        onClick={() => handleSelectAnswer(pIdx, optKey)}
                        disabled={isAnswerRevealed}
                        className={`w-full text-left text-xs p-2 rounded-xl border transition ${btnColorClass}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Explanation & Answer Key Box */}
        {isAnswerRevealed && (
          <div className="bg-emerald-50 p-4 rounded-2xl border-2 border-emerald-300 text-xs text-slate-700 animate-fadeIn">
            <p className="font-bold text-emerald-900 flex items-center gap-1.5 text-sm">
              <Lightbulb className="w-4 h-4 text-amber-500" /> Kunci Jawaban & Pembahasan:
            </p>
            <p className="font-extrabold text-emerald-700 mt-1">
              Pilihan Benar: {currentQ.key}
            </p>
            <p className="text-slate-600 mt-1 leading-relaxed italic">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between items-center border-t pt-3 flex-wrap gap-2">
          <button
            onClick={handlePrevQuestion}
            disabled={currentIndex === 0}
            className="btn-blox bg-slate-200 hover:bg-slate-300 disabled:opacity-40 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Soal Sebelumnya
          </button>

          <div className="flex items-center gap-2">
            {!isAnswerRevealed ? (
              <button
                onClick={handleVerifyAnswers}
                className="btn-blox btn-blox-blue text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                <CheckCircle className="w-4 h-4" /> Periksa Jawaban Skuad
              </button>
            ) : null}

            <button
              onClick={handleNextQuestion}
              className="btn-blox btn-blox-green text-white px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span>{currentIndex === shuffledQuestions.length - 1 ? 'Selesai Kuis' : 'Soal Berikutnya'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
