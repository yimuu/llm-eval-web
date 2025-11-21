// src/types/file.ts

export interface FileRecord {
  id: number;
  user_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  file_type: 'image' | 'document';
  created_at: string;
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  response?: any;
  error?: string;
}

export interface FileValidation {
  isValid: boolean;
  error?: string;
}

export const FILE_TYPES = {
  IMAGE: {
    extensions: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
    mimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff'],
    maxSize: 10, // MB
  },
  DOCUMENT: {
    extensions: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls'],
    mimeTypes: ['application/pdf', 'application/msword', 'text/plain', 'application/vnd.ms-excel'],
    maxSize: 50, // MB
  },
} as const;

export type FileType = keyof typeof FILE_TYPES;