import axios from 'axios';
import type { Employee, Asset, AssetAssignment } from '../types';

const api = axios.create({
    baseURL: 'http://localhost:3001',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Employee API
export const employeeApi = {
    getAll: () => api.get<Employee[]>('/employees'),
    getById: (id: string) => api.get<Employee>(`/employees/${id}`),
    create: (data: Omit<Employee, 'id'> & { id: string }) => api.post<Employee>('/employees', data),
    update: (id: string, data: Partial<Employee>) => api.put<Employee>(`/employees/${id}`, data),
    delete: (id: string) => api.delete(`/employees/${id}`),
};

// Asset API
export const assetApi = {
    getAll: () => api.get<Asset[]>('/assets'),
    getById: (id: string) => api.get<Asset>(`/assets/${id}`),
    create: (data: Omit<Asset, 'id'> & { id: string }) => api.post<Asset>('/assets', data),
    update: (id: string, data: Partial<Asset>) => api.put<Asset>(`/assets/${id}`, data),
    delete: (id: string) => api.delete(`/assets/${id}`),
};

// Assignment API
export const assignmentApi = {
    getAll: () => api.get<AssetAssignment[]>('/assignments'),
    create: (data: AssetAssignment) => api.post<AssetAssignment>('/assignments', data),
    update: (id: string, data: Partial<AssetAssignment>) =>
        api.put<AssetAssignment>(`/assignments/${id}`, data),
};

export default api;
