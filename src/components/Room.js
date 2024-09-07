import React, { useState, useEffect } from 'react';
import { Layout, Drawer, List, Avatar, Modal, Input, Button, Progress, notification } from 'antd';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import TimerWidget from './TimerWidget';
import HeaderComponent from './HeaderComponent';
import RoomStepper from './RoomStepper';
import ColumnManager from './ColumnManager';

const { Content } = Layout;

const API_URL = 'http://localhost:3000';

function Room() {
  const { roomId } = useParams();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [phase, setPhase] = useState('preparation');
  const [timerDuration, setTimerDuration] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [socket, setSocket] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [progressBarVisible, setProgressBarVisible] = useState(false);
  const [success, setSuccess] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
    } else {
      setLoginModalOpen(true);
    }
  }, []);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms/${roomId}`);
        if (!response.ok) throw new Error('Не удалось загрузить данные комнаты');

        const roomData = await response.json();

        setColumns(roomData.columns);
        setCards(roomData.cards || []);
        setTimerDuration(roomData.timerDuration || 0);
        setTimeLeft(roomData.remainingTime || roomData.timerDuration || 0);
        setPhase(roomData.phase);
        setIsRunning(roomData.running || false);
        setProgressBarVisible(roomData.running && (roomData.remainingTime > 0));
      } catch (error) {
        console.error('Ошибка загрузки данных комнаты:', error);
      }
    };

    fetchRoomData();
  }, [roomId]);

  useEffect(() => {
    if (!user) return;

    const socketIo = io(API_URL, { withCredentials: true });

    setSocket(socketIo);

    socketIo.on('connect', () => {
      socketIo.emit('joinRoom', { userId: user.userId, roomId });
    });

    socketIo.on('userJoined', (data) => setUsers(data.users || []));
    socketIo.on('userLeft', (data) => setUsers(data.users || []));
    socketIo.on('cardAdded', (data) => setCards((prev) => [...prev, data.card]));

    socketIo.on('timerUpdate', (data) => {
      const { isRunning, timeLeft } = data;
      setIsRunning(isRunning);
      setTimeLeft(timeLeft);

      setProgressBarVisible(isRunning && (timeLeft > 0));

      if (timeLeft === 0) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 2000);
      }
    });

    socketIo.on('disconnect', () => {
      setSocket(null);
    });

    return () => {
      socketIo.emit('leaveRoom', { userId: user.userId, roomId });
      socketIo.disconnect();
    };
  }, [user, roomId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (timerDuration > 0) {
        setProgressPercent((((timerDuration - timeLeft) / timerDuration) * 100).toFixed(2));
      }

      if (isRunning && timeLeft > 0) {
        setTimeLeft((prev) => Math.max(prev - 0.05, 0)); // Smaller decrement for smoother progress
      }
    }, 30); // Update every 30 milliseconds

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, timerDuration]);

  const handleLogin = async () => {
    if (!username) {
      notification.error({ message: 'Ошибка', description: 'Введите имя пользователя' });
      return;
    }

    try {
      const response = await fetch(`${API_URL}/auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) throw new Error('Не удалось авторизоваться');

      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoginModalOpen(false);
      notification.success({
        message: 'Успешно',
        description: 'Вы успешно авторизованы',
      });
    } catch (error) {
      console.error('Ошибка авторизации:', error);
      notification.error({
        message: 'Ошибка',
        description: 'Не удалось авторизоваться',
      });
    }
  };

  const handleProgressBarChange = (visible) => {
    setProgressBarVisible(visible);
  };

  const handleTimerDurationUpdate = (duration) => {
    setTimerDuration(duration);
  };

  const handleTimeLeftUpdate = (timeLeft) => {
    setTimeLeft(timeLeft);
  };

  return (
    <Layout>
      <HeaderComponent roomId={roomId} onParticipantsClick={() => setDrawerOpen(true)} />

      <div style={{
        height: '10px', // Fixed height
        transition: 'opacity 0.5s ease-in-out', // Smooth transition for opacity
        opacity: progressBarVisible ? 1 : 0, // Toggle visibility
        width: '100%',
      }}>
        <Progress
          percent={progressPercent}
          showInfo={false}
          strokeColor={isRunning ? { from: '#1890ff', to: '#87d068' } : '#FFC107'} 
          trailColor="#FAFAFA"
          style={{
            borderRadius: '10px',
          }}
          status={success ? 'success' : 'active'}
        />
      </div>

      <Content style={{ padding: '24px', marginTop: 20, backgroundColor: '#f5f5f5' }}>
        <RoomStepper activeStep={['preparation', 'createCards', 'prepareVote', 'vote', 'discussion'].indexOf(phase)} />

        <ColumnManager
          columns={columns}
          cards={cards}
          addCard={(columnId, content) => {
            const card = { content, columnId, author: user.userId };
            socket?.emit('addCard', { roomId, card });
          }}
          editColumn={(columnId, name) => {
            const newColumns = columns.map((col) => (col._id === columnId ? { ...col, name } : col));
            setColumns(newColumns);
          }}
          deleteColumn={(columnId) => {
            const newColumns = columns.filter((col) => col._id !== columnId);
            setColumns(newColumns);
          }}
        />

        {socket && (
          <TimerWidget
            socket={socket}
            roomId={roomId}
            isRunning={isRunning}
            timerDuration={timerDuration}
            timeLeft={timeLeft}
            setTimeLeft={setTimeLeft}
            setShowProgressBar ={handleProgressBarChange}
            onTimerDurationUpdate={handleTimerDurationUpdate}
            onTimeLeftUpdate={handleTimeLeftUpdate}
          />
        )}
      </Content>

      <Drawer
        title="Участники"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={320}
      >
   
        <List
          itemLayout="horizontal"
          dataSource={users}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={<Avatar>{(item.username || 'У').charAt(0).toUpperCase()}</Avatar>}
                title={item.username || 'Неизвестный пользователь'}
              />
            </List.Item>
          )}
        />
      </Drawer>

      <Modal
        title="Авторизация"
        open={loginModalOpen}
        onOk={handleLogin}
        onCancel={() => setLoginModalOpen(false)}
        footer={[
          <Button key="back" onClick={() => setLoginModalOpen(false)}>Закрыть</Button>,
          <Button key="submit" type="primary" onClick={handleLogin}>Войти</Button>,
        ]}
      >
        <Input
          placeholder="Введите ваше имя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onPressEnter={handleLogin}
        />
      </Modal>
    </Layout>
  );
}

export default Room;
