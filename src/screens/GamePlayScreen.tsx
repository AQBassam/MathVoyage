import React, { useState, useEffect } from 'react';
import { GameType, MultiplicationFact, ScreenType } from '../types/game.ts';
import { useProgress } from '../context/ProgressContext.tsx';
import { getAdaptiveQuestions, getRandomSuccessMessage } from '../utils/adaptiveEngine.ts';
import { getFact, getTableFacts, ALL_FACTS } from '../data/multiplicationData.ts';
import { sound } from '../utils/audio.ts';
import { toEastern } from '../utils/arabicNumerals.ts';

// الألعاب التعليمية
import { SolveEquationGame } from '../components/games/SolveEquationGame.tsx';
import { ChooseAnswerGame } from '../components/games/ChooseAnswerGame.tsx';
import { MissingNumberGame } from '../components/games/MissingNumberGame.tsx';
import { MatchPairsGame } from '../components/games/MatchPairsGame.tsx';
import { BuildAnswerGame } from '../components/games/BuildAnswerGame.tsx';
import { MultiplicationRaceGame } from '../components/games/MultiplicationRaceGame.tsx';
import { TrueFalseGame } from '../components/games/TrueFalseGame.tsx';
import { MemoryCardsGame } from '../components/games/MemoryCardsGame.tsx';
import { MultiplicationMazeGame } from '../components/games/MultiplicationMazeGame.tsx';
import { MultiplicationBingoGame } from '../components/games/MultiplicationBingoGame.tsx';
import { ErrorDetectiveGame } from '../components/games/ErrorDetectiveGame.tsx';
import { VisualLearningGame } from '../components/games/VisualLearningGame.tsx';
import { TimeChallengeGame } from '../components/games/TimeChallengeGame.tsx';

// النوافذ والمؤثرات
import { ExplanationModal } from '../components/ExplanationModal.tsx';
import { JadwaliAssistant } from '../components/games/JadwaliAssistant.tsx';
import { fireCelebrationConfetti } from '../components/ConfettiEffect.tsx';
import { ArrowRight, Star, Sparkles, CheckCircle2, Lightbulb } from 'lucide-react';

interface GamePlayScreenProps {
  gameType: GameType;
  tableNumber: number;
  onFinish: (result: {
    gameType: GameType;
    tableNumber: number;
    score: number;
    totalQuestions: number;
    starsEarned: number;
    accuracyPercent: number;
    mistakes: Array<{
      factorA: number;
      factorB: number;
      givenAnswer: number;
      correctAnswer: number;
    }>;
  }) => void;
  onExit: () => void;
}

