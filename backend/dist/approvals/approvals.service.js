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
exports.ApprovalsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const approval_entity_1 = require("./approval.entity");
const LIMIT = 250000;
let ApprovalsService = class ApprovalsService {
    repo;
    constructor(repo) {
        this.repo = repo;
    }
    findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
    findOne(id) { return this.repo.findOne({ where: { id } }); }
    async getStats() {
        const all = await this.repo.find();
        return {
            total: all.length,
            submitted: all.filter(a => a.status === 'submitted').length,
            in_review: all.filter(a => ['review_1', 'review_2'].includes(a.status)).length,
            pending_boss: all.filter(a => a.status === 'pending_boss').length,
            approved: all.filter(a => a.status === 'approved').length,
            paid: all.filter(a => a.status === 'paid').length,
            rejected: all.filter(a => a.status === 'rejected').length,
            totalAmount: all.filter(a => a.status === 'paid').reduce((s, a) => s + (a.amount || 0), 0),
            pendingAmount: all.filter(a => !['paid', 'rejected'].includes(a.status)).reduce((s, a) => s + (a.amount || 0), 0),
        };
    }
    async create(data) {
        const ref = `APV-${Date.now().toString().slice(-6)}`;
        const a = this.repo.create({
            ...data,
            reference: ref,
            status: 'draft',
            currency: data.currency || 'XAF',
            history: [{ action: 'created', by: data.submittedBy || 'PM', at: new Date(), comment: 'Demande créée' }],
        });
        return this.repo.save(a);
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.findOne(id);
    }
    async submit(id, submittedBy, submittedByEmail) {
        const a = await this.findOne(id);
        if (!a)
            throw new Error('Non trouvé');
        const prev = Array.isArray(a.history) ? a.history : [];
        const history = [...prev, { action: 'submitted', by: submittedBy, at: new Date(), comment: 'Soumis pour validation' }];
        if (a.amount < LIMIT) {
            await this.repo.update(id, {
                status: 'approved',
                submittedBy, submittedByEmail, submittedAt: new Date(),
                approvedBy: 'Système Auto', approvedAt: new Date(), autoApproved: true,
                approvalComment: `Auto-approuvé — ${new Intl.NumberFormat('fr-FR').format(a.amount)} XAF < 250 000 XAF`,
                history: [...history, { action: 'auto_approved', by: 'Système', at: new Date(), comment: 'Montant < 250 000 XAF' }],
            });
        }
        else {
            await this.repo.update(id, { status: 'review_1', submittedBy, submittedByEmail, submittedAt: new Date(), history });
        }
        return this.findOne(id);
    }
    async review1(id, reviewer, reviewerEmail, decision, comment) {
        const a = await this.findOne(id);
        if (!a)
            throw new Error('Non trouvé');
        const prev = Array.isArray(a.history) ? a.history : [];
        const history = [...prev, { action: `review1_${decision}`, by: reviewer, at: new Date(), comment }];
        if (decision === 'reject') {
            await this.repo.update(id, { status: 'rejected', reviewer1: reviewer, reviewer1Email: reviewerEmail, reviewer1At: new Date(), reviewer1Comment: comment, reviewer1Decision: 'rejected', history });
        }
        else {
            await this.repo.update(id, { status: 'review_2', reviewer1: reviewer, reviewer1Email: reviewerEmail, reviewer1At: new Date(), reviewer1Comment: comment, reviewer1Decision: 'approved', history });
        }
        return this.findOne(id);
    }
    async review2(id, reviewer, reviewerEmail, decision, comment) {
        const a = await this.findOne(id);
        if (!a)
            throw new Error('Non trouvé');
        const prev = Array.isArray(a.history) ? a.history : [];
        const history = [...prev, { action: `review2_${decision}`, by: reviewer, at: new Date(), comment }];
        if (decision === 'reject') {
            await this.repo.update(id, { status: 'rejected', reviewer2: reviewer, reviewer2Email: reviewerEmail, reviewer2At: new Date(), reviewer2Comment: comment, reviewer2Decision: 'rejected', history });
        }
        else {
            await this.repo.update(id, { status: 'pending_boss', reviewer2: reviewer, reviewer2Email: reviewerEmail, reviewer2At: new Date(), reviewer2Comment: comment, reviewer2Decision: 'approved', history });
        }
        return this.findOne(id);
    }
    async bossApprove(id, boss, decision, comment) {
        const a = await this.findOne(id);
        if (!a)
            throw new Error('Non trouvé');
        const prev = Array.isArray(a.history) ? a.history : [];
        const history = [...prev, { action: `boss_${decision}`, by: boss, at: new Date(), comment }];
        const status = decision === 'approve' ? 'approved' : 'rejected';
        await this.repo.update(id, { status, approvedBy: boss, approvedAt: new Date(), approvalComment: comment, history });
        return this.findOne(id);
    }
    async markPaid(id, paymentRef, paymentMethod) {
        const a = await this.findOne(id);
        if (!a)
            throw new Error('Non trouvé');
        const prev = Array.isArray(a.history) ? a.history : [];
        const history = [...prev, { action: 'paid', by: 'Finance', at: new Date(), comment: `Paiement: ${paymentRef}` }];
        await this.repo.update(id, { status: 'paid', paidAt: new Date(), paymentReference: paymentRef, paymentMethod, history });
        return this.findOne(id);
    }
    async seedApprovals() {
        const count = await this.repo.count();
        if (count > 0)
            return;
        const samples = [
            { projectName: 'Installation 5G DLA-001', projectCode: 'DLA-001', poNumber: 'PO-2024-001', siteCode: 'DLA-001', amount: 850000, description: 'Paiement avancement installation 5G Phase 1', beneficiaryName: 'Thomas Ngono', beneficiaryEmail: 'thomas@cleanit.cm', beneficiaryPhone: '+237677001001', beneficiaryBank: 'Société Générale', beneficiaryAccount: 'SG-CM-001-234567', submittedBy: 'Marie Kamga', submittedByEmail: 'marie@cleanit.cm', status: 'review_1', submittedAt: new Date(Date.now() - 86400000) },
            { projectName: 'Survey BFN-001', projectCode: 'BFN-001', poNumber: 'PO-2024-002', siteCode: 'BFN-001', amount: 180000, description: 'Remboursement frais survey Bafoussam', beneficiaryName: 'Samuel Djomo', beneficiaryEmail: 'samuel@cleanit.cm', beneficiaryPhone: '+237677001003', beneficiaryBank: 'Afriland First Bank', beneficiaryAccount: 'AFB-CM-002-345678', submittedBy: 'Marie Kamga', submittedByEmail: 'marie@cleanit.cm', status: 'approved', autoApproved: true, submittedAt: new Date(Date.now() - 172800000), approvedBy: 'Système Auto', approvedAt: new Date(Date.now() - 172800000) },
            { projectName: 'Maintenance GAR-001', projectCode: 'GAR-001', poNumber: 'PO-2024-002', siteCode: 'GAR-001', amount: 320000, description: 'Frais déplacement équipe Garoua', beneficiaryName: 'Ali Moussa', beneficiaryEmail: 'ali@cleanit.cm', submittedBy: 'Marie Kamga', submittedByEmail: 'marie@cleanit.cm', status: 'draft' },
            { projectName: 'Swap KRI-001', projectCode: 'KRI-001', poNumber: 'PO-2024-001', siteCode: 'KRI-001', amount: 1500000, description: 'Paiement final installation Kribi Port', beneficiaryName: 'Pierre Etoga', beneficiaryEmail: 'pierre@cleanit.cm', beneficiaryBank: 'BICEC', beneficiaryAccount: 'BIC-CM-003-456789', submittedBy: 'Marie Kamga', submittedByEmail: 'marie@cleanit.cm', status: 'paid', submittedAt: new Date(Date.now() - 604800000), approvedBy: 'Directeur Général', approvedAt: new Date(Date.now() - 432000000), paidAt: new Date(Date.now() - 259200000), paymentReference: 'PAY-2024-001', paymentMethod: 'Virement bancaire' },
        ];
        for (const s of samples) {
            await this.repo.save(this.repo.create({ ...s, currency: 'XAF', reference: `APV-${Date.now().toString().slice(-6)}`, history: [] }));
            await new Promise(r => setTimeout(r, 100));
        }
        console.log('✅ Approvals seedés');
    }
};
exports.ApprovalsService = ApprovalsService;
exports.ApprovalsService = ApprovalsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(approval_entity_1.Approval)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ApprovalsService);
//# sourceMappingURL=approvals.service.js.map