// src/store/evaluationStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { EvaluationRun, EvaluationProgress, Task, EvaluationRule } from '@/types/evaluation';

interface EvaluationFilter {
  status?: string[];
  taskId?: number;
  modelVersion?: string;
  dateRange?: [string, string];
}

interface EvaluationSort {
  field: 'created_at' | 'progress_percent' | 'total_count';
  order: 'asc' | 'desc';
}

interface EvaluationState {
  // 当前评测数据
  currentRun: EvaluationRun | null;
  currentProgress: EvaluationProgress | null;
  
  // 评测列表
  runs: EvaluationRun[];
  totalCount: number;
  
  // 任务和规则
  tasks: Task[];
  rules: Record<number, EvaluationRule[]>; // taskId -> rules
  
  // 筛选和排序
  filter: EvaluationFilter;
  sort: EvaluationSort;
  
  // 分页
  pagination: {
    current: number;
    pageSize: number;
  };
  
  // 选中项
  selectedRunIds: number[];
  
  // WebSocket 连接状态
  wsConnections: Record<number, boolean>; // runId -> isConnected
  
  // 操作
  setCurrentRun: (run: EvaluationRun | null) => void;
  setCurrentProgress: (progress: EvaluationProgress | null) => void;
  updateCurrentProgress: (data: Partial<EvaluationProgress>) => void;
  
  setRuns: (runs: EvaluationRun[]) => void;
  addRun: (run: EvaluationRun) => void;
  updateRun: (id: number, data: Partial<EvaluationRun>) => void;
  removeRun: (id: number) => void;
  
  setTasks: (tasks: Task[]) => void;
  setRules: (taskId: number, rules: EvaluationRule[]) => void;
  
  setFilter: (filter: Partial<EvaluationFilter>) => void;
  clearFilter: () => void;
  
  setSort: (sort: EvaluationSort) => void;
  
  setPagination: (pagination: Partial<{ current: number; pageSize: number }>) => void;
  
  setSelectedRunIds: (ids: number[]) => void;
  toggleSelectedRun: (id: number) => void;
  selectAllRuns: () => void;
  clearSelection: () => void;
  
  setWsConnection: (runId: number, isConnected: boolean) => void;
  
  // 计算属性
  getFilteredRuns: () => EvaluationRun[];
  getSortedRuns: () => EvaluationRun[];
  getRunById: (id: number) => EvaluationRun | undefined;
  getRulesByTaskId: (taskId: number) => EvaluationRule[];
  
  // 统计
  getStatistics: () => {
    total: number;
    completed: number;
    running: number;
    failed: number;
    pending: number;
  };
  
  // 重置
  reset: () => void;
}

const initialState = {
  currentRun: null,
  currentProgress: null,
  runs: [],
  totalCount: 0,
  tasks: [],
  rules: {},
  filter: {},
  sort: { field: 'created_at' as const, order: 'desc' as const },
  pagination: { current: 1, pageSize: 20 },
  selectedRunIds: [],
  wsConnections: {},
};

