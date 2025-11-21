import { useState } from 'react';
import { Card, Table, Button, Tag, Space, Modal, Form, Input, Select, Switch, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: 'admin' | 'user' | 'viewer';
  is_active: boolean;
  created_at: string;
}

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();

  // 获取用户列表
  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await axios.get('/api/v1/admin/users');
      return response.data;
    },
  });

  // 创建/更新用户
  const saveMutation = useMutation({
    mutationFn: async (values: any) => {
      if (editingUser) {
        return axios.put(`/api/v1/admin/users/${editingUser.id}`, values);
      } else {
        return axios.post('/api/v1/admin/users', values);
      }
    },
    onSuccess: () => {
      message.success(editingUser ? '更新成功' : '创建成功');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setModalVisible(false);
      setEditingUser(null);
      form.resetFields();
    },
  });

  // 删除用户
  const deleteMutation = useMutation({
    mutationFn: (id: number) => axios.delete(`/api/v1/admin/users/${id}`),
    onSuccess: () => {
      message.success('删除成功');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  // 切换用户状态
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: number; is_active: boolean }) =>
      axios.patch(`/api/v1/admin/users/${id}`, { is_active }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleCreate = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue(user);
    setModalVisible(true);
  };

  const handleDelete = (user: User) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${user.username}" 吗？`,
      onOk: () => deleteMutation.mutate(user.id),
    });
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      saveMutation.mutate(values);
    } catch (error) {
      // 表单验证失败
    }
  };

  const handleResetPassword = (user: User) => {
    Modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 "${user.username}" 的密码吗？新密码将通过邮件发送。`,
      onOk: async () => {
        try {
          await axios.post(`/api/v1/admin/users/${user.id}/reset-password`);
          message.success('密码重置成功');
        } catch (error) {
          message.error('密码重置失败');
        }
      },
    });
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '姓名',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text: string) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => {
        const config: Record<string, any> = {
          admin: { color: 'red', text: '管理员' },
          user: { color: 'blue', text: '用户' },
          viewer: { color: 'default', text: '访客' },
        };
        return <Tag color={config[role].color}>{config[role].text}</Tag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (is_active: boolean, record: User) => (
        <Switch
          checked={is_active}
          checkedChildren="启用"
          unCheckedChildren="禁用"
          onChange={(checked) =>
            toggleStatusMutation.mutate({ id: record.id, is_active: checked })
          }
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: '操作',
      key: 'action',
      width: 250,
      render: (_: any, record: User) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="link"
            icon={<KeyOutlined />}
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">用户管理</h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建用户
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 个用户`,
          }}
        />
      </Card>

      {/* 创建/编辑用户弹窗 */}
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={() => {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
        }}
        confirmLoading={saveMutation.isPending}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" disabled={!!editingUser} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>

          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: '请输入密码' },
                { min: 6, message: '密码至少6位' },
              ]}
            >
              <Input.Password placeholder="密码" />
            </Form.Item>
          )}

          <Form.Item name="full_name" label="姓名">
            <Input placeholder="姓名（可选）" />
          </Form.Item>

          <Form.Item
            name="role"
            label="角色"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select
              options={[
                { label: '管理员', value: 'admin' },
                { label: '用户', value: 'user' },
                { label: '访客', value: 'viewer' },
              ]}
            />
          </Form.Item>

          <Form.Item name="is_active" label="状态" valuePropName="checked" initialValue={true}>
            <Switch checkedChildren="启用" unCheckedChildren="禁用" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}