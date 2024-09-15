import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Typography, Card, Space } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import PropTypes from 'prop-types';
import CardList from './CardList';
import AddCardForm from './AddCardForm';
import PhaseHandler from './PhaseHandler';
import { LayoutGroup } from 'framer-motion'; // Updated import

const ColumnManager = ({ socket, roomId, columns, userId, cards, addCard }) => {
  const [currentPhaseId, setCurrentPhaseId] = useState(null);
  const [cardToDelete, setCardToDelete] = useState(null);
  const [localCards, setLocalCards] = useState(cards);
  const [topCardsById, setTopCardsById] = useState({});

  // Обновляем локальные карточки при изменении cards
  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  // Обновляем ранги топ-3 карточек при изменении cards или currentPhaseId
  useEffect(() => {
    if (currentPhaseId === 'Discussion' || currentPhaseId === 'Finish') {
      // Сортируем все карточки по количеству голосов
      const sortedCards = [...localCards].sort((a, b) => (b.votes || 0) - (a.votes || 0));

      // Присваиваем ранги топ-3 карточкам
      const newTopCardsById = {};
      for (let i = 0; i < sortedCards.length && i < 3; i++) {
        const card = sortedCards[i];
        const rank = i + 1;
        newTopCardsById[card._id] = rank;
      }
      setTopCardsById(newTopCardsById);

      // Обновляем локальные карточки с сортировкой
      setLocalCards(sortedCards);
    } else {
      setTopCardsById({});
      setLocalCards(cards);
    }
  }, [localCards, currentPhaseId]);

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

  return (
    <div>
      <PhaseHandler socket={socket} roomId={roomId} setCurrentPhaseId={setCurrentPhaseId} />

      {currentPhaseId === 'Preparation' ? (
        <Row justify="center" align="middle" style={{ height: '80vh', textAlign: 'center' }}>
          <div>
            <Space direction="vertical" size="large" align="center">
              <InfoCircleOutlined style={{ fontSize: '64px', color: '#1890ff' }} />
              <Typography.Title level={3} style={{ margin: 0 }}>
                Ожидаем подключение всех участников
              </Typography.Title>
              <Typography.Text style={{ fontSize: '16px', color: '#595959' }}>
                Как будете готовы, переключайтесь на следующий этап.
              </Typography.Text>
            </Space>
          </div>
        </Row>
      ) : (
        currentPhaseId && (
          <LayoutGroup>
            <Row gutter={[16, 16]} wrap={false} align="top">
              {columns.map((column) => {
                // Получаем карточки для текущей колонки из локального состояния
                const columnCards = localCards.filter((card) => card.columnId === column._id);

                return (
                  <Col xs={24} sm={12} md={8} key={column._id}>
                    <Card
                      title={
                        <Typography.Title level={4} style={{ margin: 0 }}>
                          {column.name}
                        </Typography.Title>
                      }
                      bordered
                      style={{
                        backgroundColor: '#f9f9f9',
                        position: 'relative',
                      }}
                    >
                      {currentPhaseId === 'Create Cards' && (
                        <AddCardForm columnId={column._id} addCard={addCard} />
                      )}
                      <CardList
                        cards={columnCards}
                        currentPhaseId={currentPhaseId}
                        userId={userId}
                        socket={socket}
                        roomId={roomId}
                        setCardToDelete={setCardToDelete}
                        topCardsById={topCardsById}
                      />
                    </Card>
                  </Col>
                );
              })}
            </Row>
            </LayoutGroup>
        )
      )}
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