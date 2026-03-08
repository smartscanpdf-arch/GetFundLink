import { create } from "zustand";
import type { Notification } from "@/types";

interface AppStore {
  // Notifications
  notifications:     Notification[];
  unreadCount:       number;
  setNotifications:  (n: Notification[]) => void;
  markRead:          (id: string) => void;
  markAllRead:       () => void;
  addNotification:   (n: Notification) => void;

  // UI
  sidebarOpen:       boolean;
  setSidebarOpen:    (v: boolean) => void;
  supportOpen:       boolean;
  setSupportOpen:    (v: boolean) => void;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // Notifications
  notifications: [],
  unreadCount:   0,

  setNotifications: (notifications) =>
    set({ notifications, unreadCount: notifications.filter(n => !n.is_read).length }),

  markRead: (id) =>
    set(state => {
      const notifications = state.notifications.map(n => n.id === id ? { ...n, is_read: true } : n);
      return { notifications, unreadCount: notifications.filter(n => !n.is_read).length };
    }),

  markAllRead: () =>
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, is_read: true })),
      unreadCount:   0,
    })),

  addNotification: (n) =>
    set(state => ({
      notifications: [n, ...state.notifications],
      unreadCount:   state.unreadCount + (n.is_read ? 0 : 1),
    })),

  // UI
  sidebarOpen:    false,
  setSidebarOpen: (v) => set({ sidebarOpen: v }),

  supportOpen:    false,
  setSupportOpen: (v) => set({ supportOpen: v }),
}));
