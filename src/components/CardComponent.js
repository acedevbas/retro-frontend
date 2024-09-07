import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { TextField, Button } from '@mui/material';

function Auth({ setIsAuthenticated, setUser }) {
  const [username, setUsername] = useState('');

  const handleLogin = async () => {
    const apiUrl = process.env.REACT_APP_API_URL;
    if (!apiUrl) {
      console.error("API URL is not defined. Please check your .env file.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();
      console.log(data);

      if (data.userId) {
        setUser(data);
        setIsAuthenticated(true);
      } else {
        console.error("Authentication failed");
      }
    } catch (error) {
      console.error("Error during authentication:", error);
    }
  };

  return (
    <div>
      <TextField
        label="Username"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleLogin}
        sx={{ mt: 2 }}
      >
        Sign In
      </Button>
    </div>
  );
}

Auth.propTypes = {
  setIsAuthenticated: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default Auth;
