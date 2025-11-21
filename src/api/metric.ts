// src/api/metric.ts
import client from './client';

export interface Metric {
  metric_name: string;
  metric_value: number;
  metric_config?: Record<string, any>;
}

export interface MetricResponse {
  id: number;
  run_id: number;
  metric_name: string;
  metric_value: number;
  metric_config?: Record<string, any>;
  created_at: string;
}

export interface MetricComparison {
  [runId: string]: {
    run_name: string;
    model_version: string;
    created_at: string;
    metrics: Record<string, number>;
  };
}

export interface MetricTrend {
  date: string;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1_score?: number;
  [key: string]: any;
}

export interface MetricSummary {
  metric_name: string;
  avg_value: number;
  max_value: number;
  min_value: number;
  latest_value: number;
  trend: 'up' | 'down' | 'stable';
}

export const metricApi = {
  /**
   * 获取指定评测的所有指标
   * @param runId 评测运行ID
   * @returns 指标列表
   */
  getMetrics: (runId: number) => {
    return client.get<MetricResponse[]>(`/metrics/runs/${runId}`);
  },

  /**
   * 对比多个评测的指标
   * @param runIds 评测ID数组
   * @returns 对比结果
   */
  compareMetrics: (runIds: number[]) => {
    return client.get<MetricComparison>('/metrics/compare', {
      params: { run_ids: runIds },
      paramsSerializer: (params) => {
        // 处理数组参数
        return Object.entries(params)
          .map(([key, value]) => {
            if (Array.isArray(value)) {
              return value.map((v) => `${key}=${v}`).join('&');
            }
            return `${key}=${value}`;
          })
          .join('&');
      },
    });
  },

  /**
   * 重新计算指标
   * @param runId 评测运行ID
   */
  recalculateMetrics: (runId: number) => {
    return client.post(`/metrics/recalculate/${runId}`);
  },

  /**
   * 获取指标趋势数据
   * @param taskId 任务ID
   * @param metricName 指标名称
   * @param limit 数据条数
   * @returns 趋势数据
   */
  getMetricTrend: (taskId: number, metricName: string, limit: number = 10) => {
    return client.get<MetricTrend[]>('/metrics/trend', {
      params: { task_id: taskId, metric_name: metricName, limit },
    });
  },

  /**
   * 获取任务的指标汇总
   * @param taskId 任务ID
   * @returns 指标汇总
   */
  getMetricSummary: (taskId: number) => {
    return client.get<MetricSummary[]>(`/metrics/tasks/${taskId}/summary`);
  },

  /**
   * 导出指标数据为 CSV
   * @param runId 评测运行ID
   */
  exportMetricsCSV: async (runId: number) => {
    const response = await client.get(`/metrics/runs/${runId}/export`, {
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `metrics_run_${runId}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * 获取指标详细信息
   * @param metricId 指标ID
   */
  getMetricDetail: (metricId: number) => {
    return client.get<MetricResponse>(`/metrics/${metricId}`);
  },

  /**
   * 批量获取多个评测的指标
   * @param runIds 评测ID数组
   * @returns 指标映射
   */
  batchGetMetrics: async (runIds: number[]) => {
    const promises = runIds.map((runId) => 
      metricApi.getMetrics(runId).then((metrics) => ({ runId, metrics }))
    );
    const results = await Promise.all(promises);
    
    // 转换为 Map 结构
    return results.reduce((acc, { runId, metrics }) => {
      acc[runId] = metrics;
      return acc;
    }, {} as Record<number, MetricResponse[]>);
  },

  /**
   * 计算指标变化率
   * @param currentValue 当前值
   * @param previousValue 之前值
   * @returns 变化率（百分比）
   */
  calculateChange: (currentValue: number, previousValue: number): number => {
    if (previousValue === 0) return 0;
    return ((currentValue - previousValue) / previousValue) * 100;
  },

  /**
   * 格式化指标值
   * @param value 指标值
   * @param metricName 指标名称
   * @returns 格式化后的字符串
   */
  formatMetricValue: (value: number, metricName: string): string => {
    // 百分比类型的指标
    const percentageMetrics = ['accuracy', 'precision', 'recall', 'pass_rate'];
    
    if (percentageMetrics.includes(metricName.toLowerCase())) {
      return `${(value * 100).toFixed(2)}%`;
    }
    
    // 分数类型的指标
    const scoreMetrics = ['f1_score', 'average_score'];
    if (scoreMetrics.includes(metricName.toLowerCase())) {
      return value.toFixed(4);
    }
    
    // 整数类型的指标
    const integerMetrics = ['total_count', 'correct_count', 'pass_count'];
    if (integerMetrics.includes(metricName.toLowerCase())) {
      return value.toString();
    }
    
    // 默认保留2位小数
    return value.toFixed(2);
  },

  /**
   * 获取指标颜色（用于图表展示）
   * @param value 指标值
   * @param threshold 阈值配置
   * @returns 颜色代码
   */
  getMetricColor: (
    value: number,
    threshold: { good: number; warning: number }
  ): string => {
    if (value >= threshold.good) return '#52c41a'; // 绿色
    if (value >= threshold.warning) return '#faad14'; // 黄色
    return '#f5222d'; // 红色
  },

  /**
   * 获取指标描述
   * @param metricName 指标名称
   * @returns 指标描述
   */
  getMetricDescription: (metricName: string): string => {
    const descriptions: Record<string, string> = {
      accuracy: '准确率：预测正确的样本数占总样本数的比例',
      precision: '精确率：预测为正的样本中实际为正的比例',
      recall: '召回率：实际为正的样本中被预测为正的比例',
      f1_score: 'F1分数：精确率和召回率的调和平均值',
      average_score: '平均分：所有评分的平均值',
      pass_rate: '通过率：评分达到阈值的样本比例',
      total_count: '总数：评测的样本总数',
      correct_count: '正确数：预测正确的样本数',
      pass_count: '通过数：评分达到阈值的样本数',
    };

    return descriptions[metricName.toLowerCase()] || '暂无描述';
  },

  /**
   * 计算综合评分
   * @param metrics 指标对象
   * @param weights 权重配置
   * @returns 综合评分
   */
  calculateOverallScore: (
    metrics: Record<string, number>,
    weights?: Record<string, number>
  ): number => {
    const defaultWeights = {
      accuracy: 0.4,
      precision: 0.2,
      recall: 0.2,
      f1_score: 0.2,
    };

    const finalWeights = weights || defaultWeights;
    let totalScore = 0;
    let totalWeight = 0;

    Object.entries(finalWeights).forEach(([metricName, weight]) => {
      if (metrics[metricName] !== undefined) {
        totalScore += metrics[metricName] * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? totalScore / totalWeight : 0;
  },

  /**
   * 判断指标趋势
   * @param values 指标值数组（时间序列）
   * @returns 趋势类型
   */
  detectTrend: (values: number[]): 'up' | 'down' | 'stable' => {
    if (values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const change = (avgSecond - avgFirst) / avgFirst;

    if (change > 0.05) return 'up';
    if (change < -0.05) return 'down';
    return 'stable';
  },

  /**
   * 获取最佳模型（基于指定指标）
   * @param comparison 对比数据
   * @param metricName 指标名称
   * @returns 最佳模型的 runId
   */
  getBestModel: (comparison: MetricComparison, metricName: string): string | null => {
    let bestRunId: string | null = null;
    let bestValue = -Infinity;

    Object.entries(comparison).forEach(([runId, data]) => {
      const value = data.metrics[metricName];
      if (value !== undefined && value > bestValue) {
        bestValue = value;
        bestRunId = runId;
      }
    });

    return bestRunId;
  },

  /**
   * 生成指标报告
   * @param runId 评测运行ID
   * @returns 报告数据
   */
  generateReport: async (runId: number) => {
    const metrics = await metricApi.getMetrics(runId);
    
    const report = {
      runId,
      generatedAt: new Date().toISOString(),
      metrics: metrics.map((m) => ({
        name: m.metric_name,
        value: m.metric_value,
        formattedValue: metricApi.formatMetricValue(m.metric_value, m.metric_name),
        description: metricApi.getMetricDescription(m.metric_name),
      })),
      summary: {
        totalMetrics: metrics.length,
        overallScore: metricApi.calculateOverallScore(
          metrics.reduce((acc, m) => ({ ...acc, [m.metric_name]: m.metric_value }), {})
        ),
      },
    };

    return report;
  },
};