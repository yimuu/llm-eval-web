export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface EvaluationRun {
  id: number;
  task_id: number;
  rule_id: number;
  model_version: string;
  run_name: string | null;
  status: RunStatus;
  total_count: number;
  completed_count: number;
  failed_count: number;
  progress_percent: number;
  start_time: string | null;
  end_time: string | null;
  created_at: string;
}

export interface EvaluationResult {
  id: number;
  dataset_id: number;
  status: RunStatus;
  model_output: Record<string, any> | null;
  evaluation_result: Record<string, any> | null;
  error_message: string | null;
  execution_time: number | null;
}

export interface EvaluationProgress {
  run_id: number;
  status: RunStatus;
  total_count: number;
  completed_count: number;
  failed_count: number;
  pending_count: number;
  progress_percent: number;
  results: EvaluationResult[];
}

export interface CreateEvaluationRequest {
  task_id: number;
  rule_id: number;
  model_version: string;
  run_name?: string;
}

export interface Task {
  id: number;
  task_name: string;
  task_type: string;
  description: string;
  created_at: string;
}

export interface EvaluationRule {
  id: number;
  task_id: number;
  rule_name: string;
  rule_type: string;
  rule_config: Record<string, any>;
  description: string;
}

export interface Metric {
  metric_name: string;
  metric_value: number;
  metric_config: Record<string, any> | null;
}

export interface MetricComparison {
  [runId: string]: {
    run_name: string;
    model_version: string;
    created_at: string;
    metrics: Record<string, number>;
  };
}