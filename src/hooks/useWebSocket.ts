import { useEffect, useRef, useState } from 'react';
import { message } from 'antd';

interface WebSocketMessage {
  type: 'initial' | 'progress' | 'update' | 'completed';
  data: any;
}

export const useWebSocket = (runId: number | null) => {
  const [data, setData] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!runId) return;

    const wsUrl = `${import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000'}/api/v1/ws/evaluations/${runId}`;
    
    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        console.log('WebSocket connected');
      };

      ws.onmessage = (event) => {
        const message: WebSocketMessage = JSON.parse(event.data);
        setData(message.data);

        if (message.type === 'completed') {
          message.data.status === 'completed' 
            ? message.success('评测完成！') 
            : message.error('评测失败');
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        message.error('WebSocket 连接错误');
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('WebSocket disconnected');
      };

      return () => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
    }
  }, [runId]);

  return { data, isConnected };
};