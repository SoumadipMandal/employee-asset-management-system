import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Typography,
    IconButton,
    Divider,
    useTheme,
    useMediaQuery,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import AssignmentRoundedIcon from '@mui/icons-material/AssignmentRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import BusinessRoundedIcon from '@mui/icons-material/BusinessRounded';

const DRAWER_WIDTH = 260;
const DRAWER_COLLAPSED_WIDTH = 72;

interface SidebarProps {
    mobileOpen: boolean;
    onMobileClose: () => void;
}

const menuItems = [
    { text: 'Dashboard', icon: <DashboardRoundedIcon />, path: '/' },
    { text: 'Employees', icon: <PeopleAltRoundedIcon />, path: '/employees' },
    { text: 'Assets', icon: <DevicesRoundedIcon />, path: '/assets' },
    { text: 'Assignments', icon: <AssignmentRoundedIcon />, path: '/assignments' },
];

const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
    const [collapsed, setCollapsed] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const drawerWidth = collapsed && !isMobile ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

    const drawerContent = (
        <Box
            sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                background: 'linear-gradient(180deg, #0f172a 0%, #1e293b 100%)',
                color: '#fff',
            }}
        >
            {/* Logo */}
            <Box
                sx={{
                    p: collapsed && !isMobile ? 1.5 : 2.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                    gap: 1.5,
                    minHeight: 72,
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}
                >
                    <BusinessRoundedIcon sx={{ fontSize: 22 }} />
                </Box>
                {(!collapsed || isMobile) && (
                    <Box>
                        <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 700, lineHeight: 1.2, letterSpacing: -0.3 }}
                        >
                            AssetPro
                        </Typography>
                        <Typography
                            variant="caption"
                            sx={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem' }}
                        >
                            Management System
                        </Typography>
                    </Box>
                )}
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Navigation */}
            <List sx={{ px: 1.5, py: 2, flex: 1 }}>
                {menuItems.map((item) => {
                    const isActive =
                        item.path === '/'
                            ? location.pathname === '/'
                            : location.pathname.startsWith(item.path);

                    return (
                        <ListItemButton
                            key={item.text}
                            onClick={() => {
                                navigate(item.path);
                                if (isMobile) onMobileClose();
                            }}
                            sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                px: collapsed && !isMobile ? 1.5 : 2,
                                py: 1.2,
                                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                                background: isActive
                                    ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                    : 'transparent',
                                color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                                '&:hover': {
                                    background: isActive
                                        ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)'
                                        : 'rgba(255,255,255,0.06)',
                                    color: '#fff',
                                },
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <ListItemIcon
                                sx={{
                                    color: 'inherit',
                                    minWidth: collapsed && !isMobile ? 0 : 40,
                                    justifyContent: 'center',
                                }}
                            >
                                {item.icon}
                            </ListItemIcon>
                            {(!collapsed || isMobile) && (
                                <ListItemText
                                    primary={item.text}
                                    primaryTypographyProps={{
                                        fontSize: '0.875rem',
                                        fontWeight: isActive ? 600 : 500,
                                    }}
                                />
                            )}
                        </ListItemButton>
                    );
                })}
            </List>

            {/* Collapse Toggle (Desktop only) */}
            {!isMobile && (
                <Box sx={{ p: 1.5 }}>
                    <IconButton
                        onClick={() => setCollapsed(!collapsed)}
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            color: 'rgba(255,255,255,0.5)',
                            '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.06)' },
                        }}
                    >
                        {collapsed ? <ChevronRightRoundedIcon /> : <ChevronLeftRoundedIcon />}
                    </IconButton>
                </Box>
            )}
        </Box>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
        >
            {/* Mobile drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onMobileClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': {
                        width: DRAWER_WIDTH,
                        border: 'none',
                    },
                }}
            >
                {drawerContent}
            </Drawer>

            {/* Desktop drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', md: 'block' },
                    '& .MuiDrawer-paper': {
                        width: drawerWidth,
                        border: 'none',
                        transition: 'width 0.3s ease',
                        overflowX: 'hidden',
                    },
                }}
                open
            >
                {drawerContent}
            </Drawer>
        </Box>
    );
};

export default Sidebar;
export { DRAWER_WIDTH, DRAWER_COLLAPSED_WIDTH };
