import { MockMethod } from 'vite-plugin-mock';
import Mock from 'mockjs';

const { Random } = Mock;

// 生成模拟数据集列表
const generateDatasets = (count: number) => {
    return Array.from({ length: count }, (_, index) => ({
        id: index + 1,
        name: `数据集_${Random.word(3, 8)}`,
        description: Random.sentence(10, 20),
        fileCount: Random.integer(10, 1000),
        totalSize: Random.integer(1024 * 1024, 1024 * 1024 * 1024),
        format: Random.pick(['JSON', 'CSV', 'JSONL', 'Parquet']),
        status: Random.pick(['active', 'processing', 'archived']),
        createdAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        updatedAt: Random.datetime('yyyy-MM-dd HH:mm:ss'),
        createdBy: Random.pick(['admin', 'user1', 'user2']),
    }));
};

const datasets = generateDatasets(20);

export default [
    // 获取数据集列表
    {
        url: '/api/v1/datasets',
        method: 'get',
        response: ({ query }: any) => {
            const { page = 1, pageSize = 10, search = '' } = query;

            let filteredData = datasets;
            if (search) {
                filteredData = datasets.filter(d =>
                    d.name.includes(search) || d.description.includes(search)
                );
            }

            const start = (page - 1) * pageSize;
            const end = start + parseInt(pageSize);

            return {
                items: filteredData.slice(start, end),
                total: filteredData.length,
                page: parseInt(page),
                pageSize: parseInt(pageSize),
            };
        },
    },

    // 获取单个数据集
    {
        url: '/api/v1/datasets/:id',
        method: 'get',
        response: ({ query }: any) => {
            const dataset = datasets.find(d => d.id === parseInt(query.id));
            return dataset || { code: 404, message: '数据集不存在' };
        },
    },

    // 创建数据集
    {
        url: '/api/v1/datasets',
        method: 'post',
        response: ({ body }: any) => {
            const newDataset = {
                id: datasets.length + 1,
                ...body,
                status: 'processing',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                createdBy: 'admin',
            };
            datasets.push(newDataset);
            return newDataset;
        },
    },

    // 删除数据集
    {
        url: '/api/v1/datasets/:id',
        method: 'delete',
        response: ({ query }: any) => {
            const index = datasets.findIndex(d => d.id === parseInt(query.id));
            if (index > -1) {
                datasets.splice(index, 1);
                return { success: true };
            }
            return { code: 404, message: '数据集不存在' };
        },
    },
] as MockMethod[];
