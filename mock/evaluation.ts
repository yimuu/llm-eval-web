import { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const { Random } = Mock;

// 生成模拟评测任务
const generateEvaluations = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        run_name: `评测任务_${index + 1}`,
        model_version: Random.pick(['GPT-4', 'Claude-3', 'Gemini-Pro', 'LLaMA-3', 'Qwen-Max']),
        task_id: Random.integer(1, 5),
        status: Random.pick(['pending', 'running', 'completed', 'failed']),
        progress_percent: Random.integer(0, 100),
        created_at: Random.datetime('yyyy-MM-ddTHH:mm:ss'),
        updated_at: Random.datetime('yyyy-MM-ddTHH:mm:ss'),
    }));
};

const evaluations = generateEvaluations(30);

export default [
    // 获取评测列表 - 返回数组而不是分页对象
    {
        url: '/api/v1/evaluations/runs',
        method: 'get',
        response: ({ query }: any) => {
            const { task_id, limit = 10, offset = 0 } = query;

            let filteredData = evaluations;
            if (task_id) {
                filteredData = evaluations.filter(e => e.task_id === parseInt(task_id));
            }

            const start = parseInt(offset);
            const end = start + parseInt(limit);

            // 直接返回数组
            return filteredData.slice(start, end);
        },
    },

    // 获取单个评测详情
    {
        url: '/api/v1/evaluations/runs/:id',
        method: 'get',
        response: ({ query }: any) => {
            const evaluation = evaluations.find(e => e.id === parseInt(query.id));
            if (evaluation) {
                const totalCount = Random.integer(50, 100);
                const completedCount = Math.floor(totalCount * (evaluation.progress_percent / 100));
                const failedCount = Random.integer(0, 5);

                return {
                    ...evaluation,
                    total_count: totalCount,
                    completed_count: completedCount,
                    failed_count: failedCount,
                    metrics: {
                        accuracy: Random.float(0.75, 0.98, 2, 2),
                        precision: Random.float(0.75, 0.98, 2, 2),
                        recall: Random.float(0.75, 0.98, 2, 2),
                        f1_score: Random.float(0.75, 0.98, 2, 2),
                    },
                };
            }
            return { code: 404, message: '评测任务不存在' };
        },
    },

    // 创建评测任务
    {
        url: '/api/v1/evaluations/runs',
        method: 'post',
        response: ({ body }: any) => {
            const newEvaluation = {
                id: evaluations.length + 1,
                ...body,
                status: 'pending',
                progress_percent: 0,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };
            evaluations.push(newEvaluation);
            return newEvaluation;
        },
    },

    // 获取评测进度
    {
        url: '/api/v1/evaluations/runs/:id/progress',
        method: 'get',
        response: ({ query }: any) => {
            const id = parseInt(query.id);
            const evaluation = evaluations.find(e => e.id === id);

            if (!evaluation) {
                return { code: 404, message: '评测任务不存在' };
            }

            const totalCount = Random.integer(50, 100);
            const completedCount = Math.floor(totalCount * (evaluation.progress_percent / 100));
            const failedCount = Random.integer(0, 5);
            const pendingCount = totalCount - completedCount - failedCount;

            // Generate mock results
            const results = Array.from({ length: 20 }, (_, index) => ({
                id: index + 1,
                dataset_id: Random.integer(1, 100),
                status: Random.pick(['pending', 'running', 'completed', 'failed']),
                model_output: index % 3 === 0 ? { text: Random.sentence() } : null,
                evaluation_result: index % 2 === 0 ? { is_correct: Random.boolean() } : null,
                error_message: index % 10 === 0 ? 'API timeout' : null,
                execution_time: Random.integer(100, 3000),
            }));

            return {
                run_id: id,
                status: evaluation.status,
                total_count: totalCount,
                completed_count: completedCount,
                failed_count: failedCount,
                pending_count: pendingCount,
                progress_percent: evaluation.progress_percent,
                results: results,
            };
        },
    },


    // 删除评测任务
    {
        url: '/api/v1/evaluations/runs/:id',
        method: 'delete',
        response: ({ query }: any) => {
            const index = evaluations.findIndex(e => e.id === parseInt(query.id));
            if (index > -1) {
                evaluations.splice(index, 1);
                return { success: true };
            }
            return { code: 404, message: '评测任务不存在' };
        },
    },
] as MockMethod[];
