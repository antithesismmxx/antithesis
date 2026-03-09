// ══════════════════════════════════════════════
//  login.js — Autentikasi ANTITHESIS
// ══════════════════════════════════════════════

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, get, set } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  databaseURL: "https://antithesis-al-muayyad-default-rtdb.asia-southeast1.firebasedatabase.app",
  apiKey: "AIzaSyExample", projectId: "antithesis-al-muayyad",
  appId: "1:1014116431079:web:5f490096bf6ecdf7011e42"
};
const db = getDatabase(initializeApp(firebaseConfig));

// ── SHA-256 ──
async function sha256(str) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

// ── Session ──
function setSession(nama, username) {
  sessionStorage.setItem('antithesis_member', nama);
  sessionStorage.setItem('antithesis_username', username);
}
if (sessionStorage.getItem('antithesis_member')) {
  window.location.href = 'dashboard.html';
}

// ── Show/hide err ──
function showErr(id, msg) {
  const el = document.getElementById(id);
  el.textContent = msg; el.style.display = 'block';
}
function hideErr(id) { document.getElementById(id).style.display = 'none'; }

// ── TABS ──
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
    this.classList.add('active');
    document.getElementById('tab-' + this.dataset.tab).classList.add('active');
  });
});

// ── PASSWORD TOGGLE ──
function setupToggle(btnId, inputId) {
  document.getElementById(btnId).addEventListener('click', () => {
    const inp = document.getElementById(inputId);
    inp.type = inp.type === 'password' ? 'text' : 'password';
  });
}
setupToggle('toggleLoginPass', 'loginPass');
setupToggle('toggleRegPass', 'regPass');

// ── MASUK ──
document.getElementById('btnLogin').addEventListener('click', async () => {
  const username = document.getElementById('loginUser').value.trim().toLowerCase();
  const pass     = document.getElementById('loginPass').value;
  hideErr('loginErr');
  if (!username || !pass) { showErr('loginErr', '✕  Lengkapi semua field'); return; }

  const snap = await get(ref(db, 'antithesis/accounts/' + username));
  if (!snap.exists()) { showErr('loginErr', '✕  Username tidak ditemukan'); return; }

  const data   = snap.val();
  const hashed = await sha256(pass);
  if (data.password !== hashed) { showErr('loginErr', '✕  Password salah'); return; }

  setSession(data.nama, username);
  window.location.href = 'dashboard.html';
});

// Enter key on login
['loginUser','loginPass'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', e => {
    if (e.key === 'Enter') document.getElementById('btnLogin').click();
  });
});

// ── DAFTAR ──
document.getElementById('btnDaftar').addEventListener('click', async () => {
  const username = document.getElementById('regUser').value.trim().toLowerCase();
  const nama     = document.getElementById('regNama').value.trim();
  const pass     = document.getElementById('regPass').value;
  hideErr('regErr');
  document.getElementById('regOk').style.display = 'none';

  if (!username || !nama || !pass) { showErr('regErr', '✕  Lengkapi semua field'); return; }
  if (pass.length < 6)             { showErr('regErr', '✕  Password minimal 6 karakter'); return; }
  if (!/^[a-z0-9_]+$/.test(username)) { showErr('regErr', '✕  Username hanya huruf kecil, angka, underscore'); return; }

  // Cek whitelist
  const wlSnap = await get(ref(db, 'antithesis/whitelist'));
  const wl = wlSnap.val() || {};
  const namaLower = nama.toLowerCase();
  const found = Object.values(wl).some(v => {
    const n = typeof v === 'string' ? v : (v.nama || '');
    return n.toLowerCase() === namaLower;
  });
  if (!found) { showErr('regErr', '✕  Nama tidak ditemukan dalam daftar anggota'); return; }

  // Cek username sudah ada
  const existing = await get(ref(db, 'antithesis/accounts/' + username));
  if (existing.exists()) { showErr('regErr', '✕  Username sudah dipakai'); return; }

  const hashed = await sha256(pass);
  await set(ref(db, 'antithesis/accounts/' + username), { nama, password: hashed });

  document.getElementById('regOk').style.display = 'block';
  document.getElementById('regUser').value = '';
  document.getElementById('regNama').value = '';
  document.getElementById('regPass').value = '';
});

// ── MODAL GANTI PASSWORD ──
document.getElementById('btnOpenPass').addEventListener('click', () => {
  document.getElementById('passModal').classList.add('show');
});
document.getElementById('btnCloseModal').addEventListener('click', () => {
  document.getElementById('passModal').classList.remove('show');
});
document.getElementById('passModal').addEventListener('click', function (e) {
  if (e.target === this) this.classList.remove('show');
});

document.getElementById('btnGantiPass').addEventListener('click', async () => {
  const username = document.getElementById('gpUser').value.trim().toLowerCase();
  const oldPass  = document.getElementById('gpOld').value;
  const newPass  = document.getElementById('gpNew').value;
  hideErr('gpErr');
  document.getElementById('gpOk').style.display = 'none';

  if (!username || !oldPass || !newPass) { showErr('gpErr', '✕  Lengkapi semua field'); return; }
  if (newPass.length < 6)               { showErr('gpErr', '✕  Password baru minimal 6 karakter'); return; }

  const snap = await get(ref(db, 'antithesis/accounts/' + username));
  if (!snap.exists()) { showErr('gpErr', '✕  Username tidak ditemukan'); return; }

  const data     = snap.val();
  const oldHash  = await sha256(oldPass);
  if (data.password !== oldHash) { showErr('gpErr', '✕  Password lama salah'); return; }

  const newHash  = await sha256(newPass);
  await set(ref(db, 'antithesis/accounts/' + username + '/password'), newHash);

  document.getElementById('gpOk').style.display = 'block';
  document.getElementById('gpUser').value = '';
  document.getElementById('gpOld').value  = '';
  document.getElementById('gpNew').value  = '';
});
