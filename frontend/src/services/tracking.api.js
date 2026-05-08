const API = 'https://cleanit-erp-production.up.railway.app';
const WS_URL = 'https://cleanit-erp-production.up.railway.app';

let socket = null;
let watchId = null;

const getToken = () => localStorage.getItem('token') || '';

// Connexion WebSocket
export const connectTracking = (userId, userName, userType, deviceId, onPosition, onAlert) => {
  if(socket) return;
  
  // Utiliser socket.io-client si disponible, sinon WebSocket natif
  try {
    const { io } = require('socket.io-client');
    socket = io(WS_URL + '/tracking', {
      auth: { token: getToken() },
      transports: ['websocket', 'polling'],
    });
    
    socket.on('connect', () => {
      console.log('[WS] Connecte');
      socket.emit('register', { userId, userName, userType, deviceId: deviceId || navigator.userAgent });
    });

    socket.on('new_alert', (alert) => {
      if(onAlert) onAlert(alert);
    });

    socket.on('position_update', (data) => {
      if(onPosition) onPosition(data);
    });

    socket.on('disconnect', () => {
      console.log('[WS] Deconnecte');
    });
  } catch(e) {
    console.warn('[WS] socket.io non disponible, mode dégradé');
  }
};

// Envoyer position GPS
export const sendPosition = (data) => {
  if(socket && socket.connected) {
    socket.emit('position_update', data);
  } else {
    // Fallback HTTP
    fetch(`${API}/api/tracking/pointages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify(data),
    }).catch(() => saveOffline(data));
  }
};

// Démarrer tracking GPS
export const startGPSTracking = (userId, userName, userType, zoneCode) => {
  if(!navigator.geolocation) return;
  
  watchId = navigator.geolocation.watchPosition(
    (pos) => {
      sendPosition({
        userId, userName, userType, zoneCode,
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        speed: pos.coords.speed || 0,
        deviceId: navigator.userAgent.substring(0,50),
        batteryLevel: null,
        networkType: navigator.connection?.effectiveType || 'unknown',
        timestamp: Date.now(),
      });
    },
    (err) => console.warn('[GPS]', err.message),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 5000 }
  );
  
  return () => {
    if(watchId) navigator.geolocation.clearWatch(watchId);
    if(socket)  { socket.disconnect(); socket = null; }
  };
};

// Créer pointage via API
export const createPointage = async (data) => {
  try {
    const res = await fetch(`${API}/api/tracking/pointages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
      body: JSON.stringify({ ...data, timestamp: Date.now() }),
    });
    return await res.json();
  } catch(e) {
    console.warn('[API] Indisponible, sauvegarde offline');
    saveOffline(data);
    return null;
  }
};

// Récupérer shifts technicien
export const getMyShifts = async (techId) => {
  try {
    const res = await fetch(`${API}/api/tracking/shifts/tech/${techId}`, {
      headers: { 'Authorization': `Bearer ${getToken()}` }
    });
    return await res.json();
  } catch(e) {
    return [];
  }
};

// Sauvegarde offline IndexedDB
const saveOffline = (data) => {
  try {
    const pending = JSON.parse(localStorage.getItem('cleanit_pending') || '[]');
    pending.push({ ...data, savedAt: Date.now() });
    localStorage.setItem('cleanit_pending', JSON.stringify(pending));
    console.log('[Offline] Pointage sauvegarde localement');
  } catch(e) {}
};

// Sync offline quand réseau revient
export const syncOffline = async () => {
  const pending = JSON.parse(localStorage.getItem('cleanit_pending') || '[]');
  if(pending.length === 0) return;
  
  const synced = [];
  for(const p of pending) {
    try {
      await fetch(`${API}/api/tracking/pointages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` },
        body: JSON.stringify(p),
      });
      synced.push(p);
    } catch(e) { break; }
  }
  
  const remaining = pending.filter(p => !synced.includes(p));
  localStorage.setItem('cleanit_pending', JSON.stringify(remaining));
  console.log(`[Sync] ${synced.length} pointages synchronises`);
  return synced.length;
};

window.addEventListener('online', syncOffline);
