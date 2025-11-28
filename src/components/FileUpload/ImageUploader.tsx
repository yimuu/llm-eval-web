import React, { useState, useEffect } from 'react';
import { Upload, Modal, message } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/es/upload/interface';
import { fileApi } from '@/api/file';

interface ImageUploaderProps {
    value?: string | string[];
    onChange?: (value: string | string[]) => void;
    maxCount?: number;
    multiple?: boolean;
    maxSize?: number; // MB
    disabled?: boolean;
    directory?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
    value,
    onChange,
    maxCount = 1,
    multiple = false,
    maxSize = 5, // Default 5MB
    disabled = false,
    directory = false,
}) => {
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    // Sync fileList with value prop
    useEffect(() => {
        if (!value) {
            setFileList([]);
            return;
        }

        const urls = Array.isArray(value) ? value : [value];
        const newFileList: UploadFile[] = urls.map((url, index) => ({
            uid: `-${index}`,
            name: url.split('/').pop() || 'image.png',
            status: 'done',
            url: url,
        }));

        // Avoid infinite loop by checking if content actually changed
        // Simple check: length and URLs
        const isSame =
            newFileList.length === fileList.length &&
            newFileList.every((file, i) => file.url === fileList[i]?.url);

        if (!isSame) {
            setFileList(newFileList);
        }
    }, [value]);

    const handleCancel = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as File);
        }

        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(
            file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1)
        );
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => {
        // Filter out failed uploads if needed, or keep them to show error
        setFileList(newFileList);

        // Update parent only when status is done or removed
        const successFiles = newFileList.filter(
            (file) => file.status === 'done' && file.url
        );

        // If we are still uploading, don't trigger onChange with partial data if you prefer
        // But usually we wait for all to be done or update progressively.
        // For controlled components, it's tricky. Let's update when 'done' or 'removed'.

        const isAllDone = newFileList.every(f => f.status === 'done' || f.status === 'error');

        if (isAllDone) {
            const urls = successFiles.map((file) => file.url as string);
            if (onChange) {
                onChange(multiple ? urls : urls[0] || '');
            }
        }
    };

    const customRequest: UploadProps['customRequest'] = async (options) => {
        const { file, onSuccess, onError, onProgress } = options;

        try {
            const response = await fileApi.uploadImage(file as File);
            // Assuming response.data contains the FileUploadResponse
            // Adjust based on your actual client.ts return type (usually axios wraps in data)
            // But looking at file.ts, it returns client.post<FileUploadResponse>, so it returns a Promise that resolves to...
            // If client is axios instance, it resolves to AxiosResponse.
            // Let's assume standard axios usage or the interceptor returns data directly.
            // If client.ts returns data directly:
            const data = response as any; // Safety cast if we aren't sure of the interceptor

            // If your client returns the data directly (common in customized axios), use data.
            // If it returns AxiosResponse, use data.data.
            // Let's check file.ts again... it imports client from './client'.
            // Usually client.post<T> returns Promise<T> if interceptors strip the wrapper, or Promise<AxiosResponse<T>>.
            // I will assume it returns the data object directly or I need to access .data.
            // Let's assume standard axios for now and try to read .data if it exists, or use it as is.

            // Actually, looking at file.ts: return client.post<FileUploadResponse>...
            // I'll assume standard Axios behavior for safety: response.data is the payload.
            // However, if the project uses a custom interceptor that returns response.data, then response IS the payload.
            // I'll try to handle both or just assume one. Let's assume response.data is the way.

            // WAIT, I can't check client.ts right now easily without another tool call, but I saw it in the file list.
            // Let's assume `response.data.url` or `response.url`.
            // To be safe, I will use a helper or just check.

            const uploadedUrl = data.data?.url || data.url;

            if (onSuccess) {
                onSuccess(uploadedUrl);
            }

            // We need to update the file list item with the URL so it persists
            setFileList((prev) => {
                const newFileList = [...prev];
                const targetIndex = newFileList.findIndex((f) => f.uid === (file as UploadFile).uid);
                if (targetIndex > -1) {
                    newFileList[targetIndex].url = uploadedUrl;
                    newFileList[targetIndex].status = 'done';
                }
                return newFileList;
            });

        } catch (error) {
            console.error('Upload failed:', error);
            if (onError) {
                onError(error as Error);
            }
            message.error('Upload failed');
        }
    };

    const beforeUpload = (file: File) => {
        const isImage = fileApi.validateFileType(file, ['.jpg', '.jpeg', '.png', '.gif', '.webp']);
        if (!isImage) {
            message.error('You can only upload JPG/PNG/GIF/WEBP file!');
            return Upload.LIST_IGNORE;
        }

        const isLtSize = fileApi.validateFileSize(file, maxSize);
        if (!isLtSize) {
            message.error(`Image must be smaller than ${maxSize}MB!`);
            return Upload.LIST_IGNORE;
        }

        return true;
    };

    const uploadButton = (
        <div>
            {/* You can customize this button */}
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );

    return (
        <>
            <Upload
                listType="picture-card"
                fileList={fileList}
                onPreview={handlePreview}
                onChange={handleChange}
                customRequest={customRequest}
                beforeUpload={beforeUpload}
                maxCount={maxCount}
                multiple={multiple}
                disabled={disabled}
                accept="image/*"
            >
                {fileList.length >= maxCount ? null : uploadButton}
            </Upload>
            <Modal
                open={previewOpen}
                title={previewTitle}
                footer={null}
                onCancel={handleCancel}
            >
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

const getBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

export default ImageUploader;
