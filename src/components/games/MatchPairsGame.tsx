import React, { useState, useEffect } from 'react';
import { MultiplicationFact } from '../../types/game.ts';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';

interface MatchPairsGameProps {
  factsPool: MultiplicationFact[];
  onComplete: (allCorrect: boolean, attempts: number) => void;
}

interface MatchCard {
  id: string;
  type: 'equation' | 'product';
  factKey: string;
  display: string;
  product: number;
}

export const MatchPairsGame: React.FC<MatchPairsGameProps> = ({ factsPool, onComplete }) => {
  const [cards, setCards] = useState<MatchCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [matchedKeys, setMatchedKeys] = useState<string[]>([]);
  const [wrongPairIds, setWrongPairIds] = useState<string[]>([]);
  const [mistakeCount, setMistakeCount] = useState<number>(0);

  useEffect(() => {
    const selectedFacts = factsPool.slice(0, 4);
    const cardList: MatchCard[] = [];

    selectedFacts.forEach((f, idx) => {
      const key = `${f.factorA}x${f.factorB}`;
      cardList.push({
        id: `eq_${idx}`,
        type: 'equation',
        factKey: key,
        display: `${toEastern(f.factorA)} × ${toEastern(f.factorB)}`,
        product: f.product,
      });
      cardList.push({
        id: `prod_${idx}`,
        type: 'product',
        factKey: key,
        display: `${toEastern(f.product)}`,
        product: f.product,
      });
    });

    setCards(cardList.sort(() => Math.random() - 0.5));
    setMatchedKeys([]);
    setSelectedCardId(null);
  }, [factsPool]);

  const handleCardClick = (card: MatchCard) => {
    if (matchedKeys.includes(card.factKey) || wrongPairIds.length > 0) return;
    sound.playClick();

    if (!selectedCardId) {
      setSelectedCardId(card.id);
      return;
    }

    if (selectedCardId === card.id) {
      setSelectedCardId(null);
      return;
    }

    const firstCard = cards.find((c) => c.id === selectedCardId);
    if (!firstCard) return;

    if (firstCard.factKey === card.factKey && firstCard.type !== card.type) {
      sound.playCorrect();
      const nextMatched = [...matchedKeys, card.factKey];
      setMatchedKeys(nextMatched);
      setSelectedCardId(null);

      if (nextMatched.length === 4) {
        setTimeout(() => {
          onComplete(mistakeCount === 0, mistakeCount);
        }, 800);
      }
    } else {
      sound.playTryAgain();
      setWrongPairIds([firstCard.id, card.id]);
      setMistakeCount((prev) => prev + 1);

      setTimeout(() => {
        setWrongPairIds([]);
        setSelectedCardId(null);
      }, 900);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-xl mx-auto w-full p-4">
      <div className="text-center mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900">صل بين بطاقات الضرب ونواتجها</h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal leading-relaxed">
          انقر على جملة الضرب ثم انقر على حاصل الضرب المطابق لها لتوصيلهما معاً!
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
        {cards.map((card) => {
          const isMatched = matchedKeys.includes(card.factKey);
          const isSelected = selectedCardId === card.id;
          const isWrong = wrongPairIds.includes(card.id);

          let style = 'bg-white border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-slate-50';
          if (isMatched) {
            style = 'bg-emerald-50 border-emerald-300 text-emerald-800 opacity-70 pointer-events-none';
          } else if (isWrong) {
            style = 'bg-rose-50 border-rose-400 text-rose-700 shake';
          } else if (isSelected) {
            style = 'bg-indigo-50 border-indigo-500 text-indigo-900 ring-2 ring-indigo-500/20 scale-102';
          }

          return (
            <button
              key={card.id}
              type="button"
              disabled={isMatched}
              onClick={() => handleCardClick(card)}
              className={`h-24 sm:h-28 rounded-2xl border-2 flex flex-col items-center justify-center p-2 transition-all cursor-pointer shadow-xs active:scale-95 disabled:cursor-default ${style}`}
            >
              <span
                className={`font-bold font-sans ${
                  card.type === 'equation' ? 'text-2xl sm:text-2xl text-slate-900' : 'text-3xl sm:text-4xl text-emerald-700'
                }`}
                dir="rtl"
              >
                {card.display}
              </span>
              <span className="text-xs font-medium text-slate-500 mt-1">
                {card.type === 'equation' ? 'جملة الضرب' : 'حاصل الضرب'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
