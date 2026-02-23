import type { Employee, Asset, AssetAssignment } from '../types';

const BASE_URL = 'https://jsonplaceholder.typicode.com';

// Local Storage Keys
const STORAGE_KEYS = {
    EMPLOYEES: 'ems_employees',
    ASSETS: 'ems_assets',
    ASSIGNMENTS: 'ems_assignments',
};

// Helper to get from local storage
const getLocal = <T>(key: string): T[] | null => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
};

// Helper to save to local storage
const setLocal = <T>(key: string, data: T[]) => {
    localStorage.setItem(key, JSON.stringify(data));
};

// Simulated fetch that handles persistence
const simulatedFetch = async <T>(
    key: string,
    initialFetch: () => Promise<T[]>,
    method: string = 'GET',
    body?: any,
    id?: string
): Promise<{ data: any }> => {
    let currentData = getLocal<any>(key);

    // Initial Seeding
    if (!currentData) {
        currentData = await initialFetch();
        setLocal(key, currentData);
    }

    // Simulate Network Latency
    await new Promise(resolve => setTimeout(resolve, 300));

    switch (method) {
        case 'GET':
            if (id) {
                const item = currentData.find((i: any) => i.id === id);
                return { data: item };
            }
            return { data: currentData };

        case 'POST':
            const newItem = { ...body, id: body.id || Math.random().toString(36).substr(2, 9) };
            currentData.push(newItem);
            setLocal(key, currentData);
            return { data: newItem };

        case 'PUT':
            const index = currentData.findIndex((i: any) => i.id === id);
            if (index !== -1) {
                currentData[index] = { ...currentData[index], ...body };
                setLocal(key, currentData);
                return { data: currentData[index] };
            }
            throw new Error('Item not found');

        case 'DELETE':
            const filteredData = currentData.filter((i: any) => i.id !== id);
            setLocal(key, filteredData);
            return { data: null };

        default:
            return { data: currentData };
    }
};

// Employee API
export const employeeApi = {
    getAll: () => simulatedFetch<Employee>(STORAGE_KEYS.EMPLOYEES, async () => {
        const res = await fetch(`${BASE_URL}/users`);
        const users = await res.json();
        return users.map((u: any) => ({
            id: u.id.toString(),
            name: u.name,
            email: u.email,
            department: u.company.name,
            role: 'Employee',
            status: 'Active',
        }));
    }),
    getById: (id: string) => simulatedFetch<Employee>(STORAGE_KEYS.EMPLOYEES, async () => [], 'GET', null, id),
    create: (data: any) => simulatedFetch<Employee>(STORAGE_KEYS.EMPLOYEES, async () => [], 'POST', data),
    update: (id: string, data: any) => simulatedFetch<Employee>(STORAGE_KEYS.EMPLOYEES, async () => [], 'PUT', data, id),
    delete: (id: string) => simulatedFetch<void>(STORAGE_KEYS.EMPLOYEES, async () => [], 'DELETE', null, id),
};

// Asset API
export const assetApi = {
    getAll: () => simulatedFetch<Asset>(STORAGE_KEYS.ASSETS, async () => {
        const res = await fetch(`${BASE_URL}/todos`);
        const todos = await res.json();
        return todos.slice(0, 10).map((t: any) => ({
            id: t.id.toString(),
            assetName: t.title.substring(0, 20),
            assetType: 'Hardware',
            serialNumber: `SN-${t.id}`,
            purchaseDate: '2024-01-01',
            status: t.completed ? 'Available' : 'Assigned',
            assignedTo: null,
        }));
    }),
    getById: (id: string) => simulatedFetch<Asset>(STORAGE_KEYS.ASSETS, async () => [], 'GET', null, id),
    create: (data: any) => simulatedFetch<Asset>(STORAGE_KEYS.ASSETS, async () => [], 'POST', data),
    update: (id: string, data: any) => simulatedFetch<Asset>(STORAGE_KEYS.ASSETS, async () => [], 'PUT', data, id),
    delete: (id: string) => simulatedFetch<void>(STORAGE_KEYS.ASSETS, async () => [], 'DELETE', null, id),
};

// Assignment API
export const assignmentApi = {
    getAll: () => simulatedFetch<AssetAssignment>(STORAGE_KEYS.ASSIGNMENTS, async () => {
        const res = await fetch(`${BASE_URL}/posts`);
        const posts = await res.json();
        return posts.slice(0, 5).map((p: any) => ({
            id: p.id.toString(),
            assetId: (p.id + 100).toString(),
            employeeId: p.userId.toString(),
            assetName: p.title.substring(0, 15),
            employeeName: `User ${p.userId}`,
            assignedDate: '2024-02-01',
            returnedDate: null,
            status: 'Active',
        }));
    }),
    create: (data: any) => simulatedFetch<AssetAssignment>(STORAGE_KEYS.ASSIGNMENTS, async () => [], 'POST', data),
    update: (id: string, data: any) => simulatedFetch<AssetAssignment>(STORAGE_KEYS.ASSIGNMENTS, async () => [], 'PUT', data, id),
};

export default simulatedFetch;
