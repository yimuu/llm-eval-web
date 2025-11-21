import { Table, Button, Tag, Progress, Space, Card } from 'antd';
import { PlusOutlined, EyeOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useEvaluations } from '@/hooks/useEvaluation';
import type { EvaluationRun } from '@/types/evaluation';
import dayjs from 'dayjs';

const statusColors: Record<string, string> = {
  pending: 'default',
  running: 'processing',
  completed: 'success',
  failed: 'error',
};

const statusText: Record<string, string> = {
  pending: '等待中',
  running: '运行中',
  completed: '已完成',
  failed: '失败',
};

export default function EvaluationList() {
  const navigate = useNavigate();
  const { data: evaluations, isLoading, refetch } = useEvaluations();

  const columns = [
    {
      title: '评测名称',
      dataIndex: 'run_name',
      key: 'run_name',
      render: (text: string, record: EvaluationRun) => (
        <a onClick={() => navigate(`/evaluations/${record.id}`)}>
          {text || `评测 #${record.id}`}
        </a>
      ),
    },
    {
      title: '模型版本',
      dataIndex: 'model_version',
      key: 'model_version',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusColors[status]}>{statusText[status]}</Tag>
      ),
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: any, record: EvaluationRun) => (
        <div className="w-48">
          <Progress 
            percent={record.progress_percent} 
            size="small"
            status={record.status === 'failed' ? 'exception' : undefined}
          />
          <div className="text-xs text-gray-500 mt-1">
            {record.completed_count}/{record.total_count} 完成
            {record.failed_count > 0 && `, ${record.failed_count} 失败`}
          </div>
        </div>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: EvaluationRun) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/evaluations/${record.id}`)}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">评测列表</h2>
          <Space>
            <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
              刷新
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/evaluations/create')}
            >
              创建评测
            </Button>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={evaluations}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  );
}