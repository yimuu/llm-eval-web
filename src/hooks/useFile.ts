// src/hooks/useFile.ts
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { message } from 'antd';
import { fileApi, type FileUploadResponse, type BatchUploadResponse } from '@/api/file';
import type { UploadProgress } from '@/types/file';

/**
 * 文件上传 Hook
 */
export const useFileUpload = () => {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  // 单文件上传
  const uploadMutation = useMutation({
    mutationFn: (file: File) => fileApi.uploadImage(file),
    onSuccess: () => {
      message.success('上传成功');
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploadProgress(0);
    },
    onError: (error: any) => {
      message.error(error.message || '上传失败');
      setUploadProgress(0);
    },
  });

  // 批量上传
  const batchUploadMutation = useMutation({
    mutationFn: (files: File[]) => 
      fileApi.uploadImages(files, (progress) => setUploadProgress(progress)),
    onSuccess: (data: BatchUploadResponse) => {
      message.success(`成功上传 ${data.success_count} 个文件`);
      if (data.failed_count > 0) {
        message.warning(`${data.failed_count} 个文件上传失败`);
      }
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setUploadProgress(0);
    },
    onError: (error: any) => {
      message.error(error.message || '批量上传失败');
      setUploadProgress(0);
    },
  });

  return {
    upload: uploadMutation.mutate,
    batchUpload: batchUploadMutation.mutate,
    isUploading: uploadMutation.isPending || batchUploadMutation.isPending,
    uploadProgress,
  };
};

/**
 * 文件列表 Hook
 */
export const useFileList = (params?: {
  file_type?: 'image' | 'document';
  limit?: number;
  offset?: number;
}) => {
  return useQuery({
    queryKey: ['files', params],
    queryFn: () => fileApi.getFileList(params),
  });
};

/**
 * 文件删除 Hook
 */
export const useFileDelete = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (fileId: number) => fileApi.deleteFile(fileId),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
    onError: (error: any) => {
      message.error(error.message || '删除失败');
    },
  });
};

/**
 * 批量文件上传状态管理 Hook
 */
export const useBatchUploadProgress = () => {
  const [files, setFiles] = useState<UploadProgress[]>([]);

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadProgress[] = newFiles.map((file) => ({
      file,
      progress: 0,
      status: 'pending',
    }));
    setFiles((prev) => [...prev, ...uploadFiles]);
  };

  const updateFileProgress = (index: number, progress: number) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, progress, status: 'uploading' } : f))
    );
  };

  const setFileSuccess = (index: number, response: any) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'success', response } : f))
    );
  };

  const setFileError = (index: number, error: string) => {
    setFiles((prev) =>
      prev.map((f, i) => (i === index ? { ...f, status: 'error', error } : f))
    );
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setFiles([]);
  };

  return {
    files,
    addFiles,
    updateFileProgress,
    setFileSuccess,
    setFileError,
    removeFile,
    clearFiles,
  };
};

/**
 * 文件验证 Hook
 */
export const useFileValidation = () => {
  const validateImage = (file: File) => {
    const allowedTypes = ['.jpg', '.jpeg', '.png', '.gif', '.bmp'];
    const maxSize = 10; // MB

    if (!fileApi.validateFileType(file, allowedTypes)) {
      return {
        isValid: false,
        error: `不支持的文件格式，请上传 ${allowedTypes.join(', ')} 格式的图片`,
      };
    }

    if (!fileApi.validateFileSize(file, maxSize)) {
      return {
        isValid: false,
        error: `文件大小超过 ${maxSize}MB`,
      };
    }

    return { isValid: true };
  };

  const validateDocument = (file: File) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const maxSize = 50; // MB

    if (!fileApi.validateFileType(file, allowedTypes)) {
      return {
        isValid: false,
        error: `不支持的文件格式，请上传 ${allowedTypes.join(', ')} 格式的文档`,
      };
    }

    if (!fileApi.validateFileSize(file, maxSize)) {
      return {
        isValid: false,
        error: `文件大小超过 ${maxSize}MB`,
      };
    }

    return { isValid: true };
  };

  return {
    validateImage,
    validateDocument,
  };
};