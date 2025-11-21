import { Card, Table, Button, Tag, Space, Modal, Image, Tooltip } from 'antd';
import { PlusOutlined, EyeOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import { useState } from 'react';

interface Dataset {
  id: number;
  task_id: number;
  task_name: string;
  input_data: any;
  ground_truth: any;
  created_at: string;
}

export default function DatasetList() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewData, setPreviewData] = useState<Dataset | null>(null);

  // 获取数据集列表
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/datasets');
      return response.data;
    },
  });

  // 删除数据集
  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/v1/datasets/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      message.success('删除成功');
    },
  });

  const handlePreview = (record: Dataset) => {
    setPreviewData(record);
    setPreviewVisible(true);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: '确认删除',
      content: '删除后无法恢复，确定要删除这条数据吗？',
      onOk: () => deleteMutation.mutate(id),
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '任务',
      dataIndex: 'task_name',
      key: 'task_name',
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '输入数据',
      dataIndex: 'input_data',
      key: 'input_data',
      render: (data: any) => {
        if (data?.image_path) {
          return (
            <Tooltip title="点击预览">
              <img
                src={data.image_path}
                alt="预览"
                className="w-16 h-16 object-cover rounded cursor-pointer"
                onClick={() => handlePreview({ input_data: data } as Dataset)}
              />
            </Tooltip>
          );
        }
        return <span className="text-gray-400">-</span>;
      },
    },
    {
      title: '标准答案',
      dataIndex: 'ground_truth',
      key: 'ground_truth',
      render: (truth: any) => {
        if (!truth) return '-';
        const keys = Object.keys(truth);
        return (
          <div className="space-y-1">
            {keys.slice(0, 2).map(key => (
              <div key={key} className="text-sm">
                <span className="text-gray-500">{key}:</span> {truth[key]}
              </div>
            ))}
            {keys.length > 2 && <span className="text-gray-400">...</span>}
          </div>
        );
      },
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: any, record: Dataset) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
          >
            查看
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">数据集管理</h2>
          <Space>
            <Button icon={<DownloadOutlined />}>
              导出数据集
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/datasets/upload')}
            >
              上传数据集
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={datasets}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条数据`,
          }}
        />
      </Card>

      {/* 预览弹窗 */}
      <Modal
        title="数据详情"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={800}
      >
        {previewData && (
          <div className="space-y-4">
            {previewData.input_data?.image_path && (
              <div>
                <h4 className="text-gray-600 mb-2">输入图像</h4>
                <Image
                  src={previewData.input_data.image_path}
                  alt="输入图像"
                  style={{ maxWidth: '100%' }}
                />
              </div>
            )}

            {previewData.ground_truth && (
              <div>
                <h4 className="text-gray-600 mb-2">标准答案</h4>
                <pre className="bg-gray-50 p-4 rounded">
                  {JSON.stringify(previewData.ground_truth, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}