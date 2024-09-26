// useCurrentUser.js
import { useState, useEffect } from 'react';
import { notification } from 'antd';

const API_URL = process.env.REACT_APP_API_URL;

const useCurrentUser = (roomId, setLoginModalOpen) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      checkUserInRoom(storedUser);
    } else {
      setLoginModalOpen(true);
    }
  }, []);

  const checkUserInRoom = async (storedUser) => {
    try {
      const response = await fetch(`${API_URL}/check-user-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: storedUser.userId }),
      });

      if (!response.ok) throw new Error('Не удалось проверить комнату пользователя');

      const data = await response.json();

      if (data.inRoom && data.roomId !== roomId) {
        setLoginModalOpen(true);
      } else {
        setUser(storedUser);
      }
    } catch (error) {
      console.error('Ошибка при проверке комнаты пользователя:', error);
      setLoginModalOpen(true);
    }
  };

  const handleLogin = async (username) => {
    try {
      const response = await fetch(`${API_URL}/auth/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, room: roomId }),
      });

      const userData = await response.json();

      if (!response.ok) {
        throw new Error(userData.error || 'Не удалось войти в систему');
      }

      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setLoginModalOpen(false);
      notification.success({
        message: 'Успех',
        description: userData.message || 'Вы успешно вошли в систему',
      });
    } catch (error) {
      console.error('Ошибка входа:', error);
      notification.error({
        message: 'Ошибка',
        description: error.message || 'Не удалось войти в систему',
      });
    }
  };

  return {
    user,
    handleLogin,
  };
};

export default useCurrentUser;