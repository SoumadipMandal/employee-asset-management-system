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
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Snackbar,
    Alert,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import AssignmentReturnRoundedIcon from '@mui/icons-material/AssignmentReturnRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import SearchBar from '../components/common/SearchBar';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchEmployees } from '../features/employees/employeesSlice';
import {
    fetchAssets,
    fetchAssignments,
    assignAsset,
    returnAsset,
    clearAssetError,
} from '../features/assets/assetsSlice';

const AssignmentsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const employees = useAppSelector((state) => state.employees.items);
    const assets = useAppSelector((state) => state.assets.items);
    const assignments = useAppSelector((state) => state.assets.assignments);
    const { loading, error } = useAppSelector((state) => state.assets);

    const [search, setSearch] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [assignDialogOpen, setAssignDialogOpen] = useState(false);
    const [selectedAssetId, setSelectedAssetId] = useState('');
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [returnConfirm, setReturnConfirm] = useState<{
        assetId: string;
        assignmentId: string;
    } | null>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({ open: false, message: '', severity: 'success' });

    useEffect(() => {
        dispatch(fetchEmployees());
        dispatch(fetchAssets());
        dispatch(fetchAssignments());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearAssetError());
        }
    }, [error, dispatch]);

    const availableAssets = useMemo(
        () => (assets || []).filter((a) => a.status === 'Available'),
        [assets]
    );

    const activeEmployees = useMemo(
        () => (employees || []).filter((e) => e.status === 'Active'),
        [employees]
    );

    const filteredAssignments = useMemo(() => {
        const q = search.toLowerCase();
        return [...(assignments || [])]
            .sort(
                (a, b) =>
                    new Date(b.assignedDate).getTime() -
                    new Date(a.assignedDate).getTime()
            )
            .filter(
                (a) =>
                    a.assetName.toLowerCase().includes(q) ||
                    a.employeeName.toLowerCase().includes(q) ||
                    a.status.toLowerCase().includes(q)
            );
    }, [assignments, search]);

    const paginatedAssignments = useMemo(
        () =>
            filteredAssignments.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [filteredAssignments, page, rowsPerPage]
    );

    const handleAssign = async () => {
        if (!selectedAssetId || !selectedEmployeeId) return;

        const asset = assets.find((a) => a.id === selectedAssetId);
        const employee = employees.find((e) => e.id === selectedEmployeeId);
        if (!asset || !employee) return;

        try {
            await dispatch(
                assignAsset({
                    assetId: selectedAssetId,
                    employeeId: selectedEmployeeId,
                    assetName: asset.assetName,
                    employeeName: employee.name,
                })
            ).unwrap();
            setSnackbar({
                open: true,
                message: `"${asset.assetName}" assigned to ${employee.name}`,
                severity: 'success',
            });
            setAssignDialogOpen(false);
            setSelectedAssetId('');
            setSelectedEmployeeId('');
        } catch (err) {
            setSnackbar({ open: true, message: String(err), severity: 'error' });
        }
    };

    const handleReturn = async () => {
        if (!returnConfirm) return;
        try {
            await dispatch(
                returnAsset({
                    assetId: returnConfirm.assetId,
                    assignmentId: returnConfirm.assignmentId,
                })
            ).unwrap();
            setSnackbar({
                open: true,
                message: 'Asset returned successfully',
                severity: 'success',
            });
        } catch (err) {
            setSnackbar({ open: true, message: String(err), severity: 'error' });
        }
        setReturnConfirm(null);
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
                    placeholder="Search assignments..."
                />
                <Button
                    variant="contained"
                    startIcon={<AddRoundedIcon />}
                    onClick={() => {
                        setSelectedAssetId('');
                        setSelectedEmployeeId('');
                        setAssignDialogOpen(true);
                    }}
                    disabled={availableAssets.length === 0}
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
                    Assign Asset
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
                                {[
                                    'Asset',
                                    'Employee',
                                    'Assigned Date',
                                    'Returned Date',
                                    'Status',
                                    'Actions',
                                ].map((header) => (
                                    <TableCell
                                        key={header}
                                        align={header === 'Actions' ? 'right' : 'left'}
                                        sx={{
                                            fontWeight: 600,
                                            color: 'text.secondary',
                                            fontSize: '0.8rem',
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.5,
                                        }}
                                    >
                                        {header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading && assignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedAssignments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {search
                                                ? 'No assignments match your search'
                                                : 'No assignments yet'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAssignments.map((assignment) => (
                                    <TableRow
                                        key={assignment.id}
                                        hover
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {assignment.assetName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2">
                                                {assignment.employeeName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {assignment.assignedDate}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {assignment.returnedDate || '—'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={assignment.status}
                                                size="small"
                                                color={
                                                    assignment.status === 'Active' ? 'success' : 'default'
                                                }
                                                sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            {assignment.status === 'Active' && (
                                                <Tooltip title="Return Asset">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            setReturnConfirm({
                                                                assetId: assignment.assetId,
                                                                assignmentId: assignment.id,
                                                            })
                                                        }
                                                        sx={{ color: '#f59e0b' }}
                                                    >
                                                        <AssignmentReturnRoundedIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filteredAssignments.length}
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

            {/* Assign Dialog */}
            <Dialog
                open={assignDialogOpen}
                onClose={() => setAssignDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ fontWeight: 600 }}>Assign Asset to Employee</DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                        <TextField
                            label="Select Asset"
                            fullWidth
                            select
                            value={selectedAssetId}
                            onChange={(e) => setSelectedAssetId(e.target.value)}
                            helperText={
                                availableAssets.length === 0
                                    ? 'No available assets'
                                    : `${availableAssets.length} asset(s) available`
                            }
                        >
                            {availableAssets.map((asset) => (
                                <MenuItem key={asset.id} value={asset.id}>
                                    {asset.assetName} ({asset.serialNumber})
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Select Employee"
                            fullWidth
                            select
                            value={selectedEmployeeId}
                            onChange={(e) => setSelectedEmployeeId(e.target.value)}
                            helperText={`${activeEmployees.length} active employee(s)`}
                        >
                            {activeEmployees.map((emp) => (
                                <MenuItem key={emp.id} value={emp.id}>
                                    {emp.name} — {emp.department}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button
                        onClick={() => setAssignDialogOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2, textTransform: 'none' }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAssign}
                        variant="contained"
                        disabled={!selectedAssetId || !selectedEmployeeId}
                        sx={{
                            borderRadius: 2,
                            textTransform: 'none',
                            fontWeight: 600,
                            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                        }}
                    >
                        Assign
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Return Confirmation */}
            <ConfirmDialog
                open={!!returnConfirm}
                title="Return Asset"
                message="Are you sure you want to mark this asset as returned? The asset will become available for reassignment."
                confirmLabel="Return"
                onConfirm={handleReturn}
                onCancel={() => setReturnConfirm(null)}
                severity="warning"
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

export default AssignmentsPage;
