// src/store/uiStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

type ThemeMode = 'light' | 'dark' | 'auto';
type LayoutMode = 'side' | 'top' | 'mix';
type Language = 'zh-CN' | 'en-US';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  description?: string;
  duration?: number;
  timestamp: number;
}

interface ModalState {
  visible: boolean;
  title?: string;
  content?: any;
  data?: any;
}

interface DrawerState {
  visible: boolean;
  title?: string;
  content?: any;
  data?: any;
  placement?: 'left' | 'right' | 'top' | 'bottom';
}

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface UIState {
  // 主题
  theme: ThemeMode;
  primaryColor: string;
  
  // 布局
  layoutMode: LayoutMode;
  collapsed: boolean; // 侧边栏是否折叠
  fixedHeader: boolean;
  fixedSidebar: boolean;
  
  // 语言
  language: Language;
  
  // 加载状态
  globalLoading: boolean;
  loadingTexts: Record<string, string>; // key -> loading text
  
  // 通知
  notifications: Notification[];
  
  // 弹窗
  modal: ModalState;
  
  // 抽屉
  drawer: DrawerState;
  
  // 面包屑
  breadcrumbs: BreadcrumbItem[];
  
  // 页面标题
  pageTitle: string;
  
  // 全屏状态
  isFullscreen: boolean;
  
  // 表格设置
  tableSettings: {
    pageSize: number;
    showSizeChanger: boolean;
    showQuickJumper: boolean;
  };
  
  // 图表设置
  chartSettings: {
    theme: 'light' | 'dark';
    animation: boolean;
  };
  
  // 用户偏好
  preferences: {
    showWelcome: boolean;
    autoRefresh: boolean;
    refreshInterval: number; // 秒
    enableNotifications: boolean;
    enableSound: boolean;
  };
  
  // 最近访问
  recentPages: Array<{
    path: string;
    title: string;
    timestamp: number;
  }>;
  
  // 操作
  setTheme: (theme: ThemeMode) => void;
  setPrimaryColor: (color: string) => void;
  
  setLayoutMode: (mode: LayoutMode) => void;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
  setFixedHeader: (fixed: boolean) => void;
  setFixedSidebar: (fixed: boolean) => void;
  
  setLanguage: (lang: Language) => void;
  
  setGlobalLoading: (loading: boolean, text?: string) => void;
  addLoadingText: (key: string, text: string) => void;
  removeLoadingText: (key: string) => void;
  
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  
  openModal: (config: Omit<ModalState, 'visible'>) => void;
  closeModal: () => void;
  updateModalData: (data: any) => void;
  
  openDrawer: (config: Omit<DrawerState, 'visible'>) => void;
  closeDrawer: () => void;
  updateDrawerData: (data: any) => void;
  
  setBreadcrumbs: (items: BreadcrumbItem[]) => void;
  addBreadcrumb: (item: BreadcrumbItem) => void;
  
  setPageTitle: (title: string) => void;
  
  toggleFullscreen: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  
  setTableSettings: (settings: Partial<UIState['tableSettings']>) => void;
  setChartSettings: (settings: Partial<UIState['chartSettings']>) => void;
  
  setPreferences: (preferences: Partial<UIState['preferences']>) => void;
  
  addRecentPage: (page: Omit<UIState['recentPages'][0], 'timestamp'>) => void;
  clearRecentPages: () => void;
  
  // 重置
  reset: () => void;
}

