import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

function App() {
  const { token, fetchUser } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token, fetchUser]);

  return null;
}