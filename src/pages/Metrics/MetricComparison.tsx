import { useState } from 'react';
import { Card, Select, Button, Table, Space, Tag, Empty } from 'antd';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { evaluationApi } from '@/api/evaluation';
import { CompareOutlined } from '@ant-design/icons';

const COLORS = ['#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1'];

export default function MetricComparison() {
  const [selectedRuns, setSelectedRuns] = useState<number[]>([]);

  // 获取所有评测
  const { data: evaluations } = useQuery({
    queryKey: ['evaluations'],
    queryFn: () => evaluationApi.getEvaluations({ limit: 100 }),
  });

  // 获取对比数据
  const { data: comparison, isLoading } = useQuery({
    queryKey: ['metric-comparison', selectedRuns],
    queryFn: () => evaluationApi.compareMetrics(selectedRuns),
    enabled: selectedRuns.length > 0,
  });

  // 转换为图表数据
  const getChartData = () => {
    if (!comparison) return [];

    const metricNames = new Set<string>();
    Object.values(comparison).forEach((run: any) => {
      Object.keys(run.metrics).forEach(name => metricNames.add(name));
    });

    return Array.from(metricNames).map(metricName => {
      const point: any = { metric: metricName };
      Object.entries(comparison).forEach(([runId, run]: [string, any]) => {
        point[run.model_version] = run.metrics[metricName] || 0;
      });
      return point;
    });
  };

  // 雷达图数据
  const getRadarData = () => {
    if (!comparison) return [];
    
    const mainMetrics = ['accuracy', 'precision', 'recall', 'f1_score'];
    return mainMetrics.map(metric => {
      const point: any = { metric };
      Object.entries(comparison).forEach(([runId, run]: [string, any]) => {
        point[run.model_version] = run.metrics[metric] || 0;
      });
      return point;
    });
  };

  // 表格数据
  const getTableData = () => {
    if (!comparison) return [];

    return Object.entries(comparison).map(([runId, run]: [string, any]) => ({
      key: runId,
      runId,
      runName: run.run_name,
      modelVersion: run.model_version,
      createdAt: run.created_at,
      ...run.metrics,
    }));
  };

  // 表格列
  const columns = [
    {
      title: '评测名称',
      dataIndex: 'runName',
      key: 'runName',
      fixed: 'left' as const,
      width: 150,
    },
    {
      title: '模型版本',
      dataIndex: 'modelVersion',
      key: 'modelVersion',
      fixed: 'left' as const,
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>,
    },
    {
      title: '准确率',
      dataIndex: 'accuracy',
      key: 'accuracy',
      render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
      sorter: (a: any, b: any) => (a.accuracy || 0) - (b.accuracy || 0),
    },
    {
      title: '精确率',
      dataIndex: 'precision',
      key: 'precision',
      render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
      sorter: (a: any, b: any) => (a.precision || 0) - (b.precision || 0),
    },
    {
      title: '召回率',
      dataIndex: 'recall',
      key: 'recall',
      render: (value: number) => value ? (value * 100).toFixed(2) + '%' : '-',
      sorter: (a: any, b: any) => (a.recall || 0) - (b.recall || 0),
    },
    {
      title: 'F1 分数',
      dataIndex: 'f1_score',
      key: 'f1_score',
      render: (value: number) => value ? value.toFixed(4) : '-',
      sorter: (a: any, b: any) => (a.f1_score || 0) - (b.f1_score || 0),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (time: string) => new Date(time).toLocaleString('zh-CN'),
    },
  ];

  const chartData = getChartData();
  const radarData = getRadarData();
  const tableData = getTableData();

  return (
    <div className="p-6 space-y-6">
      {/* 选择评测 */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Select
              mode="multiple"
              placeholder="选择要对比的评测（最多5个）"
              style={{ width: '100%' }}
              value={selectedRuns}
              onChange={setSelectedRuns}
              maxCount={5}
              options={evaluations?.map((run: any) => ({
                label: `${run.run_name || `评测 #${run.id}`} - ${run.model_version}`,
                value: run.id,
              }))}
            />
          </div>
          <Button
            type="primary"
            icon={<CompareOutlined />}
            disabled={selectedRuns.length < 2}
          >
            开始对比
          </Button>
        </div>
      </Card>

      {selectedRuns.length === 0 ? (
        <Card>
          <Empty description="请选择至少2个评测进行对比" />
        </Card>
      ) : (
        <>
          {/* 柱状图对比 */}
          <Card title="指标对比 - 柱状图">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.values(comparison || {}).map((run: any, index) => (
                  <Bar
                    key={run.model_version}
                    dataKey={run.model_version}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* 折线图趋势 */}
          <Card title="指标趋势 - 折线图">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.values(comparison || {}).map((run: any, index) => (
                  <Line
                    key={run.model_version}
                    type="monotone"
                    dataKey={run.model_version}
                    stroke={COLORS[index % COLORS.length]}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Card>

          {/* 雷达图 */}
          {radarData.length > 0 && (
            <Card title="综合能力 - 雷达图">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis domain={[0, 1]} />
                  <Tooltip />
                  <Legend />
                  {Object.values(comparison || {}).map((run: any, index) => (
                    <Radar
                      key={run.model_version}
                      name={run.model_version}
                      dataKey={run.model_version}
                      stroke={COLORS[index % COLORS.length]}
                      fill={COLORS[index % COLORS.length]}
                      fillOpacity={0.3}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {/* 详细数据表格 */}
          <Card title="详细数据">
            <Table
              columns={columns}
              dataSource={tableData}
              loading={isLoading}
              scroll={{ x: 1000 }}
              pagination={false}
            />
          </Card>
        </>
      )}
    </div>
  );
}