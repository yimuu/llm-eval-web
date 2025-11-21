// src/hooks/useDataset.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { datasetApi } from '@/api/dataset';
import type {
  CreateDatasetRequest,
  UpdateDatasetRequest,
  DatasetQueryParams,
  DatasetItemQueryParams,
  DatasetSplitConfig,
  BatchOperationRequest,
} from '@/types/dataset';

/**
 * 数据集列表 Hook
 */
export const useDatasets = (params?: DatasetQueryParams) => {
  return useQuery({
    queryKey: ['datasets', params],
    queryFn: () => datasetApi.getDatasets(params),
  });
};

/**
 * 数据集详情 Hook
 */
export const useDataset = (datasetId: number) => {
  return useQuery({
    queryKey: ['dataset', datasetId],
    queryFn: () => datasetApi.getDataset(datasetId),
    enabled: !!datasetId,
  });
};

/**
 * 创建数据集 Hook
 */
export const useCreateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateDatasetRequest) => datasetApi.createDataset(data),
    onSuccess: () => {
      message.success('数据集创建成功');
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error: any) => {
      message.error(error.message || '创建失败');
    },
  });
};

/**
 * 更新数据集 Hook
 */
export const useUpdateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateDatasetRequest }) =>
      datasetApi.updateDataset(id, data),
    onSuccess: (_, variables) => {
      message.success('更新成功');
      queryClient.invalidateQueries({ queryKey: ['dataset', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error: any) => {
      message.error(error.message || '更新失败');
    },
  });
};

/**
 * 删除数据集 Hook
 */
export const useDeleteDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (datasetId: number) => datasetApi.deleteDataset(datasetId),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error: any) => {
      message.error(error.message || '删除失败');
    },
  });
};

/**
 * 数据集条目列表 Hook
 */
export const useDatasetItems = (params?: DatasetItemQueryParams) => {
  return useQuery({
    queryKey: ['dataset-items', params],
    queryFn: () => datasetApi.getDatasetItems(params),
  });
};

/**
 * 数据集条目详情 Hook
 */
export const useDatasetItem = (itemId: number) => {
  return useQuery({
    queryKey: ['dataset-item', itemId],
    queryFn: () => datasetApi.getDatasetItem(itemId),
    enabled: !!itemId,
  });
};

/**
 * 添加数据集条目 Hook
 */
export const useAddDatasetItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, data }: { datasetId: number; data: any }) =>
      datasetApi.addDatasetItem(datasetId, data),
    onSuccess: () => {
      message.success('添加成功');
      queryClient.invalidateQueries({ queryKey: ['dataset-items'] });
    },
    onError: (error: any) => {
      message.error(error.message || '添加失败');
    },
  });
};

/**
 * 批量添加数据集条目 Hook
 */
export const useBatchAddItems = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, items }: { datasetId: number; items: any[] }) =>
      datasetApi.batchAddItems(datasetId, items),
    onSuccess: (data) => {
      message.success(`成功添加 ${data.success_count} 条数据`);
      if (data.failed_count > 0) {
        message.warning(`${data.failed_count} 条数据添加失败`);
      }
      queryClient.invalidateQueries({ queryKey: ['dataset-items'] });
    },
    onError: (error: any) => {
      message.error(error.message || '批量添加失败');
    },
  });
};

/**
 * 数据集统计 Hook
 */
export const useDatasetStatistics = (datasetId: number) => {
  return useQuery({
    queryKey: ['dataset-statistics', datasetId],
    queryFn: () => datasetApi.getDatasetStatistics(datasetId),
    enabled: !!datasetId,
  });
};

/**
 * 验证数据集 Hook
 */
export const useValidateDataset = () => {
  return useMutation({
    mutationFn: (datasetId: number) => datasetApi.validateDataset(datasetId),
    onSuccess: (data) => {
      if (data.is_valid) {
        message.success('数据集验证通过');
      } else {
        message.warning(`发现 ${data.errors.length} 个错误`);
      }
    },
    onError: (error: any) => {
      message.error(error.message || '验证失败');
    },
  });
};

/**
 * 分割数据集 Hook
 */
export const useSplitDataset = () => {
  return useMutation({
    mutationFn: ({ datasetId, config }: { datasetId: number; config: DatasetSplitConfig }) =>
      datasetApi.splitDataset(datasetId, config),
    onSuccess: (data) => {
      message.success(
        `数据集分割完成：训练集 ${data.statistics.train_count}，验证集 ${data.statistics.val_count}，测试集 ${data.statistics.test_count}`
      );
    },
    onError: (error: any) => {
      message.error(error.message || '分割失败');
    },
  });
};

/**
 * 导出数据集 Hook
 */
export const useExportDataset = () => {
  return useMutation({
    mutationFn: ({ datasetId, config }: { datasetId: number; config?: any }) =>
      datasetApi.exportDataset(datasetId, config),
    onSuccess: () => {
      message.success('导出成功');
    },
    onError: (error: any) => {
      message.error(error.message || '导出失败');
    },
  });
};

/**
 * 导入数据集 Hook
 */
export const useImportDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => datasetApi.importDataset(formData),
    onSuccess: (data) => {
      message.success(`导入成功，共 ${data.imported_count} 条数据`);
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error: any) => {
      message.error(error.message || '导入失败');
    },
  });
};

/**
 * 批量操作 Hook
 */
export const useBatchOperation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: BatchOperationRequest) => datasetApi.batchOperation(request),
    onSuccess: (data) => {
      message.success(`操作完成：成功 ${data.success_count}，失败 ${data.failed_count}`);
      queryClient.invalidateQueries({ queryKey: ['dataset-items'] });
    },
    onError: (error: any) => {
      message.error(error.message || '批量操作失败');
    },
  });
};

/**
 * 复制数据集 Hook
 */
export const useDuplicateDataset = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ datasetId, newName }: { datasetId: number; newName?: string }) =>
      datasetApi.duplicateDataset(datasetId, newName),
    onSuccess: () => {
      message.success('数据集复制成功');
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
    },
    onError: (error: any) => {
      message.error(error.message || '复制失败');
    },
  });
};

/**
 * 标签分布 Hook
 */
export const useLabelDistribution = (datasetId: number) => {
  return useQuery({
    queryKey: ['label-distribution', datasetId],
    queryFn: () => datasetApi.getLabelDistribution(datasetId),
    enabled: !!datasetId,
  });
};

/**
 * 搜索数据集条目 Hook
 */
export const useSearchDatasetItems = (datasetId: number, query: string) => {
  return useQuery({
    queryKey: ['search-dataset-items', datasetId, query],
    queryFn: () => datasetApi.searchDatasetItems(datasetId, query),
    enabled: !!datasetId && !!query,
  });
};

/**
 * 数据集预览 Hook
 */
export const useDatasetPreview = (datasetId: number, limit: number = 10) => {
  return useQuery({
    queryKey: ['dataset-preview', datasetId, limit],
    queryFn: () => datasetApi.previewDataset(datasetId, limit),
    enabled: !!datasetId,
  });
};