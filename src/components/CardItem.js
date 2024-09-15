import React, { useState, useEffect, useRef } from 'react';

import PropTypes from 'prop-types';

import {
  Card,
  Button,
  Tooltip,
  Badge,
  Typography,
  Space,
  notification,
  Popover,
} from 'antd';

import { DeleteOutlined, LikeOutlined, EllipsisOutlined } from '@ant-design/icons';

import AvatarOrAnonymous from './AvatarOrAnonymous';

import './CardItem.css';

import { LayoutGroup } from 'framer-motion';

const { Paragraph } = Typography;

const CardItem = ({
  card,
  currentPhaseId,
  userId,
  socket,
  roomId,
  setCardToDelete,
}) => {
  const [cardData, setCardData] = useState(card);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [isVoteCooldown, setIsVoteCooldown] = useState(false);
  const [displayedText, setDisplayedText] = useState(cardData.content); // Отображаемый текст

  // Состояния для размера шрифта и переполнения текста
  const [fontSize, setFontSize] = useState(16); // Начальный размер шрифта
  const textContainerRef = useRef(null);
  const textContentRef = useRef(null);
  const MIN_FONT_SIZE = 10; // Минимальный размер шрифта

  const [isTextOverflowing, setIsTextOverflowing] = useState(false); // Флаг переполнения текста

  // Устанавливаем hasVoted на основе актуальных данных
  useEffect(() => {
    setHasVoted(cardData.voters.includes(userId));
  }, [cardData.voters, userId]);

  // Подписка на событие обновления голосов
  useEffect(() => {
    if (socket) {
      const handleUpdateVotes = ({ cardId, votes, voters }) => {
        if (cardId === cardData._id) {
          setCardData((prevCardData) => ({
            ...prevCardData,
            votes: votes,
            voters: voters,
          }));
          setHasVoted(voters.includes(userId));
        }
      };

      socket.on('updateVotes', handleUpdateVotes);

      return () => {
        socket.off('updateVotes', handleUpdateVotes);
      };
    }
  }, [socket, cardData._id, userId]);

  const isCooldown = isVoteCooldown || isVoting;

  const handleVote = () => {
    if (socket && cardData._id && !isVoting && !isVoteCooldown) {
      setIsVoting(true);

      if (hasVoted) {
        // Снимаем голос
        socket.emit(
          'removeVote',
          { roomId, cardId: cardData._id, userId },
          (response) => {
            setIsVoting(false);

            if (response.error) {
              notification.error({
                message: 'Ошибка',
                description: response.error,
              });
            } else {
              notification.success({
                message: 'Голос снят',
                description: 'Вы успешно сняли свой голос.',
              });

              setHasVoted(false);

              setIsVoteCooldown(true);
              setTimeout(() => {
                setIsVoteCooldown(false);
              }, 2000);
            }
          }
        );
      } else {
        // Добавляем голос
        socket.emit(
          'voteCard',
          { roomId, cardId: cardData._id, userId },
          (response) => {
            setIsVoting(false);

            if (response.error) {
              notification.error({
                message: 'Ошибка',
                description: response.error,
              });
            } else {
              notification.success({
                message: 'Голос учтён',
                description: 'Вы успешно проголосовали.',
              });

              setHasVoted(true);

              setIsVoteCooldown(true);
              setTimeout(() => {
                setIsVoteCooldown(false);
              }, 2000);
            }
          }
        );
      }
    }
  };

  const confirmDeleteCard = () => {
    setCardToDelete(cardData._id);
  };

  const emojiRegex =
    /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}])/gu;

  // Контент для поповера
  const popoverContent = (
    <div style={{ maxWidth: '300px', wordWrap: 'break-word' }}>
      <Paragraph
        style={{
          fontSize: '16px',
          lineHeight: '1.5',
          color: '#000',
          whiteSpace: 'pre-wrap',
          overflowWrap: 'break-word',
          marginBottom: 0,
        }}
      >
        <span
          dangerouslySetInnerHTML={{
            __html: cardData.content.replace(
              emojiRegex,
              "<span style='font-size: 1.5em;'>$1</span>"
            ),
          }}
        />
      </Paragraph>
    </div>
  );

  // Блок действий
  const actions = (
    <Space>
      {isTextOverflowing && (
        <Tooltip title="Показать полностью">
          <Popover content={popoverContent} trigger="click">
            <Button
              type="text"
              size="small"
              icon={<EllipsisOutlined />}
              style={{ fontSize: '16px' }}
            />
          </Popover>
        </Tooltip>
      )}

      {currentPhaseId === 'Vote' && (
        <Tooltip title={hasVoted ? 'Снять голос' : 'Голосовать'}>
          <Button
            type="text"
            onClick={handleVote}
            className={`${hasVoted ? 'icon-button icon-button-voted' : 'icon-button'} ${
              isCooldown ? 'cooldown' : ''
            }`}
          >
            <LikeOutlined />
          </Button>
        </Tooltip>
      )}
      {(currentPhaseId === 'Discussion' || currentPhaseId === 'Finish') && (
        <Tooltip title="Голоса">
          <Button type="text" className="icon-button icon-button-votes" disabled>
            <Badge
              count={cardData.votes || 0}
              showZero
              style={{ backgroundColor: '#1890ff' }}
              offset={[0, 0]}
            >
              <LikeOutlined />
            </Badge>
          </Button>
        </Tooltip>
      )}
      <Tooltip title="Удалить">
        <Button type="text" onClick={confirmDeleteCard} className="icon-button">
          <DeleteOutlined />
        </Button>
      </Tooltip>
    </Space>
  );

  useEffect(() => {
    const adjustText = () => {
      const container = textContainerRef.current;
      const contentElement = textContentRef.current;

      if (container && contentElement) {
        let currentFontSize = 16;
        let textToDisplay = cardData.content;
        contentElement.style.fontSize = `${currentFontSize}px`;
        contentElement.textContent = textToDisplay;

        // Сброс отображаемого текста
        setDisplayedText(cardData.content);

        const originalVisibility = contentElement.style.visibility;
        contentElement.style.visibility = 'hidden';

        const availableHeight = container.clientHeight;

        // Уменьшаем размер шрифта до минимального, пока текст не поместится по высоте
        while (
          contentElement.scrollHeight > availableHeight &&
          currentFontSize > MIN_FONT_SIZE
        ) {
          currentFontSize -= 1;
          contentElement.style.fontSize = `${currentFontSize}px`;
        }

        setFontSize(currentFontSize);

        // Если текст всё ещё переполняет контейнер при минимальном размере шрифта
        if (currentFontSize === MIN_FONT_SIZE && contentElement.scrollHeight > availableHeight) {
          while (contentElement.scrollHeight > availableHeight && textToDisplay.length > 0) {
            textToDisplay = textToDisplay.slice(0, -1); // Убираем по одному символу с конца
            contentElement.textContent = textToDisplay + '...'; // Применяем текст с многоточием
          }
          setDisplayedText(textToDisplay + '...');
          setIsTextOverflowing(true);
        } else {
          setDisplayedText(cardData.content);
          setIsTextOverflowing(false);
        }

        contentElement.style.visibility = originalVisibility;
      }
    };

    adjustText();
  }, [cardData.content]);

  return (
    <LayoutGroup>
      <Card
        style={{
          height: '200px', // Высота карточки
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          borderRadius: '8px',
          border: '1px solid #f0f0f0',
          overflow: 'hidden',
        }}
        headStyle={{ borderBottom: 'none', padding: '15px' }}
        bodyStyle={{
          padding: '15px',
          flex: '1 1 auto',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Заголовок карточки с аватаркой */}
        <Card.Meta
          avatar={
            <AvatarOrAnonymous
              authorName={cardData.authorName}
              currentPhaseId={currentPhaseId}
              size={48}
            />
          }
          title={
            ['Discussion', 'Finish'].includes(currentPhaseId)
              ? cardData.authorName
              : 'Аноним'
          }
          style={{ marginBottom: '10px' }}
        />

        {/* Контейнер для текста и действий */}
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden', // Ограничиваем переполнение
          }}
        >
          {/* Текстовый контейнер с фиксированной высотой */}
          <div
            ref={textContainerRef}
            style={{
              flex: '1 1 auto',
              maxHeight: '100px', // Фиксированная максимальная высота текста
              overflow: 'hidden', // Скрываем переполнение
            }}
          >
            <div
              ref={textContentRef}
              style={{
                fontSize: `${fontSize}px`,
                lineHeight: '1.5',
                color: '#000',
                marginBottom: 0,
                whiteSpace: 'pre-wrap',
                overflowWrap: 'break-word',
              }}
              dangerouslySetInnerHTML={{
                __html: displayedText.replace(
                  emojiRegex,
                  "<span style='font-size: 1.5em;'>$1</span>"
                ),
              }}
            />
          </div>


          {/* Блок действий */}
          <div
            style={{
              marginTop: 'auto', // Прижимаем блок действий к низу
            
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexShrink: 0,
            }}
          
          >
            {actions}
          </div>
          
        </div>
      </Card>
    </LayoutGroup>
  );
};

CardItem.propTypes = {
  card: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    authorName: PropTypes.string.isRequired,
    votes: PropTypes.number,
    voters: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  currentPhaseId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  setCardToDelete: PropTypes.func.isRequired,
  rank: PropTypes.number,
};

CardItem.defaultProps = {
  rank: null,
};

export default React.memo(CardItem);