import { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const { Random } = Mock;

export default [
    // 获取指标对比数据
    {
        url: '/api/v1/metrics/comparison',
        method: 'get',
        response: () => {
            const models = ['GPT-4', 'Claude-3', 'Gemini-Pro', 'LLaMA-3', 'Qwen-Max'];

            return models.map(model => ({
                modelName: model,
                accuracy: Random.float(0.75, 0.98, 2, 2),
                precision: Random.float(0.75, 0.98, 2, 2),
                recall: Random.float(0.75, 0.98, 2, 2),
                f1Score: Random.float(0.75, 0.98, 2, 2),
                latency: Random.float(0.5, 3.0, 1, 2),
                throughput: Random.integer(100, 1000),
            }));
        },
    },

    // 获取指标趋势数据
    {
        url: '/api/v1/metrics/trend',
        method: 'get',
        response: ({ query }: any) => {
            const { modelId, metric = 'accuracy', days = 7 } = query;

            return Array.from({ length: parseInt(days) }, (_, index) => ({
                date: new Date(Date.now() - (days - index - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                value: Random.float(0.7, 0.95, 2, 2),
            }));
        },
    },

    // 获取详细指标
    {
        url: '/api/v1/metrics/:evaluationId',
        method: 'get',
        response: () => {
            return {
                accuracy: Random.float(0.75, 0.98, 2, 2),
                precision: Random.float(0.75, 0.98, 2, 2),
                recall: Random.float(0.75, 0.98, 2, 2),
                f1Score: Random.float(0.75, 0.98, 2, 2),
                confusionMatrix: [
                    [Random.integer(80, 100), Random.integer(0, 10)],
                    [Random.integer(0, 10), Random.integer(80, 100)],
                ],
                rocAuc: Random.float(0.85, 0.99, 2, 2),
                avgResponseTime: Random.float(0.5, 3.0, 1, 2),
                errorRate: Random.float(0, 0.05, 2, 4),
            };
        },
    },
] as MockMethod[];
