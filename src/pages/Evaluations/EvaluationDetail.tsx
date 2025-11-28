import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Descriptions, Progress, Tag, Table, Tabs } from 'antd';
import { useEvaluationDetail, useEvaluationProgress, useMetrics } from '@/hooks/useEvaluation';
import { useWebSocket } from '@/hooks/useWebSocket';
import MetricChart from '@/components/Charts/MetricChart';
import dayjs from 'dayjs';

export default function EvaluationDetail() {
  const { id } = useParams<{ id: string }>();
  const runId = parseInt(id!);

  const { data: evaluation } = useEvaluationDetail(runId);
  const { data: progress, refetch } = useEvaluationProgress(runId, false);
  const { data: metrics } = useMetrics(runId);

  // WebSocket 实时更新
  const { data: wsData } = useWebSocket(
    evaluation?.status === 'running' ? runId : null
  );

  // WebSocket 数据更新时刷新进度
  useEffect(() => {
    if (wsData) {
      refetch();
    }
  }, [wsData, refetch]);

  if (!evaluation) return <div>Loading...</div>;

  // Ensure results is always an array
  const resultsData = Array.isArray(progress?.results) ? progress.results : [];

  const resultColumns = [
    {
      title: '数据ID',
      dataIndex: 'dataset_id',
      key: 'dataset_id',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: Record<string, string> = {
          pending: 'default',
          running: 'processing',
          completed: 'success',
          failed: 'error',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '模型输出',
      dataIndex: 'model_output',
      key: 'model_output',
      render: (output: any) => output ? JSON.stringify(output) : '-',
    },
    {
      title: '评测结果',
      dataIndex: 'evaluation_result',
      key: 'evaluation_result',
      render: (result: any) => {
        if (!result) return '-';
        return result.is_correct ? (
          <Tag color="success">正确</Tag>
        ) : (
          <Tag color="error">错误</Tag>
        );
      },
    },
    {
      title: '执行时间',
      dataIndex: 'execution_time',
      key: 'execution_time',
      render: (time: number) => time ? `${time}ms` : '-',
    },
  ];

  return (
    <div className="p-6 space-y-4">
      {/* 基本信息 */}
      <Card title="评测信息">
        <Descriptions column={2}>
          <Descriptions.Item label="评测名称">
            {evaluation.run_name || `评测 #${evaluation.id}`}
          </Descriptions.Item>
          <Descriptions.Item label="模型版本">
            {evaluation.model_version}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            <Tag color={
              evaluation.status === 'completed' ? 'success' :
                evaluation.status === 'running' ? 'processing' :
                  evaluation.status === 'failed' ? 'error' : 'default'
            }>
              {evaluation.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            {dayjs(evaluation.created_at).format('YYYY-MM-DD HH:mm:ss')}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-4">
          <div className="mb-2">评测进度</div>
          <Progress
            percent={evaluation.progress_percent}
            status={evaluation.status === 'failed' ? 'exception' : undefined}
          />
          <div className="text-sm text-gray-500 mt-2">
            完成: {evaluation.completed_count || 0} / {evaluation.total_count || 0}
            {(evaluation.failed_count || 0) > 0 && ` | 失败: ${evaluation.failed_count}`}
          </div>
        </div>
      </Card>

      {/* 详细结果 */}
      <Card>
        <Tabs
          items={[
            {
              key: 'results',
              label: '评测结果',
              children: (
                <Table
                  columns={resultColumns}
                  dataSource={resultsData}
                  rowKey="id"
                  pagination={{ pageSize: 20 }}
                />
              ),
            },
            {
              key: 'metrics',
              label: '评测指标',
              children: metrics ? <MetricChart data={metrics} /> : <div>暂无指标</div>,
            },
          ]}
        />
      </Card>
    </div>
  );
}