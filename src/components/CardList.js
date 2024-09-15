import React from 'react';
import PropTypes from 'prop-types';
import { AnimatePresence, motion, LayoutGroup } from 'framer-motion';
import CardItem from './CardItem';
import './CardList.css';

const CardList = ({
  cards,
  currentPhaseId,
  userId,
  socket,
  roomId,
  setCardToDelete,

}) => {
  return (
    <LayoutGroup>
      <motion.div
        layout
        className="card-list"
        transition={{
          layout: {
            type: 'spring',
            damping: 20,
            stiffness: 300,
          },
        }}
      >
        <AnimatePresence>
          {cards.map((card) => (
            <motion.div
              key={card._id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                layout: {
                  type: 'spring',
                  damping: 20,
                  stiffness: 300,
                },
              }}
            >
              <CardItem
                card={card}
                currentPhaseId={currentPhaseId}
                userId={userId}
                socket={socket}
                roomId={roomId}
                setCardToDelete={setCardToDelete}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </LayoutGroup>
    );
};

CardList.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      votes: PropTypes.number,
      voters: PropTypes.arrayOf(PropTypes.string).isRequired,
      columnId: PropTypes.string.isRequired,
    })
  ).isRequired,
  userId: PropTypes.string.isRequired,
  currentPhaseId: PropTypes.string.isRequired,
  roomId: PropTypes.string.isRequired,
  setCardToDelete: PropTypes.func.isRequired,
  socket: PropTypes.object.isRequired,
 
};

export default CardList;