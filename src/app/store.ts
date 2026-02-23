import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from '../features/auth/authSlice';
import employeesReducer from '../features/employees/employeesSlice';
import assetsReducer from '../features/assets/assetsSlice';

const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isAuthenticated'],
};

const rootReducer = combineReducers({
    auth: persistReducer(authPersistConfig, authReducer),
    employees: employeesReducer,
    assets: assetsReducer,
});

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
