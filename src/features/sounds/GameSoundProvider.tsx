import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createAudioPlayer,
  setAudioModeAsync,
  type AudioPlayer,
  type AudioSource,
} from 'expo-audio';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const SOUND_STORAGE_KEY = 'jogastop:sounds';

export type GameSound = 'start' | 'tick' | 'stop';

type GameSoundContextValue = {
  enabled: boolean;
  play: (sound: GameSound) => void;
  setEnabled: (enabled: boolean) => Promise<void>;
  toggle: () => Promise<void>;
};

const GameSoundContext = createContext<GameSoundContextValue | null>(null);

const SOUND_SOURCES: Record<GameSound, AudioSource> = {
  start: require('../../../assets/sounds/start.wav'),
  tick: require('../../../assets/sounds/tick.wav'),
  stop: require('../../../assets/sounds/stop.wav'),
};

function createPlayers() {
  return {
    start: createAudioPlayer(SOUND_SOURCES.start),
    tick: createAudioPlayer(SOUND_SOURCES.tick),
    stop: createAudioPlayer(SOUND_SOURCES.stop),
  };
}

function playPlayer(player: AudioPlayer) {
  try {
    void player.seekTo(0).then(() => player.play());
  } catch {
    // Audio can fail silently if the native audio session is not ready yet.
  }
}

export function GameSoundProvider({ children }: PropsWithChildren) {
  const [enabled, setEnabledState] = useState(true);
  const [players] = useState(createPlayers);

  useEffect(() => {
    let mounted = true;

    AsyncStorage.getItem(SOUND_STORAGE_KEY).then((value) => {
      if (mounted) setEnabledState(value !== 'off');
    });

    void setAudioModeAsync({
      allowsRecording: false,
      playsInSilentMode: true,
    }).catch(() => undefined);

    return () => {
      mounted = false;
      Object.values(players).forEach((player) => player.remove());
    };
  }, [players]);

  const setEnabled = useCallback(async (nextEnabled: boolean) => {
    setEnabledState(nextEnabled);
    await AsyncStorage.setItem(SOUND_STORAGE_KEY, nextEnabled ? 'on' : 'off');
  }, []);

  const value = useMemo<GameSoundContextValue>(
    () => ({
      enabled,
      play: (sound) => {
        if (!enabled) return;
        playPlayer(players[sound]);
      },
      setEnabled,
      toggle: () => setEnabled(!enabled),
    }),
    [enabled, players, setEnabled],
  );

  return <GameSoundContext.Provider value={value}>{children}</GameSoundContext.Provider>;
}

export function useGameSoundControls() {
  const context = useContext(GameSoundContext);
  if (!context) {
    throw new Error('useGameSoundControls must be used inside GameSoundProvider');
  }

  return context;
}
