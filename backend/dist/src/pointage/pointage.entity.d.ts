export declare enum TypePointage {
    ENTREE = "entree",
    SORTIE = "sortie",
    PAUSE_DEBUT = "pause_debut",
    PAUSE_FIN = "pause_fin"
}
export declare enum TypeEmploye {
    INTERNE = "interne",
    EXTERNE = "externe"
}
export declare class Pointage {
    id: string;
    userId: string;
    userName: string;
    userRole: string;
    type: TypePointage;
    typeEmploye: TypeEmploye;
    latitude: number;
    longitude: number;
    adresse: string;
    siteCode: string;
    siteName: string;
    photoUrl: string;
    horsZone: boolean;
    distanceZone: number;
    notes: string;
    deviceInfo: string;
    valide: boolean;
    validePar: string;
    createdAt: Date;
    heurePointage: Date;
}
