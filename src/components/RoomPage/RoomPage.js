import React, { useState, useEffect, useCallback, useRef, createContext } from 'react';
import { Layout, notification, theme, Modal, Button, Typography, Input, message, Tooltip } from 'antd';
import { io } from 'socket.io-client';
import { useParams } from 'react-router-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { CopyOutlined, TeamOutlined } from '@ant-design/icons'; // Удалены неиспользуемые иконки
import HeaderComponent from './HeaderComponent';
import SidebarComponent from './SidebarComponent';
import LoginModal from '../LoginModal';
import RoomStepper from '../RoomStepper';
import ColumnManager from '../ColumnManager';
import TimerWidget from '../TimerWidget';
import './RoomPage.css';
import { motion, AnimatePresence } from 'framer-motion';
import NotesPage from './NotesPage';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import useCurrentUser from '../useCurrentUser';

const { Content, Footer } = Layout;
const { Paragraph, Title, Text } = Typography;

// Создаем контекст для управления вкладками
export const TabContext = createContext(); // Экспортируем TabContext


const API_URL = process.env.REACT_APP_API_URL;
// Создаем контекст для управления вкладками


const RoomPage = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [sidebarContent, setSidebarContent] = useState(null);
  const [shareModalVisible, setShareModalVisible] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);  // Добавляем состояние для модального окна входа
  const { roomId } = useParams();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const { user, handleLogin } = useCurrentUser(roomId, setLoginModalOpen);  // Передаем setLoginModalOpen в хук
  const [users, setUsers] = useState([]);
  const [cards, setCards] = useState([]);
  const [columns, setColumns] = useState([]);
  const [socket, setSocket] = useState(null);

  const [roomName, setRoomName] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [newRoomName, setNewRoomName] = useState(roomName);

  const [activeTab, setActiveTab] = useState('main');
  const [initialized, setInitialized] = useState(false);
  const [stepperState, setStepperState] = useState(null); // Восстановлен stepperState

  const navigate = useNavigate();
  const location = useLocation();

  const isSubscribed = useRef(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
    setInitialized(true);
  }, [location.search]);

  useEffect(() => {
    if (!initialized) return;
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('tab') !== activeTab) {
      searchParams.set('tab', activeTab);
      navigate({ search: searchParams.toString() }, { replace: true });
    }
  }, [activeTab, navigate, initialized]);

  useEffect(() => {
    setNewRoomName(roomName);
  }, [roomName]);

  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const response = await fetch(`${API_URL}/rooms/${roomId}`);
        if (!response.ok) throw new Error('Failed to load room data');

        const roomData = await response.json();
        setColumns(roomData.columns);
        setCards(roomData.cards || []);
        setRoomName(roomData.name || 'Untitled');
      } catch (error) {
        console.error('Error loading room data:', error);
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

    socketIo.on('roomNameUpdated', (newRoomName) => {
      setRoomName(newRoomName.name);
      notification.success({
        message: 'Название комнаты обновлено',
        description: `Текущее название: ${newRoomName.name}`,
      });
    });

    socketIo.on('stepperStateUpdated', (newStepperState) => {
      setStepperState(newStepperState);
    });

    socketIo.on('disconnect', () => {
      setSocket(null);
    });

    return () => {
      socketIo.emit('leaveRoom', { userId: user.userId, roomId });
      socketIo.disconnect();
    };
  }, [user, roomId]);

  const subscribeToStepperUpdates = useCallback(() => {
    if (!socket || isSubscribed.current) return;

    socket.emit('getStepperState', { roomId }, (state) => {
      setStepperState(state);
      isSubscribed.current = true;
      socket.on('stepperStateUpdated', handleStepperStateUpdated);
    });
  }, [socket, roomId]);

  const unsubscribeFromStepperUpdates = useCallback(() => {
    if (socket && isSubscribed.current) {
      socket.off('stepperStateUpdated', handleStepperStateUpdated);
      isSubscribed.current = false;
    }
  }, [socket]);

  useEffect(() => {
    if (activeTab === 'main') {
      subscribeToStepperUpdates();
    } else {
      unsubscribeFromStepperUpdates();
    }

    return () => {
      unsubscribeFromStepperUpdates();
    };
  }, [activeTab, subscribeToStepperUpdates, unsubscribeFromStepperUpdates]);

  const handleStepperStateUpdated = (newStepperState) => {
    setStepperState(newStepperState);
  };

  const addCard = (columnId, content) => {
    const card = { content, columnId, author: user.userId };
    socket?.emit('addCard', { roomId, card });
  };

  const handleSidebarContentChange = (content) => {
    if (collapsed) {
      setSidebarContent(content);
      setCollapsed(false);
    } else if (sidebarContent === content) {
      setCollapsed(true);
      setTimeout(() => setSidebarContent(null), 300);
    } else {
      setCollapsed(true);
      setTimeout(() => {
        setSidebarContent(content);
        setCollapsed(false);
      }, 300);
    }
  };

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

      if (!response.ok) throw new Error('Failed to change room name');

      setRoomName(trimmedNewName);
      setIsEditingName(false);
    } catch (error) {
      console.error('Error changing room name:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to change room name',
      });
    }
  };

  const buttonStyle = {
    fontSize: '16px',
    width: 48,
    height: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const handleShareButtonClick = () => {
    setShareModalVisible(true);
  };

  const handleModalClose = () => {
    setShareModalVisible(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      message.success('Ссылка скопирована в буфер обмена');
    });
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.3, ease: 'easeInOut' } },
  };

  return (
    <TabContext.Provider value={{ activeTab, setActiveTab }}>
    <Layout style={{ minHeight: '100vh' }}>
      {socket && users && (
        <SidebarComponent
          collapsed={collapsed}
          sidebarContent={sidebarContent}
          setCollapsed={setCollapsed}
          setSidebarContent={setSidebarContent}
          users={users}
          handleSidebarContentChange={handleSidebarContentChange}
          socket={socket}
          roomId={roomId}
        />
      )}
      <Layout style={{ marginLeft: collapsed ? 80 : 300, transition: 'margin-left 0.3s' }}>
        <HeaderComponent
          roomName={roomName}
          user={user}
          isEditingName={isEditingName}
          newRoomName={newRoomName}
          setNewRoomName={setNewRoomName}
          handleNameChange={handleNameChange}
          setIsEditingName={setIsEditingName}
          buttonStyle={buttonStyle}
          colorBgContainer={colorBgContainer}
          onShareButtonClick={handleShareButtonClick}
        />
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={pageVariants}
            style={{ height: '100%', overflowY: 'hidden' }}
          >
            {activeTab === 'main' && (
              <div className="room-stepper">
                {socket && (
                  <RoomStepper
                    roomId={roomId}
                    socket={socket}
                    stepperState={stepperState}
                    setStepperState={setStepperState}
                  />
                )}
              </div>
            )}

            <Content
              style={{
                margin: '24px 16px',
                padding: '24px',
                background: activeTab === 'notes' ? 'none' : colorBgContainer,
                borderRadius: borderRadiusLG,
                overflow: 'initial',
                flex: 1,
                minHeight: '76vh',
              }}
            >
              {activeTab === 'main' && socket && user && cards && (
                <ColumnManager
                  socket={socket}
                  columns={columns}
                  cards={cards}
                  roomId={roomId}
                  addCard={addCard}
                  userId={user.userId}
                />
              )}

              {activeTab === 'notes' && (
                <DndProvider backend={HTML5Backend}>
                  {socket && users && (
                    <NotesPage
                      users={users}
                      socket={socket}
                      roomId={roomId}
                      cards={cards}
                    />
                  )}
                </DndProvider>
              )}

            
            </Content>
          </motion.div>
        </AnimatePresence>
        {socket && <TimerWidget socket={socket} roomId={roomId} />}
        <Footer style={{ textAlign: 'center' }}>
        InsightLoop.ru ©{new Date().getFullYear()} 
        </Footer>
      </Layout>
      <LoginModal
        open={loginModalOpen}
        onLogin={handleLogin}
        onClose={() => setLoginModalOpen(false)}  // Это позволит закрывать модальное окно
      />
      <Modal
        title={<Title level={4} style={{ marginBottom: 0 }}><TeamOutlined /> Поделитесь с командой</Title>}
        open={shareModalVisible}
        onCancel={handleModalClose}
        centered // Устанавливаем модальное окно по центру
        width={600} // Устанавливаем ширину модального окна
        footer={[
          <Button key="close" onClick={handleModalClose}>
            Закрыть
          </Button>,
        ]}
      >
        <Paragraph>Пригласите участников в вашу комнату для совместной работы.</Paragraph>
        <Paragraph>Вы можете использовать эту ссылку, чтобы пригласить членов вашей команды:</Paragraph>
        <Input.Group compact>
          <Input
            style={{ width: 'calc(100% - 32px)' }}
            value={`${window.location.origin}${window.location.pathname}`} // Формируем URL без гет-параметров
            readOnly
          />
          <Tooltip title="Копировать">
            <Button icon={<CopyOutlined />} onClick={handleCopyLink} />
          </Tooltip>
        </Input.Group>
        <Paragraph style={{ marginTop: '16px' }}>
          <Text strong>Шаги для приглашения:</Text>
          <ol>
            <li>Скопируйте ссылку выше, нажав на кнопку &quot;Копировать&quot;.</li>
            <li>Отправьте ссылку вашим коллегам через мессенджер, почту или любое другое средство связи.</li>
            <li>Ваши коллеги смогут перейти по ссылке и присоединиться к комнате для совместной работы.</li>
          </ol>
        </Paragraph>
        <Paragraph>
          <Text>Помните, что только приглашенные участники смогут получить доступ к этой комнате.</Text>
        </Paragraph>
      </Modal>
    </Layout>
  </TabContext.Provider>
  );
};

export default RoomPage;