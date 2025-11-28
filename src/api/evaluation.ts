import client from './client';
import type {
  EvaluationRun,
  EvaluationProgress,
  CreateEvaluationRequest,
  Task,
  EvaluationRule,
} from '@/types/evaluation';

export const evaluationApi = {
  // 获取任务列表
  getTasks: () => {
    return client.get<Task[]>('/tasks') as unknown as Promise<Task[]>;
  },

  // 获取任务的评测规则
  getTaskRules: (taskId: number) => {
    return client.get<EvaluationRule[]>(`/tasks/${taskId}/rules`) as unknown as Promise<EvaluationRule[]>;
  },

  // 创建评测
  createEvaluation: (data: CreateEvaluationRequest) => {
    return client.post<EvaluationRun>('/evaluations/runs', data) as unknown as Promise<EvaluationRun>;
  },

  // 获取评测列表
  getEvaluations: (params?: { task_id?: number; limit?: number; offset?: number }) => {
    return client.get<EvaluationRun[]>('/evaluations/runs', { params }) as unknown as Promise<EvaluationRun[]>;
  },

  // 获取评测详情
  getEvaluationDetail: (runId: number) => {
    return client.get<EvaluationRun>(`/evaluations/runs/${runId}`) as unknown as Promise<EvaluationRun>;
  },

  // 获取评测进度
  getEvaluationProgress: (runId: number, params?: { limit?: number; offset?: number }) => {
    return client.get<EvaluationProgress>(`/evaluations/runs/${runId}/progress`, { params }) as unknown as Promise<EvaluationProgress>;
  },

  // 获取评测指标
  getMetrics: (runId: number) => {
    return client.get<any[]>(`/metrics/runs/${runId}`) as unknown as Promise<any[]>;
  },

  // 对比多个评测的指标
  compareMetrics: (runIds: number[]) => {
    return client.get('/metrics/compare', {
      params: { run_ids: runIds },
    }) as unknown as Promise<any>;
  },
};