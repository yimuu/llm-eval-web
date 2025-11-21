// src/api/dataset.ts
import client from './client';
import type {
  Dataset,
  DatasetItem,
  CreateDatasetRequest,
  UpdateDatasetRequest,
  DatasetQueryParams,
  DatasetItemQueryParams,
  DatasetStatistics,
  DatasetValidationResult,
  DatasetSplitConfig,
  DatasetSplitResult,
  BatchOperationRequest,
  BatchOperationResult,
  DatasetExportConfig,
} from '@/types/dataset';

export const datasetApi = {
  /**
   * 获取数据集列表
   */
  getDatasets: (params?: DatasetQueryParams) => {
    return client.get<Dataset[]>('/datasets', { params });
  },

  /**
   * 获取数据集详情
   */
  getDataset: (datasetId: number) => {
    return client.get<Dataset>(`/datasets/${datasetId}`);
  },

  /**
   * 创建数据集
   */
  createDataset: (data: CreateDatasetRequest) => {
    return client.post<Dataset>('/datasets', data);
  },

  /**
   * 更新数据集
   */
  updateDataset: (datasetId: number, data: UpdateDatasetRequest) => {
    return client.put<Dataset>(`/datasets/${datasetId}`, data);
  },

  /**
   * 删除数据集
   */
  deleteDataset: (datasetId: number) => {
    return client.delete(`/datasets/${datasetId}`);
  },

  /**
   * 获取数据集条目列表
   */
  getDatasetItems: (params?: DatasetItemQueryParams) => {
    return client.get<DatasetItem[]>('/datasets/items', { params });
  },

  /**
   * 获取单个数据集条目
   */
  getDatasetItem: (itemId: number) => {
    return client.get<DatasetItem>(`/datasets/items/${itemId}`);
  },

  /**
   * 添加数据集条目
   */
  addDatasetItem: (datasetId: number, data: Omit<DatasetItem, 'id' | 'created_at'>) => {
    return client.post<DatasetItem>(`/datasets/${datasetId}/items`, data);
  },

  /**
   * 批量添加数据集条目
   */
  batchAddItems: (
    datasetId: number,
    items: Array<Omit<DatasetItem, 'id' | 'created_at'>>
  ) => {
    return client.post<{ success_count: number; failed_count: number }>(
      `/datasets/${datasetId}/items/batch`,
      { items }
    );
  },

  /**
   * 更新数据集条目
   */
  updateDatasetItem: (itemId: number, data: Partial<DatasetItem>) => {
    return client.put<DatasetItem>(`/datasets/items/${itemId}`, data);
  },

  /**
   * 删除数据集条目
   */
  deleteDatasetItem: (itemId: number) => {
    return client.delete(`/datasets/items/${itemId}`);
  },

  /**
   * 获取数据集统计信息
   */
  getDatasetStatistics: (datasetId: number) => {
    return client.get<DatasetStatistics>(`/datasets/${datasetId}/statistics`);
  },

  /**
   * 验证数据集
   */
  validateDataset: (datasetId: number) => {
    return client.post<DatasetValidationResult>(`/datasets/${datasetId}/validate`);
  },

  /**
   * 分割数据集
   */
  splitDataset: (datasetId: number, config: DatasetSplitConfig) => {
    return client.post<DatasetSplitResult>(`/datasets/${datasetId}/split`, config);
  },

  /**
   * 导出数据集
   */
  exportDataset: async (datasetId: number, config?: DatasetExportConfig) => {
    const response = await client.post(
      `/datasets/${datasetId}/export`,
      config,
      { responseType: 'blob' }
    );

    // 创建下载链接
    const format = config?.format || 'json';
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `dataset_${datasetId}.${format}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * 导入数据集
   */
  importDataset: (formData: FormData) => {
    return client.post<{ dataset_id: number; imported_count: number }>(
      '/datasets/import',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
  },

  /**
   * 批量操作
   */
  batchOperation: (request: BatchOperationRequest) => {
    return client.post<BatchOperationResult>('/datasets/items/batch-operation', request);
  },

  /**
   * 复制数据集
   */
  duplicateDataset: (datasetId: number, newName?: string) => {
    return client.post<Dataset>(`/datasets/${datasetId}/duplicate`, {
      name: newName,
    });
  },

  /**
   * 获取数据集标签分布
   */
  getLabelDistribution: (datasetId: number) => {
    return client.get<Record<string, number>>(
      `/datasets/${datasetId}/label-distribution`
    );
  },

  /**
   * 搜索数据集条目
   */
  searchDatasetItems: (datasetId: number, query: string) => {
    return client.get<DatasetItem[]>(`/datasets/${datasetId}/search`, {
      params: { q: query },
    });
  },

  /**
   * 预览数据集
   */
  previewDataset: (datasetId: number, limit: number = 10) => {
    return client.get<DatasetItem[]>(`/datasets/${datasetId}/preview`, {
      params: { limit },
    });
  },
};