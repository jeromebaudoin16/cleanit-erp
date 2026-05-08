export const generateInvoicePDF = async (invoice, customer, job) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('fr-FR');
  
  // Header
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CleanIT ERP', 20, 18);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Douala, Cameroun | contact@cleanit.cm', 20, 28);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURE CLIENT', 140, 20);
  doc.setFontSize(11);
  doc.text(invoice.id || 'INV-DRAFT', 140, 30);
  
  // Info client
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURÉ À:', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(customer?.company || '—', 20, 62);
  doc.text(customer?.contact || '—', 20, 68);
  doc.text(customer?.city || '—', 20, 74);
  
  // Info facture
  doc.setFont('helvetica', 'bold');
  doc.text('DÉTAILS:', 130, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(`Date: ${invoice.date || today}`, 130, 62);
  doc.text(`Échéance: ${invoice.dueDate || '—'}`, 130, 68);
  doc.text(`Conditions: ${invoice.terms || 'Net 30'}`, 130, 74);
  if(invoice.poNumber) doc.text(`N° PO: ${invoice.poNumber}`, 130, 80);
  
  // Lignes facture
  const tableData = (invoice.lines || []).map(l => [
    l.desc || '—',
    l.qty || 1,
    new Intl.NumberFormat('fr-FR').format(l.rate || 0) + ' ' + (invoice.currency || 'FCFA'),
    l.taxable ? '19.25%' : '—',
    new Intl.NumberFormat('fr-FR').format(l.amount || 0) + ' ' + (invoice.currency || 'FCFA'),
  ]);
  
  autoTable(doc, {
    startY: 90,
    head: [['Description', 'Qté', 'Prix unitaire', 'TVA', 'Montant']],
    body: tableData,
    headStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [240, 246, 255] },
    styles: { fontSize: 9 },
    columnStyles: { 0: {cellWidth: 70}, 4: {halign: 'right'} },
  });
  
  // Totaux
  const finalY = doc.lastAutoTable.finalY + 10;
  const fN = n => new Intl.NumberFormat('fr-FR').format(Math.round(n||0));
  const cur = invoice.currency || 'FCFA';
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Sous-total HT: ${fN(invoice.subtotal)} ${cur}`, 130, finalY);
  doc.text(`TVA 19.25%: ${fN(invoice.taxAmount)} ${cur}`, 130, finalY + 7);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(37, 99, 235);
  doc.text(`TOTAL TTC: ${fN(invoice.total)} ${cur}`, 130, finalY + 16);
  
  if(invoice.balance > 0) {
    doc.setFontSize(11);
    doc.setTextColor(234, 88, 12);
    doc.text(`Solde dû: ${fN(invoice.balance)} ${cur}`, 130, finalY + 24);
  }
  
  // Note
  if(invoice.memo) {
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text(`Note: ${invoice.memo}`, 20, finalY + 16);
  }
  
  // Footer
  doc.setFillColor(240, 244, 255);
  doc.rect(0, 280, 210, 17, 'F');
  doc.setTextColor(100, 100, 100);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('CleanIT ERP · SYSCOHADA · TVA 19.25% · RC Douala · Généré le ' + today, 20, 290);
  
  doc.save(`Facture_${invoice.id || 'DRAFT'}_${today.replace(/\//g,'-')}.pdf`);
};

export const generateBillPDF = async (bill, vendor) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF();
  const today = new Date().toLocaleDateString('fr-FR');
  
  doc.setFillColor(234, 88, 12);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('CleanIT ERP', 20, 18);
  doc.setFontSize(16);
  doc.text('BILL FOURNISSEUR', 130, 20);
  doc.setFontSize(11);
  doc.text(bill.id || 'BILL-DRAFT', 130, 30);
  
  doc.setTextColor(0);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('FOURNISSEUR:', 20, 55);
  doc.setFont('helvetica', 'normal');
  doc.text(vendor?.company || '—', 20, 62);
  doc.text(`Ref: ${bill.refNum || '—'}`, 20, 68);
  doc.text(`Date: ${bill.date || today}`, 20, 74);
  doc.text(`Échéance: ${bill.dueDate || '—'}`, 20, 80);
  
  autoTable(doc, {
    startY: 90,
    head: [['Compte', 'Description', 'Montant']],
    body: (bill.lines || []).map(l => [l.account || '—', l.desc || '—', new Intl.NumberFormat('fr-FR').format(l.amount || 0) + ' ' + (bill.currency || 'FCFA')]),
    headStyles: { fillColor: [234, 88, 12], textColor: 255 },
    alternateRowStyles: { fillColor: [255, 247, 237] },
  });
  
  const fy = doc.lastAutoTable.finalY + 10;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(234, 88, 12);
  doc.text(`TOTAL: ${new Intl.NumberFormat('fr-FR').format(bill.total || 0)} ${bill.currency || 'FCFA'}`, 130, fy);
  
  doc.save(`Bill_${bill.id || 'DRAFT'}_${today.replace(/\//g,'-')}.pdf`);
};

export const generatePayrollPDF = async (employees, period) => {
  const { default: jsPDF } = await import('jspdf');
  const { default: autoTable } = await import('jspdf-autotable');
  
  const doc = new jsPDF('landscape');
  const today = new Date().toLocaleDateString('fr-FR');
  
  doc.setFillColor(124, 58, 237);
  doc.rect(0, 0, 297, 30, 'F');
  doc.setTextColor(255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(`CleanIT ERP — Bulletin de paie — ${period}`, 20, 18);
  
  const calcPayroll = (gross) => {
    const cnps = Math.round(gross * 0.084);
    const taxable = gross - cnps;
    let irpp = 0;
    if(taxable > 291667) irpp = Math.round((taxable-166667)*0.10);
    if(taxable > 458333) irpp = 12500 + Math.round((taxable-291667)*0.15);
    const cac = Math.round(irpp * 0.10);
    return { cnps, irpp, cac, net: gross - cnps - irpp - cac };
  };
  
  const rows = employees.map(e => {
    const p = calcPayroll(e.grossSalary);
    return [e.firstName+' '+e.lastName, e.title, e.dept, new Intl.NumberFormat('fr-FR').format(e.grossSalary), new Intl.NumberFormat('fr-FR').format(p.cnps), new Intl.NumberFormat('fr-FR').format(p.irpp), new Intl.NumberFormat('fr-FR').format(p.cac), new Intl.NumberFormat('fr-FR').format(p.net)];
  });
  
  autoTable(doc, {
    startY: 38,
    head: [['Employé', 'Poste', 'Dept', 'Brut FCFA', 'CNPS 8.4%', 'IRPP', 'CAC 10%', 'Net FCFA']],
    body: rows,
    headStyles: { fillColor: [124, 58, 237], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 243, 255] },
    foot: [[`Total (${employees.length} employés)`, '', '',
      new Intl.NumberFormat('fr-FR').format(employees.reduce((s,e)=>s+e.grossSalary,0)),
      '', '', '',
      new Intl.NumberFormat('fr-FR').format(employees.reduce((s,e)=>s+calcPayroll(e.grossSalary).net,0))]],
    footStyles: { fillColor: [15, 23, 42], textColor: 255, fontStyle: 'bold' },
  });
  
  doc.save(`Paie_${period.replace(/ /g,'_')}_${today.replace(/\//g,'-')}.pdf`);
};
