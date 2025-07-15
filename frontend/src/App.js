import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';
import Home from './pages/Home';
import DebateRoom from './pages/DebateRoom';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import StartDebate from './pages/StartDebate';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import { LayoutProvider, useLayout } from './context/LayoutContext';
import './App.css';

// A component to conditionally render Navbar based on context
const AppNavbar = () => {
  const { showHeader } = useLayout();
  return showHeader ? <Navbar /> : null;
};

// A component to conditionally render Footer based on context
const AppFooter = () => {
  const { showFooter } = useLayout();
  return showFooter ? <Footer /> : null;
};

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LayoutProvider>
        <Router>
          <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <AppNavbar />
            <Box component="main" sx={{ flexGrow: 1 }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/start-debate" element={<StartDebate />} />
                <Route path="/debate/:team_id" element={<DebateRoom />} />
                <Route path="/admin-login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute />}>
                  <Route index element={<AdminDashboard />} />
                </Route>
              </Routes>
            </Box>
            <AppFooter />
          </Box>
        </Router>
      </LayoutProvider>
    </ThemeProvider>
  );
}

export default App; 