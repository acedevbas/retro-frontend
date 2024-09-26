// RoomPage.js
import React, { useState, useEffect } from 'react';
import {
  Layout,
  Button,
  theme,
  notification,
  Input,
  Typography,
  Space,
  Avatar,
  List,
} from 'antd';
import {
  UserOutlined,
  HomeOutlined,
  FileTextOutlined,
  ShareAltOutlined,
  SettingOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import LoginModal from '../components/LoginModal';
import RoomStepper from '../components/RoomStepper';
import ColumnManager from '../components/ColumnManager';
import TimerWidget from '../components/TimerWidget';
import './Room.css';


const { Header, Sider, Content, Footer } = Layout;

const API_URL = process.env.REACT_APP_API_URL;

const siderStyle = {
  overflow: 'hidden',
  height: '100vh',
  position: 'fixed',
  top: 0,
  bottom: 0,
  backgroundColor: '#001529',
};

const buttonStyle = {
  fontSize: '16px',
  width: 48,
  height: 48,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const RoomPage = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [sidebarContent, setSidebarContent] = useState(null);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { roomId } = useParams();

  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const [roomName, setRoomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState(roomName);

  useEffect(() => {
    setNewRoomName(roomName);
  }, [roomName]);

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
        setRoomName(roomData.name || 'Без названия');
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

    socketIo.on('roomNameChanged', (data) => {
      if (data.roomId === roomId) {
        setRoomName(data.name);
        notification.info({
          message: 'Название комнаты изменено',
          description: `Новое название: ${data.name}`,
        });
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

  const handleNameChange = async () => {
    const trimmedNewName = newRoomName.trim();
    const trimmedCurrentName = roomName.trim();

    if (trimmedNewName === trimmedCurrentName || trimmedNewName === '') {
      setIsEditingName(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/rooms/${roomId}/name`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedNewName }),
      });

      if (!response.ok) throw new Error('Не удалось изменить название комнаты');

      setRoomName(trimmedNewName);
      setIsEditingName(false);

      socket.emit('roomNameChanged', { roomId, name: trimmedNewName });

      notification.success({
        message: 'Название комнаты обновлено',
        description: `Новое название: ${trimmedNewName}`,
      });
    } catch (error) {
      console.error('Ошибка при изменении названия комнаты:', error);
      notification.error({
        message: 'Ошибка',
        description: 'Не удалось изменить название комнаты',
      });
    }
  };

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

  // Функция для переключения контента сайдбара с анимацией закрытия и открытия
  const handleSidebarContentChange = (content) => {
    // Если выбран тот же контент, просто закрываем сайдбар
    if (sidebarContent === content && !collapsed) {
      setCollapsed(true);
      setTimeout(() => {
        setSidebarContent(null);
      }, 300); // Время совпадает со временем transition
    } else {
      // Если сайдбар открыт с другим контентом
      if (!collapsed) {
        setCollapsed(true);
        setTimeout(() => {
          setSidebarContent(content);
          setCollapsed(false);
        }, 300);
      } else {
        // Если сайдбар закрыт
        setSidebarContent(content);
        setCollapsed(false);
      }
    }
  };

  return (
    <Layout hasSider style={{ minHeight: '100vh' }}>
      {/* Сайдбар */}
      <Sider
        width={300}
        style={siderStyle}
        collapsedWidth={48} // Сайдбар всегда чуть-чуть торчит
        collapsible
        collapsed={collapsed}
        trigger={null}
        className="custom-sider"
      >
        {/* Кнопка закрытия сайдбара */}
        {!collapsed && (
          <Button
            type="text"
            icon={<CloseOutlined style={{ color: 'white' }} />}
            onClick={() => {
              setCollapsed(true);
              setTimeout(() => {
                setSidebarContent(null);
              }, 300);
            }}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 1 }}
          />
        )}
        {/* Контент сайдбара */}
        {sidebarContent === 'users' && !collapsed && <UsersList users={users} />}
      
      </Sider>
      <Layout
        className="site-layout"
        style={{
          marginLeft: collapsed ? 48 : 300,
          transition: 'margin-left 0.3s', // Вернули более плавную анимацию
        }}
      >
        <Header
          style={{
            padding: '0 16px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
          }}
        >
          {/* Левая часть хедера */}
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {/* Кнопка пользователей */}
            <Button
              type="text"
              icon={<UserOutlined style={{ fontSize: '16px' }} />}
              onClick={() => handleSidebarContentChange('users')}
              style={buttonStyle}
            />
            {/* Кнопка заметок */}
            <Button
              type="text"
              icon={<FileTextOutlined style={{ fontSize: '16px' }} />}
              onClick={() => handleSidebarContentChange('notes')}
              style={buttonStyle}
            />
            {/* Другие кнопки */}
            <Button
              type="text"
              icon={<ShareAltOutlined style={{ fontSize: '16px' }} />}
              onClick={() => {
                /* Действие по нажатию на кнопку поделиться */
              }}
              style={buttonStyle}
            />
            <Button
              type="text"
              icon={<SettingOutlined style={{ fontSize: '16px' }} />}
              onClick={() => {
                /* Действие по нажатию на кнопку настроек */
              }}
              style={buttonStyle}
            />
          </div>

          {/* Центральная часть - название комнаты */}
          <div style={{ flex: 1, textAlign: 'center' }}>
            {isEditingName ? (
              <Input
                value={newRoomName}
                onChange={(e) => setNewRoomName(e.target.value)}
                onPressEnter={handleNameChange}
                onBlur={handleNameChange}
                style={{ maxWidth: '400px' }}
                autoFocus
              />
            ) : (
              <Space>
                <HomeOutlined style={{ fontSize: '24px' }} />
                <Typography.Title
                  level={3}
                  editable={{
                    onStart: () => setIsEditingName(true),
                  }}
                  style={{ margin: 0, display: 'inline-block' }}
                >
                  {roomName}
                </Typography.Title>
              </Space>
            )}
          </div>

          {/* Правая часть - информация о пользователе */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginRight: '16px',
            }}
          >
            <Avatar style={{ backgroundColor: '#1890ff', marginRight: '8px' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </Avatar>
            <Typography.Text>{user?.username}</Typography.Text>
          </div>
        </Header>

        <div className="room-stepper">
          {socket && <RoomStepper roomId={roomId} socket={socket} />}
        </div>

        <Content
          style={{
            margin: '24px 16px',
            padding: '24px',
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            overflow: 'initial',
            flex: 1,
          }}
        >
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

          {socket && <TimerWidget socket={socket} roomId={roomId} />}
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>

      <LoginModal
        visible={loginModalOpen}
        onLogin={handleLogin}
        onClose={() => setLoginModalOpen(false)}
      />
    </Layout>
  );
};

// Компонент списка пользователей
const UsersList = ({ users }) => (
  <>
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <Typography.Title level={4} style={{ margin: 0, color: 'white' }}>
        Участники
      </Typography.Title>
    </div>
    <div style={{ overflowY: 'auto', height: 'calc(100% - 64px)' }}>
      <List
        itemLayout="horizontal"
        dataSource={users}
        style={{ padding: '0 16px' }} // Добавили отступы от края
        renderItem={(userItem) => (
          <List.Item style={{ padding: '12px 0' }}>
            <List.Item.Meta
              avatar={
                <Avatar style={{ backgroundColor: '#1890ff' }}>
                  {userItem.username.charAt(0).toUpperCase()}
                </Avatar>
              }
              title={
                <span style={{ color: 'white' }}>{userItem.username}</span>
              }
            />
          </List.Item>
        )}
      />
    </div>
  </>
);



UsersList.propTypes = {
  users: PropTypes.array.isRequired,
};



export default RoomPage;