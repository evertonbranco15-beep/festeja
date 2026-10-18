(() => {
  'use strict';
  const STORAGE_KEY = 'festeja-planner-v1';
  const SUPABASE_URL = 'https://cjoasktqvxendspxabfc.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_yYfc-J5PK1ha7dgfF4R33g_4V7Q_gWh';
  const SHARED_HASH = /^#\/p\/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/i;
  const TYPES = {
    batizado: { label: 'Batizado', emoji: '🕊️', decoration: '🕊️ 👶 ✝️', color: '#8faebe', accent: '#dfc88e' },
    aniversario: { label: 'Aniversário', emoji: '🎂', decoration: '✨ 🎂 ✨', color: '#c77d67', accent: '#e8b7a5' },
    casamento: { label: 'Casamento', emoji: '💍', decoration: '✧ 💍 ✧', color: '#9e7886', accent: '#dfc6cc' },
    confraternizacao: { label: 'Confraternização', emoji: '🥂', decoration: '🥂 ✨ 🥂', color: '#718e75', accent: '#b8c9a9' },
    infantil: { label: 'Festa infantil', emoji: '🎈', decoration: '🎈 ⭐ 🎈', color: '#8187bd', accent: '#c4caed' },
    personalizado: { label: 'Personalizado', emoji: '🎉', decoration: '✦ 🎉 ✦', color: '#bd8069', accent: '#e7bc9b' }
  };
  const TASK_TEMPLATES = ['Pagar fornecedores', 'Enviar convites', 'Confirmar presenças', 'Encomendar o bolo', 'Finalizar mesas'];
  const id = () => crypto.randomUUID ? crypto.randomUUID() : `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const addDays = (date, n) => { const d = new Date(date); d.setDate(d.getDate() + n); return d; };
  const localDateTime = (date, time = '12:00') => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}T${time}`;
  const dateInput = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const fmtDate = value => value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(`${value.slice(0, 10)}T12:00:00`)).replace('.', '') : 'Sem data';
  const fmtDateTime = value => value ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(value)) : 'Sem prazo';
  const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const partyTheme = type => TYPES[type] || TYPES.personalizado;
  const groupNames = ['Família', 'Amigos', 'Trabalho', 'Família Silva', 'Amigos da escola', 'Vizinhos'];
  const guestNames = ['Ana Souza', 'Beatriz Lima', 'Bruno Costa', 'Camila Rocha', 'Daniel Martins', 'Eduarda Alves', 'Felipe Nunes', 'Gabriela Melo', 'Helena Castro', 'Igor Santos', 'João Pedro', 'Karina Freitas', 'Lucas Ribeiro', 'Marina Oliveira', 'Nina Carvalho', 'Otávio Mendes', 'Paula Ferreira', 'Rafael Gomes', 'Sofia Barros', 'Thiago Lopes', 'Valentina Dias', 'André Moreira', 'Bianca Teixeira', 'Caio Azevedo', 'Davi Pires', 'Elisa Farias', 'Fernanda Reis', 'Gustavo Neves', 'Isabela Campos', 'Júlia Cardoso', 'Leonardo Tavares', 'Manuela Prado', 'Noah Correia', 'Pedro Henrique', 'Renata Vieira'];
  function seedData() {
    const today = new Date();
    const partyId = id();
    const guests = guestNames.map((name, index) => ({ id: id(), name, group: groupNames[index % groupNames.length], status: index < 27 ? 'confirmado' : index % 3 ? 'pendente' : 'recusou', notes: index === 2 ? 'Vegetariano' : '', seatId: index < 26 ? `t${Math.floor(index / 5) + 1}-c${index % 5 + 1}` : null }));
    const taskData = [
      { title: 'Reservar o espaço da festa', offset: -1, time: '16:00', owner: 'Maria', reminders: [1440, 60] },
      { title: 'Enviar convites', offset: 1, time: '18:00', owner: 'Marina', reminders: [1440, 60] },
      { title: 'Encomendar o bolo', offset: 4, time: '12:00', owner: 'Paula', reminders: [10080, 1440] },
      { title: 'Confirmar presenças', offset: 8, time: '18:00', owner: 'Maria', reminders: [1440, 60] },
      { title: 'Finalizar mesas', offset: 14, time: '10:00', owner: 'Rafael', reminders: [1440] },
      { title: 'Pagar fornecedores', offset: 19, time: '15:00', owner: 'Maria', reminders: [10080, 1440] }
    ];
    return { version: 1, activePartyId: partyId, parties: [{ id: partyId, name: 'Aniversário da Maria – 30 anos', date: dateInput(addDays(today, 30)), time: '16:00', venue: 'Jardim das Oliveiras', type: 'aniversario', theme: 'Jardim encantado', color: '#c77d67', accent: '#e8b7a5', estimate: 50, guests, tables: [
      { id: 't1', name: 'Mesa 1', shape: 'round', chairs: 6, x: 160, y: 120 }, { id: 't2', name: 'Mesa 2', shape: 'round', chairs: 6, x: 355, y: 120 }, { id: 't3', name: 'Mesa 3', shape: 'square', chairs: 6, x: 550, y: 120 }, { id: 't4', name: 'Mesa 4', shape: 'rectangular', chairs: 6, x: 160, y: 330 }, { id: 't5', name: 'Mesa 5', shape: 'round', chairs: 6, x: 355, y: 330 }, { id: 't6', name: 'Mesa 6', shape: 'square', chairs: 6, x: 550, y: 330 }
    ], tasks: taskData.map(item => ({ id: id(), title: item.title, due: localDateTime(addDays(today, item.offset), item.time), owner: item.owner, notes: '', status: 'pendente', reminders: item.reminders, sentReminders: [], snoozeUntil: null })) }] };
  }
  function loadData() {
    try { const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)); if (stored?.parties?.length) return stored; } catch (error) { console.warn('Não foi possível ler os dados salvos.', error); }
    const data = seedData(); localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); return data;
  }
  let data = loadData();
  let currentScreen = 'inicio';
  let guestFilters = { query: '', status: 'todos', group: 'todos', seat: 'todos' };
  let taskFilter = 'todas';
  let customReminderValues = [];
  let toastTimer;
  let mapZoom = 1;
  let mapPan = { x: 0, y: 0 };
  let mapInteraction = null;
  let dragGuestId = null;
  let dragPreview = null;
  const syncTimers = new Map();
  const syncing = new Set();
  const revisions = new Map();
  const deferredRemote = new Map();
  let syncError = false;
  let polling = false;
  async function rpc(name, args) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify(args)
    });
    if (!response.ok) throw new Error(`Falha de sincronização (${response.status})`);
    return response.json();
  }
  function sharedPayload(party) {
    const { sharedId, sharedVersion, syncPending, ...fields } = party;
    return { ...fields, tasks: party.tasks.map(({ sentReminders, snoozeUntil, snoozeSent, ...task }) => task) };
  }
  function mergeById(local, remote) {
    const localIds = new Set(local.map(item => item.id));
    return [...local, ...remote.filter(item => !localIds.has(item.id))];
  }
  function mergeParty(local, remote) {
    return { ...remote, ...local, guests: mergeById(local.guests, remote.guests || []),
      tables: mergeById(local.tables, remote.tables || []), tasks: mergeById(local.tasks, remote.tasks || []) };
  }
  function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); renderHeader(); }
  function updateSyncStatus() {
    const party = activeParty(); const status = $('#sync-status');
    status.hidden = !party.sharedId;
    if (!party.sharedId) return;
    const pending = party.syncPending || syncing.has(party.sharedId);
    status.textContent = !navigator.onLine || syncError ? 'Offline, será enviado depois' : pending ? 'Sincronizando…' : 'Sincronizado ✓';
  }
  function schedulePush(sharedId, delay = 800) {
    clearTimeout(syncTimers.get(sharedId));
    syncTimers.set(sharedId, setTimeout(() => { syncTimers.delete(sharedId); pushShared(sharedId); }, delay));
  }
  async function pushShared(sharedId) {
    const party = data.parties.find(item => item.sharedId === sharedId);
    if (!party?.syncPending || syncing.has(sharedId) || !navigator.onLine) { updateSyncStatus(); return; }
    syncing.add(sharedId); updateSyncStatus();
    try {
      const rows = await rpc('get_shared_party', { p_id: sharedId });
      if (!rows.length) throw new Error('Festa compartilhada não encontrada');
      const current = data.parties.find(item => item.sharedId === sharedId);
      if (!current?.syncPending) return;
      if (Number(rows[0].version) > Number(current.sharedVersion || 0)) {
        Object.assign(current, mergeParty(current, rows[0].data));
        persist();
      }
      const revision = revisions.get(sharedId) || 0;
      const saved = await rpc('save_shared_party', { p_id: sharedId, p_data: sharedPayload(current) });
      if (!saved.length) throw new Error('Festa compartilhada não encontrada');
      if (current.sharedId !== sharedId) return;
      current.sharedVersion = Number(saved[0].version);
      if ((revisions.get(sharedId) || 0) === revision) current.syncPending = false;
      syncError = false; persist();
    } catch (error) {
      console.warn('Não foi possível sincronizar a festa.', error);
      syncError = true; updateSyncStatus();
    } finally {
      syncing.delete(sharedId);
      updateSyncStatus();
      if (data.parties.some(item => item.sharedId === sharedId && item.syncPending) && navigator.onLine && !syncError) schedulePush(sharedId);
    }
  }
  function renderCurrent() {
    renderHeader();
    if (currentScreen === 'inicio') renderHome();
    if (currentScreen === 'convidados') renderGuests();
    if (currentScreen === 'mesas') renderTables();
    if (currentScreen === 'tarefas') renderTasks();
    if (currentScreen === 'resumo') renderSummary();
  }
  function applyRemote(sharedId, row) {
    const index = data.parties.findIndex(item => item.sharedId === sharedId);
    if (index < 0 || data.parties[index].syncPending || syncing.has(sharedId)) return;
    const local = data.parties[index];
    if (Number(row.version) <= Number(local.sharedVersion || 0)) return;
    if (document.querySelector('dialog[open]')) { deferredRemote.set(sharedId, row); return; }
    const reminderState = new Map(local.tasks.map(task => [task.id, {
      sentReminders: task.sentReminders || [], snoozeUntil: task.snoozeUntil || null, snoozeSent: task.snoozeSent || false
    }]));
    data.parties[index] = { ...row.data, id: local.id, sharedId, sharedVersion: Number(row.version), syncPending: false,
      tasks: (row.data.tasks || []).map(task => ({ ...task, ...reminderState.get(task.id) })) };
    persist(); renderCurrent();
  }
  function applyDeferredRemote() {
    if (document.querySelector('dialog[open]')) return;
    for (const [sharedId, row] of deferredRemote) { deferredRemote.delete(sharedId); applyRemote(sharedId, row); }
  }
  async function pollShared() {
    if (document.hidden || polling) return;
    const party = activeParty(); if (!party.sharedId) return;
    if (party.syncPending) { if (navigator.onLine) schedulePush(party.sharedId, 0); return; }
    polling = true;
    try {
      const rows = await rpc('get_shared_party', { p_id: party.sharedId });
      if (!rows.length) { showToast('Festa compartilhada não encontrada'); return; }
      if (Number(rows[0].version) > Number(party.sharedVersion || 0)) applyRemote(party.sharedId, rows[0]);
      syncError = false; updateSyncStatus();
    } catch (error) { console.warn('Falha ao buscar alterações.', error); syncError = true; updateSyncStatus(); }
    finally { polling = false; }
  }
  async function openSharedLink() {
    const match = location.hash.match(SHARED_HASH); if (!match) return;
    const sharedId = match[1].toLowerCase();
    try {
      const rows = await rpc('get_shared_party', { p_id: sharedId });
      if (!rows.length) { showToast('Festa compartilhada não encontrada'); return; }
      if (location.hash.toLowerCase() !== `#/p/${sharedId}`) return;
      const remote = rows[0];
      let party = data.parties.find(item => item.sharedId === sharedId || item.id === remote.data.id);
      if (party?.syncPending) schedulePush(sharedId, 0);
      else if (party) {
        party.sharedId = sharedId;
        applyRemote(sharedId, remote);
      } else {
        party = { ...remote.data, sharedId, sharedVersion: Number(remote.version), syncPending: false };
        data.parties.push(party);
      }
      data.activePartyId = party.id;
      persist(); renderCurrent(); showToast('Festa compartilhada aberta');
    } catch (error) { console.warn('Não foi possível abrir o link.', error); showToast('Erro ao abrir festa compartilhada'); }
  }
  function sharedLink(sharedId) { return `${location.href.split('#')[0]}#/p/${sharedId}`; }
  function showShareDialog(party) {
    $('#share-link').value = sharedLink(party.sharedId);
    $('#web-share').disabled = !navigator.share;
    $('#share-dialog').showModal();
  }
  async function shareForEditing(partyId, button) {
    const party = data.parties.find(item => item.id === partyId);
    if (!party) return;
    if (party.sharedId) { showShareDialog(party); return; }
    button.disabled = true;
    try {
