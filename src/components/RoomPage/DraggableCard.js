import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { Card, Avatar, Typography, Badge, Tooltip } from 'antd';
import { LikeOutlined } from '@ant-design/icons';
import styled from 'styled-components';

const { Text, Paragraph } = Typography;

const ItemTypes = {
    CARD: 'CARD',
};

const StyledCard = styled(Card)`
    .ant-card-body {
        padding: 0;
    }
`;

const DraggableCard = ({ card }) => {
    if (!card.uuid) {
        console.warn('Card uuid is missing:', card);
    }

    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.CARD,
        item: card,  // Pass the whole card object
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    return (
        <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1, cursor: 'move' }}>
            <StyledCard hoverable style={{ position: 'relative' }}>
                <div className="card-header" style={{ backgroundColor: '#f5f5f5', padding: '8px 16px' }}>
                    <Text strong>{card.columnName}</Text>
                </div>
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', padding: '16px' }}>
                    <Tooltip title={card.authorName}>
                        <Avatar style={{ backgroundColor: 'rgba(75, 196, 99, 0.75)', marginRight: '16px' }}>
                            {card.authorName.charAt(0).toUpperCase()}
                        </Avatar>
                    </Tooltip>
                    <div style={{ flexGrow: 1 }}>
                        <Paragraph style={{ margin: 0 }}>{card.content}</Paragraph>
                    </div>
                    <Badge count={card.votes} showZero>
                        <LikeOutlined style={{ fontSize: '16px', color: '#1890ff' }} />
                    </Badge>
                </div>
            </StyledCard>
        </div>
    );
};

DraggableCard.propTypes = {
    card: PropTypes.shape({
        _id: PropTypes.string.isRequired,
        content: PropTypes.string.isRequired,
        columnName: PropTypes.string.isRequired,
        authorName: PropTypes.string.isRequired,
        votes: PropTypes.number.isRequired,
        uuid: PropTypes.string.isRequired,
    }).isRequired,
};

const MemoizedDraggableCard = memo(DraggableCard);
MemoizedDraggableCard.displayName = "DraggableCard";

export default MemoizedDraggableCard;