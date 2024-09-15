// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import SVGComponent from './SVGComponent';

function Home() {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL;

  const handleCreateRoom = async () => {
    try {
      const response = await fetch(`${API_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Не удалось создать комнату');
      }

      const { roomId } = await response.json();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error);
    }
  };

  return (
    <div style={styles.container}>
      <Typography.Title level={2}>Добро пожаловать</Typography.Title>
      <Space direction="vertical" size="large" align="center">
        <div style={styles.svgWrapper}>
          <SVGComponent />
        </div>
        <Typography.Paragraph type="secondary">
          Анализируй опыт, улучшай результат.
        </Typography.Paragraph>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          style={styles.button}
          onClick={handleCreateRoom}
        >
          Создать комнату
        </Button>
      </Space>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    textAlign: 'center',
    padding: '20px',
    backgroundColor: '#f0f2f5',
  },
  svgWrapper: {
    width: '260px',
  },
  button: {
    backgroundColor: '#1890ff',
    borderColor: '#1890ff',
    borderRadius: '8px',
    padding: '0 40px',
  },
};

export default Home;