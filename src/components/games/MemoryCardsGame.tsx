import React, { useState, useEffect } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { HelpCircle } from 'lucide-react';

interface MemoryCardsGameProps {
  factsPool: MultiplicationFact[];
  onComplete: (allCorrect: boolean, totalFlips: number) => void;
}

interface MemCard {
  id: string;
  pairId: string;
  content: string;
  type: 'equation' | 'product';
  isFlipped: boolean;
  isMatched: boolean;
}

export const MemoryCardsGame: React.FC<MemoryCardsGameProps> = ({ factsPool, onComplete }) => {
  const [cards, setCards] = useState<MemCard[]>([]);
  const [selectedCards, setSelectedCards] = useState<MemCard[]>([]);
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [totalFlips, setTotalFlips] = useState<number>(0);

  useEffect(() => {
    const selectedFacts = factsPool.slice(0, 4);
    const cardList: MemCard[] = [];

    selectedFacts.forEach((f, idx) => {
      const pairId = `${f.factorA}x${f.factorB}`;
      cardList.push({
        id: `card_${idx}_eq`,
        pairId,
        content: `${toEastern(f.factorA)} × ${toEastern(f.factorB)}`,
        type: 'equation',
        isFlipped: false,
        isMatched: false,
      });
      cardList.push({
        id: `card_${idx}_prod`,
        pairId,
        content: `${toEastern(f.product)}`,
        type: 'product',
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(cardList.sort(() => Math.random() - 0.5));
    setSelectedCards([]);
    setTotalFlips(0);
  }, [factsPool]);

  const handleFlip = (card: MemCard) => {
    if (isChecking || card.isFlipped || card.isMatched) return;

    sound.playClick();
    setTotalFlips((prev) => prev + 1);

    const updatedCards = cards.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c));
    setCards(updatedCards);

    const nextSelected = [...selectedCards, card];
    setSelectedCards(nextSelected);

    if (nextSelected.length === 2) {
      setIsChecking(true);
      const [first, second] = nextSelected;

      if (first.pairId === second.pairId && first.type !== second.type) {
        sound.playCorrect();
        setTimeout(() => {
          const matchedList = updatedCards.map((c) =>
            c.pairId === first.pairId ? { ...c, isMatched: true } : c
          );
          setCards(matchedList);
          setSelectedCards([]);
          setIsChecking(false);

          if (matchedList.every((c) => c.isMatched)) {
            setTimeout(() => {
              onComplete(true, totalFlips + 1);
            }, 700);
          }
        }, 600);
      } else {
        sound.playTryAgain();
        setTimeout(() => {
          setCards((prev) =>
            prev.map((c) =>
              c.id === first.id || c.id === second.id ? { ...c, isFlipped: false } : c
            )
          );
          setSelectedCards([]);
          setIsChecking(false);
        }, 1100);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto w-full p-4">
      <div className="text-center mb-5">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">ذاكرة حقائق الضرب</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal leading-relaxed">
          اقلب البطاقات واعثر على كل حقيقة ضرب مع حاصل ضربها المطابق لها!
        </p>
      </div>

      <div className="grid grid-cols-4 gap-3 w-full">
        {cards.map((card) => {
          return (
            <button
              key={card.id}
              type="button"
              disabled={card.isFlipped || card.isMatched || isChecking}
              onClick={() => handleFlip(card)}
              className={`h-24 sm:h-28 rounded-3xl border-2 flex items-center justify-center p-2 transition-all cursor-pointer shadow-xs active:scale-95 disabled:cursor-default ${
                card.isMatched
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-80'
                  : card.isFlipped
                  ? 'bg-white border-indigo-400 text-slate-900 scale-102 ring-2 ring-indigo-500/20'
                  : 'bg-indigo-600 border-indigo-700 text-white hover:bg-indigo-700'
              }`}
            >
              {card.isFlipped || card.isMatched ? (
                <span className="text-xl sm:text-2xl font-bold font-sans" dir="rtl">
                  {card.content}
                </span>
              ) : (
                <HelpCircle className="w-8 h-8 opacity-60" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
