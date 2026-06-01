import { useState, useEffect } from 'react';

// ─── COULEURS QUICKBOOKS ──────────────────────────────────────
const QB = {
  green:'#2CA01C', greenDark:'#1a7a10', greenLight:'#EBF5E9',
  blue:'#0077C5', blueLight:'#E6F3FC',
  orange:'#E97D05', orangeLight:'#FEF3E2',
  red:'#D52B1E', redLight:'#FDECEA',
  gray1:'#393A3D', gray2:'#6B6C72', gray3:'#D4D6D8',
  gray4:'#F4F5F7', gray5:'#FAFAFA',
  white:'#FFFFFF', border:'#D4D6D8'
};

const S = {
  page:{background:QB.gray4,minHeight:'100vh',fontFamily:"'Avenir Next','Helvetica Neue',Arial,sans-serif"},
  card:{background:QB.white,borderRadius:8,border:`1px solid ${QB.border}`,marginBottom:16},
  cardHeader:{padding:'16px 20px',borderBottom:`1px solid ${QB.border}`,display:'flex',alignItems:'center',justifyContent:'space-between'},
  cardTitle:{fontSize:16,fontWeight:700,color:QB.gray1},
  cardBody:{padding:'20px'},
  row:{display:'flex',gap:16,marginBottom:16},
  col:{flex:1},
  label:{display:'block',fontSize:13,fontWeight:600,color:QB.gray2,marginBottom:4},
  input:{width:'100%',padding:'8px 12px',border:`1px solid ${QB.border}`,borderRadius:4,fontSize:14,color:QB.gray1,outline:'none',boxSizing:'border-box'},
  select:{width:'100%',padding:'8px 12px',border:`1px solid ${QB.border}`,borderRadius:4,fontSize:14,color:QB.gray1,background:QB.white,outline:'none',boxSizing:'border-box'},
  textarea:{width:'100%',padding:'8px 12px',border:`1px solid ${QB.border}`,borderRadius:4,fontSize:14,color:QB.gray1,resize:'vertical',outline:'none',boxSizing:'border-box'},
  btnGreen:{background:QB.green,color:QB.white,border:'none',borderRadius:4,padding:'9px 20px',fontSize:14,fontWeight:600,cursor:'pointer'},
  btnBlue:{background:QB.blue,color:QB.white,border:'none',borderRadius:4,padding:'9px 20px',fontSize:14,fontWeight:600,cursor:'pointer'},
  btnOutline:{background:QB.white,color:QB.gray1,border:`1px solid ${QB.border}`,borderRadius:4,padding:'9px 20px',fontSize:14,fontWeight:600,cursor:'pointer'},
  btnRed:{background:QB.red,color:QB.white,border:'none',borderRadius:4,padding:'9px 20px',fontSize:14,fontWeight:600,cursor:'pointer'},
  table:{width:'100%',borderCollapse:'collapse'},
  th:{padding:'10px 12px',background:QB.gray4,borderBottom:`2px solid ${QB.border}`,fontSize:12,fontWeight:700,color:QB.gray2,textAlign:'left',textTransform:'uppercase',letterSpacing:'0.5px'},
  td:{padding:'10px 12px',borderBottom:`1px solid ${QB.gray4}`,fontSize:14,color:QB.gray1},
  badge:(c)=>({display:'inline-block',padding:'3px 10px',borderRadius:12,fontSize:12,fontWeight:600,background:c==='green'?QB.greenLight:c==='blue'?QB.blueLight:c==='orange'?QB.orangeLight:QB.redLight,color:c==='green'?QB.green:c==='blue'?QB.blue:c==='orange'?QB.orange:QB.red}),
  total:{display:'flex',justifyContent:'flex-end'},
  totalBox:{background:QB.gray4,borderRadius:8,padding:'16px 24px',minWidth:280},
  totalRow:{display:'flex',justifyContent:'space-between',marginBottom:8,fontSize:14},
  totalFinal:{display:'flex',justifyContent:'space-between',fontSize:18,fontWeight:700,color:QB.green,borderTop:`2px solid ${QB.border}`,paddingTop:8,marginTop:8},
};

const fmtF = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0)) + ' F';
const today = () => new Date().toISOString().split('T')[0];
const addDays = (d,n) => { const dt=new Date(d); dt.setDate(dt.getDate()+n); return dt.toISOString().split('T')[0]; };

