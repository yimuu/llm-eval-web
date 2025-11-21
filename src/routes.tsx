import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainLayout from '@/components/Layout/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import EvaluationList from '@/pages/Evaluations/EvaluationList';
import EvaluationDetail from '@/pages/Evaluations/EvaluationDetail';
import CreateEvaluation from '@/pages/Evaluations/CreateEvaluation';
import DatasetList from '@/pages/Datasets/DatasetList';
import DatasetUpload from '@/pages/Datasets/DatasetUpload';
import MetricComparison from '@/pages/Metrics/MetricComparison';
import UserManagement from '@/pages/Admin/UserManagement';
import { useAuthStore } from '@/store/authStore';

// 权限路由守卫
function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

// 管理员路由守卫
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/" />;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Dashboard />,
      },
      {
        path: 'evaluations',
        children: [
          {
            index: true,
            element: <EvaluationList />,
          },
          {
            path: 'create',
            element: <CreateEvaluation />,
          },
          {
            path: ':id',
            element: <EvaluationDetail />,
          },
        ],
      },
      {
        path: 'datasets',
        children: [
          {
            index: true,
            element: <DatasetList />,
          },
          {
            path: 'upload',
            element: <DatasetUpload />,
          },
        ],
      },
      {
        path: 'metrics',
        children: [
          {
            index: true,
            element: <MetricComparison />,
          },
        ],
      },
      {
        path: 'admin',
        children: [
          {
            path: 'users',
            element: (
              <AdminRoute>
                <UserManagement />
              </AdminRoute>
            ),
          },
        ],
      },
    ],
  },
]);