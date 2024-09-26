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
  Skeleton,
} from 'antd';
import {
  DeleteOutlined,
  LikeOutlined,
  EllipsisOutlined,
} from '@ant-design/icons';
import AvatarOrAnonymous from './AvatarOrAnonymous';
import useUser from '../hooks/useUser';
import './CardItem.css';
import { LayoutGroup } from 'framer-motion';

const { Paragraph } = Typography;
const MIN_FONT_SIZE = 10;
const EMOJI_REGEX = /([\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{1FB00}-\u{1FBFF}])/gu;

const TextContainer = ({ fontSize, displayedText, textContainerRef, textContentRef }) => (
  <div
    ref={textContainerRef}
    style={{
      flex: '1 1 auto',
      maxHeight: '100px',
      overflow: 'hidden',
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
          EMOJI_REGEX,
          "<span style='font-size: 1.5em;'>$1</span>"
        ),
      }}
    />
  </div>
);

TextContainer.propTypes = {
  content: PropTypes.string.isRequired,
  fontSize: PropTypes.number.isRequired,
  displayedText: PropTypes.string.isRequired,
  textContainerRef: PropTypes.object.isRequired,
  textContentRef: PropTypes.object.isRequired,
};

const Actions = ({ isTextOverflowing, popoverContent, currentPhaseId, hasVoted, isCooldown, handleVote, confirmDeleteCard, cardData }) => (
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

Actions.propTypes = {
  isTextOverflowing: PropTypes.bool.isRequired,
  popoverContent: PropTypes.node.isRequired,
  currentPhaseId: PropTypes.string.isRequired,
  hasVoted: PropTypes.bool.isRequired,
  isCooldown: PropTypes.bool.isRequired,
  handleVote: PropTypes.func.isRequired,
  confirmDeleteCard: PropTypes.func.isRequired,
  cardData: PropTypes.shape({
    votes: PropTypes.number,
    _id: PropTypes.string.isRequired,
  }).isRequired,
};

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
  const [displayedText, setDisplayedText] = useState(cardData.content);
  const [fontSize, setFontSize] = useState(16);
  const textContainerRef = useRef(null);
  const textContentRef = useRef(null);
  const [isTextOverflowing, setIsTextOverflowing] = useState(false);

  const { user, loading } = useUser(cardData.author);

  useEffect(() => {
    setHasVoted(cardData.voters.includes(userId));
  }, [cardData.voters, userId]);

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

      const handleVoteResponse = (response, successMessage) => {
        setIsVoting(false);
        if (response.error) {
          notification.error({
            message: 'Ошибка',
            description: response.error,
          });
        } else {
          notification.success({
            message: successMessage,
            description: `Вы успешно ${successMessage}.`,
          });
          setHasVoted(!hasVoted);
          setIsVoteCooldown(true);
          setTimeout(() => {
            setIsVoteCooldown(false);
          }, 2000);
        }
      };

      if (hasVoted) {
        socket.emit(
          'removeVote',
          { roomId, cardId: cardData._id, userId },
          (response) => handleVoteResponse(response, 'сняли голос')
        );
      } else {
        socket.emit(
          'voteCard',
          { roomId, cardId: cardData._id, userId },
          (response) => handleVoteResponse(response, 'проголосовали')
        );
      }
    }
  };

  const confirmDeleteCard = () => {
    setCardToDelete(cardData._id);
  };

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
              EMOJI_REGEX,
              "<span style='font-size: 1.5em;'>$1</span>"
            ),
          }}
        />
      </Paragraph>
    </div>
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

        setDisplayedText(cardData.content);

        const originalVisibility = contentElement.style.visibility;
        contentElement.style.visibility = 'hidden';

        const availableHeight = container.clientHeight;

        while (
          contentElement.scrollHeight > availableHeight &&
          currentFontSize > MIN_FONT_SIZE
        ) {
          currentFontSize -= 1;
          contentElement.style.fontSize = `${currentFontSize}px`;
        }

        setFontSize(currentFontSize);

        if (
          currentFontSize === MIN_FONT_SIZE &&
          contentElement.scrollHeight > availableHeight
        ) {
          while (
            contentElement.scrollHeight > availableHeight &&
            textToDisplay.length > 0
          ) {
            textToDisplay = textToDisplay.slice(0, -1);
            contentElement.textContent = textToDisplay + '...';
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
          height: '200px',
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
        <Card.Meta
          avatar={
            <AvatarOrAnonymous
              author={cardData.author}
              currentPhaseId={currentPhaseId}
              size={48}
            />
          }
          title={
            loading ? (
              <Skeleton.Input active size="small" style={{ width: 100 }} />
            ) : ['Discussion', 'Finish'].includes(currentPhaseId) ? (
              user?.username || 'Неизвестный пользователь'
            ) : (
              'Аноним'
            )
          }
          style={{ marginBottom: '10px' }}
        />
        <div
          style={{
            flex: '1 1 auto',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <TextContainer
            content={cardData.content}
            fontSize={fontSize}
            displayedText={displayedText}
            textContainerRef={textContainerRef}
            textContentRef={textContentRef}
          />
          <div
            style={{
              marginTop: 'auto',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            <Actions
              isTextOverflowing={isTextOverflowing}
              popoverContent={popoverContent}
              currentPhaseId={currentPhaseId}
              hasVoted={hasVoted}
              isCooldown={isCooldown}
              handleVote={handleVote}
              confirmDeleteCard={confirmDeleteCard}
              cardData={cardData}
            />
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
    authorName: PropTypes.string, // Удалено, т.к. теперь используется хук useUser
    votes: PropTypes.number,
    voters: PropTypes.arrayOf(PropTypes.string).isRequired,
  }).isRequired,
  currentPhaseId: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  setCardToDelete: PropTypes.func.isRequired,
};

export default React.memo(CardItem);