import { Card, Row, Col, Statistic } from 'antd';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Metric } from '@/types/evaluation';

interface MetricChartProps {
  data: Metric[];
}

export default function MetricChart({ data }: MetricChartProps) {
  // 转换数据格式
  const chartData = data.map(metric => ({
    name: metric.metric_name,
    value: metric.metric_value,
  }));

  // 主要指标卡片
  const mainMetrics = data.filter(m => 
    ['accuracy', 'precision', 'recall', 'f1_score'].includes(m.metric_name)
  );

  const metricLabels: Record<string, string> = {
    accuracy: '准确率',
    precision: '精确率',
    recall: '召回率',
    f1_score: 'F1分数',
    average_score: '平均分',
    pass_rate: '通过率',
  };

  return (
    <div className="space-y-4">
      {/* 指标卡片 */}
      <Row gutter={16}>
        {mainMetrics.map((metric) => (
          <Col span={6} key={metric.metric_name}>
            <Card>
              <Statistic
                title={metricLabels[metric.metric_name] || metric.metric_name}
                value={metric.metric_value}
                precision={4}
                suffix={metric.metric_value <= 1 ? '' : ''}
                valueStyle={{ 
                  color: metric.metric_value > 0.8 ? '#3f8600' : 
                         metric.metric_value > 0.6 ? '#faad14' : '#cf1322' 
                }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* 柱状图 */}
      <Card title="指标详情">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" fill="#1890ff" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}