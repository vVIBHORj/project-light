/* eslint-disable @typescript-eslint/no-empty-function */
// Mock react-native-reanimated
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('react-native-reanimated').setUpTests?.();
} catch {}

// Mock expo-font
jest.mock('expo-font', () => ({
  isLoaded: jest.fn(() => true),
  loadAsync: jest.fn(() => Promise.resolve()),
  useFonts: jest.fn(() => [true, null]),
}));

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(() => Promise.resolve()),
  hideAsync: jest.fn(() => Promise.resolve()),
}));

// Mock expo-blur
jest.mock('expo-blur', () => {
  const { View } = require('react-native');
  return {
    BlurView: View,
  };
});

// Mock expo-linear-gradient
jest.mock('expo-linear-gradient', () => {
  const { View } = require('react-native');
  return {
    LinearGradient: View,
  };
});

// Mock expo-secure-store
const inMemoryStore = {};
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn((key) => Promise.resolve(inMemoryStore[key] || null)),
  setItemAsync: jest.fn((key, value) => {
    inMemoryStore[key] = value;
    return Promise.resolve();
  }),
  deleteItemAsync: jest.fn((key) => {
    delete inMemoryStore[key];
    return Promise.resolve();
  }),
}));

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useLocalSearchParams: () => ({}),
  useSegments: () => [],
  Stack: {
    Screen: () => null,
  },
  Tabs: {
    Screen: () => null,
  },
}));
