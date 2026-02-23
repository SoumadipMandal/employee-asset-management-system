import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const AdminLayout: React.FC = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f0f2f5' }}>
            <Sidebar
                mobileOpen={mobileOpen}
                onMobileClose={() => setMobileOpen(false)}
            />
            <Box
                sx={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minWidth: 0,
                }}
            >
                <Navbar onMenuClick={() => setMobileOpen(true)} />
                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        p: { xs: 2, md: 3 },
                        overflow: 'auto',
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
};

export default AdminLayout;
