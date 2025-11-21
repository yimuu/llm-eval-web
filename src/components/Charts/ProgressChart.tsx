// src/components/Charts/ProgressChart.tsx
import { Card, Progress, Space, Tag, Tooltip, Empty } from 'antd';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import type { EvaluationProgress } from '@/types/evaluation';

interface ProgressChartProps {
  data: EvaluationProgress;
  type?: 'line' | 'area' | 'bar' | 'pie' | 'overview';
  height?: number;
  showLegend?: boolean;
  showDetails?: boolean;
}

const STATUS_COLORS = {
  completed: '#52c41a',
  pending: '#faad14',
  failed: '#f5222d',
  running: '#1890ff',
};

const STATUS_ICONS = {
  completed: <CheckCircleOutlined />,
  pending: <ClockCircleOutlined />,
  failed: <CloseCircleOutlined />,
  running: <SyncOutlined spin />,
};

const STATUS_LABELS = {
  completed: '已完成',
  pending: '等待中',
  failed: '失败',
  running: '运行中',
};

export default function ProgressChart({
  data,
  type = 'overview',
  height = 300,
  showLegend = true,
  showDetails = true,
}: ProgressChartProps) {
  if (!data) {
    return (
      <Card>
        <Empty description="暂无数据" />
      </Card>
    );
  }

  // 计算各状态数量
  const statusData = [
    { name: '已完成', value: data.completed_count, color: STATUS_COLORS.completed },
    { name: '失败', value: data.failed_count, color: STATUS_COLORS.failed },
    { name: '等待中', value: data.pending_count, color: STATUS_COLORS.pending },
  ];

  // 时间序列数据（模拟）
  const timeSeriesData = generateTimeSeriesData(data);

  // 根据类型渲染不同图表
  const renderChart = () => {
    switch (type) {
      case 'line':
        return <LineProgressChart data={timeSeriesData} height={height} />;
      case 'area':
        return <AreaProgressChart data={timeSeriesData} height={height} />;
      case 'bar':
        return <BarProgressChart data={statusData} height={height} />;
      case 'pie':
        return <PieProgressChart data={statusData} height={height} />;
      case 'overview':
      default:
        return (
          <OverviewProgress
            data={data}
            statusData={statusData}
            showDetails={showDetails}
          />
        );
    }
  };

  return renderChart();
}

// 折线图
function LineProgressChart({
  data,
  height,
}: {
  data: any[];
  height: number;
}) {
  return (
    <Card title="进度趋势">
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="completed"
            stroke={STATUS_COLORS.completed}
            strokeWidth={2}
            name="已完成"
          />
          <Line
            type="monotone"
            dataKey="failed"
            stroke={STATUS_COLORS.failed}
            strokeWidth={2}
            name="失败"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
}

// 面积图
function AreaProgressChart({
  data,
  height,
}: {
  data: any[];
  height: number;
}) {
  return (
    <Card title="进度累积">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Area
            type="monotone"
            dataKey="completed"
            stackId="1"
            stroke={STATUS_COLORS.completed}
            fill={STATUS_COLORS.completed}
            fillOpacity={0.6}
            name="已完成"
          />
          <Area
            type="monotone"
            dataKey="failed"
            stackId="1"
            stroke={STATUS_COLORS.failed}
            fill={STATUS_COLORS.failed}
            fillOpacity={0.6}
            name="失败"
          />
        </AreaChart>
      </ResponsiveContainer>
    </Card>
  );
}

// 柱状图
function BarProgressChart({
  data,
  height,
}: {
  data: any[];
  height: number;
}) {
  return (
    <Card title="状态分布">
      <ResponsiveContainer width="100%" height={height}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <RechartsTooltip />
          <Legend />
          <Bar dataKey="value" name="数量">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}

// 饼图
function PieProgressChart({
  data,
  height,
}: {
  data: any[];
  height: number;
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title="完成情况">
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) =>
              `${name}: ${(percent * 100).toFixed(0)}%`
            }
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <RechartsTooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4 text-gray-600">
        总计: {total} 条数据
      </div>
    </Card>
  );
}

