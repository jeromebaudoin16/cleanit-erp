export declare class Site {
    id: number;
    code: string;
    name: string;
    region: string;
    ville: string;
    adresse: string;
    latitude: number;
    longitude: number;
    status: string;
    typeTravauxEnum: string;
    technology: string;
    poNumber: string;
    projectManager: string;
    technicienAssigne: string;
    progression: number;
    dateDebut: Date;
    dateFin: Date;
    dateLivraisonPrevue: Date;
    budgetEstime: number;
    budgetReel: number;
    priorite: string;
    notes: string;
    equipements: any[];
    createdAt: Date;
    updatedAt: Date;
}
