import { useState } from 'react';
import { Card, Upload, Button, message, Table, Progress, Tag, Space, Modal, Form, Input, Select } from 'antd';
import { InboxOutlined, DeleteOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { Dragger } = Upload;

interface FileItem extends UploadFile {
  response?: {
    id: number;
    url: string;
  };
}

export default function DatasetUpload() {
  const [fileList, setFileList] = useState<FileItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  // 获取任务列表
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/tasks');
      return response.data;
    },
  });

  // 上传配置
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: true,
    accept: 'image/*',
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error(`${file.name} 不是图片文件`);
        return Upload.LIST_IGNORE;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error(`${file.name} 文件大小超过 10MB`);
        return Upload.LIST_IGNORE;
      }

      return false; // 阻止自动上传
    },
    onChange: (info) => {
      setFileList(info.fileList);
    },
    fileList,
  };

  // 批量上传
  const handleBatchUpload = async () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      fileList.forEach((file) => {
        if (file.originFileObj) {
          formData.append('files', file.originFileObj);
        }
      });

      const response = await axios.post(
        '/api/v1/files/upload/images/batch',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded * 100) / (progressEvent.total || 1)
            );
            console.log(`上传进度: ${percent}%`);
          },
        }
      );

      message.success(`成功上传 ${response.data.success_count} 个文件`);
      if (response.data.failed_count > 0) {
        message.warning(`${response.data.failed_count} 个文件上传失败`);
      }

      // 更新文件列表状态
      const uploadedFiles = response.data.files;
      setFileList(fileList.map((file, index) => ({
        ...file,
        status: 'done',
        response: uploadedFiles[index],
      })));

      // 显示标注弹窗
      setModalVisible(true);
    } catch (error) {
      message.error('上传失败');
    } finally {
      setUploading(false);
    }
  };

  // 保存数据集
  const handleSaveDataset = async () => {
    try {
      const values = await form.validateFields();
      
      // TODO: 调用保存数据集 API
      const dataset = {
        task_id: values.task_id,
        name: values.name,
        files: fileList.map(f => f.response?.id),
      };

      console.log('保存数据集:', dataset);
      message.success('数据集保存成功');
      
      setModalVisible(false);
      setFileList([]);
      form.resetFields();
    } catch (error) {
      // 表单验证失败
    }
  };

  // 移除文件
  const handleRemove = (file: FileItem) => {
    setFileList(fileList.filter(f => f.uid !== file.uid));
  };

  // 表格列
  const columns = [
    {
      title: '预览',
      key: 'preview',
      width: 80,
      render: (_: any, record: FileItem) => (
        <img 
          src={record.thumbUrl || record.url} 
          alt={record.name}
          className="w-12 h-12 object-cover rounded"
        />
      ),
    },
    {
      title: '文件名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '大小',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => `${(size / 1024).toFixed(2)} KB`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config: Record<string, any> = {
          uploading: { color: 'processing', text: '上传中' },
          done: { color: 'success', text: '已上传', icon: <CheckCircleOutlined /> },
          error: { color: 'error', text: '失败' },
        };
        const current = config[status] || { color: 'default', text: '等待上传' };
        return (
          <Tag color={current.color} icon={current.icon}>
            {current.text}
          </Tag>
        );
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: FileItem) => (
        <Button
          type="link"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record)}
        >
          移除
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <Card title="批量上传数据集">
        <Dragger {...uploadProps} style={{ marginBottom: 24 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持单个或批量上传。支持 JPG、PNG、BMP 等图片格式，单个文件不超过 10MB
          </p>
        </Dragger>

        {fileList.length > 0 && (
          <>
            <div className="mb-4 flex justify-between items-center">
              <span className="text-gray-600">
                已选择 {fileList.length} 个文件
              </span>
              <Space>
                <Button onClick={() => setFileList([])}>清空列表</Button>
                <Button
                  type="primary"
                  onClick={handleBatchUpload}
                  loading={uploading}
                >
                  {uploading ? '上传中...' : '开始上传'}
                </Button>
              </Space>
            </div>

            <Table
              columns={columns}
              dataSource={fileList}
              rowKey="uid"
              pagination={{ pageSize: 10 }}
            />
          </>
        )}
      </Card>

      {/* 数据集信息弹窗 */}
      <Modal
        title="保存数据集"
        open={modalVisible}
        onOk={handleSaveDataset}
        onCancel={() => setModalVisible(false)}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="task_id"
            label="关联任务"
            rules={[{ required: true, message: '请选择任务' }]}
          >
            <Select
              placeholder="选择任务"
              options={tasks?.map((task: any) => ({
                label: task.task_name,
                value: task.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="数据集名称"
            rules={[{ required: true, message: '请输入数据集名称' }]}
          >
            <Input placeholder="例如: 皮肤病数据集 v1.0" />
          </Form.Item>

          <div className="text-gray-500 text-sm">
            成功上传 {fileList.filter(f => f.status === 'done').length} 个文件
          </div>
        </Form>
      </Modal>
    </div>
  );
}