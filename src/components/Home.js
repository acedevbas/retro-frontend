// src/components/Home.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Typography, Button } from 'antd';

function Home() {
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    try {
      const response = await fetch('http://localhost:3000/rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        throw new Error('Failed to create room');
      }

      const { roomId } = await response.json();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '20px',
        backgroundColor: '#f0f2f5',
      }}
    >
      <Typography.Title level={2}>Welcome to Retro Board</Typography.Title>
      <Typography.Paragraph type="secondary">
        Collaborate and innovate with ease
      </Typography.Paragraph>
      <Button type="primary" size="large" style={{ margin: '20px 0' }} onClick={handleCreateRoom}>
        Create a Room
      </Button>
    </div>
  );
}

export default Home;