export const useEvaluationStore = create<EvaluationState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // 设置当前评测
      setCurrentRun: (run) => set({ currentRun: run }),

      // 设置当前进度
      setCurrentProgress: (progress) => set({ currentProgress: progress }),

      // 更新当前进度
      updateCurrentProgress: (data) =>
        set((state) => ({
          currentProgress: state.currentProgress
            ? { ...state.currentProgress, ...data }
            : null,
        })),

      // 设置评测列表
      setRuns: (runs) => set({ runs, totalCount: runs.length }),

      // 添加评测
      addRun: (run) =>
        set((state) => ({
          runs: [run, ...state.runs],
          totalCount: state.totalCount + 1,
        })),

      // 更新评测
      updateRun: (id, data) =>
        set((state) => ({
          runs: state.runs.map((run) =>
            run.id === id ? { ...run, ...data } : run
          ),
          currentRun:
            state.currentRun?.id === id
              ? { ...state.currentRun, ...data }
              : state.currentRun,
        })),

      // 删除评测
      removeRun: (id) =>
        set((state) => ({
          runs: state.runs.filter((run) => run.id !== id),
          totalCount: state.totalCount - 1,
          selectedRunIds: state.selectedRunIds.filter((rid) => rid !== id),
        })),

      // 设置任务列表
      setTasks: (tasks) => set({ tasks }),

      // 设置规则列表
      setRules: (taskId, rules) =>
        set((state) => ({
          rules: { ...state.rules, [taskId]: rules },
        })),

      // 设置筛选条件
      setFilter: (filter) =>
        set((state) => ({
          filter: { ...state.filter, ...filter },
          pagination: { ...state.pagination, current: 1 }, // 重置到第一页
        })),

      // 清除筛选
      clearFilter: () =>
        set({
          filter: {},
          pagination: { current: 1, pageSize: 20 },
        }),

      // 设置排序
      setSort: (sort) => set({ sort }),

      // 设置分页
      setPagination: (pagination) =>
        set((state) => ({
          pagination: { ...state.pagination, ...pagination },
        })),

      // 设置选中的评测
      setSelectedRunIds: (ids) => set({ selectedRunIds: ids }),

      // 切换选中状态
      toggleSelectedRun: (id) =>
        set((state) => ({
          selectedRunIds: state.selectedRunIds.includes(id)
            ? state.selectedRunIds.filter((rid) => rid !== id)
            : [...state.selectedRunIds, id],
        })),

      // 全选
      selectAllRuns: () =>
        set((state) => ({
          selectedRunIds: state.runs.map((run) => run.id),
        })),

      // 清除选择
      clearSelection: () => set({ selectedRunIds: [] }),

      // 设置 WebSocket 连接状态
      setWsConnection: (runId, isConnected) =>
        set((state) => ({
          wsConnections: { ...state.wsConnections, [runId]: isConnected },
        })),

      // 获取筛选后的评测列表
      getFilteredRuns: () => {
        const { runs, filter } = get();
        let filtered = [...runs];

        if (filter.status && filter.status.length > 0) {
          filtered = filtered.filter((run) => filter.status!.includes(run.status));
        }

        if (filter.taskId) {
          filtered = filtered.filter((run) => run.task_id === filter.taskId);
        }

        if (filter.modelVersion) {
          filtered = filtered.filter((run) =>
            run.model_version.includes(filter.modelVersion!)
          );
        }

        if (filter.dateRange) {
          const [start, end] = filter.dateRange;
          filtered = filtered.filter((run) => {
            const date = new Date(run.created_at);
            return date >= new Date(start) && date <= new Date(end);
          });
        }

        return filtered;
      },

      // 获取排序后的评测列表
      getSortedRuns: () => {
        const { sort } = get();
        const filtered = get().getFilteredRuns();

        return [...filtered].sort((a, b) => {
          const aVal = a[sort.field];
          const bVal = b[sort.field];

          if (sort.order === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
      },

      // 根据 ID 获取评测
      getRunById: (id) => {
        const { runs } = get();
        return runs.find((run) => run.id === id);
      },

      // 根据任务 ID 获取规则
      getRulesByTaskId: (taskId) => {
        const { rules } = get();
        return rules[taskId] || [];
      },

      // 获取统计信息
      getStatistics: () => {
        const { runs } = get();
        return {
          total: runs.length,
          completed: runs.filter((r) => r.status === 'completed').length,
          running: runs.filter((r) => r.status === 'running').length,
          failed: runs.filter((r) => r.status === 'failed').length,
          pending: runs.filter((r) => r.status === 'pending').length,
        };
      },

      // 重置状态
      reset: () => set(initialState),
    }),
    {
      name: 'evaluation-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        filter: state.filter,
        sort: state.sort,
        pagination: state.pagination,
      }),
    }
  )
);