import { Layout, Menu, Avatar, Dropdown, Tag } from 'antd';
import {
  DashboardOutlined,
  ExperimentOutlined,
  DatabaseOutlined,
  BarChartOutlined,
  UserOutlined,
  LogoutOutlined,
  TeamOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

const { Header, Sider, Content } = Layout;

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  const menuItems = [
    {
      key: '/',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/evaluations',
      icon: <ExperimentOutlined />,
      label: '评测管理',
    },
    {
      key: '/datasets',
      icon: <DatabaseOutlined />,
      label: '数据集',
      children: [
        {
          key: '/datasets',
          label: '数据集列表',
        },
        {
          key: '/datasets/upload',
          icon: <UploadOutlined />,
          label: '上传数据集',
        },
      ],
    },
    {
      key: '/metrics',
      icon: <BarChartOutlined />,
      label: '指标对比',
    },
    ...(user?.role === 'admin' ? [
      {
        key: '/admin',
        icon: <TeamOutlined />,
        label: '系统管理',
        children: [
          {
            key: '/admin/users',
            label: '用户管理',
          },
        ],
      },
    ] : []),
  ];

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <Layout className="min-h-screen">
      <Sider
        theme="dark"
        breakpoint="lg"
        collapsedWidth="0"
      >
        <div className="h-16 flex items-center justify-center text-white text-lg font-bold">
          评测系统
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header className="bg-white px-6 flex justify-between items-center shadow-sm">
          <div className="text-lg font-semibold">模型评测系统</div>

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div className="flex items-center cursor-pointer">
              <Avatar icon={<UserOutlined />} />
              <span className="ml-2">{user?.username}</span>
              <Tag color={user?.role === 'admin' ? 'red' : 'blue'} className="ml-2">
                {user?.role === 'admin' ? '管理员' : '用户'}
              </Tag>
            </div>
          </Dropdown>
        </Header>

        <Content className="bg-gray-50">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}