import React, { useState } from 'react';
import { ScreenType, GameType } from './types/game.ts';
import { ProgressProvider } from './context/ProgressContext.tsx';
import { Navigation } from './components/Navigation.tsx';
import { FursanSymbol } from './components/brand/FursanLogo.tsx';

// الشاشات
import { HomeScreen } from './screens/HomeScreen.tsx';
import { LearnScreen } from './screens/LearnScreen.tsx';
import { TableSelectScreen } from './screens/TableSelectScreen.tsx';
import { GameSelectScreen } from './screens/GameSelectScreen.tsx';
import { GamePlayScreen } from './screens/GamePlayScreen.tsx';
import { ResultsScreen } from './screens/ResultsScreen.tsx';
import { ProgressScreen } from './screens/ProgressScreen.tsx';
import { TeacherDashboardScreen } from './screens/TeacherDashboardScreen.tsx';
import { SettingsScreen } from './screens/SettingsScreen.tsx';

function MainApp() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [activeGame, setActiveGame] = useState<{ gameType: GameType; tableNumber: number }>({
    gameType: 'choice',
    tableNumber: 2,
  });
  const [lastResult, setLastResult] = useState<{
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
  } | null>(null);

  const handleStartGame = (gameType: GameType, tableNumber: number) => {
    setActiveGame({ gameType, tableNumber });
    setCurrentScreen('game_play');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFinishGame = (result: NonNullable<typeof lastResult>) => {
    setLastResult(result);
    setCurrentScreen('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (screen: ScreenType) => {
    setCurrentScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800 font-sans selection:bg-emerald-500 selection:text-white" dir="rtl">
      {/* شريط الملاحة العلوي المتوافق مع عقود الواجهة وRTL */}
      <Navigation currentScreen={currentScreen} onNavigate={handleNavigate} />

      {/* المحتوى الرئيسي للشاشة المختارة */}
      <main className="flex-1">
        {currentScreen === 'home' && (
          <HomeScreen onNavigate={handleNavigate} onStartGame={handleStartGame} />
        )}

        {currentScreen === 'learn' && (
          <LearnScreen onStartGame={handleStartGame} onNavigate={handleNavigate} />
        )}

        {currentScreen === 'table_select' && (
          <TableSelectScreen onStartGame={handleStartGame} onNavigate={handleNavigate} />
        )}

        {currentScreen === 'game_select' && (
          <GameSelectScreen onStartGame={handleStartGame} />
        )}

        {currentScreen === 'game_play' && (
          <GamePlayScreen
            gameType={activeGame.gameType}
            tableNumber={activeGame.tableNumber}
            onFinish={handleFinishGame}
            onExit={() => handleNavigate('game_select')}
          />
        )}

        {currentScreen === 'results' && lastResult && (
          <ResultsScreen
            result={lastResult}
            onPlayAgain={() => handleStartGame(lastResult.gameType, lastResult.tableNumber)}
            onNavigate={handleNavigate}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressScreen onStartGame={handleStartGame} />
        )}

        {currentScreen === 'dashboard' && <TeacherDashboardScreen />}

        {currentScreen === 'settings' && <SettingsScreen />}
      </main>

      {/* تذييل الصفحة التربوي الأنيق */}
      <footer className="w-full bg-white border-t border-slate-200 py-6 px-4 print:hidden">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-600 font-medium">
          <div className="flex items-center gap-2">
            <FursanSymbol sizePx={22} />
            <span className="font-extrabold text-slate-900">فُرسان الحساب</span>
            <span className="text-slate-400">·</span>
            <span>منصة تعليمية تفاعلية حديثة لإتقان جداول الضرب والمهارات الرياضية</span>
          </div>
          <div className="flex items-center gap-4 font-semibold text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => handleNavigate('learn')}
              className="hover:text-emerald-800 cursor-pointer"
            >
              المختبر البصري
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleNavigate('progress')}
              className="hover:text-emerald-800 cursor-pointer"
            >
              شبكة المئة حقيقة
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleNavigate('dashboard')}
              className="hover:text-emerald-800 cursor-pointer"
            >
              أوراق العمل المطبوعة
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={() => handleNavigate('settings')}
              className="hover:text-emerald-800 cursor-pointer"
            >
              التفضيلات
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ProgressProvider>
      <MainApp />
    </ProgressProvider>
  );
}
