// src/hooks/useMetric.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { metricApi } from '@/api/metric';
import type { MetricComparison, MetricTrend } from '@/api/metric';

/**
 * 获取评测指标 Hook
 */
export const useMetrics = (runId: number) => {
  return useQuery({
    queryKey: ['metrics', runId],
    queryFn: () => metricApi.getMetrics(runId),
    enabled: !!runId,
  });
};

/**
 * 指标对比 Hook
 */
export const useMetricComparison = (runIds: number[]) => {
  return useQuery({
    queryKey: ['metric-comparison', runIds],
    queryFn: () => metricApi.compareMetrics(runIds),
    enabled: runIds.length > 0,
  });
};

/**
 * 指标趋势 Hook
 */
export const useMetricTrend = (
  taskId: number,
  metricName: string,
  limit: number = 10
) => {
  return useQuery({
    queryKey: ['metric-trend', taskId, metricName, limit],
    queryFn: () => metricApi.getMetricTrend(taskId, metricName, limit),
    enabled: !!taskId && !!metricName,
  });
};

/**
 * 指标汇总 Hook
 */
export const useMetricSummary = (taskId: number) => {
  return useQuery({
    queryKey: ['metric-summary', taskId],
    queryFn: () => metricApi.getMetricSummary(taskId),
    enabled: !!taskId,
  });
};

/**
 * 重新计算指标 Hook
 */
export const useRecalculateMetrics = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (runId: number) => metricApi.recalculateMetrics(runId),
    onSuccess: (_, runId) => {
      message.success('指标重新计算完成');
      queryClient.invalidateQueries({ queryKey: ['metrics', runId] });
    },
    onError: (error: any) => {
      message.error(error.message || '重新计算失败');
    },
  });
};

/**
 * 导出指标 Hook
 */
export const useExportMetrics = () => {
  return useMutation({
    mutationFn: (runId: number) => metricApi.exportMetricsCSV(runId),
    onSuccess: () => {
      message.success('导出成功');
    },
    onError: (error: any) => {
      message.error(error.message || '导出失败');
    },
  });
};

/**
 * 批量获取指标 Hook
 */
export const useBatchMetrics = (runIds: number[]) => {
  return useQuery({
    queryKey: ['batch-metrics', runIds],
    queryFn: () => metricApi.batchGetMetrics(runIds),
    enabled: runIds.length > 0,
  });
};

/**
 * 指标统计计算 Hook
 */
export const useMetricStats = (runId: number) => {
  const { data: metrics } = useMetrics(runId);

  if (!metrics) return null;

  const metricsMap = metrics.reduce((acc, m) => {
    acc[m.metric_name] = m.metric_value;
    return acc;
  }, {} as Record<string, number>);

  // 计算综合评分
  const overallScore = metricApi.calculateOverallScore(metricsMap);

  // 格式化所有指标
  const formattedMetrics = metrics.map((m) => ({
    ...m,
    formattedValue: metricApi.formatMetricValue(m.metric_value, m.metric_name),
    description: metricApi.getMetricDescription(m.metric_name),
    color: metricApi.getMetricColor(m.metric_value, { good: 0.8, warning: 0.6 }),
  }));

  return {
    metrics: formattedMetrics,
    overallScore,
    metricsMap,
  };
};

/**
 * 指标对比分析 Hook
 */
export const useMetricComparisonAnalysis = (runIds: number[]) => {
  const { data: comparison } = useMetricComparison(runIds);

  if (!comparison) return null;

  // 找出最佳模型
  const bestModels: Record<string, string | null> = {};
  const allMetricNames = new Set<string>();

  Object.values(comparison).forEach((run) => {
    Object.keys(run.metrics).forEach((name) => allMetricNames.add(name));
  });

  allMetricNames.forEach((metricName) => {
    bestModels[metricName] = metricApi.getBestModel(comparison, metricName);
  });

  // 计算模型排名
  const modelRankings = Object.entries(comparison)
    .map(([runId, data]) => {
      const score = metricApi.calculateOverallScore(data.metrics);
      return {
        runId,
        modelVersion: data.model_version,
        runName: data.run_name,
        score,
      };
    })
    .sort((a, b) => b.score - a.score);

  return {
    comparison,
    bestModels,
    modelRankings,
    allMetricNames: Array.from(allMetricNames),
  };
};

/**
 * 指标趋势分析 Hook
 */
export const useMetricTrendAnalysis = (
  taskId: number,
  metricName: string,
  limit: number = 10
) => {
  const { data: trend } = useMetricTrend(taskId, metricName, limit);

  if (!trend) return null;

  const values = trend.map((t) => t[metricName] || 0);
  const trendType = metricApi.detectTrend(values);

  // 计算统计信息
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const latest = values[values.length - 1];
  const change = values.length > 1 
    ? metricApi.calculateChange(latest, values[0]) 
    : 0;

  return {
    trend,
    trendType,
    statistics: {
      avg,
      max,
      min,
      latest,
      change,
    },
  };
};