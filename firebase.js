// ══════════════════════════════════════════════
//  ANTITHESIS — Firebase Config & Shared Utils
// ══════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getDatabase, ref, set, get, push, remove, onValue, update
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyExample",
  authDomain: "antithesis-al-muayyad.firebaseapp.com",
  databaseURL: "https://antithesis-al-muayyad-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "antithesis-al-muayyad",
  storageBucket: "antithesis-al-muayyad.appspot.com",
  messagingSenderId: "1014116431079",
  appId: "1:1014116431079:web:5f490096bf6ecdf7011e42"
};

const app = initializeApp(firebaseConfig);
const db  = getDatabase(app);

// ── Session helpers ──
const SESSION_KEY  = 'antithesis_member';
const USERNAME_KEY = 'antithesis_username';

export function getSession() {
  const nama     = sessionStorage.getItem(SESSION_KEY);
  const username = sessionStorage.getItem(USERNAME_KEY);
  return nama && username ? { nama, username } : null;
}

export function setSession(nama, username) {
  sessionStorage.setItem(SESSION_KEY,  nama);
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
}

export function requireAuth() {
  if (!getSession()) { window.location.href = 'login.html'; }
}

// ── SHA-256 ──
export async function sha256(str) {
  const buf  = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Toast notif ──
export function toast(msg, type = 'ok') {
  let t = document.getElementById('__toast');
  if (!t) {
    t = document.createElement('div');
    t.id = '__toast';
    t.style.cssText = `
      position:fixed;bottom:36px;left:50%;transform:translateX(-50%) translateY(20px);
      background:#111;border:1px solid rgba(201,168,76,.35);color:#c9a84c;
      font-family:'Montserrat',sans-serif;font-size:.52rem;letter-spacing:.28em;
      text-transform:uppercase;padding:13px 28px;z-index:9999;
      opacity:0;transition:all .4s;pointer-events:none;white-space:nowrap;
      box-shadow:0 8px 40px rgba(0,0,0,.6);`;
    document.body.appendChild(t);
  }
  if (type === 'err') t.style.color = '#e74c3c';
  else t.style.color = '#c9a84c';
  t.textContent = msg;
  t.style.opacity = '1';
  t.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(t.__tid);
  t.__tid = setTimeout(() => {
    t.style.opacity = '0';
    t.style.transform = 'translateX(-50%) translateY(20px)';
  }, 3400);
}

// ── Firebase exports ──
export { db, ref, set, get, push, remove, onValue, update };
export const ADMIN_PIN = '300105';
