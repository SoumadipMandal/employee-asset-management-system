import React, { useEffect } from 'react';
import { Box, Grid, Typography, Paper, Chip } from '@mui/material';
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded';
import DevicesRoundedIcon from '@mui/icons-material/DevicesRounded';
import AssignmentTurnedInRoundedIcon from '@mui/icons-material/AssignmentTurnedInRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import StatsCard from '../components/common/StatsCard';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchEmployees } from '../features/employees/employeesSlice';
import { fetchAssets, fetchAssignments } from '../features/assets/assetsSlice';

const DashboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const employees = useAppSelector((state) => state.employees.items);
    const assets = useAppSelector((state) => state.assets.items);
    const assignments = useAppSelector((state) => state.assets.assignments);

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchAssets());
        dispatch(fetchAssignments());
    }, [dispatch]);

    const stats = {
        totalEmployees: employees.length,
        totalAssets: assets.length,
        assignedAssets: assets.filter((a) => a.status === 'Assigned').length,
        availableAssets: assets.filter((a) => a.status === 'Available').length,
        repairAssets: assets.filter((a) => a.status === 'Repair').length,
    };

    const recentAssignments = [...assignments]
        .sort(
            (a, b) =>
                new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()
        )
        .slice(0, 5);

    const departmentCounts = employees.reduce<Record<string, number>>(
        (acc, emp) => {
            acc[emp.department] = (acc[emp.department] || 0) + 1;
            return acc;
        },
        {}
    );

    return (
        <Box>
            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                    <StatsCard
                        title="Total Employees"
                        value={stats.totalEmployees}
                        icon={<PeopleAltRoundedIcon sx={{ fontSize: 26 }} />}
                        color="#6366f1"
                        gradient="linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                    <StatsCard
                        title="Total Assets"
                        value={stats.totalAssets}
                        icon={<DevicesRoundedIcon sx={{ fontSize: 26 }} />}
                        color="#3b82f6"
                        gradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                    <StatsCard
                        title="Assigned Assets"
                        value={stats.assignedAssets}
                        icon={<AssignmentTurnedInRoundedIcon sx={{ fontSize: 26 }} />}
                        color="#f59e0b"
                        gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                    <StatsCard
                        title="Available Assets"
                        value={stats.availableAssets}
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: 26 }} />}
                        color="#10b981"
                        gradient="linear-gradient(135deg, #10b981 0%, #34d399 100%)"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 2.4 }}>
                    <StatsCard
                        title="In Repair"
                        value={stats.repairAssets}
                        icon={<BuildRoundedIcon sx={{ fontSize: 26 }} />}
                        color="#ef4444"
                        gradient="linear-gradient(135deg, #ef4444 0%, #f87171 100%)"
                    />
                </Grid>
            </Grid>

            {/* Bottom Section */}
            <Grid container spacing={3}>
                {/* Recent Assignments */}
                <Grid size={{ xs: 12, md: 7 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                mb: 3,
                            }}
                        >
                            <Typography variant="h6" fontWeight={600}>
                                Recent Assignments
                            </Typography>
                            <TrendingUpRoundedIcon sx={{ color: 'text.disabled' }} />
                        </Box>

                        {recentAssignments.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
                                No assignments yet
                            </Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {recentAssignments.map((assignment) => (
                                    <Box
                                        key={assignment.id}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: 2,
                                            backgroundColor: '#f8fafc',
                                            border: '1px solid #f1f5f9',
                                        }}
                                    >
                                        <Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {assignment.assetName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                → {assignment.employeeName}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ textAlign: 'right' }}>
                                            <Chip
                                                size="small"
                                                label={assignment.status}
                                                color={assignment.status === 'Active' ? 'success' : 'default'}
                                                sx={{ fontSize: '0.7rem', height: 24 }}
                                            />
                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                sx={{ display: 'block', mt: 0.5 }}
                                            >
                                                {assignment.assignedDate}
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Grid>

                {/* Department Breakdown */}
                <Grid size={{ xs: 12, md: 5 }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>
                            Employees by Department
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {Object.entries(departmentCounts).map(([dept, count]) => (
                                <Box key={dept}>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            mb: 0.5,
                                        }}
                                    >
                                        <Typography variant="body2" fontWeight={500}>
                                            {dept}
                                        </Typography>
                                        <Typography variant="body2" fontWeight={600} color="primary">
                                            {count}
                                        </Typography>
                                    </Box>
                                    <Box
                                        sx={{
                                            height: 6,
                                            borderRadius: 3,
                                            backgroundColor: '#f0f0f0',
                                            overflow: 'hidden',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                height: '100%',
                                                width: `${(count / employees.length) * 100}%`,
                                                borderRadius: 3,
                                                background:
                                                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                                                transition: 'width 1s ease',
                                            }}
                                        />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
};

export default DashboardPage;
