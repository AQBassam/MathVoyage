import React, { useState, useEffect } from 'react';
import { sound } from '../../utils/audio.ts';
import { toEastern } from '../../utils/arabicNumerals.ts';
import { Compass, Footprints } from 'lucide-react';

interface MultiplicationMazeGameProps {
  tableNumber: number;
  onComplete: (isSuccess: boolean) => void;
}

export const MultiplicationMazeGame: React.FC<MultiplicationMazeGameProps> = ({
  tableNumber = 4,
  onComplete,
}) => {
  const effectiveTable = tableNumber > 0 ? tableNumber : 3;

  const [grid, setGrid] = useState<number[][]>([]);
  const [currentPos, setCurrentPos] = useState<[number, number]>([0, 0]);
  const [visited, setVisited] = useState<string[]>(['0-0']);
  const [wrongCell, setWrongCell] = useState<string | null>(null);

  useEffect(() => {
    const newGrid: number[][] = Array.from({ length: 4 }, () => Array(4).fill(0));
    const pathCoords: [number, number][] = [
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 3],
      [3, 3],
    ];

    const multiples = Array.from({ length: 10 }, (_, i) => (i + 1) * effectiveTable);
    const nonMultiples: number[] = [];
    for (let i = 2; i <= 60; i++) {
      if (i % effectiveTable !== 0) nonMultiples.push(i);
    }

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const isPath = pathCoords.some(([pr, pc]) => pr === r && pc === c);
        if (isPath) {
          const randMultiple = multiples[Math.floor(Math.random() * multiples.length)];
          newGrid[r][c] = randMultiple;
        } else {
          const randNon = nonMultiples[Math.floor(Math.random() * nonMultiples.length)];
          newGrid[r][c] = randNon;
        }
      }
    }

    setGrid(newGrid);
    setCurrentPos([0, 0]);
    setVisited(['0-0']);
    setWrongCell(null);
  }, [effectiveTable]);

  const handleCellClick = (r: number, c: number) => {
    const [cr, cc] = currentPos;
    const isAdjacent = Math.abs(cr - r) + Math.abs(cc - c) === 1;

    if (!isAdjacent) return;

    const cellVal = grid[r][c];
    const isMultiple = cellVal % effectiveTable === 0;

    if (isMultiple) {
      sound.playCorrect();
      const nextKey = `${r}-${c}`;
      setCurrentPos([r, c]);
      setVisited((prev) => [...prev, nextKey]);

      if (r === 3 && c === 3) {
        sound.playCelebration();
        setTimeout(() => {
          onComplete(true);
        }, 800);
      }
    } else {
      sound.playTryAgain();
      const failKey = `${r}-${c}`;
      setWrongCell(failKey);
      setTimeout(() => setWrongCell(null), 800);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center max-w-lg mx-auto w-full p-4">
      <div className="text-center mb-4">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center justify-center gap-2">
          <Compass className="w-5 h-5 text-indigo-600" />
          <span>متاهة مضاعفات العدد {toEastern(effectiveTable)}</span>
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 mt-1 font-normal leading-relaxed">
          سر فقط على الأعداد التي تنتمي لجدول <span className="text-indigo-700 font-bold">{toEastern(effectiveTable)}</span> لتصل من نقطة البداية (⭐) إلى خط النهاية (🏆)!
        </p>
      </div>

      <div className="grid grid-cols-4 gap-2.5 p-3.5 bg-slate-100 border border-slate-200 rounded-3xl shadow-inner">
        {grid.map((row, r) =>
          row.map((val, c) => {
            const isCurrent = currentPos[0] === r && currentPos[1] === c;
            const isVisited = visited.includes(`${r}-${c}`);
            const isWrong = wrongCell === `${r}-${c}`;
            const [cr, cc] = currentPos;
            const isNeighbor = Math.abs(cr - r) + Math.abs(cc - c) === 1;
            const isGoal = r === 3 && c === 3;
            const isStart = r === 0 && c === 0;

            let cellClass = 'bg-white border-slate-200 text-slate-700';
            if (isCurrent) {
              cellClass = 'bg-indigo-600 border-indigo-700 text-white font-bold ring-4 ring-indigo-300 scale-105';
            } else if (isWrong) {
              cellClass = 'bg-rose-500 border-rose-600 text-white shake';
            } else if (isVisited) {
              cellClass = 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold';
            } else if (isNeighbor) {
              cellClass = 'bg-indigo-50 border-indigo-300 text-indigo-900 hover:bg-indigo-100 animate-pulse';
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => handleCellClick(r, c)}
                className={`w-16 h-16 sm:w-18 sm:h-18 rounded-2xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer font-bold text-lg sm:text-xl font-sans shadow-xs ${cellClass}`}
                aria-label={`الخلية صف ${toEastern(r + 1)} عمود ${toEastern(c + 1)} القيمة ${toEastern(val)}`}
              >
                <span>{toEastern(val)}</span>
                {isStart && <span className="text-[10px] sm:text-xs -mt-1 font-semibold">⭐ البداية</span>}
                {isGoal && <span className="text-[10px] sm:text-xs -mt-1 font-semibold">🏆 الهدف</span>}
                {isCurrent && <Footprints className="w-3.5 h-3.5 mt-0.5" />}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
