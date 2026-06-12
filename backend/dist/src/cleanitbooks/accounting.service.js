"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const account_entity_1 = require("./account.entity");
const journal_entry_entity_1 = require("./journal_entry.entity");
const journal_line_entity_1 = require("./journal_line.entity");
const payment_entity_1 = require("./payment.entity");
const fiscal_year_entity_1 = require("./fiscal_year.entity");
const invoice_entity_1 = require("./invoice.entity");
const bill_entity_1 = require("./bill.entity");
const PLAN_COMPTABLE_SYSCOHADA = [
    { code: '101000', nom: 'Capital social', classe: '1', type: 'passif' },
    { code: '111000', nom: 'Réserves légales', classe: '1', type: 'passif' },
    { code: '120000', nom: 'Résultat de l\'exercice', classe: '1', type: 'passif' },
    { code: '164000', nom: 'Emprunts bancaires', classe: '1', type: 'passif' },
    { code: '221000', nom: 'Terrains', classe: '2', type: 'actif' },
    { code: '231000', nom: 'Bâtiments', classe: '2', type: 'actif' },
    { code: '241000', nom: 'Matériel et outillage', classe: '2', type: 'actif' },
    { code: '244000', nom: 'Matériel informatique', classe: '2', type: 'actif' },
    { code: '245000', nom: 'Matériel de transport', classe: '2', type: 'actif' },
    { code: '281000', nom: 'Amort. bâtiments', classe: '2', type: 'actif' },
    { code: '284000', nom: 'Amort. matériel informatique', classe: '2', type: 'actif' },
    { code: '311000', nom: 'Marchandises', classe: '3', type: 'actif' },
    { code: '321000', nom: 'Matières premières', classe: '3', type: 'actif' },
    { code: '381000', nom: 'Stock en transit', classe: '3', type: 'actif' },
    { code: '401000', nom: 'Fournisseurs', classe: '4', type: 'passif' },
    { code: '401001', nom: 'Huawei Technologies', classe: '4', type: 'passif' },
    { code: '401002', nom: 'Nokia Networks', classe: '4', type: 'passif' },
    { code: '401003', nom: 'Ericsson', classe: '4', type: 'passif' },
    { code: '408000', nom: 'Fournisseurs - factures non parvenues', classe: '4', type: 'passif' },
    { code: '411000', nom: 'Clients', classe: '4', type: 'actif' },
    { code: '411001', nom: 'MTN Cameroun', classe: '4', type: 'actif' },
    { code: '411002', nom: 'Orange Cameroun', classe: '4', type: 'actif' },
    { code: '411003', nom: 'CAMTEL', classe: '4', type: 'actif' },
    { code: '411004', nom: 'Gouvernement Cameroun', classe: '4', type: 'actif' },
    { code: '418000', nom: 'Clients - produits non encore facturés', classe: '4', type: 'actif' },
    { code: '421000', nom: 'Personnel - rémunérations dues', classe: '4', type: 'passif' },
    { code: '431000', nom: 'Sécurité sociale - CNPS', classe: '4', type: 'passif' },
    { code: '441000', nom: 'État - impôts et taxes', classe: '4', type: 'passif' },
    { code: '443000', nom: 'TVA collectée', classe: '4', type: 'passif' },
    { code: '445000', nom: 'TVA déductible', classe: '4', type: 'actif' },
    { code: '471000', nom: 'Débiteurs divers', classe: '4', type: 'actif' },
    { code: '472000', nom: 'Créditeurs divers', classe: '4', type: 'passif' },
    { code: '521000', nom: 'BICEC - Compte courant', classe: '5', type: 'tresorerie' },
    { code: '521001', nom: 'SGC - Compte courant', classe: '5', type: 'tresorerie' },
    { code: '521002', nom: 'UBA - Compte courant', classe: '5', type: 'tresorerie' },
    { code: '571000', nom: 'Caisse principale', classe: '5', type: 'tresorerie' },
    { code: '572000', nom: 'Mobile Money MTN', classe: '5', type: 'tresorerie' },
    { code: '573000', nom: 'Mobile Money Orange', classe: '5', type: 'tresorerie' },
    { code: '601000', nom: 'Achats de marchandises', classe: '6', type: 'charge' },
    { code: '604000', nom: 'Achats d\'études et prestations', classe: '6', type: 'charge' },
    { code: '605000', nom: 'Achats de matériels et équipements', classe: '6', type: 'charge' },
    { code: '611000', nom: 'Transport et déplacements', classe: '6', type: 'charge' },
    { code: '613000', nom: 'Locations et charges locatives', classe: '6', type: 'charge' },
    { code: '614000', nom: 'Charges d\'entretien', classe: '6', type: 'charge' },
    { code: '615000', nom: 'Primes d\'assurance', classe: '6', type: 'charge' },
    { code: '616000', nom: 'Frais de télécommunications', classe: '6', type: 'charge' },
    { code: '621000', nom: 'Rémunérations du personnel', classe: '6', type: 'charge' },
    { code: '631000', nom: 'Cotisations sociales - CNPS', classe: '6', type: 'charge' },
    { code: '641000', nom: 'Impôts et taxes', classe: '6', type: 'charge' },
    { code: '651000', nom: 'Pertes sur créances', classe: '6', type: 'charge' },
    { code: '661000', nom: 'Intérêts des emprunts', classe: '6', type: 'charge' },
    { code: '671000', nom: 'Charges exceptionnelles', classe: '6', type: 'charge' },
    { code: '681000', nom: 'Dotations aux amortissements', classe: '6', type: 'charge' },
    { code: '701000', nom: 'Prestations de services télécom', classe: '7', type: 'produit' },
    { code: '701001', nom: 'Installation équipements 5G/4G', classe: '7', type: 'produit' },
    { code: '701002', nom: 'Maintenance réseaux', classe: '7', type: 'produit' },
    { code: '701003', nom: 'Déploiement fibre optique', classe: '7', type: 'produit' },
    { code: '701004', nom: 'Audit et conseil télécom', classe: '7', type: 'produit' },
    { code: '706000', nom: 'Prestations diverses', classe: '7', type: 'produit' },
    { code: '707000', nom: 'Produits accessoires', classe: '7', type: 'produit' },
    { code: '741000', nom: 'Subventions d\'exploitation', classe: '7', type: 'produit' },
    { code: '771000', nom: 'Produits financiers', classe: '7', type: 'produit' },
    { code: '781000', nom: 'Reprises sur amortissements', classe: '7', type: 'produit' },
];
let AccountingService = class AccountingService {
    accountRepo;
    jnlRepo;
    lineRepo;
    paymentRepo;
    fyRepo;
    invoiceRepo;
    billRepo;
    jnlCounter = 1;
    payCounter = 1;
    constructor(accountRepo, jnlRepo, lineRepo, paymentRepo, fyRepo, invoiceRepo, billRepo) {
        this.accountRepo = accountRepo;
        this.jnlRepo = jnlRepo;
        this.lineRepo = lineRepo;
        this.paymentRepo = paymentRepo;
        this.fyRepo = fyRepo;
        this.invoiceRepo = invoiceRepo;
        this.billRepo = billRepo;
    }
    async initPlanComptable() {
        const count = await this.accountRepo.count();
        if (count > 0)
            return { message: 'Plan comptable déjà initialisé', count };
        const accounts = PLAN_COMPTABLE_SYSCOHADA.map(a => this.accountRepo.create(a));
        await this.accountRepo.save(accounts);
        return { message: 'Plan comptable SYSCOHADA initialisé', count: accounts.length };
    }
    findAllAccounts() {
        return this.accountRepo.find({ order: { code: 'ASC' } });
    }
    findAccountsByClasse(classe) {
        return this.accountRepo.find({ where: { classe }, order: { code: 'ASC' } });
    }
    async updateAccountBalance(code, debit, credit) {
        const account = await this.accountRepo.findOneBy({ code });
        if (!account)
            return;
        account.soldeDebit = Number(account.soldeDebit) + debit;
        account.soldeCredit = Number(account.soldeCredit) + credit;
        return this.accountRepo.save(account);
    }
    async nextJnlNum() {
        const count = await this.jnlRepo.count();
        return `JNL-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    async nextPayNum() {
        const count = await this.paymentRepo.count();
        return `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;
    }
    async generateInvoiceEntry(invoice) {
        const tva = Math.round(invoice.total * 0.1925 / 1.1925);
        const ht = invoice.total - tva;
        const numero = await this.nextJnlNum();
        const entry = this.jnlRepo.create({
            numero,
            date: invoice.date || new Date().toISOString().split('T')[0],
            journal: 'VENTES',
            libelle: `Facture ${invoice.id} — ${invoice.customerId}`,
            pieceRef: invoice.id,
            pieceType: 'invoice',
            totalDebit: invoice.total,
            totalCredit: invoice.total,
            statut: 'validated',
            lines: [
                {
                    accountCode: '411000', accountNom: 'Clients',
                    libelle: `FAC ${invoice.id}`, debit: invoice.total, credit: 0,
                    tiers: invoice.customerId,
                },
                {
                    accountCode: '701001', accountNom: 'Prestations télécom',
                    libelle: `FAC ${invoice.id} — Prestations`, debit: 0, credit: ht,
                    tiers: invoice.customerId,
                },
                {
                    accountCode: '443000', accountNom: 'TVA collectée 19.25%',
                    libelle: `TVA FAC ${invoice.id}`, debit: 0, credit: tva,
                    tiers: null,
                },
            ],
        });
        const saved = await this.jnlRepo.save(entry);
        await this.updateAccountBalance('411000', invoice.total, 0);
        await this.updateAccountBalance('701001', 0, ht);
        await this.updateAccountBalance('443000', 0, tva);
        return saved;
    }
    async generateBillEntry(bill) {
        const tva = Math.round(bill.total * 0.1925 / 1.1925);
        const ht = bill.total - tva;
        const numero = await this.nextJnlNum();
        const entry = this.jnlRepo.create({
            numero,
            date: bill.date || new Date().toISOString().split('T')[0],
            journal: 'ACHATS',
            libelle: `Bill ${bill.id} — ${bill.vendorId}`,
            pieceRef: bill.id,
            pieceType: 'bill',
            totalDebit: bill.total,
            totalCredit: bill.total,
            lines: [
                {
                    accountCode: '604000', accountNom: 'Achats prestations',
                    libelle: `BILL ${bill.id}`, debit: ht, credit: 0,
                    tiers: bill.vendorId,
                },
                {
                    accountCode: '445000', accountNom: 'TVA déductible',
                    libelle: `TVA BILL ${bill.id}`, debit: tva, credit: 0,
                    tiers: null,
                },
                {
                    accountCode: '401000', accountNom: 'Fournisseurs',
                    libelle: `BILL ${bill.id}`, debit: 0, credit: bill.total,
                    tiers: bill.vendorId,
                },
            ],
        });
        const saved = await this.jnlRepo.save(entry);
        await this.updateAccountBalance('604000', ht, 0);
        await this.updateAccountBalance('445000', tva, 0);
        await this.updateAccountBalance('401000', 0, bill.total);
        return saved;
    }
    async receivePayment(dto) {
        const numero = await this.nextPayNum();
        const lettrage = `LET-${Date.now().toString().slice(-6)}`;
        const compteBank = '521000';
        const payment = await this.paymentRepo.save(this.paymentRepo.create({
            numero, date: dto.date, type: 'receipt',
            customerId: dto.customerId, invoiceId: dto.invoiceId,
            montant: dto.montant, methode: dto.methode,
            reference: dto.reference, lettrage,
        }));
        const invoice = await this.invoiceRepo.findOneBy({ id: dto.invoiceId });
        if (invoice) {
            const newPaid = Number(invoice.amountPaid || 0) + dto.montant;
            const newBalance = Math.max(0, Number(invoice.total) - newPaid);
            await this.invoiceRepo.update(dto.invoiceId, {
                amountPaid: newPaid,
                balance: newBalance,
                status: newBalance === 0 ? 'Paid' : 'Partial',
            });
        }
        const jnlNum = await this.nextJnlNum();
        const entry = await this.jnlRepo.save(this.jnlRepo.create({
            numero: jnlNum, date: dto.date, journal: 'BANQUE',
            libelle: `Encaissement ${dto.reference} — ${dto.customerId}`,
            pieceRef: payment.id, pieceType: 'payment',
            totalDebit: dto.montant, totalCredit: dto.montant,
            lines: [
                {
                    accountCode: compteBank, accountNom: 'BICEC - Compte courant',
                    libelle: `Encais. ${dto.reference}`, debit: dto.montant, credit: 0,
                    tiers: dto.customerId, lettrage,
                },
                {
                    accountCode: '411000', accountNom: 'Clients',
                    libelle: `Encais. ${dto.reference}`, debit: 0, credit: dto.montant,
                    tiers: dto.customerId, lettrage,
                },
            ],
        }));
        await this.updateAccountBalance(compteBank, dto.montant, 0);
        await this.updateAccountBalance('411000', 0, dto.montant);
        return { payment, entry, lettrage };
    }
    async payBill(dto) {
        const numero = await this.nextPayNum();
        const lettrage = `LET-${Date.now().toString().slice(-6)}`;
        const payment = await this.paymentRepo.save(this.paymentRepo.create({
            numero, date: dto.date, type: 'payment',
            vendorId: dto.vendorId, billId: dto.billId,
            montant: dto.montant, methode: dto.methode,
            reference: dto.reference, lettrage,
        }));
        const bill = await this.billRepo.findOneBy({ id: dto.billId });
        if (bill) {
            const newPaid = Number(bill.amountPaid || 0) + dto.montant;
            const newBalance = Math.max(0, Number(bill.total) - newPaid);
            await this.billRepo.update(dto.billId, {
                amountPaid: newPaid, balance: newBalance,
                status: newBalance === 0 ? 'Paid' : 'Partial',
            });
        }
        const jnlNum = await this.nextJnlNum();
        const entry = await this.jnlRepo.save(this.jnlRepo.create({
            numero: jnlNum, date: dto.date, journal: 'BANQUE',
            libelle: `Paiement ${dto.reference} — ${dto.vendorId}`,
            pieceRef: payment.id, pieceType: 'payment',
            totalDebit: dto.montant, totalCredit: dto.montant,
            lines: [
                {
                    accountCode: '401000', accountNom: 'Fournisseurs',
                    libelle: `Pmt ${dto.reference}`, debit: dto.montant, credit: 0,
                    tiers: dto.vendorId, lettrage,
                },
                {
                    accountCode: '521000', accountNom: 'BICEC - Compte courant',
                    libelle: `Pmt ${dto.reference}`, debit: 0, credit: dto.montant,
                    tiers: dto.vendorId, lettrage,
                },
            ],
        }));
        await this.updateAccountBalance('401000', dto.montant, 0);
        await this.updateAccountBalance('521000', 0, dto.montant);
        return { payment, entry };
    }
    async getGrandLivre(accountCode, dateDebut, dateFin) {
        const query = this.lineRepo.createQueryBuilder('line')
            .leftJoinAndSelect('line.entry', 'entry')
            .orderBy('entry.date', 'ASC');
        if (accountCode)
            query.where('line.accountCode = :code', { code: accountCode });
        const lines = await query.getMany();
        const grouped = {};
        lines.forEach(l => {
            const code = l.accountCode;
            if (!grouped[code])
                grouped[code] = [];
            grouped[code].push({ ...l, entryDate: l.entry?.date, entryNum: l.entry?.numero, journal: l.entry?.journal });
        });
        return grouped;
    }
    async getBalance() {
        const accounts = await this.accountRepo.find({ order: { code: 'ASC' } });
        let totalDebit = 0, totalCredit = 0;
        const rows = accounts.map(a => {
            const d = Number(a.soldeDebit);
            const c = Number(a.soldeCredit);
            totalDebit += d;
            totalCredit += c;
            return { code: a.code, nom: a.nom, classe: a.classe, type: a.type, debit: d, credit: c, solde: d - c };
        });
        return { rows, totalDebit, totalCredit, equilibre: Math.abs(totalDebit - totalCredit) < 1 };
    }
    async getPL(dateDebut, dateFin) {
        const accounts = await this.accountRepo.find({ order: { code: 'ASC' } });
        const produits = accounts.filter(a => a.classe === '7').map(a => ({ code: a.code, nom: a.nom, montant: Number(a.soldeCredit) - Number(a.soldeDebit) }));
        const charges = accounts.filter(a => a.classe === '6').map(a => ({ code: a.code, nom: a.nom, montant: Number(a.soldeDebit) - Number(a.soldeCredit) }));
        const totalProduits = produits.reduce((s, a) => s + a.montant, 0);
        const totalCharges = charges.reduce((s, a) => s + a.montant, 0);
        const resultat = totalProduits - totalCharges;
        return { produits, charges, totalProduits, totalCharges, resultat, beneficiaire: resultat > 0 };
    }
    async getBilan() {
        const accounts = await this.accountRepo.find({ order: { code: 'ASC' } });
        const actif = accounts.filter(a => ['1', '2', '3'].includes(a.classe) && a.type === 'actif' || a.classe === '4' && a.type === 'actif' || a.classe === '5');
        const passif = accounts.filter(a => a.type === 'passif');
        const calcSolde = (a) => Math.abs(Number(a.soldeDebit) - Number(a.soldeCredit));
        const totalActif = actif.reduce((s, a) => s + calcSolde(a), 0);
        const totalPassif = passif.reduce((s, a) => s + calcSolde(a), 0);
        return {
            actif: actif.map(a => ({ code: a.code, nom: a.nom, classe: a.classe, solde: calcSolde(a) })),
            passif: passif.map(a => ({ code: a.code, nom: a.nom, classe: a.classe, solde: calcSolde(a) })),
            totalActif, totalPassif, equilibre: Math.abs(totalActif - totalPassif) < 1,
        };
    }
    findJournal(journal) {
        if (journal)
            return this.jnlRepo.find({ where: { journal }, order: { createdAt: 'DESC' } });
        return this.jnlRepo.find({ order: { createdAt: 'DESC' } });
    }
    findPayments(type) {
        if (type)
            return this.paymentRepo.find({ where: { type }, order: { createdAt: 'DESC' } });
        return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
    }
    findFiscalYears() { return this.fyRepo.find({ order: { dateDebut: 'DESC' } }); }
    createFiscalYear(dto) { return this.fyRepo.save(dto); }
    async closeFiscalYear(id) {
        await this.fyRepo.update(id, { statut: 'closed', cloture: true });
        return { message: 'Exercice clôturé' };
    }
    async generateApprovalPayment(approval) {
        try {
            const numero = await this.nextJnlNum();
            const entry = this.jnlRepo.create({
                numero, date: new Date().toISOString().split('T')[0], journal: 'BANQUE',
                libelle: 'Pmt Approbation ' + approval.reference + ' — ' + approval.beneficiaryName,
                pieceRef: approval.reference, pieceType: 'approval_payment',
                totalDebit: approval.amount, totalCredit: approval.amount, statut: 'validated',
                lines: [
                    { accountCode: '401000', accountNom: 'Fournisseurs', libelle: 'Appro. ' + approval.reference, debit: approval.amount, credit: 0, tiers: approval.beneficiaryName },
                    { accountCode: '521000', accountNom: 'BICEC Compte courant', libelle: 'Pmt ' + approval.reference, debit: 0, credit: approval.amount, tiers: approval.beneficiaryName },
                ],
            });
            const saved = await this.jnlRepo.save(entry);
            await this.updateAccountBalance('401000', approval.amount, 0);
            await this.updateAccountBalance('521000', 0, approval.amount);
            return saved;
        }
        catch (e) {
            console.warn('generateApprovalPayment error:', e.message);
            return null;
        }
    }
};
exports.AccountingService = AccountingService;
exports.AccountingService = AccountingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __param(1, (0, typeorm_1.InjectRepository)(journal_entry_entity_1.JournalEntry)),
    __param(2, (0, typeorm_1.InjectRepository)(journal_line_entity_1.JournalLine)),
    __param(3, (0, typeorm_1.InjectRepository)(payment_entity_1.Payment)),
    __param(4, (0, typeorm_1.InjectRepository)(fiscal_year_entity_1.FiscalYear)),
    __param(5, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(6, (0, typeorm_1.InjectRepository)(bill_entity_1.Bill)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AccountingService);
//# sourceMappingURL=accounting.service.js.map