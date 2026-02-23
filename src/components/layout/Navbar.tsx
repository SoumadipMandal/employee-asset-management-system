import React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    Divider,
    Chip,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import AdminPanelSettingsRoundedIcon from '@mui/icons-material/AdminPanelSettingsRounded';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logout } from '../../features/auth/authSlice';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavbarProps {
    onMenuClick: () => void;
}

const getPageTitle = (pathname: string): string => {
    switch (pathname) {
        case '/':
            return 'Dashboard';
        case '/employees':
            return 'Employees';
        case '/assets':
            return 'Assets';
        case '/assignments':
            return 'Assignments';
        default:
            return 'Dashboard';
    }
};

const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const user = useAppSelector((state) => state.auth.user);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate('/login');
        handleMenuClose();
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid',
                borderColor: 'divider',
                color: 'text.primary',
            }}
        >
            <Toolbar sx={{ px: { xs: 2, md: 3 }, minHeight: { xs: 64, md: 72 } }}>
                <IconButton
                    edge="start"
                    onClick={onMenuClick}
                    sx={{
                        mr: 2,
                        display: { md: 'none' },
                        color: 'text.primary',
                    }}
                >
                    <MenuRoundedIcon />
                </IconButton>

                <Box sx={{ flex: 1 }}>
                    <Typography
                        variant="h5"
                        sx={{ fontWeight: 700, letterSpacing: -0.5 }}
                    >
                        {getPageTitle(location.pathname)}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Chip
                        icon={<AdminPanelSettingsRoundedIcon sx={{ fontSize: 16 }} />}
                        label="Admin"
                        size="small"
                        sx={{
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                            color: '#fff',
                            fontWeight: 600,
                            fontSize: '0.75rem',
                            display: { xs: 'none', sm: 'flex' },
                            '& .MuiChip-icon': { color: '#fff' },
                        }}
                    />

                    <IconButton
                        onClick={handleMenuOpen}
                        sx={{
                            p: 0.5,
                            border: '2px solid',
                            borderColor: 'divider',
                            transition: 'all 0.2s',
                            '&:hover': { borderColor: '#6366f1' },
                        }}
                    >
                        <Avatar
                            sx={{
                                width: 34,
                                height: 34,
                                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                fontSize: '0.875rem',
                                fontWeight: 700,
                            }}
                        >
                            {user?.name?.charAt(0) || 'A'}
                        </Avatar>
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={handleMenuClose}
                        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                        PaperProps={{
                            sx: {
                                mt: 1,
                                borderRadius: 2,
                                minWidth: 200,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                            },
                        }}
                    >
                        <Box sx={{ px: 2, py: 1.5 }}>
                            <Typography variant="subtitle2" fontWeight={600}>
                                {user?.name || 'Admin'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {user?.email || 'admin@company.com'}
                            </Typography>
                        </Box>
                        <Divider />
                        <MenuItem onClick={handleMenuClose} sx={{ py: 1.2 }}>
                            <ListItemIcon>
                                <PersonRoundedIcon fontSize="small" />
                            </ListItemIcon>
                            Profile
                        </MenuItem>
                        <MenuItem onClick={handleLogout} sx={{ py: 1.2, color: 'error.main' }}>
                            <ListItemIcon>
                                <LogoutRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
                            </ListItemIcon>
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Navbar;
