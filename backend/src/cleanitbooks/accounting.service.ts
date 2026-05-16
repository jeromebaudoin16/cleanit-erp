import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Account } from './account.entity';
import { JournalEntry } from './journal_entry.entity';
import { JournalLine } from './journal_line.entity';
import { Payment } from './payment.entity';
import { FiscalYear } from './fiscal_year.entity';
import { Invoice } from './invoice.entity';
import { Bill } from './bill.entity';

// Plan comptable SYSCOHADA complet
const PLAN_COMPTABLE_SYSCOHADA = [
  // CLASSE 1 — COMPTES DE RESSOURCES DURABLES
  { code:'101000', nom:'Capital social', classe:'1', type:'passif' },
  { code:'111000', nom:'Réserves légales', classe:'1', type:'passif' },
  { code:'120000', nom:'Résultat de l\'exercice', classe:'1', type:'passif' },
  { code:'164000', nom:'Emprunts bancaires', classe:'1', type:'passif' },
  // CLASSE 2 — COMPTES D'ACTIF IMMOBILISÉ
  { code:'221000', nom:'Terrains', classe:'2', type:'actif' },
  { code:'231000', nom:'Bâtiments', classe:'2', type:'actif' },
  { code:'241000', nom:'Matériel et outillage', classe:'2', type:'actif' },
  { code:'244000', nom:'Matériel informatique', classe:'2', type:'actif' },
  { code:'245000', nom:'Matériel de transport', classe:'2', type:'actif' },
  { code:'281000', nom:'Amort. bâtiments', classe:'2', type:'actif' },
  { code:'284000', nom:'Amort. matériel informatique', classe:'2', type:'actif' },
  // CLASSE 3 — COMPTES DE STOCKS
  { code:'311000', nom:'Marchandises', classe:'3', type:'actif' },
  { code:'321000', nom:'Matières premières', classe:'3', type:'actif' },
  { code:'381000', nom:'Stock en transit', classe:'3', type:'actif' },
  // CLASSE 4 — COMPTES DE TIERS
  { code:'401000', nom:'Fournisseurs', classe:'4', type:'passif' },
  { code:'401001', nom:'Huawei Technologies', classe:'4', type:'passif' },
  { code:'401002', nom:'Nokia Networks', classe:'4', type:'passif' },
  { code:'401003', nom:'Ericsson', classe:'4', type:'passif' },
  { code:'408000', nom:'Fournisseurs - factures non parvenues', classe:'4', type:'passif' },
  { code:'411000', nom:'Clients', classe:'4', type:'actif' },
  { code:'411001', nom:'MTN Cameroun', classe:'4', type:'actif' },
  { code:'411002', nom:'Orange Cameroun', classe:'4', type:'actif' },
  { code:'411003', nom:'CAMTEL', classe:'4', type:'actif' },
  { code:'411004', nom:'Gouvernement Cameroun', classe:'4', type:'actif' },
  { code:'418000', nom:'Clients - produits non encore facturés', classe:'4', type:'actif' },
  { code:'421000', nom:'Personnel - rémunérations dues', classe:'4', type:'passif' },
  { code:'431000', nom:'Sécurité sociale - CNPS', classe:'4', type:'passif' },
  { code:'441000', nom:'État - impôts et taxes', classe:'4', type:'passif' },
  { code:'443000', nom:'TVA collectée', classe:'4', type:'passif' },
  { code:'445000', nom:'TVA déductible', classe:'4', type:'actif' },
  { code:'471000', nom:'Débiteurs divers', classe:'4', type:'actif' },
  { code:'472000', nom:'Créditeurs divers', classe:'4', type:'passif' },
  // CLASSE 5 — COMPTES DE TRÉSORERIE
  { code:'521000', nom:'BICEC - Compte courant', classe:'5', type:'tresorerie' },
  { code:'521001', nom:'SGC - Compte courant', classe:'5', type:'tresorerie' },
  { code:'521002', nom:'UBA - Compte courant', classe:'5', type:'tresorerie' },
  { code:'571000', nom:'Caisse principale', classe:'5', type:'tresorerie' },
  { code:'572000', nom:'Mobile Money MTN', classe:'5', type:'tresorerie' },
  { code:'573000', nom:'Mobile Money Orange', classe:'5', type:'tresorerie' },
  // CLASSE 6 — COMPTES DE CHARGES
  { code:'601000', nom:'Achats de marchandises', classe:'6', type:'charge' },
  { code:'604000', nom:'Achats d\'études et prestations', classe:'6', type:'charge' },
  { code:'605000', nom:'Achats de matériels et équipements', classe:'6', type:'charge' },
  { code:'611000', nom:'Transport et déplacements', classe:'6', type:'charge' },
  { code:'613000', nom:'Locations et charges locatives', classe:'6', type:'charge' },
  { code:'614000', nom:'Charges d\'entretien', classe:'6', type:'charge' },
  { code:'615000', nom:'Primes d\'assurance', classe:'6', type:'charge' },
  { code:'616000', nom:'Frais de télécommunications', classe:'6', type:'charge' },
  { code:'621000', nom:'Rémunérations du personnel', classe:'6', type:'charge' },
  { code:'631000', nom:'Cotisations sociales - CNPS', classe:'6', type:'charge' },
  { code:'641000', nom:'Impôts et taxes', classe:'6', type:'charge' },
  { code:'651000', nom:'Pertes sur créances', classe:'6', type:'charge' },
  { code:'661000', nom:'Intérêts des emprunts', classe:'6', type:'charge' },
  { code:'671000', nom:'Charges exceptionnelles', classe:'6', type:'charge' },
  { code:'681000', nom:'Dotations aux amortissements', classe:'6', type:'charge' },
  // CLASSE 7 — COMPTES DE PRODUITS
  { code:'701000', nom:'Prestations de services télécom', classe:'7', type:'produit' },
  { code:'701001', nom:'Installation équipements 5G/4G', classe:'7', type:'produit' },
  { code:'701002', nom:'Maintenance réseaux', classe:'7', type:'produit' },
  { code:'701003', nom:'Déploiement fibre optique', classe:'7', type:'produit' },
  { code:'701004', nom:'Audit et conseil télécom', classe:'7', type:'produit' },
  { code:'706000', nom:'Prestations diverses', classe:'7', type:'produit' },
  { code:'707000', nom:'Produits accessoires', classe:'7', type:'produit' },
  { code:'741000', nom:'Subventions d\'exploitation', classe:'7', type:'produit' },
  { code:'771000', nom:'Produits financiers', classe:'7', type:'produit' },
  { code:'781000', nom:'Reprises sur amortissements', classe:'7', type:'produit' },
];

