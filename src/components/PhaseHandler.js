import { useEffect } from 'react';
import PropTypes from 'prop-types';

const PhaseHandler = ({ socket, roomId, setCurrentPhaseId }) => {
  useEffect(() => {
    if (!socket) return;

    

    // Запрашиваем текущую фазу при подключении
    socket.emit('getCurrentPhase', { roomId });

    // Обработчик получения текущей фазы
    socket.on('currentPhase', ({ currentPhaseId }) => {
      setCurrentPhaseId(currentPhaseId);
    });

    // Обработчик изменения фазы
    socket.on('phaseChanged', ({ phaseId }) => {
      setCurrentPhaseId(phaseId);
    });

    // Очистка обработчиков при размонтировании компонента
    return () => {
      socket.off('currentPhase');
      socket.off('phaseChanged');
    };
  }, [socket, roomId, setCurrentPhaseId]);

  return null; // Компонент не отображает ничего
};

PhaseHandler.propTypes = {
  socket: PropTypes.object.isRequired,
  roomId: PropTypes.string.isRequired,
  setCurrentPhaseId: PropTypes.func.isRequired,
};

export default PhaseHandler;
