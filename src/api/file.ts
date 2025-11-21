// src/api/file.ts
import client from './client';

export interface FileUploadResponse {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  url: string;
}

export interface BatchUploadResponse {
  success_count: number;
  failed_count: number;
  files: FileUploadResponse[];
}

export interface FileListItem {
  id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: string;
  created_at: string;
}

export const fileApi = {
  /**
   * 上传单张图片
   * @param file 文件对象
   * @returns 上传结果
   */
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return client.post<FileUploadResponse>('/files/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 批量上传图片
   * @param files 文件数组
   * @param onProgress 上传进度回调
   * @returns 批量上传结果
   */
  uploadImages: (files: File[], onProgress?: (progress: number) => void) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    return client.post<BatchUploadResponse>('/files/upload/images/batch', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  /**
   * 上传文档（PDF、Word 等）
   * @param file 文件对象
   * @returns 上传结果
   */
  uploadDocument: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return client.post<FileUploadResponse>('/files/upload/document', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  /**
   * 获取文件列表
   * @param params 查询参数
   * @returns 文件列表
   */
  getFileList: (params?: {
    file_type?: 'image' | 'document';
    limit?: number;
    offset?: number;
  }) => {
    return client.get<FileListItem[]>('/files/list', { params });
  },

  /**
   * 获取文件下载链接
   * @param fileId 文件ID
   * @returns 下载链接
   */
  getDownloadUrl: (fileId: number) => {
    return `/api/v1/files/${fileId}/download`;
  },

  /**
   * 下载文件
   * @param fileId 文件ID
   * @param filename 保存的文件名
   */
  downloadFile: async (fileId: number, filename?: string) => {
    const response = await client.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });

    // 创建下载链接
    const url = window.URL.createObjectURL(new Blob([response]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename || `file_${fileId}`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  },

  /**
   * 删除文件
   * @param fileId 文件ID
   */
  deleteFile: (fileId: number) => {
    return client.delete(`/files/${fileId}`);
  },

  /**
   * 预览图片（获取完整 URL）
   * @param fileId 文件ID
   * @returns 图片 URL
   */
  getImagePreviewUrl: (fileId: number) => {
    const token = localStorage.getItem('token');
    const baseURL = import.meta.env.VITE_API_BASE_URL || '/api/v1';
    return `${baseURL}/files/${fileId}/download?token=${token}`;
  },

  /**
   * 验证文件类型
   * @param file 文件对象
   * @param allowedTypes 允许的文件类型
   * @returns 是否合法
   */
  validateFileType: (file: File, allowedTypes: string[]): boolean => {
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    return allowedTypes.some((type) => 
      type === `.${fileExtension}` || file.type.startsWith(type.replace('.', ''))
    );
  },

  /**
   * 验证文件大小
   * @param file 文件对象
   * @param maxSizeInMB 最大大小（MB）
   * @returns 是否合法
   */
  validateFileSize: (file: File, maxSizeInMB: number): boolean => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  },

  /**
   * 格式化文件大小
   * @param bytes 字节数
   * @returns 格式化后的字符串
   */
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  },

  /**
   * 批量删除文件
   * @param fileIds 文件ID数组
   */
  deleteFiles: async (fileIds: number[]) => {
    const promises = fileIds.map((id) => client.delete(`/files/${id}`));
    return Promise.all(promises);
  },

  /**
   * 获取文件统计信息
   */
  getFileStats: () => {
    return client.get<{
      total_count: number;
      total_size: number;
      image_count: number;
      document_count: number;
    }>('/files/stats');
  },
};