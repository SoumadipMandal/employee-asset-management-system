import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Asset, AssetAssignment } from '../../types';
import { assetApi, assignmentApi } from '../../services/api';
import { v4 as uuidv4 } from 'uuid';

interface AssetsState {
    items: Asset[];
    assignments: AssetAssignment[];
    loading: boolean;
    error: string | null;
}

const initialState: AssetsState = {
    items: [],
    assignments: [],
    loading: false,
    error: null,
};

export const fetchAssets = createAsyncThunk(
    'assets/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await assetApi.getAll();
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch assets');
        }
    }
);

export const fetchAssignments = createAsyncThunk(
    'assets/fetchAssignments',
    async (_, { rejectWithValue }) => {
        try {
            const response = await assignmentApi.getAll();
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to fetch assignments');
        }
    }
);

export const addAsset = createAsyncThunk(
    'assets/add',
    async (asset: Omit<Asset, 'id'> & { id: string }, { rejectWithValue }) => {
        try {
            const response = await assetApi.create(asset);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to add asset');
        }
    }
);

export const updateAsset = createAsyncThunk(
    'assets/update',
    async ({ id, data }: { id: string; data: Partial<Asset> }, { rejectWithValue }) => {
        try {
            const response = await assetApi.update(id, data);
            return response.data;
        } catch (error) {
            return rejectWithValue('Failed to update asset');
        }
    }
);

export const deleteAsset = createAsyncThunk(
    'assets/delete',
    async (id: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { assets: AssetsState };
            const asset = state.assets.items.find((a) => a.id === id);
            if (asset && asset.status === 'Assigned') {
                return rejectWithValue(
                    'Cannot delete an assigned asset. Please return the asset first.'
                );
            }
            await assetApi.delete(id);
            return id;
        } catch (error) {
            if (typeof error === 'string') return rejectWithValue(error);
            return rejectWithValue('Failed to delete asset');
        }
    }
);

export const assignAsset = createAsyncThunk(
    'assets/assign',
    async (
        {
            assetId,
            employeeId,
            assetName,
            employeeName,
        }: {
            assetId: string;
            employeeId: string;
            assetName: string;
            employeeName: string;
        },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as { assets: AssetsState };
            const asset = state.assets.items.find((a) => a.id === assetId);

            if (!asset) {
                return rejectWithValue('Asset not found');
            }
            if (asset.status === 'Assigned') {
                return rejectWithValue('Asset is already assigned to another employee');
            }
            if (asset.status === 'Repair') {
                return rejectWithValue('Cannot assign an asset that is under repair');
            }

            // Update asset status
            const updatedAsset = await assetApi.update(assetId, {
                ...asset,
                status: 'Assigned',
                assignedTo: employeeId,
            });

            // Create assignment record
            const assignment: AssetAssignment = {
                id: uuidv4(),
                assetId,
                employeeId,
                assetName,
                employeeName,
                assignedDate: new Date().toISOString().split('T')[0],
                returnedDate: null,
                status: 'Active',
            };
            await assignmentApi.create(assignment);

            return { asset: updatedAsset.data, assignment };
        } catch (error) {
            if (typeof error === 'string') return rejectWithValue(error);
            return rejectWithValue('Failed to assign asset');
        }
    }
);

export const returnAsset = createAsyncThunk(
    'assets/return',
    async (
        { assetId, assignmentId }: { assetId: string; assignmentId: string },
        { getState, rejectWithValue }
    ) => {
        try {
            const state = getState() as { assets: AssetsState };
            const asset = state.assets.items.find((a) => a.id === assetId);

            if (!asset) {
                return rejectWithValue('Asset not found');
            }

            // Update asset
            const updatedAsset = await assetApi.update(assetId, {
                ...asset,
                status: 'Available',
                assignedTo: null,
            });

            // Update assignment
            const assignment = state.assets.assignments.find((a) => a.id === assignmentId);
            if (assignment) {
                await assignmentApi.update(assignmentId, {
                    ...assignment,
                    returnedDate: new Date().toISOString().split('T')[0],
                    status: 'Returned',
                });
            }

            return {
                asset: updatedAsset.data,
                assignmentId,
                returnedDate: new Date().toISOString().split('T')[0],
            };
        } catch (error) {
            return rejectWithValue('Failed to return asset');
        }
    }
);

const assetsSlice = createSlice({
    name: 'assets',
    initialState,
    reducers: {
        clearAssetError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Assets
            .addCase(fetchAssets.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAssets.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchAssets.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Fetch Assignments
            .addCase(fetchAssignments.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchAssignments.fulfilled, (state, action) => {
                state.loading = false;
                state.assignments = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchAssignments.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Add
            .addCase(addAsset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addAsset.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(addAsset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Update
            .addCase(updateAsset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateAsset.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex((a) => a.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateAsset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Delete
            .addCase(deleteAsset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteAsset.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter((a) => a.id !== action.payload);
            })
            .addCase(deleteAsset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Assign
            .addCase(assignAsset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(assignAsset.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex(
                    (a) => a.id === action.payload.asset.id
                );
                if (index !== -1) {
                    state.items[index] = action.payload.asset;
                }
                state.assignments.push(action.payload.assignment);
            })
            .addCase(assignAsset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Return
            .addCase(returnAsset.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(returnAsset.fulfilled, (state, action) => {
                state.loading = false;
                const assetIndex = state.items.findIndex(
                    (a) => a.id === action.payload.asset.id
                );
                if (assetIndex !== -1) {
                    state.items[assetIndex] = action.payload.asset;
                }
                const assignmentIndex = state.assignments.findIndex(
                    (a) => a.id === action.payload.assignmentId
                );
                if (assignmentIndex !== -1) {
                    state.assignments[assignmentIndex].status = 'Returned';
                    state.assignments[assignmentIndex].returnedDate =
                        action.payload.returnedDate;
                }
            })
            .addCase(returnAsset.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearAssetError } = assetsSlice.actions;
export default assetsSlice.reducer;
