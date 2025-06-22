import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Container,
    Paper,
    Typography,
    Box,
    Button,
    TextField,
    Alert
} from '@mui/material';

// For simplicity, the passcode is hardcoded. In a real app, use environment variables.
const ADMIN_PASSCODE = 'admin123';

const AdminLogin = () => {
    const [passcode, setPasscode] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = (e) => {
        e.preventDefault();
        if (passcode === ADMIN_PASSCODE) {
            sessionStorage.setItem('isAdminAuthenticated', 'true');
            navigate('/admin', { replace: true });
        } else {
            setError('Incorrect passcode. Please try again.');
        }
    };

    return (
        <Container maxWidth="xs" sx={{ py: 8 }}>
            <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography component="h1" variant="h5">
                    Admin Access
                </Typography>
                <Box component="form" onSubmit={handleLogin} sx={{ mt: 1, width: '100%' }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="passcode"
                        label="Passcode"
                        type="password"
                        id="passcode"
                        autoFocus
                        value={passcode}
                        onChange={(e) => setPasscode(e.target.value)}
                        error={!!error}
                    />
                    {error && <Alert severity="error" sx={{ width: '100%', mt: 1 }}>{error}</Alert>}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                    >
                        Enter
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};

export default AdminLogin; 