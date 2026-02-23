import React, { useEffect, useState, useMemo } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { v4 as uuidv4 } from 'uuid';
import SearchBar from '../components/common/SearchBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
    fetchEmployees,
    addEmployee,
    updateEmployee,
    deleteEmployee,
    clearEmployeeError,
} from '../features/employees/employeesSlice';
import { fetchAssets } from '../features/assets/assetsSlice';
import type { Employee } from '../types';

const DEPARTMENTS = [
    'Engineering',
    'Design',
    'Marketing',
    'HR',
    'Finance',
    'Operations',
    'Sales',
    'Support',
];

const initialFormState: Omit<Employee, 'id'> = {
    name: '',
    email: '',
    department: '',
    role: '',
    status: 'Active',
};

const EmployeesPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: employees, loading, error } = useAppSelector((state) => state.employees);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(initialFormState);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchAssets());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearEmployeeError());
        }
    }, [error, dispatch]);

    const filteredEmployees = useMemo(() => {
        const q = search.toLowerCase();
        return employees.filter(
            (e) =>
                e.name.toLowerCase().includes(q) ||
                e.email.toLowerCase().includes(q) ||
                e.department.toLowerCase().includes(q) ||
                e.role.toLowerCase().includes(q)
        );
    }, [employees, search]);

    const paginatedEmployees = useMemo(
        () =>
            filteredEmployees.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [filteredEmployees, page, rowsPerPage]
    );

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }
        if (!formData.department) errors.department = 'Department is required';
        if (!formData.role.trim()) errors.role = 'Role is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleOpenEdit = (employee: Employee) => {
        setEditingId(employee.id);
        setFormData({
            name: employee.name,
            email: employee.email,
            department: employee.department,
            role: employee.role,
            status: employee.status,
        });
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (editingId) {
                await dispatch(
                    updateEmployee({
                        id: editingId,
                        data: { ...formData, id: editingId },
                    })
                ).unwrap();
                setSnackbar({
                    open: true,
                    message: 'Employee updated successfully',
                    severity: 'success',
                });
            } else {
                await dispatch(
                    addEmployee({ ...formData, id: uuidv4() })
                ).unwrap();
                setSnackbar({
                    open: true,
                    message: 'Employee added successfully',
                    severity: 'success',
                });
            }
            setDialogOpen(false);
        } catch (err) {
            setSnackbar({
                open: true,
                message: String(err),
                severity: 'error',
            });
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await dispatch(deleteEmployee(deleteConfirm)).unwrap();
            setSnackbar({
                open: true,
                message: 'Employee deleted successfully',
                severity: 'success',
            });
        } catch (err) {
            setSnackbar({
                open: true,
                message: String(err),
                severity: 'error',
            });
        }
        setDeleteConfirm(null);
    };

    return (
        <Box>
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: { xs: 'stretch', sm: 'center' },
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 3,
                }}
            >
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder="Search employees..."
                />
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={handleOpenAdd}
                    sx={{
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        px: 3,
                        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)',
                        '&:hover': {
                            boxShadow: '0 6px 20px rgba(99, 102, 241, 0.4)',
                        },
                    }}
                >
                    Add Employee
                </Button>
            </Box>

            {/* Table */}
            <Paper
                elevation={0}
                sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
            >
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Name
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Email
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Department
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Role
                                </TableCell>
                                <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                    Status
                                </TableCell>
                                <TableCell
                                    align="right"
                                    sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: 0.5 }}
                                >
                                    Actions
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedEmployees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {search ? 'No employees match your search' : 'No employees found'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedEmployees.map((employee) => (
                                    <TableRow
                                        key={employee.id}
                                        hover
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {employee.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {employee.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={employee.department}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.75rem', borderRadius: 1.5 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">{employee.role}</Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={employee.status}
                                                size="small"
                                                color={employee.status === 'Active' ? 'success' : 'default'}
                                                sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenEdit(employee)}
                                                    sx={{ color: '#6366f1' }}
                                                >
                                                    <EditRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDeleteConfirm(employee.id)}
                                                    sx={{ color: '#ef4444' }}
                                                >
                                                    <DeleteRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredEmployees.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value, 10));
                        setPage(0);
                    }}
                    rowsPerPageOptions={[5, 10, 25]}
                />
            </Paper>

            {/* Add/Edit Dialog */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>
                    {editingId ? 'Edit Employee' : 'Add New Employee'}
                </DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Full Name"
                            fullWidth
                            value={formData.name}
                            onChange={(e) =>
                                setFormData({ ...formData, name: e.target.value })
                            }
                            error={!!formErrors.name}
                            helperText={formErrors.name}
                        />
                        <TextField
                            label="Email Address"
                            fullWidth
                            value={formData.email}
                            onChange={(e) =>
                                setFormData({ ...formData, email: e.target.value })
                            }
                            error={!!formErrors.email}
                            helperText={formErrors.email}
                        />
                        <TextField
                            label="Department"
                            fullWidth
                            select
                            value={formData.department}
                            onChange={(e) =>
                                setFormData({ ...formData, department: e.target.value })
                            }
                            error={!!formErrors.department}
                            helperText={formErrors.department}
                        >
                            {DEPARTMENTS.map((dept) => (
                                <MenuItem key={dept} value={dept}>
                                    {dept}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Role"
                            fullWidth
                            value={formData.role}
                            onChange={(e) =>
                                setFormData({ ...formData, role: e.target.value })
                            }
                            error={!!formErrors.role}
                            helperText={formErrors.role}
                        />
                        <TextField
                            label="Status"
                            fullWidth
                            select
                            value={formData.status}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    status: e.target.value as 'Active' | 'Inactive',
                                })
                            }
                        >
                            <MenuItem value="Active">Active</MenuItem>
                            <MenuItem value="Inactive">Inactive</MenuItem>
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        }}
                    >
                        {editingId ? 'Update' : 'Add Employee'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteConfirm}
                title="Delete Employee"
                message="Are you sure you want to delete this employee? This action cannot be undone."
                confirmLabel="Delete"
                onConfirm={handleDelete}
                onCancel={() => setDeleteConfirm(null)}
                severity="error"
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default EmployeesPage;
