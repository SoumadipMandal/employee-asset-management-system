import React from 'react';
import { Paper, Typography, Box } from '@mui/material';

interface StatsCardProps {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    gradient: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    color,
    gradient,
}) => {
    return (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                background: '#fff',
                transition: 'all 0.3s ease',
                cursor: 'default',
                '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
                },
            }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.8rem',
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                            mb: 1,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h3"
                        sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            lineHeight: 1,
                        }}
                    >
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: 3,
                        background: gradient,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#fff',
                        flexShrink: 0,
                    }}
                >
                    {icon}
                </Box>
            </Box>
            <Box
                sx={{
                    mt: 2,
                    height: 4,
                    borderRadius: 2,
                    background: '#f0f0f0',
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        height: '100%',
                        width: `${Math.min(value * 10, 100)}%`,
                        borderRadius: 2,
                        background: color,
                        transition: 'width 1s ease-in-out',
                    }}
                />
            </Box>
        </Paper>
    );
};

export default StatsCard;
