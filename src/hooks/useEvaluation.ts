import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluationApi } from '@/api/evaluation';
import type { CreateEvaluationRequest } from '@/types/evaluation';
import { message } from 'antd';

export const useEvaluations = (taskId?: number) => {
  return useQuery({
    queryKey: ['evaluations', taskId],
    queryFn: () => evaluationApi.getEvaluations({ task_id: taskId }),
  });
};

export const useEvaluationDetail = (runId: number) => {
  return useQuery({
    queryKey: ['evaluation', runId],
    queryFn: () => evaluationApi.getEvaluationDetail(runId),
    enabled: !!runId,
  });
};

export const useEvaluationProgress = (runId: number, autoRefresh = false) => {
  return useQuery({
    queryKey: ['evaluation-progress', runId],
    queryFn: () => evaluationApi.getEvaluationProgress(runId),
    enabled: !!runId,
    refetchInterval: autoRefresh ? 3000 : false, // 自动刷新
  });
};

export const useCreateEvaluation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEvaluationRequest) => evaluationApi.createEvaluation(data),
    onSuccess: () => {
      message.success('评测任务创建成功');
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
    },
    onError: (error: any) => {
      message.error(error.message || '创建失败');
    },
  });
};

export const useMetrics = (runId: number) => {
  return useQuery({
    queryKey: ['metrics', runId],
    queryFn: () => evaluationApi.getMetrics(runId),
    enabled: !!runId,
  });
};

export const useMetricComparison = (runIds: number[]) => {
  return useQuery({
    queryKey: ['metric-comparison', runIds],
    queryFn: () => evaluationApi.compareMetrics(runIds),
    enabled: runIds.length > 0,
  });
};