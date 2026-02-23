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
    fetchAssets,
    addAsset,
    updateAsset,
    deleteAsset,
    clearAssetError,
} from '../features/assets/assetsSlice';
import type { Asset } from '../types';

const ASSET_TYPES = [
    'Laptop',
    'Monitor',
    'Mobile',
    'Tablet',
    'Peripheral',
    'Furniture',
    'Printer',
    'Networking',
    'Other',
];

const initialFormState: Omit<Asset, 'id' | 'assignedTo'> = {
    assetName: '',
    assetType: '',
    serialNumber: '',
    purchaseDate: '',
    status: 'Available',
};

const AssetsPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { items: assets, loading, error } = useAppSelector((state) => state.assets);
    const employees = useAppSelector((state) => state.employees.items);

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
        dispatch(fetchAssets());
    }, [dispatch]);

    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearAssetError());
        }
    }, [error, dispatch]);

    const filteredAssets = useMemo(() => {
        const q = search.toLowerCase();
        return (assets || []).filter(
            (a) =>
                a.assetName.toLowerCase().includes(q) ||
                a.assetType.toLowerCase().includes(q) ||
                a.serialNumber.toLowerCase().includes(q) ||
                a.status.toLowerCase().includes(q)
        );
    }, [assets, search]);

    const paginatedAssets = useMemo(
        () =>
            filteredAssets.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
            ),
        [filteredAssets, page, rowsPerPage]
    );

    const getEmployeeName = (employeeId: string | null): string => {
        if (!employeeId) return '—';
        const emp = employees.find((e) => e.id === employeeId);
        return emp ? emp.name : 'Unknown';
    };

    const getStatusColor = (
        status: string
    ): 'success' | 'warning' | 'error' | 'default' => {
        switch (status) {
            case 'Available':
                return 'success';
            case 'Assigned':
                return 'warning';
            case 'Repair':
                return 'error';
            default:
                return 'default';
        }
    };

    const validateForm = (): boolean => {
        const errors: Record<string, string> = {};
        if (!formData.assetName.trim()) errors.assetName = 'Asset name is required';
        if (!formData.assetType) errors.assetType = 'Asset type is required';
        if (!formData.serialNumber.trim())
            errors.serialNumber = 'Serial number is required';
        if (!formData.purchaseDate) errors.purchaseDate = 'Purchase date is required';
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData(initialFormState);
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleOpenEdit = (asset: Asset) => {
        setEditingId(asset.id);
        setFormData({
            assetName: asset.assetName,
            assetType: asset.assetType,
            serialNumber: asset.serialNumber,
            purchaseDate: asset.purchaseDate,
            status: asset.status,
        });
        setFormErrors({});
        setDialogOpen(true);
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            if (editingId) {
                const existing = assets.find((a) => a.id === editingId);
                await dispatch(
                    updateAsset({
                        id: editingId,
                        data: {
                            ...formData,
                            id: editingId,
                            assignedTo: existing?.assignedTo ?? null,
                        },
                    })
                ).unwrap();
                setSnackbar({
                    open: true,
                    message: 'Asset updated successfully',
                    severity: 'success',
                });
            } else {
                await dispatch(
                    addAsset({
                        ...formData,
                        id: uuidv4(),
                        assignedTo: null,
                    })
                ).unwrap();
                setSnackbar({
                    open: true,
                    message: 'Asset added successfully',
                    severity: 'success',
                });
            }
            setDialogOpen(false);
        } catch (err) {
            setSnackbar({ open: true, message: String(err), severity: 'error' });
        }
    };

    const handleDelete = async () => {
        if (!deleteConfirm) return;
        try {
            await dispatch(deleteAsset(deleteConfirm)).unwrap();
            setSnackbar({
                open: true,
                message: 'Asset deleted successfully',
                severity: 'success',
            });
        } catch (err) {
            setSnackbar({ open: true, message: String(err), severity: 'error' });
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
                    placeholder="Search assets..."
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
                    Add Asset
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
                                    'Asset Name',
                                    'Type',
                                    'Serial Number',
                                    'Purchase Date',
                                    'Status',
                                    'Assigned To',
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
                            {loading && assets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : paginatedAssets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                                        <Typography variant="body2" color="text.secondary">
                                            {search ? 'No assets match your search' : 'No assets found'}
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedAssets.map((asset) => (
                                    <TableRow
                                        key={asset.id}
                                        hover
                                        sx={{
                                            '&:last-child td, &:last-child th': { border: 0 },
                                            transition: 'background-color 0.2s',
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {asset.assetName}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={asset.assetType}
                                                size="small"
                                                variant="outlined"
                                                sx={{ fontSize: '0.75rem', borderRadius: 1.5 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{ fontFamily: 'monospace', fontSize: '0.8rem' }}
                                            >
                                                {asset.serialNumber}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {asset.purchaseDate}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={asset.status}
                                                size="small"
                                                color={getStatusColor(asset.status)}
                                                sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {getEmployeeName(asset.assignedTo)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => handleOpenEdit(asset)}
                                                    sx={{ color: '#6366f1' }}
                                                >
                                                    <EditRoundedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Delete">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDeleteConfirm(asset.id)}
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
                    count={filteredAssets.length}
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
                    {editingId ? 'Edit Asset' : 'Add New Asset'}
                </DialogTitle>
                <DialogContent sx={{ pt: '16px !important' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Asset Name"
                            fullWidth
                            value={formData.assetName}
                            onChange={(e) =>
                                setFormData({ ...formData, assetName: e.target.value })
                            }
                            error={!!formErrors.assetName}
                            helperText={formErrors.assetName}
                        />
                        <TextField
                            label="Asset Type"
                            fullWidth
                            select
                            value={formData.assetType}
                            onChange={(e) =>
                                setFormData({ ...formData, assetType: e.target.value })
                            }
                            error={!!formErrors.assetType}
                            helperText={formErrors.assetType}
                        >
                            {ASSET_TYPES.map((type) => (
                                <MenuItem key={type} value={type}>
                                    {type}
                                </MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            label="Serial Number"
                            fullWidth
                            value={formData.serialNumber}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    serialNumber: e.target.value,
                                })
                            }
                            error={!!formErrors.serialNumber}
                            helperText={formErrors.serialNumber}
                        />
                        <TextField
                            label="Purchase Date"
                            fullWidth
                            type="date"
                            value={formData.purchaseDate}
                            onChange={(e) =>
                                setFormData({
                                    ...formData,
                                    purchaseDate: e.target.value,
                                })
                            }
                            error={!!formErrors.purchaseDate}
                            helperText={formErrors.purchaseDate}
                            slotProps={{ inputLabel: { shrink: true } }}
                        />
                        {editingId && (
                            <TextField
                                label="Status"
                                fullWidth
                                select
                                value={formData.status}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        status: e.target.value as
                                            | 'Available'
                                            | 'Assigned'
                                            | 'Repair',
                                    })
                                }
                            >
                                <MenuItem value="Available">Available</MenuItem>
                                <MenuItem value="Assigned">Assigned</MenuItem>
                                <MenuItem value="Repair">Repair</MenuItem>
                            </TextField>
                        )}
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
                        {editingId ? 'Update' : 'Add Asset'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation */}
            <ConfirmDialog
                open={!!deleteConfirm}
                title="Delete Asset"
                message="Are you sure you want to delete this asset? This action cannot be undone."
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

export default AssetsPage;
