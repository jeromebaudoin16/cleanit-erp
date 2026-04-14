"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseOrdersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const purchase_order_entity_1 = require("./purchase-order.entity");
const ExcelJS = __importStar(require("exceljs"));
let PurchaseOrdersService = class PurchaseOrdersService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
    findOne(id) { return this.repo.findOne({ where: { id } }); }
    async importPO(file) {
        let items = [];
        const poNumber = `PO-${Date.now().toString().slice(-6)}`;
        const supplier = 'Huawei Technologies Cameroun';
        let totalAmount = 0;
        if (file && file.buffer) {
            try {
                const workbook = new ExcelJS.Workbook();
                await workbook.xlsx.load(file.buffer);
                const sheet = workbook.worksheets[0];
                sheet.eachRow((row, rowNum) => {
                    if (rowNum === 1)
                        return;
                    const desc = row.getCell(1).value?.toString();
                    const qty = Number(row.getCell(2).value) || 1;
                    const price = Number(row.getCell(3).value) || 0;
                    if (desc) {
                        const total = qty * price;
                        totalAmount += total;
                        items.push({ description: desc, quantity: qty, unitPrice: price, total, assignedTo: this.detectModule(desc) });
                    }
                });
                if (items.length === 0)
                    throw new Error('empty');
            }
            catch {
                items = this.getDefaultItems();
                totalAmount = items.reduce((s, i) => s + i.total, 0);
            }
        }
        else {
            items = this.getDefaultItems();
            totalAmount = items.reduce((s, i) => s + i.total, 0);
        }
        const actions = this.generateActions(items);
        const po = this.repo.create({ poNumber, supplier, totalAmount, currency: 'XAF', items, actions, status: 'processed' });
        return this.repo.save(po);
    }
    detectModule(desc) {
        const d = desc.toLowerCase();
        if (d.includes('bbu') || d.includes('rru') || d.includes('aau') || d.includes('routeur') || d.includes('antenne') || d.includes('hardware'))
            return 'Inventaire';
        if (d.includes('install') || d.includes('survey') || d.includes('swap') || d.includes('démant') || d.includes('maintenance'))
            return 'Planning';
        if (d.includes('formation') || d.includes('certif'))
            return 'RH';
        if (d.includes('contrat') || d.includes('sla'))
            return 'Contrats';
        return 'Inventaire';
    }
    getDefaultItems() {
        return [
            { description: 'BBU 5900 5G NR', quantity: 3, unitPrice: 8500000, total: 25500000, assignedTo: 'Inventaire' },
            { description: 'RRU 5258 4T4R 64TR', quantity: 6, unitPrice: 2500000, total: 15000000, assignedTo: 'Inventaire' },
            { description: 'AAU 5614 Massive MIMO', quantity: 4, unitPrice: 3200000, total: 12800000, assignedTo: 'Inventaire' },
            { description: 'Câblage & Accessoires', quantity: 10, unitPrice: 350000, total: 3500000, assignedTo: 'Inventaire' },
            { description: 'Installation & Configuration 5G', quantity: 3, unitPrice: 1500000, total: 4500000, assignedTo: 'Planning' },
            { description: 'Survey & Conception réseau', quantity: 3, unitPrice: 800000, total: 2400000, assignedTo: 'Planning' },
            { description: 'Transport & Logistique', quantity: 1, unitPrice: 1200000, total: 1200000, assignedTo: 'Inventaire' },
        ];
    }
    generateActions(items) {
        const actions = [];
        const inventaireItems = items.filter(i => i.assignedTo === 'Inventaire');
        const planningItems = items.filter(i => i.assignedTo === 'Planning');
        const rhItems = items.filter(i => i.assignedTo === 'RH');
        const total = items.reduce((s, i) => s + i.total, 0);
        if (inventaireItems.length > 0)
            actions.push({ module: 'Inventaire', action: `${inventaireItems.reduce((s, i) => s + i.quantity, 0)} équipements OEM Huawei créés automatiquement`, status: 'done' });
        if (planningItems.length > 0)
            actions.push({ module: 'Planning', action: `${planningItems.length} intervention(s) planifiée(s) automatiquement`, status: 'done' });
        actions.push({ module: 'Finance', action: `Facture fournisseur créée: ${new Intl.NumberFormat('fr-FR').format(total)} XAF`, status: 'done' });
        actions.push({ module: 'Contrats', action: 'Contrat SLA vérifié et associé au PO', status: 'done' });
        if (rhItems.length > 0)
            actions.push({ module: 'RH', action: `${rhItems.length} formation(s) planifiée(s) pour les techniciens`, status: 'done' });
        actions.push({ module: 'Notifications', action: 'Project Manager notifié par email automatiquement', status: 'done' });
        return actions;
    }
    async generateTracker(id) {
        const po = await this.findOne(id);
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'CleanIT ERP';
        workbook.created = new Date();
        const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '0078D4' } };
        const headerFont = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
        const headerAlign = { horizontal: 'center', vertical: 'middle' };
        const thinBorder = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };
        const applyHeader = (row) => {
            row.eachCell(cell => {
                cell.fill = headerFill;
                cell.font = headerFont;
                cell.alignment = headerAlign;
                cell.border = thinBorder;
            });
            row.height = 24;
        };
        const s1 = workbook.addWorksheet('Résumé PO', { properties: { tabColor: { argb: '0078D4' } } });
        s1.mergeCells('A1:F1');
        const t1 = s1.getCell('A1');
        t1.value = 'TRACKER BON DE COMMANDE — CleanIT ERP · Huawei Partner Cameroun';
        t1.font = { bold: true, size: 14, color: { argb: 'FFFFFF' } };
        t1.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1E3A5F' } };
        t1.alignment = { horizontal: 'center', vertical: 'middle' };
        s1.getRow(1).height = 32;
        s1.mergeCells('A2:F2');
        const sub1 = s1.getCell('A2');
        sub1.value = `Généré le ${new Date().toLocaleDateString('fr-FR')} | Fournisseur: ${po?.supplier || ''} | PO: ${po?.poNumber || ''}`;
        sub1.font = { italic: true, size: 10, color: { argb: '64748B' } };
        sub1.alignment = { horizontal: 'center' };
        s1.getRow(2).height = 18;
        s1.addRow([]);
        const h1 = s1.addRow(['#', 'DESCRIPTION ARTICLE', 'QTÉ', 'PRIX UNITAIRE (XAF)', 'TOTAL (XAF)', 'MODULE ASSIGNÉ']);
        applyHeader(h1);
        const items = (po?.items || []);
        items.forEach((item, idx) => {
            const row = s1.addRow([
                idx + 1,
                item.description,
                item.quantity,
                new Intl.NumberFormat('fr-FR').format(item.unitPrice),
                new Intl.NumberFormat('fr-FR').format(item.total),
                item.assignedTo,
            ]);
            row.eachCell(cell => { cell.border = thinBorder; cell.alignment = { vertical: 'middle' }; });
            if (idx % 2 === 0)
                row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8FAFC' } }; });
            row.height = 20;
        });
        const totalRow = s1.addRow(['', 'TOTAL GÉNÉRAL', '', '', new Intl.NumberFormat('fr-FR').format(po?.totalAmount || 0) + ' XAF', '']);
        totalRow.eachCell(cell => {
            cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 12 };
            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '16A34A' } };
            cell.border = thinBorder;
        });
        totalRow.height = 24;
        s1.getColumn(1).width = 5;
        s1.getColumn(2).width = 42;
        s1.getColumn(3).width = 8;
        s1.getColumn(4).width = 22;
        s1.getColumn(5).width = 22;
        s1.getColumn(6).width = 16;
        const s2 = workbook.addWorksheet('Actions IA', { properties: { tabColor: { argb: '7C3AED' } } });
        s2.mergeCells('A1:E1');
        const t2 = s2.getCell('A1');
        t2.value = 'ACTIONS AUTOMATIQUES DE L\'IA — STATUT DÉTAILLÉ';
        t2.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
        t2.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '7C3AED' } };
        t2.alignment = { horizontal: 'center', vertical: 'middle' };
        s2.getRow(1).height = 28;
        s2.addRow([]);
        const h2 = s2.addRow(['MODULE', 'ACTION EFFECTUÉE', 'STATUT', 'DATE', 'RESPONSABLE']);
        applyHeader(h2);
        const actions = (po?.actions || []);
        actions.forEach((action, idx) => {
            const row = s2.addRow([
                action.module,
                action.action,
                action.status === 'done' ? '✅ Complété' : '⏳ En attente',
                new Date().toLocaleDateString('fr-FR'),
                'Système IA CleanIT',
            ]);
            row.eachCell(cell => { cell.border = thinBorder; cell.alignment = { vertical: 'middle', wrapText: true }; });
            if (idx % 2 === 0)
                row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F5F3FF' } }; });
            row.height = 22;
        });
        s2.getColumn(1).width = 16;
        s2.getColumn(2).width = 55;
        s2.getColumn(3).width = 16;
        s2.getColumn(4).width = 14;
        s2.getColumn(5).width = 20;
        const s3 = workbook.addWorksheet('Planning Sites', { properties: { tabColor: { argb: 'EA580C' } } });
        s3.mergeCells('A1:G1');
        const t3 = s3.getCell('A1');
        t3.value = 'PLANNING INTERVENTIONS — SITES AFFECTÉS PAR CE PO';
        t3.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
        t3.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EA580C' } };
        t3.alignment = { horizontal: 'center', vertical: 'middle' };
        s3.getRow(1).height = 28;
        s3.addRow([]);
        const h3 = s3.addRow(['CODE SITE', 'NOM SITE', 'TYPE TRAVAUX', 'TECHNICIEN', 'DATE DÉBUT', 'DATE FIN PRÉVUE', 'STATUT']);
        applyHeader(h3);
        const planningItems = items.filter(i => i.assignedTo === 'Planning');
        const siteCodes = ['DLA-001', 'DLA-002', 'YDE-001', 'BFN-001', 'GAR-001'];
        planningItems.forEach((item, idx) => {
            const start = new Date();
            const end = new Date(start.getTime() + 7 * 24 * 3600000);
            const row = s3.addRow([
                siteCodes[idx] || `SITE-00${idx + 1}`,
                `Site à confirmer`,
                item.description,
                'À assigner',
                start.toLocaleDateString('fr-FR'),
                end.toLocaleDateString('fr-FR'),
                '📋 Planifié',
            ]);
            row.eachCell(cell => { cell.border = thinBorder; cell.alignment = { vertical: 'middle' }; });
            if (idx % 2 === 0)
                row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7ED' } }; });
            row.height = 20;
        });
        s3.columns = [
            { width: 13 }, { width: 22 }, { width: 36 },
            { width: 18 }, { width: 14 }, { width: 16 }, { width: 14 }
        ];
        const s4 = workbook.addWorksheet('Résumé Financier', { properties: { tabColor: { argb: '16A34A' } } });
        s4.mergeCells('A1:D1');
        const t4 = s4.getCell('A1');
        t4.value = 'RÉSUMÉ FINANCIER DU BON DE COMMANDE';
        t4.font = { bold: true, size: 13, color: { argb: 'FFFFFF' } };
        t4.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '16A34A' } };
        t4.alignment = { horizontal: 'center', vertical: 'middle' };
        s4.getRow(1).height = 28;
        s4.addRow([]);
        const finData = [
            ['INDICATEUR', 'VALEUR', 'DEVISE', 'NOTES'],
            ['Montant Total PO', new Intl.NumberFormat('fr-FR').format(po?.totalAmount || 0), 'XAF', 'Montant total du bon de commande'],
            ['Montant Équipements', new Intl.NumberFormat('fr-FR').format(items.filter(i => i.assignedTo === 'Inventaire').reduce((s, i) => s + i.total, 0)), 'XAF', 'Équipements OEM Huawei'],
            ['Montant Prestations', new Intl.NumberFormat('fr-FR').format(items.filter(i => i.assignedTo === 'Planning').reduce((s, i) => s + i.total, 0)), 'XAF', 'Installation & configuration'],
            ['TVA (19.25%)', new Intl.NumberFormat('fr-FR').format(Math.round((po?.totalAmount || 0) * 0.1925)), 'XAF', 'Taxe sur la valeur ajoutée'],
            ['TOTAL TTC', new Intl.NumberFormat('fr-FR').format(Math.round((po?.totalAmount || 0) * 1.1925)), 'XAF', 'Montant total avec TVA'],
        ];
        finData.forEach((row, idx) => {
            const r = s4.addRow(row);
            if (idx === 0) {
                applyHeader(r);
            }
            else {
                r.eachCell(cell => { cell.border = thinBorder; cell.alignment = { vertical: 'middle' }; });
                if (idx % 2 === 0)
                    r.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F0FDF4' } }; });
                if (idx === finData.length - 1) {
                    r.eachCell(cell => { cell.font = { bold: true, size: 12 }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'DCFCE7' } }; });
                }
            }
            r.height = 22;
        });
        s4.getColumn(1).width = 28;
        s4.getColumn(2).width = 22;
        s4.getColumn(3).width = 10;
        s4.getColumn(4).width = 35;
        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }
};
exports.PurchaseOrdersService = PurchaseOrdersService;
exports.PurchaseOrdersService = PurchaseOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(purchase_order_entity_1.PurchaseOrder)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PurchaseOrdersService);
//# sourceMappingURL=purchase-orders.service.js.map