const initialState = {
  theme: 'light' as ThemeMode,
  primaryColor: '#1890ff',
  layoutMode: 'side' as LayoutMode,
  collapsed: false,
  fixedHeader: true,
  fixedSidebar: true,
  language: 'zh-CN' as Language,
  globalLoading: false,
  loadingTexts: {},
  notifications: [],
  modal: { visible: false },
  drawer: { visible: false },
  breadcrumbs: [],
  pageTitle: '',
  isFullscreen: false,
  tableSettings: {
    pageSize: 20,
    showSizeChanger: true,
    showQuickJumper: true,
  },
  chartSettings: {
    theme: 'light' as const,
    animation: true,
  },
  preferences: {
    showWelcome: true,
    autoRefresh: false,
    refreshInterval: 30,
    enableNotifications: true,
    enableSound: false,
  },
  recentPages: [],
};

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 主题
      setTheme: (theme) => set({ theme }),
      setPrimaryColor: (color) => set({ primaryColor: color }),

      // 布局
      setLayoutMode: (mode) => set({ layoutMode: mode }),
      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),
      setFixedHeader: (fixed) => set({ fixedHeader: fixed }),
      setFixedSidebar: (fixed) => set({ fixedSidebar: fixed }),

      // 语言
      setLanguage: (lang) => set({ language: lang }),

      // 加载状态
      setGlobalLoading: (loading, text) =>
        set((state) => ({
          globalLoading: loading,
          loadingTexts: text
            ? { ...state.loadingTexts, global: text }
            : state.loadingTexts,
        })),

      addLoadingText: (key, text) =>
        set((state) => ({
          loadingTexts: { ...state.loadingTexts, [key]: text },
        })),

      removeLoadingText: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.loadingTexts;
          return { loadingTexts: rest };
        }),

      // 通知
      addNotification: (notification) =>
        set((state) => ({
          notifications: [
            ...state.notifications,
            {
              ...notification,
              id: `notification-${Date.now()}-${Math.random()}`,
              timestamp: Date.now(),
            },
          ],
        })),

      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        })),

      clearNotifications: () => set({ notifications: [] }),

      // 弹窗
      openModal: (config) =>
        set({
          modal: { ...config, visible: true },
        }),

      closeModal: () =>
        set((state) => ({
          modal: { ...state.modal, visible: false },
        })),

      updateModalData: (data) =>
        set((state) => ({
          modal: { ...state.modal, data },
        })),

      // 抽屉
      openDrawer: (config) =>
        set({
          drawer: { ...config, visible: true, placement: config.placement || 'right' },
        }),

      closeDrawer: () =>
        set((state) => ({
          drawer: { ...state.drawer, visible: false },
        })),

      updateDrawerData: (data) =>
        set((state) => ({
          drawer: { ...state.drawer, data },
        })),

      // 面包屑
      setBreadcrumbs: (items) => set({ breadcrumbs: items }),

      addBreadcrumb: (item) =>
        set((state) => ({
          breadcrumbs: [...state.breadcrumbs, item],
        })),

      // 页面标题
      setPageTitle: (title) => set({ pageTitle: title }),

      // 全屏
      toggleFullscreen: () =>
        set((state) => {
          const newState = !state.isFullscreen;
          
          if (newState) {
            document.documentElement.requestFullscreen?.();
          } else {
            document.exitFullscreen?.();
          }
          
          return { isFullscreen: newState };
        }),

      setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),

      // 表格设置
      setTableSettings: (settings) =>
        set((state) => ({
          tableSettings: { ...state.tableSettings, ...settings },
        })),

      // 图表设置
      setChartSettings: (settings) =>
        set((state) => ({
          chartSettings: { ...state.chartSettings, ...settings },
        })),

      // 用户偏好
      setPreferences: (preferences) =>
        set((state) => ({
          preferences: { ...state.preferences, ...preferences },
        })),

      // 最近访问
      addRecentPage: (page) =>
        set((state) => {
          const recentPages = [
            { ...page, timestamp: Date.now() },
            ...state.recentPages.filter((p) => p.path !== page.path),
          ].slice(0, 10); // 只保留最近 10 条

          return { recentPages };
        }),

      clearRecentPages: () => set({ recentPages: [] }),

      // 重置
      reset: () => set(initialState),
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        primaryColor: state.primaryColor,
        layoutMode: state.layoutMode,
        collapsed: state.collapsed,
        fixedHeader: state.fixedHeader,
        fixedSidebar: state.fixedSidebar,
        language: state.language,
        tableSettings: state.tableSettings,
        chartSettings: state.chartSettings,
        preferences: state.preferences,
        recentPages: state.recentPages,
      }),
    }
  )
);

// 辅助 Hooks
export const useTheme = () => {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  return { theme, setTheme };
};

export const useLayout = () => {
  const layoutMode = useUIStore((state) => state.layoutMode);
  const collapsed = useUIStore((state) => state.collapsed);
  const toggleCollapsed = useUIStore((state) => state.toggleCollapsed);
  const setCollapsed = useUIStore((state) => state.setCollapsed);
  return { layoutMode, collapsed, toggleCollapsed, setCollapsed };
};

export const useLoading = () => {
  const globalLoading = useUIStore((state) => state.globalLoading);
  const setGlobalLoading = useUIStore((state) => state.setGlobalLoading);
  return { globalLoading, setGlobalLoading };
};

export const useNotifications = () => {
  const notifications = useUIStore((state) => state.notifications);
  const addNotification = useUIStore((state) => state.addNotification);
  const removeNotification = useUIStore((state) => state.removeNotification);
  const clearNotifications = useUIStore((state) => state.clearNotifications);
  return { notifications, addNotification, removeNotification, clearNotifications };
};

export const useModal = () => {
  const modal = useUIStore((state) => state.modal);
  const openModal = useUIStore((state) => state.openModal);
  const closeModal = useUIStore((state) => state.closeModal);
  const updateModalData = useUIStore((state) => state.updateModalData);
  return { modal, openModal, closeModal, updateModalData };
};

export const useDrawer = () => {
  const drawer = useUIStore((state) => state.drawer);
  const openDrawer = useUIStore((state) => state.openDrawer);
  const closeDrawer = useUIStore((state) => state.closeDrawer);
  const updateDrawerData = useUIStore((state) => state.updateDrawerData);
  return { drawer, openDrawer, closeDrawer, updateDrawerData };
};