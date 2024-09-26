// hooks/useUser.js
import { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL;

const fetchUserData = async (uuid) => {
 
  const response = await fetch(`${API_URL}/users/${uuid}`);
  
  if (!response.ok) {
   
    throw new Error('User not found');
  }

  const data = await response.json();
 
  return data;
};

const useUser = (uuid) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;  // Флаг, чтобы избежать обновления состояния в размонтированном компоненте

    const getUserData = async () => {
      if (uuid) {
        try {
        
          const data = await fetchUserData(uuid);
          if (isMounted) {  // Обновляем состояние только если компонент все еще смонтирован
            setUser(data);
            setLoading(false);
          }
        } catch (err) {
          if (isMounted) {
          
            setError(err.message);
            setLoading(false);
          }
        }
      } else {
     
        setLoading(false);
      }
    };

    getUserData();

    return () => {
      isMounted = false;  // Устанавливаем флаг в false при размонтировании
    };
  }, [uuid]);


  return { user, loading, error };
};

export default useUser;