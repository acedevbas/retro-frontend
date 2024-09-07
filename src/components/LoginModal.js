import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogContent, DialogTitle, TextField, Button } from '@mui/material';

const LoginModal = ({ open, username, setUsername, handleLogin }) => {
  return (
    <Dialog open={open}>
      <DialogTitle>Enter your username</DialogTitle>
      <DialogContent>
        <TextField
          fullWidth
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="dense"
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleLogin}
          sx={{ marginTop: 2 }}
        >
          Login
        </Button>
      </DialogContent>
    </Dialog>
  );
};

LoginModal.propTypes = {
  open: PropTypes.bool.isRequired,
  username: PropTypes.string.isRequired,
  setUsername: PropTypes.func.isRequired,
  handleLogin: PropTypes.func.isRequired,
};

export default LoginModal;
