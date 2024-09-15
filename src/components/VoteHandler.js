const VoteHandler = ({ socket, roomId, cardId, userId }) => {
    if (socket && cardId) {
      socket.emit('voteCard', { roomId, cardId, userId }, (response) => {
        if (response.error) {
          alert(response.error);
        } else {
          console.log('Голос принят');
        }
      });
    }
  };
  
  export default VoteHandler;
  