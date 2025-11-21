import { Row, Col, Card, Statistic, Table, Progress, Tag } from 'antd';
import {
  ExperimentOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { evaluationApi } from '@/api/evaluation';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import type { EvaluationRun } from '@/types/evaluation';

export default function Dashboard() {
  const navigate = useNavigate();

  // 获取最近的评测
  const { data: recentEvaluations } = useQuery({
    queryKey: ['evaluations', 'recent'],
    queryFn: () => evaluationApi.getEvaluations({ limit: 10 }),
  });

  // 统计数据（实际应该从后端获取）
  const stats = {
    total: recentEvaluations?.length || 0,
    completed: recentEvaluations?.filter(e => e.status === 'completed').length || 0,
    running: recentEvaluations?.filter(e => e.status === 'running').length || 0,
    failed: recentEvaluations?.filter(e => e.status === 'failed').length || 0,
  };

  // 准确率趋势数据（模拟）
  const accuracyTrend = recentEvaluations?.slice(0, 7).reverse().map((run, index) => ({
    name: `评测${index + 1}`,
    accuracy: 0.85 + Math.random() * 0.1,
    version: run.model_version,
  })) || [];

  // 任务类型分布（模拟）
  const taskDistribution = [
    { name: '皮肤病识别', value: 45 },
    { name: '报告解读', value: 30 },
    { name: '病灶检测', value: 25 },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  // 最近评测表格列
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
      render: (status: string) => {
        const config = {
          completed: { color: 'success', text: '已完成' },
          running: { color: 'processing', text: '运行中' },
          failed: { color: 'error', text: '失败' },
          pending: { color: 'default', text: '等待中' },
        };
        return <Tag color={config[status as keyof typeof config].color}>{config[status as keyof typeof config].text}</Tag>;
      },
    },
    {
      title: '进度',
      key: 'progress',
      render: (_: any, record: EvaluationRun) => (
        <Progress percent={record.progress_percent} size="small" />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('MM-DD HH:mm'),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* 统计卡片 */}
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总评测数"
              value={stats.total}
              prefix={<ExperimentOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="已完成"
              value={stats.completed}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="运行中"
              value={stats.running}
              prefix={<ClockCircleOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="失败"
              value={stats.failed}
              prefix={<CloseCircleOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={16}>
        <Col span={16}>
          <Card title="准确率趋势">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={accuracyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0.7, 1.0]} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="accuracy" 
                  stroke="#1890ff" 
                  strokeWidth={2}
                  name="准确率"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        <Col span={8}>
          <Card title="任务类型分布">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>
      </Row>

      {/* 最近评测 */}
      <Card title="最近评测" extra={<a onClick={() => navigate('/evaluations')}>查看全部</a>}>
        <Table
          columns={columns}
          dataSource={recentEvaluations}
          rowKey="id"
          pagination={false}
        />
      </Card>
    </div>
  );
}