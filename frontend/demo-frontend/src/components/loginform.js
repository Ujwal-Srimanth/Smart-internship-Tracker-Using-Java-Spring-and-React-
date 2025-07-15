import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { useDispatch } from 'react-redux';
import { login } from '../store/userSlice';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }

    try {
      const response = await axios.post(`http://localhost:8080/api/users/login`, null, {
        params: {
          username,
          password,
        },
      });

      console.log(username," ",password)

      const userData = response.data; // Should be { username, role } from backend
      dispatch(login({ username: userData.username, role: userData.role ,email: userData.email}));

      // Clear form
      setUsername('');
      setPassword('');
      setError('');
      navigate('/Client-dashboard');
    } catch (err) {
      setError('Invalid username or password');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        maxWidth: 400,
        mx: 'auto',
        mt: 5,
        p: 3,
        border: '1px solid #ccc',
        borderRadius: 2,
      }}
    >
      <Typography variant="h6" mb={2}>
        Login
      </Typography>

      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        margin="normal"
      />

      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        margin="normal"
      />

      <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
        Login
      </Button>

      <Typography variant="body2" mt={2}>
  Don't have an account? <Link to="/signup">Signup</Link>
</Typography>

<Typography variant="body2" mt={1}>
  If you forgot your password <Link to="/update-password">Please Click here</Link>
</Typography>
    </Box>
  );
}
