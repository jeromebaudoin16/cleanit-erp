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
import Approvals from './pages/Approvals';
import CRM from './pages/CRM';
import Analytics from './pages/Analytics';
import Contrats from './pages/Contrats';
import Mediation from './pages/Mediation';
import PurchaseOrders from './pages/PurchaseOrders';
import BI from './pages/BI';
import AI from './pages/AI';
import Profile from './pages/Profile';

const Guard = ({ children }) =>
  (localStorage.getItem('token') || sessionStorage.getItem('token'))
    ? children : <Navigate to="/login" replace />;

const Soon = ({ title, color='#4f8ef7' }) => (
  <div style={{ padding:40, textAlign:'center', marginTop:60 }}>
    <div style={{ width:72, height:72, borderRadius:20, background:`${color}12`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
    </div>
    <h2 style={{ fontSize:22, fontWeight:800, color:'#1e293b', marginBottom:8 }}>{title}</h2>
    <p style={{ color:'#64748b', fontSize:14 }}>Ce module sera disponible prochainement</p>
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
          <Route path="profile"         element={<Profile />} />
          <Route path="sites"           element={<Sites />} />
          <Route path="tickets"         element={<Tickets />} />
          <Route path="technicians"     element={<Techniciens />} />
          <Route path="interventions"   element={<Interventions />} />
          <Route path="planning"        element={<Planning />} />
          <Route path="inventaire"      element={<Inventaire />} />
          <Route path="contrats"        element={<Contrats />} />
          <Route path="mediation"       element={<Mediation />} />
          <Route path="purchase-orders" element={<PurchaseOrders />} />
          <Route path="approvals"       element={<Approvals />} />
          <Route path="finance"         element={<Finance />} />
          <Route path="rh"              element={<RH />} />
          <Route path="crm"             element={<CRM />} />
          <Route path="analytics"       element={<Analytics />} />
          <Route path="bi"              element={<BI />} />
          <Route path="ai"              element={<AI />} />
          <Route path="map" element={<MapPage />} />
          <Route path="meteo"           element={<Soon title="Météo Sites" color="#0891b2" />} />
          <Route path="messaging"       element={<Soon title="Messagerie Interne" color="#7c3aed" />} />
          <Route path="provisioning"    element={<Soon title="Provisioning Réseau" color="#4f8ef7" />} />
          <Route path="evidence" element={<Evidence />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
