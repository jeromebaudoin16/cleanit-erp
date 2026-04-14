import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Approval } from './approval.entity';

const LIMIT = 250000;

@Injectable()
export class ApprovalsService {
  constructor(@InjectRepository(Approval) private repo: Repository<Approval>) {}

  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }

  async getStats() {
    const all = await this.repo.find();
    return {
      total: all.length,
      submitted: all.filter(a => a.status === 'submitted').length,
      in_review: all.filter(a => ['review_1','review_2'].includes(a.status)).length,
      pending_boss: all.filter(a => a.status === 'pending_boss').length,
      approved: all.filter(a => a.status === 'approved').length,
      paid: all.filter(a => a.status === 'paid').length,
      rejected: all.filter(a => a.status === 'rejected').length,
      totalAmount: all.filter(a => a.status === 'paid').reduce((s,a) => s + (a.amount||0), 0),
      pendingAmount: all.filter(a => !['paid','rejected'].includes(a.status)).reduce((s,a) => s + (a.amount||0), 0),
    };
  }

  async create(data: any) {
    const ref = `APV-${Date.now().toString().slice(-6)}`;
    const a = this.repo.create({
      ...data,
      reference: ref,
      status: 'draft',
      currency: data.currency || 'XAF',
      history: [{ action:'created', by: data.submittedBy||'PM', at: new Date(), comment:'Demande créée' }],
    });
    return this.repo.save(a);
  }

  async update(id: number, data: any) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async submit(id: number, submittedBy: string, submittedByEmail: string) {
    const a = await this.findOne(id);
    if (!a) throw new Error('Non trouvé');
    const prev = Array.isArray(a.history) ? a.history : [];
    const history = [...prev, { action:'submitted', by: submittedBy, at: new Date(), comment:'Soumis pour validation' }];
    if (a.amount < LIMIT) {
      await this.repo.update(id, {
        status: 'approved',
        submittedBy, submittedByEmail, submittedAt: new Date(),
        approvedBy: 'Système Auto', approvedAt: new Date(), autoApproved: true,
        approvalComment: `Auto-approuvé — ${new Intl.NumberFormat('fr-FR').format(a.amount)} XAF < 250 000 XAF`,
        history: [...history, { action:'auto_approved', by:'Système', at: new Date(), comment:'Montant < 250 000 XAF' }],
      });
    } else {
      await this.repo.update(id, { status:'review_1', submittedBy, submittedByEmail, submittedAt: new Date(), history });
    }
    return this.findOne(id);
  }

  async review1(id: number, reviewer: string, reviewerEmail: string, decision: string, comment: string) {
    const a = await this.findOne(id);
    if (!a) throw new Error('Non trouvé');
    const prev = Array.isArray(a.history) ? a.history : [];
    const history = [...prev, { action:`review1_${decision}`, by: reviewer, at: new Date(), comment }];
    if (decision === 'reject') {
      await this.repo.update(id, { status:'rejected', reviewer1:reviewer, reviewer1Email:reviewerEmail, reviewer1At:new Date(), reviewer1Comment:comment, reviewer1Decision:'rejected', history });
    } else {
      await this.repo.update(id, { status:'review_2', reviewer1:reviewer, reviewer1Email:reviewerEmail, reviewer1At:new Date(), reviewer1Comment:comment, reviewer1Decision:'approved', history });
    }
    return this.findOne(id);
  }

  async review2(id: number, reviewer: string, reviewerEmail: string, decision: string, comment: string) {
    const a = await this.findOne(id);
    if (!a) throw new Error('Non trouvé');
    const prev = Array.isArray(a.history) ? a.history : [];
    const history = [...prev, { action:`review2_${decision}`, by: reviewer, at: new Date(), comment }];
    if (decision === 'reject') {
      await this.repo.update(id, { status:'rejected', reviewer2:reviewer, reviewer2Email:reviewerEmail, reviewer2At:new Date(), reviewer2Comment:comment, reviewer2Decision:'rejected', history });
    } else {
      await this.repo.update(id, { status:'pending_boss', reviewer2:reviewer, reviewer2Email:reviewerEmail, reviewer2At:new Date(), reviewer2Comment:comment, reviewer2Decision:'approved', history });
    }
    return this.findOne(id);
  }

  async bossApprove(id: number, boss: string, decision: string, comment: string) {
    const a = await this.findOne(id);
    if (!a) throw new Error('Non trouvé');
    const prev = Array.isArray(a.history) ? a.history : [];
    const history = [...prev, { action:`boss_${decision}`, by: boss, at: new Date(), comment }];
    const status = decision === 'approve' ? 'approved' : 'rejected';
    await this.repo.update(id, { status, approvedBy:boss, approvedAt:new Date(), approvalComment:comment, history });
    return this.findOne(id);
  }

  async markPaid(id: number, paymentRef: string, paymentMethod: string) {
    const a = await this.findOne(id);
    if (!a) throw new Error('Non trouvé');
    const prev = Array.isArray(a.history) ? a.history : [];
    const history = [...prev, { action:'paid', by:'Finance', at: new Date(), comment:`Paiement: ${paymentRef}` }];
    await this.repo.update(id, { status:'paid', paidAt:new Date(), paymentReference:paymentRef, paymentMethod, history });
    return this.findOne(id);
  }

  async seedApprovals() {
    const count = await this.repo.count();
    if (count > 0) return;
    const samples = [
      { projectName:'Installation 5G DLA-001', projectCode:'DLA-001', poNumber:'PO-2024-001', siteCode:'DLA-001', amount:850000, description:'Paiement avancement installation 5G Phase 1', beneficiaryName:'Thomas Ngono', beneficiaryEmail:'thomas@cleanit.cm', beneficiaryPhone:'+237677001001', beneficiaryBank:'Société Générale', beneficiaryAccount:'SG-CM-001-234567', submittedBy:'Marie Kamga', submittedByEmail:'marie@cleanit.cm', status:'review_1', submittedAt:new Date(Date.now()-86400000) },
      { projectName:'Survey BFN-001', projectCode:'BFN-001', poNumber:'PO-2024-002', siteCode:'BFN-001', amount:180000, description:'Remboursement frais survey Bafoussam', beneficiaryName:'Samuel Djomo', beneficiaryEmail:'samuel@cleanit.cm', beneficiaryPhone:'+237677001003', beneficiaryBank:'Afriland First Bank', beneficiaryAccount:'AFB-CM-002-345678', submittedBy:'Marie Kamga', submittedByEmail:'marie@cleanit.cm', status:'approved', autoApproved:true, submittedAt:new Date(Date.now()-172800000), approvedBy:'Système Auto', approvedAt:new Date(Date.now()-172800000) },
      { projectName:'Maintenance GAR-001', projectCode:'GAR-001', poNumber:'PO-2024-002', siteCode:'GAR-001', amount:320000, description:'Frais déplacement équipe Garoua', beneficiaryName:'Ali Moussa', beneficiaryEmail:'ali@cleanit.cm', submittedBy:'Marie Kamga', submittedByEmail:'marie@cleanit.cm', status:'draft' },
      { projectName:'Swap KRI-001', projectCode:'KRI-001', poNumber:'PO-2024-001', siteCode:'KRI-001', amount:1500000, description:'Paiement final installation Kribi Port', beneficiaryName:'Pierre Etoga', beneficiaryEmail:'pierre@cleanit.cm', beneficiaryBank:'BICEC', beneficiaryAccount:'BIC-CM-003-456789', submittedBy:'Marie Kamga', submittedByEmail:'marie@cleanit.cm', status:'paid', submittedAt:new Date(Date.now()-604800000), approvedBy:'Directeur Général', approvedAt:new Date(Date.now()-432000000), paidAt:new Date(Date.now()-259200000), paymentReference:'PAY-2024-001', paymentMethod:'Virement bancaire' },
    ];
    for (const s of samples) {
      await this.repo.save(this.repo.create({ ...s, currency:'XAF', reference:`APV-${Date.now().toString().slice(-6)}`, history:[] }));
      await new Promise(r => setTimeout(r, 100));
    }
    console.log('✅ Approvals seedés');
  }
}
