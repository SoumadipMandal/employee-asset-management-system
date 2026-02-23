import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AuthUser } from '../../types';

interface AuthState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    isAuthenticated: false,
    error: null,
};

const ADMIN_CREDENTIALS = {
    email: 'admin@company.com',
    password: 'admin123',
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        login(state, action: PayloadAction<{ email: string; password: string }>) {
            const { email, password } = action.payload;
            if (
                email === ADMIN_CREDENTIALS.email &&
                password === ADMIN_CREDENTIALS.password
            ) {
                state.user = {
                    email,
                    name: 'Admin User',
                    role: 'Administrator',
                };
                state.isAuthenticated = true;
                state.error = null;
            } else {
                state.error = 'Invalid email or password';
                state.isAuthenticated = false;
                state.user = null;
            }
        },
        logout(state) {
            state.user = null;
            state.isAuthenticated = false;
            state.error = null;
        },
        clearError(state) {
            state.error = null;
        },
    },
});

export const { login, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
