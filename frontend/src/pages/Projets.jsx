import React from 'react';

export default function Projets() {
  return (
    <div style={{display:'flex',height:'100%',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:16,background:'#F9FAFB',fontFamily:'inherit'}}>
      <div style={{width:64,height:64,borderRadius:16,background:'#E6F1FB',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#185FA5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/>
        </svg>
      </div>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:18,fontWeight:600,color:'#111827',marginBottom:6}}>Module Projets</div>
        <div style={{fontSize:13,color:'#6B7280',maxWidth:380,lineHeight:1.6}}>
          Ce module est en cours de développement.<br/>
          La gestion de projets est actuellement intégrée dans <strong>CleanITBooks</strong> (Jobs) et <strong>Bons de Commande</strong>.
        </div>
      </div>
      <div style={{display:'flex',gap:10,marginTop:8}}>
        <a href="/cleanitbooks" style={{padding:'8px 18px',borderRadius:8,border:'none',background:'#185FA5',color:'#fff',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:500,textDecoration:'none'}}>
          Aller à CleanITBooks
        </a>
        <a href="/purchase-orders" style={{padding:'8px 18px',borderRadius:8,border:'1px solid #E5E7EB',background:'#fff',color:'#374151',cursor:'pointer',fontFamily:'inherit',fontSize:13,textDecoration:'none'}}>
          Bons de Commande
        </a>
      </div>
    </div>
  );
}
