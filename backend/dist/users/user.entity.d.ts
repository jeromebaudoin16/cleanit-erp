export declare enum UserRole {
    ADMIN = "admin",
    PROJECT_MANAGER = "project_manager",
    TECHNICIAN = "technician",
    FINANCE = "finance",
    HR = "hr",
    VIEWER = "viewer"
}
export declare class User {
    id: number;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone: string;
    avatar: string;
    isActive: boolean;
    latitude: number;
    longitude: number;
    lastSeen: Date;
    createdAt: Date;
    updatedAt: Date;
}
