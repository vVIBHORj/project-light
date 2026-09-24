import { create } from 'zustand';
import { TabKey } from '../design-system/components/TabBar';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppState {
  activeTab: TabKey;
  isOffline: boolean;
  toast: ToastState;
  setActiveTab: (tab: TabKey) => void;
  setOffline: (offline: boolean) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  hideToast: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeTab: 'home',
  isOffline: false,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },

  setActiveTab: (tab) => set({ activeTab: tab }),
  setOffline: (isOffline) => set({ isOffline }),
  showToast: (message, type = 'info') =>
    set({ toast: { visible: true, message, type } }),
  hideToast: () =>
    set((state) => ({ toast: { ...state.toast, visible: false } })),
}));