// ══════════════════════════════════════════════════════════════
// FORMULAIRE FACTURE — QuickBooks style
// ══════════════════════════════════════════════════════════════
export function InvoiceForm({ invoice=null, customers=[], onSave, onCancel }) {
  const isEdit = !!invoice;
  const [form, setForm] = useState({
    customer: invoice?.customer||'', invoiceNum: invoice?.number||('INV-'+Date.now().toString().slice(-6)),
    date: invoice?.date||today(), due: invoice?.due||addDays(today(),30),
    terms: invoice?.terms||'Net 30', memo: invoice?.memo||'',
    message: invoice?.message||'Merci pour votre confiance.',
    lines: invoice?.lines||[{desc:'',qty:1,rate:0,amount:0}]
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const setLine = (i,k,v) => {
    const lines=[...form.lines];
    lines[i]={...lines[i],[k]:v};
    if(k==='qty'||k==='rate') lines[i].amount=(parseFloat(lines[i].qty)||0)*(parseFloat(lines[i].rate)||0);
    setForm(p=>({...p,lines}));
  };
  const addLine = () => setForm(p=>({...p,lines:[...p.lines,{desc:'',qty:1,rate:0,amount:0}]}));
  const delLine = i => setForm(p=>({...p,lines:p.lines.filter((_,j)=>j!==i)}));
  const subtotal = form.lines.reduce((s,l)=>s+(l.amount||0),0);
  const tva = subtotal*0;
  const total = subtotal+tva;

  return (
    <div style={S.page}>
      {/* TOP BAR */}
      <div style={{background:QB.white,borderBottom:`1px solid ${QB.border}`,padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onCancel} style={{...S.btnOutline,padding:'6px 14px',fontSize:13}}>← Retour</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:QB.gray1}}>{isEdit?'Modifier la facture':'Nouvelle facture'}</h2>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnBlue}>Enregistrer brouillon</button>
          <button onClick={()=>onSave&&onSave({...form,status:'envoye'})} style={S.btnGreen}>Enregistrer et envoyer</button>
        </div>
      </div>

      <div style={{maxWidth:960,margin:'0 auto',padding:'24px 16px'}}>
        {/* HEADER CARD */}
        <div style={S.card}>
          <div style={S.cardBody}>
            <div style={S.row}>
              <div style={S.col}>
                <label style={S.label}>Client *</label>
                <select style={S.select} value={form.customer} onChange={e=>set('customer',e.target.value)}>
                  <option value=''>Choisir un client...</option>
                  {customers.map(c=><option key={c.id||c.nom} value={c.nom||c.id}>{c.nom||c.name}</option>)}
                  <option value='MTN Cameroun'>MTN Cameroun</option>
                  <option value='Orange Cameroun'>Orange Cameroun</option>
                  <option value='CAMTEL'>CAMTEL</option>
                  <option value='Huawei Technologies'>Huawei Technologies</option>
                  <option value='Gouvernement Cameroun'>Gouvernement Cameroun</option>
                </select>
              </div>
              <div style={{width:180}}>
                <label style={S.label}>N° Facture</label>
                <input style={S.input} value={form.invoiceNum} onChange={e=>set('invoiceNum',e.target.value)}/>
              </div>
            </div>
            <div style={S.row}>
              <div style={S.col}>
                <label style={S.label}>Date de facturation</label>
                <input type='date' style={S.input} value={form.date} onChange={e=>{set('date',e.target.value);set('due',addDays(e.target.value,30));}}/>
              </div>
              <div style={S.col}>
                <label style={S.label}>Date d'échéance</label>
                <input type='date' style={S.input} value={form.due} onChange={e=>set('due',e.target.value)}/>
              </div>
              <div style={S.col}>
                <label style={S.label}>Conditions de paiement</label>
                <select style={S.select} value={form.terms} onChange={e=>set('terms',e.target.value)}>
                  <option>Net 15</option><option>Net 30</option><option>Net 45</option>
                  <option>Net 60</option><option>Net 90</option><option>Immédiat</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* LIGNES ARTICLES */}
        <div style={S.card}>
          <div style={S.cardHeader}><span style={S.cardTitle}>Lignes d'articles</span></div>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{...S.th,width:'40%'}}>Description / Service</th>
                <th style={{...S.th,width:'10%',textAlign:'center'}}>Qté</th>
                <th style={{...S.th,width:'18%',textAlign:'right'}}>Prix unitaire (FCFA)</th>
                <th style={{...S.th,width:'18%',textAlign:'right'}}>Montant (FCFA)</th>
                <th style={{...S.th,width:'6%'}}></th>
              </tr>
            </thead>
            <tbody>
              {form.lines.map((l,i)=>(
                <tr key={i}>
                  <td style={S.td}><input style={{...S.input,border:'none',background:'transparent'}} placeholder='Description du service...' value={l.desc} onChange={e=>setLine(i,'desc',e.target.value)}/></td>
                  <td style={{...S.td,textAlign:'center'}}><input type='number' style={{...S.input,textAlign:'center',border:'none',background:'transparent',width:60}} value={l.qty} onChange={e=>setLine(i,'qty',e.target.value)}/></td>
                  <td style={{...S.td,textAlign:'right'}}><input type='number' style={{...S.input,textAlign:'right',border:'none',background:'transparent'}} value={l.rate} onChange={e=>setLine(i,'rate',e.target.value)}/></td>
                  <td style={{...S.td,textAlign:'right',fontWeight:600}}>{fmtF(l.amount)}</td>
                  <td style={S.td}><button onClick={()=>delLine(i)} style={{background:'none',border:'none',color:QB.red,cursor:'pointer',fontSize:18}}>×</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${QB.gray4}`}}>
            <button onClick={addLine} style={{...S.btnOutline,fontSize:13,padding:'6px 14px'}}>+ Ajouter une ligne</button>
          </div>
          {/* TOTAUX */}
          <div style={{...S.cardBody,...S.total}}>
            <div style={S.totalBox}>
              <div style={S.totalRow}><span style={{color:QB.gray2}}>Sous-total</span><span>{fmtF(subtotal)}</span></div>
              <div style={S.totalRow}><span style={{color:QB.gray2}}>TVA (0%)</span><span>{fmtF(tva)}</span></div>
              <div style={S.totalFinal}><span>Total TTC</span><span>{fmtF(total)}</span></div>
            </div>
          </div>
        </div>

        {/* NOTES */}
        <div style={S.card}>
          <div style={S.cardBody}>
            <div style={S.row}>
              <div style={S.col}>
                <label style={S.label}>Message au client</label>
                <textarea style={{...S.textarea,height:80}} value={form.message} onChange={e=>set('message',e.target.value)}/>
              </div>
              <div style={S.col}>
                <label style={S.label}>Mémo interne (non visible client)</label>
                <textarea style={{...S.textarea,height:80}} value={form.memo} onChange={e=>set('memo',e.target.value)} placeholder='Note interne...'/>
              </div>
            </div>
          </div>
        </div>

        {/* PIED */}
        <div style={{display:'flex',justifyContent:'flex-end',gap:8,marginTop:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnBlue}>Enregistrer brouillon</button>
          <button onClick={()=>onSave&&onSave({...form,status:'envoye'})} style={S.btnGreen}>✓ Enregistrer et envoyer</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FORMULAIRE BILL (Dépense fournisseur) — QuickBooks style
// ══════════════════════════════════════════════════════════════
export function BillForm({ bill=null, vendors=[], onSave, onCancel }) {
  const isEdit = !!bill;
  const [form, setForm] = useState({
    vendor: bill?.vendor||'', billNum: bill?.number||('BILL-'+Date.now().toString().slice(-6)),
    date: bill?.date||today(), due: bill?.due||addDays(today(),30),
    terms: bill?.terms||'Net 30', memo: bill?.memo||'',
    lines: bill?.lines||[{desc:'',account:'611 - Sous-traitants',qty:1,rate:0,amount:0}]
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const setLine = (i,k,v) => {
    const lines=[...form.lines];
    lines[i]={...lines[i],[k]:v};
    if(k==='qty'||k==='rate') lines[i].amount=(parseFloat(lines[i].qty)||0)*(parseFloat(lines[i].rate)||0);
    setForm(p=>({...p,lines}));
  };
  const addLine = () => setForm(p=>({...p,lines:[...p.lines,{desc:'',account:'611 - Sous-traitants',qty:1,rate:0,amount:0}]}));
  const delLine = i => setForm(p=>({...p,lines:p.lines.filter((_,j)=>j!==i)}));
  const total = form.lines.reduce((s,l)=>s+(l.amount||0),0);
  const ACCOUNTS = ['601 - Achats matières','611 - Sous-traitants','615 - Entretien & réparations','616 - Assurances','624 - Transport','626 - Télécom & Internet','631 - Frais bancaires','641 - Charges personnel','661 - Charges intérêts'];

  return (
    <div style={S.page}>
      <div style={{background:QB.white,borderBottom:`1px solid ${QB.border}`,padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onCancel} style={{...S.btnOutline,padding:'6px 14px',fontSize:13}}>← Retour</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:QB.gray1}}>{isEdit?'Modifier le bill':'Saisir un bill fournisseur'}</h2>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnGreen}>✓ Enregistrer le bill</button>
        </div>
      </div>
      <div style={{maxWidth:960,margin:'0 auto',padding:'24px 16px'}}>
        <div style={S.card}>
          <div style={S.cardBody}>
            <div style={S.row}>
              <div style={S.col}>
                <label style={S.label}>Fournisseur *</label>
                <select style={S.select} value={form.vendor} onChange={e=>set('vendor',e.target.value)}>
                  <option value=''>Choisir un fournisseur...</option>
                  {vendors.map(v=><option key={v.id||v.nom} value={v.nom||v.name}>{v.nom||v.name}</option>)}
                  <option>Huawei Technologies</option><option>Nokia Networks</option>
                  <option>Ericsson Cameroun</option><option>Total Energies</option>
                </select>
              </div>
              <div style={{width:200}}>
                <label style={S.label}>N° de bill / référence</label>
                <input style={S.input} value={form.billNum} onChange={e=>set('billNum',e.target.value)}/>
              </div>
            </div>
            <div style={S.row}>
              <div style={S.col}><label style={S.label}>Date de réception</label><input type='date' style={S.input} value={form.date} onChange={e=>set('date',e.target.value)}/></div>
              <div style={S.col}><label style={S.label}>Date d'échéance</label><input type='date' style={S.input} value={form.due} onChange={e=>set('due',e.target.value)}/></div>
              <div style={S.col}><label style={S.label}>Conditions</label><select style={S.select} value={form.terms} onChange={e=>set('terms',e.target.value)}><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Immédiat</option></select></div>
            </div>
          </div>
        </div>
        <div style={S.card}>
          <div style={S.cardHeader}><span style={S.cardTitle}>Détail des lignes</span></div>
          <table style={S.table}>
            <thead><tr>
              <th style={{...S.th,width:'30%'}}>Description</th>
              <th style={{...S.th,width:'28%'}}>Compte SYSCOHADA</th>
              <th style={{...S.th,width:'8%',textAlign:'center'}}>Qté</th>
              <th style={{...S.th,width:'16%',textAlign:'right'}}>Montant unitaire</th>
              <th style={{...S.th,width:'14%',textAlign:'right'}}>Total</th>
              <th style={{...S.th,width:'4%'}}></th>
            </tr></thead>
            <tbody>{form.lines.map((l,i)=>(
              <tr key={i}>
                <td style={S.td}><input style={{...S.input,border:'none',background:'transparent'}} placeholder='Description...' value={l.desc} onChange={e=>setLine(i,'desc',e.target.value)}/></td>
                <td style={S.td}><select style={{...S.select,border:'none',background:'transparent',fontSize:13}} value={l.account} onChange={e=>setLine(i,'account',e.target.value)}>{ACCOUNTS.map(a=><option key={a}>{a}</option>)}</select></td>
                <td style={{...S.td,textAlign:'center'}}><input type='number' style={{...S.input,width:50,textAlign:'center',border:'none',background:'transparent'}} value={l.qty} onChange={e=>setLine(i,'qty',e.target.value)}/></td>
                <td style={{...S.td,textAlign:'right'}}><input type='number' style={{...S.input,textAlign:'right',border:'none',background:'transparent'}} value={l.rate} onChange={e=>setLine(i,'rate',e.target.value)}/></td>
                <td style={{...S.td,textAlign:'right',fontWeight:600}}>{fmtF(l.amount)}</td>
                <td style={S.td}><button onClick={()=>delLine(i)} style={{background:'none',border:'none',color:QB.red,cursor:'pointer',fontSize:18}}>×</button></td>
              </tr>
            ))}</tbody>
          </table>
          <div style={{padding:'12px 16px',borderTop:`1px solid ${QB.gray4}`}}>
            <button onClick={addLine} style={{...S.btnOutline,fontSize:13,padding:'6px 14px'}}>+ Ajouter une ligne</button>
          </div>
          <div style={{...S.cardBody,...S.total}}>
            <div style={S.totalBox}>
              <div style={S.totalFinal}><span>Total à payer</span><span>{fmtF(total)}</span></div>
            </div>
          </div>
        </div>
        <div style={S.card}><div style={S.cardBody}>
          <label style={S.label}>Mémo / Notes</label>
          <textarea style={{...S.textarea,height:80}} value={form.memo} onChange={e=>set('memo',e.target.value)} placeholder='Notes internes, référence contrat...'/>
        </div></div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnGreen}>✓ Enregistrer le bill</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FORMULAIRE CLIENT — QuickBooks style
// ══════════════════════════════════════════════════════════════
export function CustomerForm({ customer=null, onSave, onCancel }) {
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({
    nom: customer?.nom||'', type: customer?.type||'Telecom',
    email: customer?.email||'', phone: customer?.phone||'',
    website: customer?.website||'', siret: customer?.siret||'',
    adresse: customer?.adresse||'', ville: customer?.ville||'',
    pays: customer?.pays||'Cameroun', devise: customer?.devise||'FCFA',
    contact_nom: customer?.contact_nom||'', contact_role: customer?.contact_role||'',
    contact_email: customer?.contact_email||'', contact_phone: customer?.contact_phone||'',
    conditions: customer?.conditions||'Net 30', limite_credit: customer?.limite_credit||'',
    notes: customer?.notes||''
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const tabs = [{id:'info',l:'Infos générales'},{id:'adresse',l:'Adresse & Contact'},{id:'paiement',l:'Paiement'},{id:'notes',l:'Notes'}];

  return (
    <div style={S.page}>
      <div style={{background:QB.white,borderBottom:`1px solid ${QB.border}`,padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onCancel} style={{...S.btnOutline,padding:'6px 14px',fontSize:13}}>← Retour</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:QB.gray1}}>{customer?'Modifier client':'Nouveau client'}</h2>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnGreen}>✓ Enregistrer</button>
        </div>
      </div>
      <div style={{maxWidth:800,margin:'0 auto',padding:'24px 16px'}}>
        <div style={S.card}>
          <div style={{...S.cardHeader,gap:0,padding:'0 20px',flexDirection:'column',alignItems:'flex-start'}}>
            <div style={{display:'flex',gap:0,borderBottom:`1px solid ${QB.border}`,width:'100%',marginBottom:-1}}>
              {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'12px 20px',border:'none',background:'none',fontWeight:tab===t.id?700:400,color:tab===t.id?QB.blue:QB.gray2,borderBottom:tab===t.id?`2px solid ${QB.blue}`:'2px solid transparent',cursor:'pointer',fontSize:14}}>{t.l}</button>)}
            </div>
          </div>
          <div style={S.cardBody}>
            {tab==='info'&&<>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Nom de l'entreprise / Client *</label><input style={S.input} value={form.nom} onChange={e=>set('nom',e.target.value)} placeholder='MTN Cameroun...'/></div>
                <div style={{width:180}}><label style={S.label}>Type</label><select style={S.select} value={form.type} onChange={e=>set('type',e.target.value)}><option>Telecom</option><option>OEM</option><option>Public</option><option>PME</option><option>Autre</option></select></div>
              </div>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Email</label><input type='email' style={S.input} value={form.email} onChange={e=>set('email',e.target.value)} placeholder='contact@mtn.cm'/></div>
                <div style={S.col}><label style={S.label}>Téléphone</label><input style={S.input} value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder='+237 6XX XXX XXX'/></div>
              </div>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Site web</label><input style={S.input} value={form.website} onChange={e=>set('website',e.target.value)} placeholder='www.mtn.cm'/></div>
                <div style={S.col}><label style={S.label}>RCCM / Numéro fiscal</label><input style={S.input} value={form.siret} onChange={e=>set('siret',e.target.value)}/></div>
              </div>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Devise préférée</label><select style={S.select} value={form.devise} onChange={e=>set('devise',e.target.value)}><option>FCFA</option><option>USD</option><option>EUR</option></select></div>
              </div>
            </>}
            {tab==='adresse'&&<>
              <div style={{marginBottom:16,paddingBottom:16,borderBottom:`1px solid ${QB.border}`}}>
                <p style={{fontWeight:700,color:QB.gray1,marginBottom:12}}>Adresse de facturation</p>
                <div style={S.row}><div style={S.col}><label style={S.label}>Adresse</label><input style={S.input} value={form.adresse} onChange={e=>set('adresse',e.target.value)}/></div></div>
                <div style={S.row}>
                  <div style={S.col}><label style={S.label}>Ville</label><input style={S.input} value={form.ville} onChange={e=>set('ville',e.target.value)}/></div>
                  <div style={S.col}><label style={S.label}>Pays</label><select style={S.select} value={form.pays} onChange={e=>set('pays',e.target.value)}><option>Cameroun</option><option>Gabon</option><option>Congo</option><option>France</option></select></div>
                </div>
              </div>
              <p style={{fontWeight:700,color:QB.gray1,marginBottom:12}}>Contact principal</p>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Nom & Prénom</label><input style={S.input} value={form.contact_nom} onChange={e=>set('contact_nom',e.target.value)}/></div>
                <div style={S.col}><label style={S.label}>Rôle / Fonction</label><input style={S.input} value={form.contact_role} onChange={e=>set('contact_role',e.target.value)}/></div>
              </div>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Email contact</label><input type='email' style={S.input} value={form.contact_email} onChange={e=>set('contact_email',e.target.value)}/></div>
                <div style={S.col}><label style={S.label}>Tél. contact</label><input style={S.input} value={form.contact_phone} onChange={e=>set('contact_phone',e.target.value)}/></div>
              </div>
            </>}
            {tab==='paiement'&&<>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Conditions de paiement par défaut</label><select style={S.select} value={form.conditions} onChange={e=>set('conditions',e.target.value)}><option>Immédiat</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option><option>Net 90</option></select></div>
                <div style={S.col}><label style={S.label}>Limite de crédit (FCFA)</label><input type='number' style={S.input} value={form.limite_credit} onChange={e=>set('limite_credit',e.target.value)} placeholder='500 000 000'/></div>
              </div>
              <div style={{background:QB.blueLight,border:`1px solid ${QB.blue}`,borderRadius:6,padding:'12px 16px',marginTop:8}}>
                <p style={{margin:0,fontSize:13,color:QB.blue}}>ℹ️ Les conditions de paiement définies ici seront appliquées automatiquement à toutes les nouvelles factures de ce client.</p>
              </div>
            </>}
            {tab==='notes'&&<>
              <label style={S.label}>Notes internes (non visibles du client)</label>
              <textarea style={{...S.textarea,height:200}} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder='Historique relations, conditions spéciales, contacts secondaires...'/>
            </>}
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnGreen}>✓ Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FORMULAIRE FOURNISSEUR — QuickBooks style
// ══════════════════════════════════════════════════════════════
export function VendorForm({ vendor=null, onSave, onCancel }) {
  const [tab, setTab] = useState('info');
  const [form, setForm] = useState({
    nom: vendor?.nom||'', type: vendor?.type||'Equipementier',
    email: vendor?.email||'', phone: vendor?.phone||'',
    adresse: vendor?.adresse||'', ville: vendor?.ville||'',
    pays: vendor?.pays||'Cameroun', devise: vendor?.devise||'FCFA',
    contact_nom: vendor?.contact_nom||'', contact_role: vendor?.contact_role||'',
    contact_email: vendor?.contact_email||'', contact_phone: vendor?.contact_phone||'',
    conditions: vendor?.conditions||'Net 30', compte_banque: vendor?.compte_banque||'',
    notes: vendor?.notes||''
  });
  const set = (k,v) => setForm(p=>({...p,[k]:v}));
  const tabs = [{id:'info',l:'Infos générales'},{id:'adresse',l:'Adresse & Contact'},{id:'paiement',l:'Paiement & Banque'},{id:'notes',l:'Notes'}];

  return (
    <div style={S.page}>
      <div style={{background:QB.white,borderBottom:`1px solid ${QB.border}`,padding:'12px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <button onClick={onCancel} style={{...S.btnOutline,padding:'6px 14px',fontSize:13}}>← Retour</button>
          <h2 style={{margin:0,fontSize:18,fontWeight:700,color:QB.gray1}}>{vendor?'Modifier fournisseur':'Nouveau fournisseur'}</h2>
        </div>
        <div style={{display:'flex',gap:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnGreen}>✓ Enregistrer</button>
        </div>
      </div>
      <div style={{maxWidth:800,margin:'0 auto',padding:'24px 16px'}}>
        <div style={S.card}>
          <div style={{...S.cardHeader,flexDirection:'column',alignItems:'flex-start',padding:'0 20px'}}>
            <div style={{display:'flex',gap:0,width:'100%',marginBottom:-1}}>
              {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'12px 20px',border:'none',background:'none',fontWeight:tab===t.id?700:400,color:tab===t.id?QB.blue:QB.gray2,borderBottom:tab===t.id?`2px solid ${QB.blue}`:'2px solid transparent',cursor:'pointer',fontSize:14}}>{t.l}</button>)}
            </div>
          </div>
          <div style={S.cardBody}>
            {tab==='info'&&<>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Nom du fournisseur *</label><input style={S.input} value={form.nom} onChange={e=>set('nom',e.target.value)} placeholder='Huawei Technologies...'/></div>
                <div style={{width:200}}><label style={S.label}>Type</label><select style={S.select} value={form.type} onChange={e=>set('type',e.target.value)}><option>Equipementier</option><option>Services</option><option>Telecom</option><option>Transport</option><option>Autre</option></select></div>
              </div>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Email</label><input type='email' style={S.input} value={form.email} onChange={e=>set('email',e.target.value)}/></div>
                <div style={S.col}><label style={S.label}>Téléphone</label><input style={S.input} value={form.phone} onChange={e=>set('phone',e.target.value)}/></div>
              </div>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Devise</label><select style={S.select} value={form.devise} onChange={e=>set('devise',e.target.value)}><option>FCFA</option><option>USD</option><option>EUR</option></select></div>
              </div>
            </>}
            {tab==='adresse'&&<>
              <div style={S.row}><div style={S.col}><label style={S.label}>Adresse</label><input style={S.input} value={form.adresse} onChange={e=>set('adresse',e.target.value)}/></div></div>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Ville</label><input style={S.input} value={form.ville} onChange={e=>set('ville',e.target.value)}/></div>
                <div style={S.col}><label style={S.label}>Pays</label><select style={S.select} value={form.pays} onChange={e=>set('pays',e.target.value)}><option>Cameroun</option><option>France</option><option>Chine</option><option>USA</option><option>Allemagne</option></select></div>
              </div>
              <div style={{borderTop:`1px solid ${QB.border}`,marginTop:16,paddingTop:16}}>
                <p style={{fontWeight:700,color:QB.gray1,marginBottom:12}}>Contact principal</p>
                <div style={S.row}>
                  <div style={S.col}><label style={S.label}>Nom</label><input style={S.input} value={form.contact_nom} onChange={e=>set('contact_nom',e.target.value)}/></div>
                  <div style={S.col}><label style={S.label}>Rôle</label><input style={S.input} value={form.contact_role} onChange={e=>set('contact_role',e.target.value)}/></div>
                </div>
                <div style={S.row}>
                  <div style={S.col}><label style={S.label}>Email</label><input type='email' style={S.input} value={form.contact_email} onChange={e=>set('contact_email',e.target.value)}/></div>
                  <div style={S.col}><label style={S.label}>Téléphone</label><input style={S.input} value={form.contact_phone} onChange={e=>set('contact_phone',e.target.value)}/></div>
                </div>
              </div>
            </>}
            {tab==='paiement'&&<>
              <div style={S.row}>
                <div style={S.col}><label style={S.label}>Conditions de paiement</label><select style={S.select} value={form.conditions} onChange={e=>set('conditions',e.target.value)}><option>Immédiat</option><option>Net 15</option><option>Net 30</option><option>Net 45</option><option>Net 60</option></select></div>
              </div>
              <div style={S.row}><div style={S.col}><label style={S.label}>Coordonnées bancaires (RIB/IBAN)</label><input style={S.input} value={form.compte_banque} onChange={e=>set('compte_banque',e.target.value)} placeholder='BICEC — CM21 10005 000XX XXXX XXXX XX'/></div></div>
            </>}
            {tab==='notes'&&<>
              <label style={S.label}>Notes internes</label>
              <textarea style={{...S.textarea,height:200}} value={form.notes} onChange={e=>set('notes',e.target.value)} placeholder='Conditions négociées, contacts secondaires, historique...'/>
            </>}
          </div>
        </div>
        <div style={{display:'flex',justifyContent:'flex-end',gap:8}}>
          <button onClick={onCancel} style={S.btnOutline}>Annuler</button>
          <button onClick={()=>onSave&&onSave(form)} style={S.btnGreen}>✓ Enregistrer</button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FICHE CLIENT DÉTAILLÉE — QuickBooks style (4 onglets)
// ══════════════════════════════════════════════════════════════
export function CustomerDetail({ customer, invoices=[], onEdit, onBack, onNewInvoice }) {
  const [tab, setTab] = useState('overview');
  const solde = invoices.filter(i=>i.client===customer?.nom).reduce((s,i)=>s+(i.solde||0),0);
  const tabs = [{id:'overview',l:'Vue générale'},{id:'transactions',l:'Transactions'},{id:'contacts',l:'Contacts'},{id:'activite',l:'Activité'}];

  return (
    <div style={S.page}>
      <div style={{background:QB.white,borderBottom:`1px solid ${QB.border}`,padding:'12px 24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={onBack} style={{...S.btnOutline,padding:'6px 14px',fontSize:13}}>← Clients</button>
            <div style={{width:44,height:44,borderRadius:22,background:QB.blue,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:18}}>{(customer?.nom||'?')[0]}{(customer?.nom||'?').split(' ')[1]?.[0]||''}</div>
            <div>
              <h2 style={{margin:0,fontSize:20,fontWeight:700,color:QB.gray1}}>{customer?.nom||'Client'}</h2>
              <span style={{fontSize:13,color:QB.gray2}}>{customer?.type} · {customer?.ville||'Cameroun'}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>onNewInvoice&&onNewInvoice(customer)} style={S.btnGreen}>+ Nouvelle facture</button>
            <button onClick={()=>onEdit&&onEdit(customer)} style={S.btnOutline}>Modifier</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px'}}>
        {/* KPIs */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
          {[
            {l:'Solde ouvert',v:fmtF(solde),c:solde>0?QB.orange:QB.green},
            {l:'Factures totales',v:fmtF(invoices.filter(i=>i.client===customer?.nom).reduce((s,i)=>s+(i.total||0),0)),c:QB.blue},
            {l:'Factures en retard',v:invoices.filter(i=>i.client===customer?.nom&&i.statut==='retard').length,c:QB.red},
            {l:'Limite crédit',v:fmtF(customer?.limite_credit||0),c:QB.gray2},
          ].map((k,i)=>(
            <div key={i} style={{...S.card,marginBottom:0,padding:'16px 20px'}}>
              <div style={{fontSize:12,color:QB.gray2,marginBottom:4}}>{k.l}</div>
              <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
        {/* TABS */}
        <div style={S.card}>
          <div style={{display:'flex',borderBottom:`1px solid ${QB.border}`,padding:'0 20px'}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'12px 20px',border:'none',background:'none',fontWeight:tab===t.id?700:400,color:tab===t.id?QB.blue:QB.gray2,borderBottom:tab===t.id?`2px solid ${QB.blue}`:'2px solid transparent',cursor:'pointer',fontSize:14}}>{t.l}</button>)}
          </div>
          <div style={S.cardBody}>
            {tab==='overview'&&<>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
                <div><h4 style={{color:QB.gray1,marginBottom:12}}>Informations générales</h4>
                  {[['Nom',customer?.nom],['Type',customer?.type],['Email',customer?.email||'—'],['Téléphone',customer?.phone||'—'],['Ville',customer?.ville||'—'],['Devise',customer?.devise||'FCFA']].map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${QB.gray4}`}}>
                      <span style={{color:QB.gray2,fontSize:14}}>{k}</span>
                      <span style={{fontSize:14,fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
                <div><h4 style={{color:QB.gray1,marginBottom:12}}>Conditions commerciales</h4>
                  {[['Conditions paiement',customer?.conditions||'Net 30'],['Limite crédit',fmtF(customer?.limite_credit||0)],['Contact principal',customer?.contact_nom||'—'],['Rôle contact',customer?.contact_role||'—']].map(([k,v])=>(
                    <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${QB.gray4}`}}>
                      <span style={{color:QB.gray2,fontSize:14}}>{k}</span>
                      <span style={{fontSize:14,fontWeight:500}}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>}
            {tab==='transactions'&&<>
              <table style={S.table}>
                <thead><tr><th style={S.th}>N° Facture</th><th style={S.th}>Date</th><th style={S.th}>Échéance</th><th style={{...S.th,textAlign:'right'}}>Total</th><th style={{...S.th,textAlign:'right'}}>Payé</th><th style={{...S.th,textAlign:'right'}}>Solde</th><th style={S.th}>Statut</th></tr></thead>
                <tbody>{invoices.filter(i=>i.client===customer?.nom).length===0
                  ? <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:QB.gray2,padding:32}}>Aucune transaction</td></tr>
                  : invoices.filter(i=>i.client===customer?.nom).map((inv,i)=>(
                    <tr key={i}>
                      <td style={{...S.td,color:QB.blue,fontWeight:600}}>{inv.number}</td>
                      <td style={S.td}>{inv.date}</td>
                      <td style={{...S.td,color:inv.statut==='retard'?QB.red:'inherit'}}>{inv.due}</td>
                      <td style={{...S.td,textAlign:'right'}}>{fmtF(inv.total)}</td>
                      <td style={{...S.td,textAlign:'right',color:QB.green}}>{fmtF(inv.paye)}</td>
                      <td style={{...S.td,textAlign:'right',fontWeight:600,color:inv.solde>0?QB.orange:QB.green}}>{fmtF(inv.solde)}</td>
                      <td style={S.td}><span style={S.badge(inv.statut==='paye'?'green':inv.statut==='retard'?'red':'orange')}>{inv.statut}</span></td>
                    </tr>
                  ))}</tbody>
              </table>
            </>}
            {tab==='contacts'&&<>
              <div style={{padding:32,textAlign:'center',color:QB.gray2}}>
                <div style={{fontSize:48,marginBottom:12}}>👤</div>
                <p>Contact principal : <strong>{customer?.contact_nom||'Non renseigné'}</strong></p>
                <p style={{color:QB.gray2}}>{customer?.contact_role} · {customer?.contact_email} · {customer?.contact_phone}</p>
              </div>
            </>}
            {tab==='activite'&&<>
              <div style={{padding:32,textAlign:'center',color:QB.gray2}}>
                <div style={{fontSize:48,marginBottom:12}}>📋</div>
                <p>Historique des interactions avec {customer?.nom}</p>
              </div>
            </>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
// FICHE FOURNISSEUR DÉTAILLÉE — QuickBooks style
// ══════════════════════════════════════════════════════════════
export function VendorDetail({ vendor, bills=[], onEdit, onBack, onNewBill }) {
  const [tab, setTab] = useState('overview');
  const soldeAP = bills.filter(b=>b.vendor===vendor?.nom).reduce((s,b)=>s+(b.solde||0),0);
  const tabs = [{id:'overview',l:'Vue générale'},{id:'bills',l:'Bills & Dépenses'},{id:'contacts',l:'Contacts'},{id:'historique',l:'Historique'}];

  return (
    <div style={S.page}>
      <div style={{background:QB.white,borderBottom:`1px solid ${QB.border}`,padding:'12px 24px'}}>
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <button onClick={onBack} style={{...S.btnOutline,padding:'6px 14px',fontSize:13}}>← Fournisseurs</button>
            <div style={{width:44,height:44,borderRadius:22,background:QB.orange,display:'flex',alignItems:'center',justifyContent:'center',color:'white',fontWeight:700,fontSize:18}}>{(vendor?.nom||'?')[0]}</div>
            <div>
              <h2 style={{margin:0,fontSize:20,fontWeight:700,color:QB.gray1}}>{vendor?.nom||'Fournisseur'}</h2>
              <span style={{fontSize:13,color:QB.gray2}}>{vendor?.type} · {vendor?.pays||'Cameroun'}</span>
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>onNewBill&&onNewBill(vendor)} style={S.btnBlue}>+ Saisir un bill</button>
            <button onClick={()=>onEdit&&onEdit(vendor)} style={S.btnOutline}>Modifier</button>
          </div>
        </div>
      </div>
      <div style={{maxWidth:1100,margin:'0 auto',padding:'24px 16px'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
          {[
            {l:'Solde AP',v:fmtF(soldeAP),c:QB.red},
            {l:'Bills totaux',v:bills.filter(b=>b.vendor===vendor?.nom).length,c:QB.gray1},
            {l:'Bills en retard',v:bills.filter(b=>b.vendor===vendor?.nom&&b.statut==='retard').length,c:QB.red},
            {l:'Devise',v:vendor?.devise||'FCFA',c:QB.gray2},
          ].map((k,i)=>(
            <div key={i} style={{...S.card,marginBottom:0,padding:'16px 20px'}}>
              <div style={{fontSize:12,color:QB.gray2,marginBottom:4}}>{k.l}</div>
              <div style={{fontSize:22,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
        <div style={S.card}>
          <div style={{display:'flex',borderBottom:`1px solid ${QB.border}`,padding:'0 20px'}}>
            {tabs.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{padding:'12px 20px',border:'none',background:'none',fontWeight:tab===t.id?700:400,color:tab===t.id?QB.blue:QB.gray2,borderBottom:tab===t.id?`2px solid ${QB.blue}`:'2px solid transparent',cursor:'pointer',fontSize:14}}>{t.l}</button>)}
          </div>
          <div style={S.cardBody}>
            {tab==='overview'&&<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
              <div>{[['Nom',vendor?.nom],['Type',vendor?.type],['Email',vendor?.email||'—'],['Téléphone',vendor?.phone||'—'],['Pays',vendor?.pays||'—'],['Devise',vendor?.devise||'FCFA']].map(([k,v])=>(<div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${QB.gray4}`}}><span style={{color:QB.gray2,fontSize:14}}>{k}</span><span style={{fontSize:14,fontWeight:500}}>{v}</span></div>))}</div>
              <div>{[['Conditions',vendor?.conditions||'Net 30'],['Contact',vendor?.contact_nom||'—'],['Banque',vendor?.compte_banque||'Non renseigné']].map(([k,v])=>(<div key={k} style={{display:'flex',justifyContent:'space-between',padding:'8px 0',borderBottom:`1px solid ${QB.gray4}`}}><span style={{color:QB.gray2,fontSize:14}}>{k}</span><span style={{fontSize:14,fontWeight:500,maxWidth:200,textAlign:'right'}}>{v}</span></div>))}</div>
            </div>}
            {tab==='bills'&&<table style={S.table}>
              <thead><tr><th style={S.th}>N° Bill</th><th style={S.th}>Date</th><th style={S.th}>Échéance</th><th style={{...S.th,textAlign:'right'}}>Total</th><th style={{...S.th,textAlign:'right'}}>Payé</th><th style={{...S.th,textAlign:'right'}}>Solde</th><th style={S.th}>Statut</th></tr></thead>
              <tbody>{bills.filter(b=>b.vendor===vendor?.nom).length===0
                ? <tr><td colSpan={7} style={{...S.td,textAlign:'center',color:QB.gray2,padding:32}}>Aucun bill</td></tr>
                : bills.filter(b=>b.vendor===vendor?.nom).map((b,i)=><tr key={i}><td style={{...S.td,color:QB.blue,fontWeight:600}}>{b.number}</td><td style={S.td}>{b.date}</td><td style={{...S.td,color:b.statut==='retard'?QB.red:'inherit'}}>{b.due}</td><td style={{...S.td,textAlign:'right'}}>{fmtF(b.total)}</td><td style={{...S.td,textAlign:'right',color:QB.green}}>{fmtF(b.paye)}</td><td style={{...S.td,textAlign:'right',fontWeight:600,color:b.solde>0?QB.red:QB.green}}>{fmtF(b.solde)}</td><td style={S.td}><span style={S.badge(b.statut==='paye'?'green':b.statut==='retard'?'red':'orange')}>{b.statut}</span></td></tr>)}</tbody>
            </table>}
            {(tab==='contacts'||tab==='historique')&&<div style={{padding:32,textAlign:'center',color:QB.gray2}}><div style={{fontSize:48,marginBottom:12}}>📋</div><p>Section {tab} — {vendor?.nom}</p></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// Export QB constants for reuse
export { QB, S, fmtF };
