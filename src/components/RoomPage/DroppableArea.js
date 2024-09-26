import React from 'react';
import PropTypes from 'prop-types';
import { useDrop } from 'react-dnd';
import { Button, Empty, Typography } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import MemoizedDraggableCard from './DraggableCard';

const { Text } = Typography;

const DroppableArea = ({ cards, onCardDrop, onRemoveCard }) => {
    const [{ isOver }, drop] = useDrop({
        accept: 'CARD',
        drop: (item) => {
            if (item && item.uuid) {
                onCardDrop(item);
            } else {
                console.error('Dropped item does not have a valid uuid:', item);
            }
        },
        collect: (monitor) => ({
            isOver: !!monitor.isOver(),
        }),
    });

    return (
        <div ref={drop} style={{
            padding: '16px',
            border: isOver ? '2px solid #1890ff' : '2px dashed #d9d9d9',
            backgroundColor: isOver ? '#e6f7ff' : 'white',
            minHeight: '140px', // Установим минимальную высоту чуть больше одной карточки
            maxHeight: '400px',
            overflowY: 'auto',
            borderRadius: '8px',
            transition: 'border 0.3s ease-in-out',
        }}>
            {cards && cards.length > 0 ? (
                cards.map((card) => (
                    card && card.uuid ? (
                        <div key={card.uuid} style={{ marginBottom: '8px', position: 'relative' }}>
                            <MemoizedDraggableCard card={card} />
                            <Button 
                                type="link" 
                                icon={<DeleteOutlined />} 
                                onClick={() => onRemoveCard(card.uuid)} 
                                style={{ position: 'absolute', top: '8px', right: '8px' }} 
                            />
                        </div>
                    ) : null
                ))
            ) : (
                <Empty 
                    description={<Text type="secondary">Перетащите карточки сюда</Text>}
                    imageStyle={{ height: 60 }} // Уменьшаем высоту изображения
                />
            )}
        </div>
    );
};

DroppableArea.propTypes = {
    cards: PropTypes.arrayOf(
        PropTypes.shape({
            uuid: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
        })
    ),
    onCardDrop: PropTypes.func.isRequired,
    onRemoveCard: PropTypes.func.isRequired,
};

export default DroppableArea;