import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Site } from './site.entity';

@Injectable()
export class SitesService {
  constructor(@InjectRepository(Site) private repo: Repository<Site>) {}

  findAll() { return this.repo.find({ order: { createdAt: 'DESC' } }); }
  findOne(id: number) { return this.repo.findOne({ where: { id } }); }
  findByCode(code: string) { return this.repo.findOne({ where: { code } }); }

  async create(data: Partial<Site>) {
    const site = this.repo.create(data);
    return this.repo.save(site);
  }

  async update(id: number, data: Partial<Site>) {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  remove(id: number) { return this.repo.delete(id); }

  async getStats() {
    const all = await this.repo.find();
    return {
      total: all.length,
      planifie: all.filter(s => s.status === 'planifie').length,
      en_cours: all.filter(s => s.status === 'en_cours').length,
      termine: all.filter(s => s.status === 'termine').length,
      livre: all.filter(s => s.status === 'livre').length,
      en_retard: all.filter(s => s.status === 'en_retard').length,
    };
  }

  async seedSites() {
    const count = await this.repo.count();
    if (count > 0) return;
    const sites = [
      { code:'DLA-001', name:'Site Akwa Douala', region:'Littoral', ville:'Douala', latitude:4.0511, longitude:9.7085, status:'en_cours', typeTravauxEnum:'Installation 5G', technology:'5G NR', poNumber:'PO-2024-001', projectManager:'Marie Kamga', technicienAssigne:'Thomas Ngono', progression:65, budgetEstime:12500000, priorite:'haute' },
      { code:'DLA-002', name:'Site Bonanjo Douala', region:'Littoral', ville:'Douala', latitude:4.0469, longitude:9.6952, status:'planifie', typeTravauxEnum:'Swap 4G→5G', technology:'5G NR', poNumber:'PO-2024-001', projectManager:'Marie Kamga', progression:0, budgetEstime:8500000, priorite:'normale' },
      { code:'DLA-003', name:'Site Bonabéri Douala', region:'Littoral', ville:'Douala', latitude:4.0667, longitude:9.6500, status:'en_retard', typeTravauxEnum:'Maintenance préventive', technology:'4G LTE', poNumber:'PO-2024-002', projectManager:'Marie Kamga', technicienAssigne:'Jean Mbarga', progression:30, budgetEstime:3500000, priorite:'critique' },
      { code:'YDE-001', name:'Site Centre Yaoundé', region:'Centre', ville:'Yaoundé', latitude:3.8480, longitude:11.5021, status:'termine', typeTravauxEnum:'Installation 5G', technology:'5G NR', poNumber:'PO-2024-001', projectManager:'Marie Kamga', technicienAssigne:'Samuel Djomo', progression:100, budgetEstime:15000000, priorite:'haute' },
      { code:'YDE-002', name:'Site Bastos Yaoundé', region:'Centre', ville:'Yaoundé', latitude:3.8833, longitude:11.5167, status:'en_cours', typeTravauxEnum:'Survey', technology:'5G NR', poNumber:'PO-2024-003', projectManager:'Marie Kamga', progression:45, budgetEstime:2000000, priorite:'normale' },
      { code:'BFN-001', name:'Site Bafoussam Centre', region:'Ouest', ville:'Bafoussam', latitude:5.4764, longitude:10.4214, status:'planifie', typeTravauxEnum:'Installation 4G', technology:'4G LTE', poNumber:'PO-2024-002', projectManager:'Marie Kamga', progression:0, budgetEstime:9000000, priorite:'normale' },
      { code:'GAR-001', name:'Site Garoua Nord', region:'Nord', ville:'Garoua', latitude:9.3019, longitude:13.3920, status:'en_cours', typeTravauxEnum:'Démantèlement 3G', technology:'3G UMTS', poNumber:'PO-2024-002', projectManager:'Marie Kamga', progression:55, budgetEstime:4500000, priorite:'normale' },
      { code:'MAR-001', name:'Site Maroua', region:'Extrême-Nord', ville:'Maroua', latitude:10.5900, longitude:14.3157, status:'planifie', typeTravauxEnum:'Installation 4G', technology:'4G LTE', poNumber:'PO-2024-003', projectManager:'Marie Kamga', progression:0, budgetEstime:11000000, priorite:'haute' },
      { code:'KRI-001', name:'Site Kribi Port', region:'Sud', ville:'Kribi', latitude:2.9395, longitude:9.9087, status:'livre', typeTravauxEnum:'Installation 5G', technology:'5G NR', poNumber:'PO-2024-001', projectManager:'Marie Kamga', progression:100, budgetEstime:18000000, priorite:'haute' },
      { code:'LIM-001', name:'Site Limbé', region:'Sud-Ouest', ville:'Limbé', latitude:4.0167, longitude:9.2000, status:'en_cours', typeTravauxEnum:'Swap antenne', technology:'4G LTE', poNumber:'PO-2024-002', projectManager:'Marie Kamga', technicienAssigne:'Ali Moussa', progression:75, budgetEstime:6500000, priorite:'normale' },
    ];
    for (const s of sites) await this.repo.save(this.repo.create(s));
    console.log('✅ 10 sites créés');
  }
}
