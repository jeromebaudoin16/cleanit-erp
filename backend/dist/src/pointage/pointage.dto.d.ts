export declare class CreatePointageDto {
    userId: string;
    userName: string;
    userRole: string;
    type: string;
    typeEmploye: string;
    latitude?: number;
    longitude?: number;
    adresse?: string;
    siteCode?: string;
    siteName?: string;
    photoUrl?: string;
    notes?: string;
    deviceInfo?: string;
}
export declare class GetPointagesDto {
    userId?: string;
    dateDebut?: string;
    dateFin?: string;
    type?: string;
    siteCode?: string;
    page?: number;
    limit?: number;
}