@Injectable()
export class AccountingService {
  private jnlCounter = 1;
  private payCounter = 1;

  constructor(
    @InjectRepository(Account)      private accountRepo:   Repository<Account>,
    @InjectRepository(JournalEntry) private jnlRepo:       Repository<JournalEntry>,
    @InjectRepository(JournalLine)  private lineRepo:      Repository<JournalLine>,
    @InjectRepository(Payment)      private paymentRepo:   Repository<Payment>,
    @InjectRepository(FiscalYear)   private fyRepo:        Repository<FiscalYear>,
    @InjectRepository(Invoice)      private invoiceRepo:   Repository<Invoice>,
    @InjectRepository(Bill)         private billRepo:      Repository<Bill>,
  ) {}

  // ── Plan comptable ──────────────────────────────────────────────
  async initPlanComptable() {
    const count = await this.accountRepo.count();
    if(count > 0) return { message: 'Plan comptable déjà initialisé', count };
    const accounts = PLAN_COMPTABLE_SYSCOHADA.map(a => this.accountRepo.create(a));
    await this.accountRepo.save(accounts);
    return { message: 'Plan comptable SYSCOHADA initialisé', count: accounts.length };
  }

  findAllAccounts() {
    return this.accountRepo.find({ order: { code: 'ASC' } });
  }

  findAccountsByClasse(classe: string) {
    return this.accountRepo.find({ where: { classe }, order: { code: 'ASC' } });
  }

  async updateAccountBalance(code: string, debit: number, credit: number) {
    const account = await this.accountRepo.findOneBy({ code });
    if(!account) return;
    account.soldeDebit  = Number(account.soldeDebit)  + debit;
    account.soldeCredit = Number(account.soldeCredit) + credit;
    return this.accountRepo.save(account);
  }

  // ── Numérotation ────────────────────────────────────────────────
  private async nextJnlNum(): Promise<string> {
    const count = await this.jnlRepo.count();
    return `JNL-${new Date().getFullYear()}-${String(count + 1).padStart(4,'0')}`;
  }

  private async nextPayNum(): Promise<string> {
    const count = await this.paymentRepo.count();
    return `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(4,'0')}`;
  }

