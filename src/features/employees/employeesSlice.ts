import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { Employee } from '../../types';
import { employeeApi } from '../../services/api';

interface EmployeesState {
    items: Employee[];
    loading: boolean;
    error: string | null;
}

const initialState: EmployeesState = {
    items: [],
    loading: false,
    error: null,
};

export const fetchEmployees = createAsyncThunk(
    'employees/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await employeeApi.getAll();
            return response.data;
        } catch {
            return rejectWithValue('Failed to fetch employees');
        }
    }
);

export const addEmployee = createAsyncThunk(
    'employees/add',
    async (employee: Omit<Employee, 'id'> & { id: string }, { rejectWithValue }) => {
        try {
            const response = await employeeApi.create(employee);
            return response.data;
        } catch {
            return rejectWithValue('Failed to add employee');
        }
    }
);

export const updateEmployee = createAsyncThunk(
    'employees/update',
    async ({ id, data }: { id: string; data: Partial<Employee> }, { rejectWithValue }) => {
        try {
            const response = await employeeApi.update(id, data);
            return response.data;
        } catch {
            return rejectWithValue('Failed to update employee');
        }
    }
);

interface AssetItem {
    assignedTo: string | null;
    assetName: string;
}

export const deleteEmployee = createAsyncThunk(
    'employees/delete',
    async (id: string, { getState, rejectWithValue }) => {
        try {
            const state = getState() as { assets: { items: AssetItem[] } };
            const assignedAsset = state.assets.items.find(
                (asset: AssetItem) => asset.assignedTo === id
            );
            if (assignedAsset) {
                return rejectWithValue(
                    `Cannot delete employee: Asset "${assignedAsset.assetName}" is currently assigned to them. Please return the asset first.`
                );
            }
            await employeeApi.delete(id);
            return id;
        } catch (err) {
            if (typeof err === 'string') return rejectWithValue(err);
            return rejectWithValue('Failed to delete employee');
        }
    }
);

const employeesSlice = createSlice({
    name: 'employees',
    initialState,
    reducers: {
        clearEmployeeError(state) {
            state.error = null;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEmployees.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchEmployees.fulfilled, (state, action) => {
                state.loading = false;
                state.items = Array.isArray(action.payload) ? action.payload : [];
            })
            .addCase(fetchEmployees.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(addEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.items.push(action.payload);
            })
            .addCase(addEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(updateEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateEmployee.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.items.findIndex((e) => e.id === action.payload.id);
                if (index !== -1) {
                    state.items[index] = action.payload;
                }
            })
            .addCase(updateEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(deleteEmployee.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteEmployee.fulfilled, (state, action) => {
                state.loading = false;
                state.items = state.items.filter((e) => e.id !== action.payload);
            })
            .addCase(deleteEmployee.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    },
});

export const { clearEmployeeError } = employeesSlice.actions;
export default employeesSlice.reducer;