export const GamePlayScreen: React.FC<GamePlayScreenProps> = ({
  gameType,
  tableNumber,
  onFinish,
  onExit,
}) => {
  const { progress, recordFactAttempt, recordSessionResult } = useProgress();

  const [questions, setQuestions] = useState<Array<{ fact: MultiplicationFact; distractors: number[] }>>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [mistakes, setMistakes] = useState<
    Array<{ factorA: number; factorB: number; givenAnswer: number; correctAnswer: number }>
  >([]);

  const [explainingFact, setExplainingFact] = useState<{
    factorA: number;
    factorB: number;
    givenAnswer?: number;
  } | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showAssistant, setShowAssistant] = useState<boolean>(false);

  useEffect(() => {
    const totalCount = gameType === 'race' ? 6 : 8;
    const generated = getAdaptiveQuestions(tableNumber, progress.factsMastery, totalCount);
    setQuestions(generated);
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setMistakes([]);
    setShowAssistant(false);
  }, [gameType, tableNumber]);

  const currentQ = questions[currentIdx];
  const totalQuestions = questions.length || 8;

  // مؤقت ذكي لمساعد فُرسان الحساب: يظهر تلميح لطيف وتشجيع إذا تأخر الطالب لأكثر من 10 ثوانٍ
  useEffect(() => {
    setShowAssistant(false);
    if (!currentQ || explainingFact) return;

    const timer = setTimeout(() => {
      setShowAssistant(true);
    }, 10000); // 10 ثوانٍ

    return () => clearTimeout(timer);
  }, [currentIdx, explainingFact, currentQ]);

  const handleAnswerResult = async (isCorrect: boolean, givenAnswer: number) => {
    setShowAssistant(false);
    if (!currentQ) return;

    const fact = currentQ.fact;
    await recordFactAttempt(fact.factorA, fact.factorB, isCorrect, givenAnswer);

    if (isCorrect) {
      setScore((prev) => prev + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);

      if (newStreak >= 3 && newStreak % 3 === 0) {
        sound.playStar();
      }

      const msg = getRandomSuccessMessage();
      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 1200);

      if (currentIdx + 1 >= totalQuestions) {
        finishRound(score + 1, mistakes);
      } else {
        setCurrentIdx((prev) => prev + 1);
      }
    } else {
      setStreak(0);
      const updatedMistakes = [
        ...mistakes,
        {
          factorA: fact.factorA,
          factorB: fact.factorB,
          givenAnswer,
          correctAnswer: fact.product,
        },
      ];
      setMistakes(updatedMistakes);

      setExplainingFact({
        factorA: fact.factorA,
        factorB: fact.factorB,
        givenAnswer,
      });
    }
  };

  const handleContinueAfterExplanation = () => {
    setExplainingFact(null);
    setShowAssistant(false);
    if (currentIdx + 1 >= totalQuestions) {
      finishRound(score, mistakes);
    } else {
      setCurrentIdx((prev) => prev + 1);
    }
  };

  const finishRound = (finalScore: number, finalMistakes: typeof mistakes) => {
    const accuracy = totalQuestions > 0 ? Math.round((finalScore / totalQuestions) * 100) : 100;
    let starsEarned = 1;
    if (accuracy >= 90) starsEarned = 3;
    else if (accuracy >= 60) starsEarned = 2;

    sound.playCelebration();
    fireCelebrationConfetti();

    recordSessionResult({
      gameType,
      tableNumber,
      score: finalScore,
      totalQuestions,
      starsEarned,
      accuracyPercent: accuracy,
      mistakes: finalMistakes,
    });

    onFinish({
      gameType,
      tableNumber,
      score: finalScore,
      totalQuestions,
      starsEarned,
      accuracyPercent: accuracy,
      mistakes: finalMistakes,
    });
  };

  const poolOfFacts = tableNumber > 0 ? getTableFacts(tableNumber) : ALL_FACTS;

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 flex flex-col justify-between p-4 sm:p-6">
      {/* شريط تقدم الجلسة العلوي */}
      <div className="max-w-2xl mx-auto w-full mb-4">
        <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600 mb-2">
          <button
            type="button"
            onClick={onExit}
            className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 font-medium cursor-pointer"
          >
            <ArrowRight className="w-4 h-4" />
            <span>خروج من اللعبة</span>
          </button>

          {/* عداد الأسئلة ومساعد فُرسان الحساب */}
          <div className="flex items-center gap-2">
            {currentQ && (
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setShowAssistant((prev) => !prev);
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  showAssistant
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
                }`}
                title="تلميح مساعد فُرسان الحساب"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">مساعد الفرسان</span>
              </button>
            )}
            <span className="font-semibold font-sans">
              المسألة {toEastern(Math.min(totalQuestions, currentIdx + 1))} من {toEastern(totalQuestions)}
            </span>
            {streak >= 3 && (
              <span className="text-amber-600 flex items-center gap-1 font-bold font-sans">
                <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                <span>إجابات متتالية: {toEastern(streak)}</span>
              </span>
            )}
          </div>
        </div>

        {/* خط التقدم */}
        <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
            style={{
              width: `${Math.min(100, ((currentIdx) / totalQuestions) * 100)}%`,
            }}
          />
        </div>
      </div>

      {/* رسالة التشجيع الفورية */}
      {toastMessage && (
        <div className="max-w-xs mx-auto mb-3 py-1.5 px-4 bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-full shadow-md flex items-center justify-center gap-1.5 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* مسرح اللعبة التفاعلية النشطة */}
      <div className="flex-1 flex flex-col justify-center items-center">
        {gameType === 'visuals' && currentQ && (
          <VisualLearningGame
            fact={currentQ.fact}
            onNextFact={() => {
              if (currentIdx + 1 < totalQuestions) setCurrentIdx((p) => p + 1);
              else finishRound(totalQuestions, []);
            }}
            onPrevFact={currentIdx > 0 ? () => setCurrentIdx((p) => p - 1) : undefined}
            onMasteredThisFact={() => {
              handleAnswerResult(true, currentQ.fact.product);
            }}
          />
        )}

        {gameType === 'equation' && currentQ && (
          <SolveEquationGame fact={currentQ.fact} onAnswer={handleAnswerResult} />
        )}

        {gameType === 'choice' && currentQ && (
          <ChooseAnswerGame
            fact={currentQ.fact}
            distractors={currentQ.distractors}
            onAnswer={handleAnswerResult}
          />
        )}

        {gameType === 'missing' && currentQ && (
          <MissingNumberGame fact={currentQ.fact} onAnswer={handleAnswerResult} />
        )}

        {gameType === 'pairs' && (
          <MatchPairsGame
            factsPool={poolOfFacts}
            onComplete={(allCorrect, _mistakesCount) => {
              finishRound(allCorrect ? 4 : 3, []);
            }}
          />
        )}

        {gameType === 'build' && currentQ && (
          <BuildAnswerGame fact={currentQ.fact} onAnswer={handleAnswerResult} />
        )}

        {gameType === 'race' && currentQ && (
          <MultiplicationRaceGame
            fact={currentQ.fact}
            distractors={currentQ.distractors}
            currentStep={currentIdx + 1}
            totalSteps={totalQuestions}
            onAnswer={handleAnswerResult}
          />
        )}

        {gameType === 'mixed' && currentQ && (
          <ChooseAnswerGame
            fact={currentQ.fact}
            distractors={currentQ.distractors}
            onAnswer={handleAnswerResult}
          />
        )}

        {gameType === 'truefalse' && currentQ && (
          <TrueFalseGame fact={currentQ.fact} onAnswer={handleAnswerResult} />
        )}

        {gameType === 'memory' && (
          <MemoryCardsGame
            factsPool={poolOfFacts}
            onComplete={(_allCorrect) => {
              finishRound(4, []);
            }}
          />
        )}

        {gameType === 'maze' && (
          <MultiplicationMazeGame
            tableNumber={tableNumber || 4}
            onComplete={(_success) => {
              finishRound(4, []);
            }}
          />
        )}

        {gameType === 'bingo' && (
          <MultiplicationBingoGame
            factsPool={poolOfFacts}
            onComplete={() => {
              finishRound(5, []);
            }}
          />
        )}

        {gameType === 'detective' && (
          <ErrorDetectiveGame
            factsPool={poolOfFacts}
            onAnswer={(isCorrect) => {
              handleAnswerResult(isCorrect, isCorrect ? 1 : 0);
            }}
          />
        )}

        {gameType === 'timechallenge' && currentQ && (
          <TimeChallengeGame
            fact={currentQ.fact}
            distractors={currentQ.distractors}
            questionIndex={currentIdx}
            totalQuestions={totalQuestions}
            onAnswer={(isCorrect, ans) => {
              handleAnswerResult(isCorrect, ans);
            }}
            onTimeExpired={(ans) => {
              handleAnswerResult(false, ans);
            }}
          />
        )}
      </div>

      {/* نافذة التوضيح البصري التشجيعية عند حدوث خطأ */}
      {explainingFact && (
        <ExplanationModal
          factorA={explainingFact.factorA}
          factorB={explainingFact.factorB}
          givenAnswer={explainingFact.givenAnswer}
          onContinue={handleContinueAfterExplanation}
        />
      )}

      {/* فقاعة مساعد فُرسان الحساب الذكية اللطيفة عند التأخر لأكثر من 10 ثوانٍ أو عند الطلب */}
      {currentQ && (
        <JadwaliAssistant
          factorA={currentQ.fact.factorA}
          factorB={currentQ.fact.factorB}
          isVisible={showAssistant && !explainingFact}
          onDismiss={() => setShowAssistant(false)}
        />
      )}
    </div>
  );
};