  // ── Génération écriture FACTURE CLIENT ──────────────────────────
  async generateInvoiceEntry(invoice: any): Promise<JournalEntry> {
    const tva = Math.round(invoice.total * 0.1925 / 1.1925);
    const ht  = invoice.total - tva;
    const numero = await this.nextJnlNum();

    const entry = this.jnlRepo.create({
      numero,
      date:       invoice.date || new Date().toISOString().split('T')[0],
      journal:    'VENTES',
      libelle:    `Facture ${invoice.id} — ${invoice.customerId}`,
      pieceRef:   invoice.id,
      pieceType:  'invoice',
      totalDebit: invoice.total,
      totalCredit:invoice.total,
      statut:     'validated',
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
    // Mettre à jour les soldes du plan comptable
    await this.updateAccountBalance('411000', invoice.total, 0);
    await this.updateAccountBalance('701001', 0, ht);
    await this.updateAccountBalance('443000', 0, tva);
    return saved;
  }

  // ── Génération écriture BILL FOURNISSEUR ─────────────────────────
  async generateBillEntry(bill: any): Promise<JournalEntry> {
    const tva = Math.round(bill.total * 0.1925 / 1.1925);
    const ht  = bill.total - tva;
    const numero = await this.nextJnlNum();

    const entry = this.jnlRepo.create({
      numero,
      date:       bill.date || new Date().toISOString().split('T')[0],
      journal:    'ACHATS',
      libelle:    `Bill ${bill.id} — ${bill.vendorId}`,
      pieceRef:   bill.id,
      pieceType:  'bill',
      totalDebit: bill.total,
      totalCredit:bill.total,
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

  // ── Encaissement client avec lettrage auto ───────────────────────
  async receivePayment(dto: {
    customerId: string; invoiceId: string; montant: number;
    methode: string; reference: string; date: string;
  }): Promise<{ payment: Payment; entry: JournalEntry; lettrage: string }> {
    const numero    = await this.nextPayNum();
    const lettrage  = `LET-${Date.now().toString().slice(-6)}`;
    const compteBank= '521000';

    // Créer le paiement
    const payment = await this.paymentRepo.save(this.paymentRepo.create({
      numero, date: dto.date, type: 'receipt',
      customerId: dto.customerId, invoiceId: dto.invoiceId,
      montant: dto.montant, methode: dto.methode,
      reference: dto.reference, lettrage,
    }));

    // Mettre à jour la facture
    const invoice = await this.invoiceRepo.findOneBy({ id: dto.invoiceId });
    if(invoice) {
      const newPaid    = Number(invoice.amountPaid || 0) + dto.montant;
      const newBalance = Math.max(0, Number(invoice.total) - newPaid);
      await this.invoiceRepo.update(dto.invoiceId, {
        amountPaid: newPaid,
        balance:    newBalance,
        status:     newBalance === 0 ? 'Paid' : 'Partial',
      });
    }

    // Écriture comptable encaissement
    const jnlNum = await this.nextJnlNum();
    const entry  = await this.jnlRepo.save(this.jnlRepo.create({
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

  // ── Paiement fournisseur ────────────────────────────────────────
  async payBill(dto: {
    vendorId: string; billId: string; montant: number;
    methode: string; reference: string; date: string;
  }): Promise<{ payment: Payment; entry: JournalEntry }> {
    const numero   = await this.nextPayNum();
    const lettrage = `LET-${Date.now().toString().slice(-6)}`;

    const payment = await this.paymentRepo.save(this.paymentRepo.create({
      numero, date: dto.date, type: 'payment',
      vendorId: dto.vendorId, billId: dto.billId,
      montant: dto.montant, methode: dto.methode,
      reference: dto.reference, lettrage,
    }));

    const bill = await this.billRepo.findOneBy({ id: dto.billId });
    if(bill) {
      const newPaid    = Number(bill.amountPaid || 0) + dto.montant;
      const newBalance = Math.max(0, Number(bill.total) - newPaid);
      await this.billRepo.update(dto.billId, {
        amountPaid: newPaid, balance: newBalance,
        status: newBalance === 0 ? 'Paid' : 'Partial',
      });
    }

    const jnlNum = await this.nextJnlNum();
    const entry  = await this.jnlRepo.save(this.jnlRepo.create({
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

  // ── RAPPORTS DYNAMIQUES ─────────────────────────────────────────

  // Grand Livre
  async getGrandLivre(accountCode?: string, dateDebut?: string, dateFin?: string) {
    const query = this.lineRepo.createQueryBuilder('line')
      .leftJoinAndSelect('line.entry', 'entry')
      .orderBy('entry.date', 'ASC');
    if(accountCode) query.where('line.accountCode = :code', { code: accountCode });
    const lines = await query.getMany();
    const grouped: Record<string, any[]> = {};
    lines.forEach(l => {
      const code = l.accountCode;
      if(!grouped[code]) grouped[code] = [];
      grouped[code].push({ ...l, entryDate: l.entry?.date, entryNum: l.entry?.numero, journal: l.entry?.journal });
    });
    return grouped;
  }

  // Balance générale
  async getBalance() {
    const accounts = await this.accountRepo.find({ order: { code: 'ASC' } });
    let totalDebit = 0, totalCredit = 0;
    const rows = accounts.map(a => {
      const d = Number(a.soldeDebit);
      const c = Number(a.soldeCredit);
      totalDebit  += d;
      totalCredit += c;
      return { code: a.code, nom: a.nom, classe: a.classe, type: a.type, debit: d, credit: c, solde: d - c };
    });
    return { rows, totalDebit, totalCredit, equilibre: Math.abs(totalDebit - totalCredit) < 1 };
  }

  // Compte de résultat (P&L)
  async getPL(dateDebut?: string, dateFin?: string) {
    const accounts = await this.accountRepo.find({ order: { code: 'ASC' } });
    const produits = accounts.filter(a => a.classe === '7').map(a => ({ code: a.code, nom: a.nom, montant: Number(a.soldeCredit) - Number(a.soldeDebit) }));
    const charges  = accounts.filter(a => a.classe === '6').map(a => ({ code: a.code, nom: a.nom, montant: Number(a.soldeDebit) - Number(a.soldeCredit) }));
    const totalProduits = produits.reduce((s, a) => s + a.montant, 0);
    const totalCharges  = charges.reduce((s, a) => s + a.montant, 0);
    const resultat = totalProduits - totalCharges;
    return { produits, charges, totalProduits, totalCharges, resultat, beneficiaire: resultat > 0 };
  }

  // Bilan comptable
  async getBilan() {
    const accounts = await this.accountRepo.find({ order: { code: 'ASC' } });
    const actif    = accounts.filter(a => ['1','2','3'].includes(a.classe) && a.type === 'actif' || a.classe === '4' && a.type === 'actif' || a.classe === '5');
    const passif   = accounts.filter(a => a.type === 'passif');
    const calcSolde = (a: Account) => Math.abs(Number(a.soldeDebit) - Number(a.soldeCredit));
    const totalActif  = actif.reduce((s,a) => s + calcSolde(a), 0);
    const totalPassif = passif.reduce((s,a) => s + calcSolde(a), 0);
    return {
      actif:  actif.map(a => ({ code: a.code, nom: a.nom, classe: a.classe, solde: calcSolde(a) })),
      passif: passif.map(a => ({ code: a.code, nom: a.nom, classe: a.classe, solde: calcSolde(a) })),
      totalActif, totalPassif, equilibre: Math.abs(totalActif - totalPassif) < 1,
    };
  }

  // Journaux comptables
  findJournal(journal?: string) {
    if(journal) return this.jnlRepo.find({ where: { journal }, order: { createdAt: 'DESC' } });
    return this.jnlRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Paiements
  findPayments(type?: string) {
    if(type) return this.paymentRepo.find({ where: { type }, order: { createdAt: 'DESC' } });
    return this.paymentRepo.find({ order: { createdAt: 'DESC' } });
  }

  // Exercices comptables
  findFiscalYears() { return this.fyRepo.find({ order: { dateDebut: 'DESC' } }); }
  createFiscalYear(dto: Partial<FiscalYear>) { return this.fyRepo.save(dto); }
  async closeFiscalYear(id: string) {
    await this.fyRepo.update(id, { statut: 'closed', cloture: true });
    return { message: 'Exercice clôturé' };
  }

  async generateApprovalPayment(approval: {reference:string;amount:number;beneficiaryName:string;paymentMethod:string;type:string;}): Promise<any> {
    try {
      const numero = await this.nextJnlNum();
      const entry = this.jnlRepo.create({
        numero, date:new Date().toISOString().split('T')[0], journal:'BANQUE',
        libelle:'Pmt Approbation '+approval.reference+' — '+approval.beneficiaryName,
        pieceRef:approval.reference, pieceType:'approval_payment',
        totalDebit:approval.amount, totalCredit:approval.amount, statut:'validated',
        lines:[
          {accountCode:'401000',accountNom:'Fournisseurs',libelle:'Appro. '+approval.reference,debit:approval.amount,credit:0,tiers:approval.beneficiaryName},
          {accountCode:'521000',accountNom:'BICEC Compte courant',libelle:'Pmt '+approval.reference,debit:0,credit:approval.amount,tiers:approval.beneficiaryName},
        ],
      });
      const saved = await this.jnlRepo.save(entry);
      await this.updateAccountBalance('401000', approval.amount, 0);
      await this.updateAccountBalance('521000', 0, approval.amount);
      return saved;
    } catch(e) { console.warn('generateApprovalPayment error:', (e as Error).message); return null; }
  }

}