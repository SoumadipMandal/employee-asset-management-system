import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Alert,
    InputAdornment,
    IconButton,
} from '@mui/material';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { login, clearError } from '../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, error } = useAppSelector((state) => state.auth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    const validate = (): boolean => {
        let valid = true;
        setEmailError('');
        setPasswordError('');

        if (!email.trim()) {
            setEmailError('Email is required');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Invalid email format');
            valid = false;
        }

        if (!password.trim()) {
            setPasswordError('Password is required');
            valid = false;
        } else if (password.length < 5) {
            setPasswordError('Password must be at least 5 characters');
            valid = false;
        }

        return valid;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            dispatch(login({ email, password }));
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
                p: 2,
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    maxWidth: 420,
                    borderRadius: 4,
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <Box
                    sx={{
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        p: 4,
                        textAlign: 'center',
                        color: '#fff',
                    }}
                >
                    <Box
                        sx={{
                            width: 64,
                            height: 64,
                            borderRadius: 3,
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mx: 'auto',
                            mb: 2,
                        }}
                    >
                        <BusinessRoundedIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Typography variant="h5" fontWeight={700} gutterBottom>
                        AssetPro
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Employee Asset Management System
                    </Typography>
                </Box>

                {/* Form */}
                <Box component="form" onSubmit={handleSubmit} sx={{ p: 4 }}>
                    <Typography
                        variant="h6"
                        fontWeight={600}
                        sx={{ mb: 0.5 }}
                    >
                        Welcome back
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 3 }}
                    >
                        Sign in to your admin account
                    </Typography>

                    {error && (
                        <Alert
                            severity="error"
                            sx={{ mb: 2, borderRadius: 2 }}
                            onClose={() => dispatch(clearError())}
                        >
                            {error}
                        </Alert>
                    )}

                    <TextField
                        fullWidth
                        label="Email Address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        error={!!emailError}
                        helperText={emailError}
                        sx={{ mb: 2 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <TextField
                        fullWidth
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        error={!!passwordError}
                        helperText={passwordError}
                        sx={{ mb: 3 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <LockRoundedIcon sx={{ color: 'text.disabled', fontSize: 20 }} />
                                </InputAdornment>
                            ),
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword(!showPassword)}
                                        edge="end"
                                        size="small"
                                    >
                                        {showPassword ? (
                                            <VisibilityOffRoundedIcon fontSize="small" />
                                        ) : (
                                            <VisibilityRoundedIcon fontSize="small" />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        sx={{
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '1rem',
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #5558e6 0%, #7c4fe0 100%)',
                                boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                            },
                        }}
                    >
                        Sign In
                    </Button>

                    <Box
                        sx={{
                            mt: 3,
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: '#f8fafc',
                            border: '1px dashed #e2e8f0',
                        }}
                    >
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: 'block', textAlign: 'center', fontWeight: 500 }}
                        >
                            Demo Credentials
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{
                                display: 'block',
                                textAlign: 'center',
                                fontFamily: 'monospace',
                                mt: 0.5,
                            }}
                        >
                            admin@company.com / admin123
                        </Typography>
                    </Box>
                </Box>
            </Paper>
        </Box>
    );
};

export default LoginPage;
