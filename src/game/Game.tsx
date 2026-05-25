'use client';

import { useEffect, useState } from 'react';
import { GameProvider, useGame } from './GameProvider';
import type { ScreenId } from './types';
import { HomeScreen } from './screens/HomeScreen';
import { CharacterSelect } from './screens/CharacterSelect';
import { GauntletMode } from './screens/GauntletMode';
import { QuickChallenge } from './screens/QuickChallenge';
import { RewardsScreen } from './screens/RewardsScreen';
import { Tutorial } from './screens/Tutorial';

function GameInner() {
  const { state, ready } = useGame();
  const [screen, setScreen] = useState<ScreenId>('home');
  const [checked, setChecked] = useState(false);

  // First-run: drop new players into the tutorial.
  useEffect(() => {
    if (ready && !checked) {
      setChecked(true);
      if (!state.seenTutorial) setScreen('tutorial');
    }
  }, [ready, checked, state.seenTutorial]);

  if (!ready) {
    return (
      <div className="screen felt-bg items-center justify-center">
        <div className="animate-pulse text-5xl">🎯</div>
      </div>
    );
  }

  const go = (s: ScreenId) => setScreen(s);

  // Gauntlet & Quick are keyed so picking "Play Again" / re-entering resets cleanly.
  switch (screen) {
    case 'characters':
      return <CharacterSelect go={go} />;
    case 'gauntlet':
      return <GauntletMode key="gauntlet" go={go} />;
    case 'quick':
      return <QuickChallenge key="quick" go={go} />;
    case 'rewards':
      return <RewardsScreen go={go} />;
    case 'tutorial':
      return <Tutorial go={go} />;
    case 'home':
    default:
      return <HomeScreen go={go} />;
  }
}

export function Game() {
  return (
    <div className="min-h-[100dvh] w-full bg-black">
      <div className="phone-frame">
        <GameProvider>
          <GameInner />
        </GameProvider>
      </div>
    </div>
  );
}
