import React, { useState, useEffect } from 'react';
import { Layout, notification } from 'antd';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import './Room.css';
import TimerWidget from './TimerWidget';
import RoomStepper from './RoomStepper';
import ColumnManager from './ColumnManager';
import LoginModal from './LoginModal';
import ParticipantsDrawer from './ParticipantsDrawer';
import HeaderComponent from './HeaderComponent';

const { Content } = Layout;

const API_URL = process.env.REACT_APP_API_URL;

function Room() {
  const { roomId } = useParams();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  
  // Объявляем состояния с функциями для обновления



  const [socket, setSocket] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

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
    socketIo.on('cardDeleted', ({ cardId }) => {
      setCards((prevCards) => prevCards.filter((card) => card._id !== cardId));
    });

    socketIo.on('disconnect', () => {
      setSocket(null);
    });

    return () => {
      socketIo.emit('leaveRoom', { userId: user.userId, roomId });
      socketIo.disconnect();
    };
  }, [user, roomId]);

  const handleLogin = async (username) => {
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



  const addCard = (columnId, content) => {
    const card = { content, columnId, author: user.userId };
    socket?.emit('addCard', { roomId, card });
  };


  return (
    <Layout  className="room-layout">
      {socket && users && (
    <HeaderComponent roomId={roomId} users={users} socket={socket}/>
      )}
      <Content className="room-content"  style={{ padding: '0 24px', backgroundColor: '#f5f5f5' }}>
        {socket && <RoomStepper roomId={roomId} socket={socket} />}
        {socket && user && (
          <ColumnManager
            socket={socket}
            columns={columns}
            cards={cards}
            roomId={roomId}
            addCard={addCard}
            userId={user.userId}
          />
        )}
        {socket && (
          <TimerWidget
            socket={socket}
            roomId={roomId}

          />
        )}
      </Content>

      <ParticipantsDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        users={users}
      />

      <LoginModal
        visible={loginModalOpen}
        onLogin={handleLogin}
        onClose={() => setLoginModalOpen(false)}
      />
    </Layout>
  );
}

Room.propTypes = {
  setHeaderProps: PropTypes.func.isRequired,
  
};

export default Room;