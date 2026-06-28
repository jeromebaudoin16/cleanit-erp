import { useEffect, useRef } from 'react';

/**
 * Déconnecte automatiquement l'utilisateur après une période d'inactivité.
 * Surveille les interactions clavier/souris/tactile/scroll pour réinitialiser le minuteur.
 *
 * @param {number} timeoutMs - durée d'inactivité avant déconnexion (défaut: 1h)
 * @param {function} onTimeout - fonction appelée à l'expiration (déconnexion)
 * @param {boolean} enabled - active/désactive la surveillance (ex: désactiver sur l'écran de login)
 */
export function useInactivityLogout(timeoutMs = 60 * 60 * 1000, onTimeout, enabled = true) {
  const timerRef = useRef(null);

  useEffect(() => {
    if (!enabled) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        onTimeout();
      }, timeoutMs);
      // Mémorise le dernier instant d'activité pour survivre à un rechargement de page
      localStorage.setItem('cit_last_activity', String(Date.now()));
    };

    // Vérifie au montage si l'inactivité a déjà dépassé le seuil pendant que l'app était fermée
    const lastActivity = parseInt(localStorage.getItem('cit_last_activity') || '0', 10);
    if (lastActivity && Date.now() - lastActivity > timeoutMs) {
      onTimeout();
      return;
    }

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    events.forEach(ev => window.addEventListener(ev, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach(ev => window.removeEventListener(ev, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeoutMs, onTimeout, enabled]);
}
