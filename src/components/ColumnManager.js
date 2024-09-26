import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Typography,
  Space,
  Card,
  Avatar,
  Skeleton,
  Tooltip,
  Button,
} from 'antd';
import {
  InfoCircleOutlined,
  LikeOutlined,
  DownloadOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import PropTypes from 'prop-types';
import CardList from './CardList';
import AddCardForm from './AddCardForm';
import PhaseHandler from './PhaseHandler';
import { LayoutGroup, AnimatePresence, motion } from 'framer-motion';
import useUser from '../hooks/useUser';
import './ColumnManager.css';

// Импортируем компоненты для диаграммы Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const ColumnManager = ({ socket, roomId, columns, userId, cards, addCard }) => {
  const [currentPhaseId, setCurrentPhaseId] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [localCards, setLocalCards] = useState(cards);
  const [topCardsById, setTopCardsById] = useState({});

  // Компонент для отображения информации об авторе
  const AuthorInfo = ({ authorId }) => {
    const { user, loading } = useUser(authorId);

    if (loading) {
      return <Skeleton.Avatar active size={36} />;
    }

    return (
      <Tooltip title={user?.username || 'Неизвестный автор'}>
        <Avatar
          src={user?.avatar}
          style={{
            backgroundColor: '#1890ff',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          size={36}
        >
          {user?.username ? user.username.charAt(0) : 'A'}
        </Avatar>
      </Tooltip>
    );
  };

  AuthorInfo.propTypes = {
    authorId: PropTypes.string.isRequired,
  };

  // Обновляем локальные карточки при изменении cards
  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  // Используем useMemo для вычисления отсортированных карточек
  const sortedCards = useMemo(() => {
    if (currentPhaseId === 'Discussion' || currentPhaseId === 'Finish') {
      return [...localCards].sort((a, b) => (b.votes || 0) - (a.votes || 0));
    }
    return localCards;
  }, [localCards, currentPhaseId]);

  // Обновляем ранги топ-3 карточек при изменении sortedCards
  useEffect(() => {
    if (currentPhaseId === 'Discussion' || currentPhaseId === 'Finish') {
      // Присваиваем ранги топ-3 карточкам
      const newTopCardsById = {};
      for (let i = 0; i < sortedCards.length && i < 3; i++) {
        const card = sortedCards[i];
        const rank = i + 1;
        newTopCardsById[card._id] = rank;
      }
      setTopCardsById(newTopCardsById);
    } else {
      setTopCardsById({});
    }
  }, [currentPhaseId, sortedCards]);

  // Обновляем голоса при получении события через сокет
  useEffect(() => {
    const handleUpdateVotes = ({ cardId, votes }) => {
      setLocalCards((prevCards) =>
        prevCards.map((card) =>
          card._id === cardId ? { ...card, votes } : card
        )
      );
    };

    if (socket) {
      socket.on('updateVotes', handleUpdateVotes);
    }

    return () => {
      if (socket) {
        socket.off('updateVotes', handleUpdateVotes);
      }
    };
  }, [socket]);

  const handleDeleteCard = () => {
    if (socket && cardToDelete) {
      socket.emit('deleteCard', { roomId, cardId: cardToDelete });
      setCardToDelete(null);
    }
  };
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  // Функция для обработки экспорта
  const handleExport = () => {
    // Здесь вы можете реализовать логику экспорта данных
    console.log('Экспорт данных');
  };

  // Функция для обработки шаринга
  const handleShare = () => {
    // Здесь вы можете реализовать логику шаринга результатов
    console.log('Поделиться результатами');
  };

  // Функция для обработки клика на карточку
  const handleCardClick = (item) => {
    // Здесь вы можете открыть модальное окно с детальной информацией о карточке
    console.log('Карточка нажата:', item);
  };

  // Данные для диаграммы
  const pieData = useMemo(() => {
    return columns.map((column) => {
      const totalVotes = localCards
        .filter((card) => card.columnId === column._id)
        .reduce((sum, card) => sum + (card.votes || 0), 0);
      return { name: column.name, value: totalVotes };
    });
  }, [columns, localCards]);

  return (
    <div className="column-manager">
      <PhaseHandler
        socket={socket}
        roomId={roomId}
        setCurrentPhaseId={setCurrentPhaseId}
      />

      <AnimatePresence mode="wait">
        {currentPhaseId === 'Preparation' && (
          <motion.div
            key="preparation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="waiting-message-container">
              <Space direction="vertical" size="large" align="center">
                <InfoCircleOutlined
                  style={{ fontSize: '64px', color: '#1890ff' }}
                />
                <Typography.Title level={3} style={{ margin: 0 }}>
                  Ожидаем подключение всех участников
                </Typography.Title>
                <Typography.Text
                  style={{ fontSize: '16px', color: '#595959' }}
                >
                  Как будете готовы, переключайтесь на следующий этап.
                </Typography.Text>
              </Space>
            </div>
          </motion.div>
        )}

{currentPhaseId === 'Finish' && (
  <motion.div
    key="finish"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className="finish-phase-container">
      <div className="finish-phase-content">
        {/* Заголовок с иллюстрацией */}
        <div className="finish-header">
      
          <Typography.Title level={2} className="finish-title">
            Поздравляем! Ретроспектива успешно завершена
          </Typography.Title>
          <Typography.Text className="finish-subtitle">
            Ознакомьтесь с результатами вашей совместной работы
          </Typography.Text>
        </div>

        {/* Кнопки действий */}
        <div className="finish-actions">
          <Button
            type="primary"
            onClick={handleExport}
            icon={<DownloadOutlined />}
          >
            Экспортировать результаты
          </Button>
          <Button
            type="default"
            onClick={handleShare}
            icon={<ShareAltOutlined />}
            style={{ marginLeft: '16px' }}
          >
            Поделиться результатами
          </Button>
        </div>

        {/* Карточки и график */}
        <div className="results-container">
          {/* Карточки */}
          <div className="cards-container">
            {sortedCards.slice(0, 5).map((item) => (
              <Card
                key={item._id}
                className="result-card"
                hoverable
                onClick={() => handleCardClick(item)}
                title={item.columnName}
                headStyle={{ backgroundColor: '#f0f0f0' }}
              >
                <div className="card-content">
                  <div className="card-header">
                    {/* Аватар автора */}
                    <AuthorInfo authorId={item.author} />
                    {/* Текст карточки */}
                    <div className="card-text-content">
                      <Typography.Text className="card-text">
                        {item.content}
                      </Typography.Text>
                    </div>
                    <div className="card-votes">
                      <LikeOutlined
                        style={{ marginRight: '4px', color: '#ff5722' }}
                      />
                      <Typography.Text>{item.votes || 0}</Typography.Text>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Диаграмма */}
          <div className="chart-container">
            <Typography.Title level={4} style={{ textAlign: 'center' }}>
              Распределение голосов по категориям
            </Typography.Title>
            <div style={{ width: '100%', height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </motion.div>
)}

        {currentPhaseId &&
          currentPhaseId !== 'Preparation' &&
          currentPhaseId !== 'Finish' && (
            <motion.div
              key="other-phases"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <LayoutGroup>
                {/* Используем flex-контейнер для колонок */}
                <div className="columns-container">
                  {columns.map((column) => {
                    // На этапе 'Discussion' сортируем карточки внутри колонки по количеству голосов
                    const columnCards = sortedCards.filter(
                      (card) => card.columnId === column._id
                    );

                    // Если не на этапе 'Discussion', используем исходную последовательность
                    const cardsToShow =
                      currentPhaseId === 'Discussion' || currentPhaseId === 'Finish'
                        ? columnCards.sort((a, b) => (b.votes || 0) - (a.votes || 0))
                        : columnCards;

                    return (
                      <div key={column._id} className="custom-column">
                        <Card
                          title={column.name}
                          bordered
                          className="column-card"
                        >
                          {currentPhaseId === 'Create Cards' && (
                            <AddCardForm
                              columnId={column._id}
                              addCard={addCard}
                            />
                          )}

                          <CardList
                            cards={cardsToShow}
                            currentPhaseId={currentPhaseId}
                            userId={userId}
                            socket={socket}
                            roomId={roomId}
                            setCardToDelete={setCardToDelete}
                            topCardsById={topCardsById}
                          />
                        </Card>
                      </div>
                    );
                  })}
                </div>
              </LayoutGroup>
            </motion.div>
          )}
      </AnimatePresence>

      <Modal
        title="Подтверждение удаления"
        visible={!!cardToDelete}
        onOk={handleDeleteCard}
        onCancel={() => setCardToDelete(null)}
        cancelText="Отмена"
      >
        <p>Вы уверены, что хотите удалить эту карточку?</p>
      </Modal>
    </div>
  );
};

ColumnManager.propTypes = {
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
  userId: PropTypes.string.isRequired,
  cards: PropTypes.arrayOf(PropTypes.object).isRequired,
  addCard: PropTypes.func.isRequired,
};

export default ColumnManager;