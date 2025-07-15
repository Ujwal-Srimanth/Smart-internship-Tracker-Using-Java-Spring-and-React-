import React, { useState } from 'react';
import { Box, Typography, TextField, Button } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function UpdatePassword() {
  const navigate = useNavigate();

  // States to control steps
  const [step, setStep] = useState(1);

  // Step 1: enter username/email
  const [username, setUsername] = useState('');

  // Step 2: enter code
  const [codeInput, setCodeInput] = useState('');

  // Step 3: enter new password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Error message
  const [error, setError] = useState('');

  // Store the verification code received from backend temporarily
  const [verificationCode, setVerificationCode] = useState(null);

  // Handle username/email submit -> call backend to send code
  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username) {
      setError('Please enter your username');
      return;
    }

    try {
      // Call backend to send verification code
      const response = await axios.post('http://localhost:8080/api/users/update-password-verification', null, {
        params: { username },
      });

      const code = response.data; // Assume backend returns the code (or some success flag)

      if (!code) {
        setError('Failed to send verification code. Try again.');
        return;
      }

      setVerificationCode(code);
      setStep(2); // Move to code verification step
    } catch (err) {
      setError('Username not found or server error.');
      // Navigate back to login after delay
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  // Handle code input submit
  const handleCodeSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!codeInput) {
      setError('Please enter the verification code');
      return;
    }

    if (codeInput !== String(verificationCode)) {
      setError('Invalid verification code');
      return;
    }

    setStep(3); // Move to password reset step
  };

  // Handle new password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!newPassword || !confirmPassword) {
      setError('Please fill in both password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      // Call backend API to update password
      await axios.put('http://localhost:8080/api/users/update-password', null, {
        params: {
          username,
          newPassword,
        },
      });

      alert('Password updated successfully. Redirecting to login.');
      navigate('/login');
    } catch (err) {
      setError('Failed to update password.');
      setTimeout(() => navigate('/login'), 3000);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', mt: 5, p: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Typography variant="h6" mb={2}>
        Update Password
      </Typography>

      {error && (
        <Typography color="error" variant="body2" mb={2}>
          {error}
        </Typography>
      )}

      {step === 1 && (
        <form onSubmit={handleUsernameSubmit}>
          <TextField
            label="Username or Email"
            variant="outlined"
            fullWidth
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Send Verification Code
          </Button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleCodeSubmit}>
          <TextField
            label="Enter Verification Code"
            variant="outlined"
            fullWidth
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Verify Code
          </Button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handlePasswordSubmit}>
          <TextField
            label="New Password"
            type="password"
            variant="outlined"
            fullWidth
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            variant="outlined"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>
            Update Password
          </Button>
        </form>
      )}
    </Box>
  );
}