// 概览视图
function OverviewProgress({
  data,
  statusData,
  showDetails,
}: {
  data: EvaluationProgress;
  statusData: any[];
  showDetails: boolean;
}) {
  const getStatusColor = (status: string) => {
    if (data.status === 'completed') return 'success';
    if (data.status === 'running') return 'normal';
    if (data.status === 'failed') return 'exception';
    return 'normal';
  };

  return (
    <div className="space-y-4">
      {/* 主进度条 */}
      <Card>
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium">总体进度</span>
            <Tag
              color={STATUS_COLORS[data.status as keyof typeof STATUS_COLORS]}
              icon={STATUS_ICONS[data.status as keyof typeof STATUS_ICONS]}
            >
              {STATUS_LABELS[data.status as keyof typeof STATUS_LABELS]}
            </Tag>
          </div>
          <Progress
            percent={data.progress_percent}
            status={getStatusColor(data.status)}
            strokeWidth={12}
            format={(percent) => `${percent?.toFixed(1)}%`}
          />
          <div className="text-sm text-gray-500 mt-2">
            {data.completed_count} / {data.total_count} 完成
            {data.failed_count > 0 && `, ${data.failed_count} 失败`}
          </div>
        </div>

        {/* 状态统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <Tooltip title="已成功完成的数据">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">已完成</div>
                  <div className="text-2xl font-bold text-green-600">
                    {data.completed_count}
                  </div>
                </div>
                <CheckCircleOutlined
                  style={{ fontSize: 32, color: STATUS_COLORS.completed }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {((data.completed_count / data.total_count) * 100).toFixed(1)}%
              </div>
            </div>
          </Tooltip>

          <Tooltip title="执行失败的数据">
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">失败</div>
                  <div className="text-2xl font-bold text-red-600">
                    {data.failed_count}
                  </div>
                </div>
                <CloseCircleOutlined
                  style={{ fontSize: 32, color: STATUS_COLORS.failed }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {((data.failed_count / data.total_count) * 100).toFixed(1)}%
              </div>
            </div>
          </Tooltip>

          <Tooltip title="等待处理的数据">
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600">等待中</div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {data.pending_count}
                  </div>
                </div>
                <ClockCircleOutlined
                  style={{ fontSize: 32, color: STATUS_COLORS.pending }}
                />
              </div>
              <div className="text-xs text-gray-500 mt-2">
                {((data.pending_count / data.total_count) * 100).toFixed(1)}%
              </div>
            </div>
          </Tooltip>
        </div>
      </Card>

      {/* 详细饼图 */}
      {showDetails && (
        <Card>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}

// 生成时间序列数据（模拟）
function generateTimeSeriesData(data: EvaluationProgress) {
  const points = 10;
  const timeSeriesData = [];
  const completedRate = data.completed_count / data.total_count;
  const failedRate = data.failed_count / data.total_count;

  for (let i = 0; i <= points; i++) {
    const progress = i / points;
    timeSeriesData.push({
      time: `${i * 10}%`,
      completed: Math.floor(data.completed_count * progress),
      failed: Math.floor(data.failed_count * progress),
      pending: data.total_count - Math.floor((data.completed_count + data.failed_count) * progress),
    });
  }

  return timeSeriesData;
}

// 实时进度组件
export function RealTimeProgress({
  data,
  refreshInterval = 2000,
}: {
  data: EvaluationProgress;
  refreshInterval?: number;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <Space direction="vertical" className="w-full" size="large">
          <div className="flex justify-between items-center">
            <span className="text-lg font-medium">实时进度</span>
            <Tag color="processing" icon={<SyncOutlined spin />}>
              更新中
            </Tag>
          </div>

          <Progress
            percent={data.progress_percent}
            status="active"
            strokeWidth={20}
            format={(percent) => `${percent?.toFixed(1)}%`}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-sm text-gray-600">已完成</div>
              <div className="text-xl font-bold text-green-600">
                {data.completed_count} / {data.total_count}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">失败</div>
              <div className="text-xl font-bold text-red-600">
                {data.failed_count}
              </div>
            </div>
          </div>
        </Space>
      </Card>
    </div>
  );
}

// 迷你进度条
export function MiniProgressBar({
  percent,
  status,
  showInfo = true,
}: {
  percent: number;
  status?: 'success' | 'exception' | 'normal' | 'active';
  showInfo?: boolean;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Progress
        percent={percent}
        status={status}
        size="small"
        showInfo={showInfo}
        style={{ flex: 1 }}
      />
      {showInfo && <span className="text-xs text-gray-500 whitespace-nowrap">{percent.toFixed(1)}%</span>}
    </div>
  );
}