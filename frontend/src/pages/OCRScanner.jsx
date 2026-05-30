import { useState } from 'react';

const extractInvoiceData = (text) => {
  const lines = text.split('\n').filter(l => l.trim());
  const amountReg = /(\d[\d\s]*[.,]\d{2})\s*(FCFA|XAF|F)/i;
  const dateReg = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/;
  const refReg = /(INV|FAC|N)[°:\s#-]*([A-Z0-9]+)/i;
  let amount = null, date = null, ref = null;
  for(const line of lines) {
    if(!amount) { const m = line.match(amountReg); if(m) amount = parseFloat(m[1].replace(/\s/g,'').replace(',','.')); }
    if(!date)   { const m = line.match(dateReg);   if(m) date = m[0]; }
    if(!ref)    { const m = line.match(refReg);    if(m) ref = m[2]; }
  }
  return { amount, date, reference: ref, rawText: text };
};

export default function OCRScanner() {
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [preview, setPreview] = useState(null);

  const loadTesseract = () => new Promise(res => {
    if(window.Tesseract) return res(window.Tesseract);
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.1.0/tesseract.min.js';
    s.onload = () => res(window.Tesseract);
    document.head.appendChild(s);
  });

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if(!file) return;
    setProcessing(true); setResult(null);
    setPreview(URL.createObjectURL(file));
    try {
      const T = await loadTesseract();
      setProgress('Chargement OCR...');
      const r = await T.recognize(file, 'fra+eng', {
        logger: m => { if(m.status === 'recognizing text') setProgress('OCR: '+Math.round(m.progress*100)+'%'); }
      });
      setResult(extractInvoiceData(r.data.text));
    } catch(e) {
      setResult({ error: e.message });
    }
    setProcessing(false);
  };

  return (
    <div style={{minHeight:'100vh',background:'#f8fafc',padding:24,fontFamily:"'Inter','Segoe UI',Arial,sans-serif"}}>
      <div style={{maxWidth:700,margin:'0 auto'}}>
        <div style={{marginBottom:24}}>
          <h2 style={{fontSize:20,fontWeight:700,color:'#111',margin:0}}>📷 Scan OCR Facture</h2>
          <p style={{fontSize:13,color:'#6b7280',marginTop:4}}>Photographiez une facture pour extraire automatiquement les données</p>
        </div>

        <div style={{background:'white',borderRadius:12,border:'2px dashed #d1d5db',padding:32,textAlign:'center',marginBottom:20,cursor:'pointer'}}
          onClick={() => document.getElementById('ocr-file').click()}>
          <div style={{fontSize:48,marginBottom:12}}>📄</div>
          <div style={{fontSize:14,fontWeight:600,color:'#374151',marginBottom:4}}>Cliquez pour sélectionner une image</div>
          <div style={{fontSize:12,color:'#9ca3af'}}>JPG, PNG — Photo d'une facture papier ou numérique</div>
          <input id="ocr-file" type="file" accept="image/*" onChange={handleFile} style={{display:'none'}}/>
        </div>

        {preview && (
          <div style={{background:'white',borderRadius:12,padding:16,marginBottom:20,border:'1px solid #e2e8f0'}}>
            <img src={preview} alt="Aperçu" style={{maxWidth:'100%',borderRadius:8,maxHeight:300,objectFit:'contain'}}/>
          </div>
        )}

        {processing && (
          <div style={{background:'#f0fdf4',borderRadius:12,padding:20,textAlign:'center',marginBottom:20,border:'1px solid #bbf7d0'}}>
            <div style={{fontSize:24,marginBottom:8}}>⏳</div>
            <div style={{fontSize:14,color:'#16a34a',fontWeight:600}}>{progress}</div>
          </div>
        )}

        {result && !result.error && (
          <div style={{background:'white',borderRadius:12,padding:24,border:'1px solid #e2e8f0',marginBottom:20}}>
            <div style={{fontSize:16,fontWeight:700,color:'#111',marginBottom:16}}>✅ Données extraites</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:20}}>
              {[
                {label:'Référence', value: result.reference, icon:'📋'},
                {label:'Montant', value: result.amount ? result.amount.toLocaleString('fr-FR')+' FCFA' : null, icon:'💰'},
                {label:'Date', value: result.date, icon:'📅'},
              ].map(({label,value,icon}) => value ? (
                <div key={label} style={{background:'#f8fafc',borderRadius:8,padding:'12px 16px',border:'1px solid #e2e8f0'}}>
                  <div style={{fontSize:11,color:'#6b7280',marginBottom:4}}>{icon} {label}</div>
                  <div style={{fontSize:14,fontWeight:700,color:'#111'}}>{value}</div>
                </div>
              ) : null)}
            </div>
            <details>
              <summary style={{fontSize:12,color:'#6b7280',cursor:'pointer'}}>Texte brut extrait</summary>
              <pre style={{fontSize:10,color:'#374151',marginTop:8,maxHeight:150,overflow:'auto',
                whiteSpace:'pre-wrap',background:'#f8fafc',padding:12,borderRadius:8}}>
                {result.rawText}
              </pre>
            </details>
            <button onClick={() => {
              const data = {
                ref: result.reference || '',
                total: result.amount || 0,
                date: result.date || new Date().toLocaleDateString('fr-FR'),
              };
              localStorage.setItem('ocr_import', JSON.stringify(data));
              alert('Données sauvegardées. Créez une facture dans Job Center pour les utiliser.');
            }} style={{marginTop:16,background:'#2CA01C',border:'none',borderRadius:8,
              padding:'10px 24px',color:'white',fontSize:13,fontWeight:600,cursor:'pointer',width:'100%'}}>
              ✓ Utiliser ces données
            </button>
          </div>
        )}

        {result && result.error && (
          <div style={{background:'#fef2f2',borderRadius:12,padding:20,border:'1px solid #fecaca'}}>
            <div style={{color:'#dc2626',fontWeight:600}}>❌ Erreur OCR</div>
            <div style={{fontSize:12,color:'#dc2626',marginTop:4}}>{result.error}</div>
          </div>
        )}
      </div>
    </div>
  );
}
