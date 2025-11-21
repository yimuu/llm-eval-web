import { useState } from 'react';
import { Form, Input, Select, Button, Card, Steps, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { evaluationApi } from '@/api/evaluation';
import { useCreateEvaluation } from '@/hooks/useEvaluation';

const { Step } = Steps;

export default function CreateEvaluation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  const [form] = Form.useForm();

  // 获取任务列表
  const { data: tasks } = useQuery({
    queryKey: ['tasks'],
    queryFn: () => evaluationApi.getTasks(),
  });

  // 获取选中任务的规则
  const { data: rules } = useQuery({
    queryKey: ['rules', formData.task_id],
    queryFn: () => evaluationApi.getTaskRules(formData.task_id),
    enabled: !!formData.task_id,
  });

  const createMutation = useCreateEvaluation();

  const onNext = async () => {
    try {
      const values = await form.validateFields();
      setFormData({ ...formData, ...values });
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // 验证失败
    }
  };

  const onPrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const onFinish = async () => {
    try {
      const values = await form.validateFields();
      const finalData = { ...formData, ...values };

      await createMutation.mutateAsync(finalData);
      message.success('评测任务创建成功，正在后台执行');
      navigate('/evaluations');
    } catch (error) {
      // 错误处理
    }
  };

  const steps = [
    {
      title: '选择任务',
      content: (
        <>
          <Form.Item
            name="task_id"
            label="评测任务"
            rules={[{ required: true, message: '请选择评测任务' }]}
          >
            <Select
              placeholder="选择任务"
              options={tasks?.map((task) => ({
                label: task.task_name,
                value: task.id,
              }))}
              onChange={(value) => setFormData({ ...formData, task_id: value })}
            />
          </Form.Item>

          <Form.Item
            name="rule_id"
            label="评测规则"
            rules={[{ required: true, message: '请选择评测规则' }]}
          >
            <Select
              placeholder="选择评测规则"
              options={rules?.map((rule) => ({
                label: rule.rule_name,
                value: rule.id,
              }))}
              disabled={!formData.task_id}
            />
          </Form.Item>
        </>
      ),
    },
    {
      title: '配置参数',
      content: (
        <>
          <Form.Item
            name="model_version"
            label="模型版本"
            rules={[{ required: true, message: '请输入模型版本' }]}
          >
            <Input placeholder="例如: v1.2.0" />
          </Form.Item>

          <Form.Item
            name="run_name"
            label="评测名称"
          >
            <Input placeholder="为本次评测起个名字（可选）" />
          </Form.Item>
        </>
      ),
    },
    {
      title: '确认信息',
      content: (
        <div className="space-y-2">
          <div>任务: {tasks?.find(t => t.id === formData.task_id)?.task_name}</div>
          <div>规则: {rules?.find(r => r.id === formData.rule_id)?.rule_name}</div>
          <div>模型版本: {formData.model_version}</div>
          <div>评测名称: {formData.run_name || '未设置'}</div>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-bold mb-6">创建评测任务</h2>

        <Steps current={currentStep} className="mb-8">
          {steps.map((step) => (
            <Step key={step.title} title={step.title} />
          ))}
        </Steps>

        <Form form={form} layout="vertical">
          {steps[currentStep].content}
        </Form>

        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button onClick={onPrev}>上一步</Button>
          )}
          {currentStep < steps.length - 1 && (
            <Button type="primary" onClick={onNext} className="ml-auto">
              下一步
            </Button>
          )}
          {currentStep === steps.length - 1 && (
            <Button
              type="primary"
              onClick={onFinish}
              loading={createMutation.isPending}
              className="ml-auto"
            >
              创建评测
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}