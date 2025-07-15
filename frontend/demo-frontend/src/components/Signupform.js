// SignupForm.js
import React, { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function SignupForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [email, setMail] = useState('');
  const role = 'user';
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8080/api/users/signup', {
        username,
        password,
        role,
        email
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data || 'Signup failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSignup} sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6" mb={2}>Signup</Typography>
      {error && <Typography color="error" variant="body2">{error}</Typography>}

      <TextField label="Username" fullWidth margin="normal" value={username} onChange={(e) => setUsername(e.target.value)} />
      <TextField label="Password" type="password" fullWidth margin="normal" value={password} onChange={(e) => setPassword(e.target.value)} />
      <TextField label="Email" fullWidth margin="normal" value={email} onChange={(e) => setMail(e.target.value)} />

      <Button type="submit" fullWidth variant="contained" sx={{ mt: 2 }}>Signup</Button>
    </Box>
  );
}
