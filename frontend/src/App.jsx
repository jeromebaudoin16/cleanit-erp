import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Sites from './pages/Sites';
import Tickets from './pages/Tickets';
import Techniciens from './pages/Techniciens';
import Interventions from './pages/Interventions';
import Planning from './pages/Planning';
import Inventaire from './pages/Inventaire';
import Finance from './pages/Finance';
import RH from './pages/RH';

const Guard = ({ children }) =>
  (localStorage.getItem('token') || sessionStorage.getItem('token'))
    ? children : <Navigate to="/login" replace />;

const Soon = ({ title, color = '#0078d4' }) => (
  <div style={{ padding:40, textAlign:'center', marginTop:40 }}>
    <div style={{ width:64, height:64, borderRadius:16, background:`${color}15`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    </div>
    <h2 style={{ fontSize:20, fontWeight:700, color:'#1e293b', marginBottom:8 }}>{title}</h2>
    <p style={{ color:'#64748b', fontSize:14 }}>Module en cours de développement — disponible prochainement</p>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Guard><Layout /></Guard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard"       element={<Dashboard />} />
          <Route path="sites"           element={<Sites />} />
          <Route path="tickets"         element={<Tickets />} />
          <Route path="technicians"     element={<Techniciens />} />
          <Route path="interventions"   element={<Interventions />} />
          <Route path="planning"        element={<Planning />} />
          <Route path="inventaire"      element={<Inventaire />} />
          <Route path="finance"         element={<Finance />} />
          <Route path="rh"              element={<RH />} />
          <Route path="contrats"        element={<Soon title="Contrats SLA" color="#16a34a" />} />
          <Route path="mediation"       element={<Soon title="Médiation KPIs" color="#7c3aed" />} />
          <Route path="provisioning"    element={<Soon title="Provisioning Réseau" color="#0078d4" />} />
          <Route path="evidence"        element={<Soon title="Evidence Packs Huawei" color="#ea580c" />} />
          <Route path="purchase-orders" element={<Soon title="Bons de Commande" color="#7c3aed" />} />
          <Route path="crm"             element={<Soon title="CRM Clients" color="#16a34a" />} />
          <Route path="map"             element={<Soon title="Carte Digital Twin" color="#0078d4" />} />
          <Route path="meteo"           element={<Soon title="Météo Sites" color="#0891b2" />} />
          <Route path="messaging"       element={<Soon title="Messagerie Interne" color="#7c3aed" />} />
          <Route path="analytics"       element={<Soon title="Analytics & KPIs" color="#f59e0b" />} />
          <Route path="bi"              element={<Soon title="Business Intelligence" color="#dc2626" />} />
          <Route path="ai"              element={<Soon title="IA Prédictive" color="#7c3aed" />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
