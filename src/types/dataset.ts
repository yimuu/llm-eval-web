// src/types/dataset.ts

/**
 * 数据集基础信息
 */
export interface Dataset {
  id: number;
  task_id: number;
  task_name?: string;
  name?: string;
  description?: string;
  data_count?: number;
  created_at: string;
  updated_at?: string;
}

/**
 * 数据集条目（单条数据）
 */
export interface DatasetItem {
  id: number;
  task_id: number;
  dataset_id?: number;
  input_data: Record<string, any>;
  ground_truth: Record<string, any>;
  metadata?: Record<string, any>;
  created_at: string;
}

/**
 * 图像数据集输入
 */
export interface ImageDatasetInput {
  image_path: string;
  image_url?: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * 文档数据集输入
 */
export interface DocumentDatasetInput {
  document_path: string;
  document_url?: string;
  document_type: 'pdf' | 'docx' | 'txt';
  page_count?: number;
}

/**
 * 分类任务的标准答案
 */
export interface ClassificationGroundTruth {
  label: string;
  category?: string;
  confidence?: number;
  description?: string;
}

/**
 * 检测任务的标准答案
 */
export interface DetectionGroundTruth {
  boxes: Array<{
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    confidence?: number;
  }>;
  labels: string[];
}

/**
 * 报告解读任务的标准答案
 */
export interface ReportGroundTruth {
  findings: string[];
  diagnosis: string;
  recommendations?: string[];
  severity?: 'low' | 'medium' | 'high';
  keywords?: string[];
}

/**
 * 数据集创建请求
 */
export interface CreateDatasetRequest {
  task_id: number;
  name: string;
  description?: string;
  items: Array<{
    input_data: Record<string, any>;
    ground_truth: Record<string, any>;
    metadata?: Record<string, any>;
  }>;
}

/**
 * 数据集更新请求
 */
export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
}

/**
 * 数据集批量导入
 */
export interface DatasetImportRequest {
  task_id: number;
  format: 'json' | 'csv' | 'excel';
  file_id?: number;
  data?: any[];
}

/**
 * 数据集导出配置
 */
export interface DatasetExportConfig {
  format: 'json' | 'csv' | 'excel';
  include_metadata?: boolean;
  filters?: {
    ids?: number[];
    date_range?: {
      start: string;
      end: string;
    };
  };
}

/**
 * 数据集统计信息
 */
export interface DatasetStatistics {
  total_count: number;
  label_distribution: Record<string, number>;
  avg_image_size?: {
    width: number;
    height: number;
  };
  file_size_total?: number;
  created_at_range?: {
    earliest: string;
    latest: string;
  };
}

/**
 * 数据集验证结果
 */
export interface DatasetValidationResult {
  is_valid: boolean;
  errors: Array<{
    item_index: number;
    field: string;
    message: string;
  }>;
  warnings: Array<{
    item_index: number;
    field: string;
    message: string;
  }>;
  statistics: {
    total_items: number;
    valid_items: number;
    invalid_items: number;
  };
}

/**
 * 数据集分割配置
 */
export interface DatasetSplitConfig {
  train_ratio: number;
  val_ratio: number;
  test_ratio: number;
  random_seed?: number;
  stratify?: boolean; // 是否按标签分层采样
}

/**
 * 数据集分割结果
 */
export interface DatasetSplitResult {
  train: number[];
  validation: number[];
  test: number[];
  statistics: {
    train_count: number;
    val_count: number;
    test_count: number;
    label_distribution: Record<string, { train: number; val: number; test: number }>;
  };
}

/**
 * 数据增强配置
 */
export interface DataAugmentationConfig {
  rotation?: {
    enabled: boolean;
    angle_range: [number, number];
  };
  flip?: {
    horizontal: boolean;
    vertical: boolean;
  };
  brightness?: {
    enabled: boolean;
    range: [number, number];
  };
  contrast?: {
    enabled: boolean;
    range: [number, number];
  };
  noise?: {
    enabled: boolean;
    type: 'gaussian' | 'salt_pepper';
  };
}

/**
 * 数据集标注信息
 */
export interface DatasetAnnotation {
  id: number;
  dataset_item_id: number;
  annotator_id: number;
  annotator_name?: string;
  annotation_data: Record<string, any>;
  quality_score?: number;
  status: 'pending' | 'in_progress' | 'completed' | 'reviewed';
  created_at: string;
  updated_at?: string;
}

/**
 * 数据集标注任务
 */
export interface AnnotationTask {
  id: number;
  dataset_id: number;
  name: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  total_items: number;
  completed_items: number;
  assigned_to?: number[];
  deadline?: string;
  created_at: string;
}

/**
 * 数据集查询参数
 */
export interface DatasetQueryParams {
  task_id?: number;
  keyword?: string;
  limit?: number;
  offset?: number;
  sort_by?: 'created_at' | 'updated_at' | 'name';
  sort_order?: 'asc' | 'desc';
}

/**
 * 数据集条目查询参数
 */
export interface DatasetItemQueryParams {
  dataset_id?: number;
  task_id?: number;
  label?: string;
  has_annotation?: boolean;
  limit?: number;
  offset?: number;
}

/**
 * 数据集版本
 */
export interface DatasetVersion {
  id: number;
  dataset_id: number;
  version: string;
  description?: string;
  item_count: number;
  changes?: string[];
  created_by: number;
  created_at: string;
}

/**
 * 数据质量检查结果
 */
export interface DataQualityCheck {
  dataset_id: number;
  checked_at: string;
  issues: Array<{
    type: 'missing_data' | 'invalid_format' | 'duplicate' | 'outlier';
    severity: 'low' | 'medium' | 'high';
    item_id: number;
    description: string;
    suggestion?: string;
  }>;
  statistics: {
    total_items: number;
    issues_count: number;
    quality_score: number;
  };
}

/**
 * 数据集类型枚举
 */
export enum DatasetType {
  IMAGE_CLASSIFICATION = 'image_classification',
  OBJECT_DETECTION = 'object_detection',
  SEMANTIC_SEGMENTATION = 'semantic_segmentation',
  TEXT_CLASSIFICATION = 'text_classification',
  REPORT_ANALYSIS = 'report_analysis',
  CUSTOM = 'custom',
}

/**
 * 数据集状态
 */
export enum DatasetStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

/**
 * 标注状态
 */
export enum AnnotationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  REVIEWED = 'reviewed',
  REJECTED = 'rejected',
}

/**
 * 数据集权限
 */
export interface DatasetPermission {
  dataset_id: number;
  user_id: number;
  role: 'owner' | 'editor' | 'viewer';
  can_view: boolean;
  can_edit: boolean;
  can_delete: boolean;
  can_share: boolean;
}

/**
 * 数据集标签
 */
export interface DatasetLabel {
  id: number;
  name: string;
  color?: string;
  description?: string;
  parent_id?: number;
  children?: DatasetLabel[];
}

/**
 * 标签树
 */
export interface LabelTree {
  labels: DatasetLabel[];
  hierarchy: Record<number, number[]>; // parent_id -> child_ids
}

/**
 * 数据集模板
 */
export interface DatasetTemplate {
  id: number;
  name: string;
  description?: string;
  task_type: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  example_data?: any[];
}

/**
 * 批量操作请求
 */
export interface BatchOperationRequest {
  operation: 'delete' | 'update' | 'export' | 'move';
  item_ids: number[];
  params?: Record<string, any>;
}

/**
 * 批量操作结果
 */
export interface BatchOperationResult {
  success_count: number;
  failed_count: number;
  errors?: Array<{
    item_id: number;
    error: string;
  }>;
}