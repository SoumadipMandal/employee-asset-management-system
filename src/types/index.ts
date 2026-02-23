export interface Employee {
    id: string;
    name: string;
    email: string;
    department: string;
    role: string;
    status: 'Active' | 'Inactive';
}

export interface Asset {
    id: string;
    assetName: string;
    assetType: string;
    serialNumber: string;
    purchaseDate: string;
    status: 'Available' | 'Assigned' | 'Repair';
    assignedTo: string | null;
}

export interface AssetAssignment {
    id: string;
    assetId: string;
    employeeId: string;
    assetName: string;
    employeeName: string;
    assignedDate: string;
    returnedDate: string | null;
    status: 'Active' | 'Returned';
}

export interface AuthUser {
    email: string;
    name: string;
    role: string;
}

export interface DashboardStats {
    totalEmployees: number;
    totalAssets: number;
    assignedAssets: number;
    availableAssets: number;
    repairAssets: number;
}
