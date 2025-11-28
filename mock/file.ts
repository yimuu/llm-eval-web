import { MockMethod } from 'vite-plugin-mock';

export default [
    // 文件上传
    {
        url: '/api/v1/files/upload',
        method: 'post',
        response: () => {
            return {
                fileId: 'mock-file-' + Date.now(),
                fileName: 'uploaded-file.json',
                fileSize: Math.floor(Math.random() * 1024 * 1024),
                url: '/mock/files/mock-file-' + Date.now(),
                uploadedAt: new Date().toISOString(),
            };
        },
    },

    // 批量上传
    {
        url: '/api/v1/files/batch-upload',
        method: 'post',
        response: ({ body }: any) => {
            const fileCount = body.files?.length || 1;
            return {
                uploadedFiles: Array.from({ length: fileCount }, (_, index) => ({
                    fileId: `mock-file-${Date.now()}-${index}`,
                    fileName: `file-${index}.json`,
                    fileSize: Math.floor(Math.random() * 1024 * 1024),
                    url: `/mock/files/mock-file-${Date.now()}-${index}`,
                    uploadedAt: new Date().toISOString(),
                })),
                totalSize: Math.floor(Math.random() * 10 * 1024 * 1024),
            };
        },
    },

    // 获取文件信息
    {
        url: '/api/v1/files/:fileId',
        method: 'get',
        response: ({ query }: any) => {
            return {
                fileId: query.fileId,
                fileName: 'sample-file.json',
                fileSize: 1024 * 512,
                mimeType: 'application/json',
                url: `/mock/files/${query.fileId}`,
                uploadedAt: new Date().toISOString(),
            };
        },
    },

    // 删除文件
    {
        url: '/api/v1/files/:fileId',
        method: 'delete',
        response: () => {
            return { success: true };
        },
    },
] as MockMethod[];
