import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';


function CreateRoomButton() {
  const navigate = useNavigate();

  const apiUrl = process.env.REACT_APP_API_URL;

  const createRoom = async () => {
    try {
      const response = await fetch(`${apiUrl}/rooms`, { method: 'POST' });
      if (!response.ok) {
        throw new Error('Failed to create room');
      }
      const { roomId } = await response.json();
      navigate(`/room/${roomId}`);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <Button variant="contained" color="primary" onClick={createRoom}>
      Create Room
    </Button>
  );
}

// Если вы хотите добавить `user` в будущем:
// CreateRoomButton.propTypes = {
//   user: PropTypes.object, // Или более четкое определение типа
// };

export default CreateRoomButton;
