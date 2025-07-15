// App.js
import React from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store from './store/store';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginForm from './components/loginform';
import SignupForm from './components/Signupform';
import UpdatePasswordDialog from './components/updatepasswordform';
import { logout } from './store/userSlice';
import { Box, Typography, Button } from '@mui/material';
import UserDashboard from './components/User_Dashboard';
import UserProfileForm from './components/Edit_User_Profile';



function AppRoutes() {
  const isLoggedIn = useSelector((state) => state.user.isLoggedIn);

  return (
    <Routes>
      <Route path="/Client-dashboard" element={isLoggedIn ? <UserDashboard /> : <LoginForm />} />
      <Route path="/Edit-User-Profile" element={isLoggedIn ? < UserProfileForm/> : <LoginForm />} />
      <Route path="/" element={<LoginForm></LoginForm>}></Route>
      <Route path="/signup" element={<SignupForm />} />
      <Route path="/update-password" element={<UpdatePasswordDialog />} />
      {/* Redirect any unknown route to login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppRoutes />
      </Router>
    </Provider>
  );
}
