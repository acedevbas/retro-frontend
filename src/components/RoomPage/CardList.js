import React from 'react';
import PropTypes from 'prop-types';
import MemoizedDraggableCard from './DraggableCard';

const CardList = ({ allCards, notes }) => {
    // Функция для фильтрации карточек, уже привязанных к заметкам
    const getAvailableCards = () => {
        const attachedCardUuids = notes.flatMap(note => note.cards.map(card => card.uuid));
        return allCards.filter(card => !attachedCardUuids.includes(card.uuid));
    };

    const availableCards = getAvailableCards();
    const noCards = availableCards.length === 0;

    return (
        <div style={{ ...styles.cardListContainer, ...(noCards && styles.noCardsContainer) }}>
            {noCards ? (
                <p style={styles.noCardsText}>Нет доступных карточек</p>
            ) : (
                availableCards.map((card) => (
                    <div key={card.uuid} style={styles.cardContainer}>
                        <MemoizedDraggableCard card={card} />
                    </div>
                ))
            )}
        </div>
    );
};

const styles = {
    cardListContainer: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        borderRadius: '10px',
        padding: '16px',
    },
    cardContainer: {
        marginBottom: '20px', // Отступ снизу между карточками
    },
    noCardsContainer: {
        backgroundColor: '#fafafa',
    },
    noCardsText: {
        color: '#999',
        fontSize: '16px',
        fontStyle: 'italic',
        textAlign: 'center',
        margin: 'auto',
        width: '100%',
    },
};

CardList.propTypes = {
    allCards: PropTypes.arrayOf(
        PropTypes.shape({
            uuid: PropTypes.string.isRequired,
            content: PropTypes.string.isRequired,
            columnName: PropTypes.string.isRequired,
            authorName: PropTypes.string.isRequired,
            votes: PropTypes.number.isRequired,
        })
    ).isRequired,
    notes: PropTypes.arrayOf(
        PropTypes.shape({
            uuid: PropTypes.string.isRequired,
            cards: PropTypes.arrayOf(
                PropTypes.shape({
                    uuid: PropTypes.string.isRequired,
                })
            ).isRequired,
        })
    ).isRequired,
};

export default CardList;