(() => {
  'use strict';
  const STORAGE_KEY = 'festeja-planner-v1';
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
  let saveTimer;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const activeParty = () => data.parties.find(party => party.id === data.activePartyId) || data.parties[0];
  const allTasks = () => data.parties.flatMap(party => party.tasks.map(task => ({ ...task, partyId: party.id, partyName: party.name })));
  const seatLookup = party => new Map(party.guests.filter(guest => guest.seatId).map(guest => [guest.seatId, guest]));
  const taskOverdue = task => task.status !== 'concluida' && new Date(task.due).getTime() < Date.now();
  function luminance(hex) {
    const values = (hex || '#c77d67').replace('#', '').match(/.{2}/g) || ['cc', '77', '66'];
    const rgb = values.map(value => parseInt(value, 16) / 255).map(value => value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4);
    return .2126 * rgb[0] + .7152 * rgb[1] + .0722 * rgb[2];
  }
  function contrastRatio(first, second) {
    const values = [luminance(first), luminance(second)].sort((a, b) => b - a);
    return (values[0] + .05) / (values[1] + .05);
  }
  function contrastColor(hex) {
    const ink = '#1b1614';
    return contrastRatio(hex, '#ffffff') > contrastRatio(hex, ink) ? '#ffffff' : ink;
  }
  function readableThemeColor(hex) {
    let [r, g, b] = (hex || '#c77d67').replace('#', '').match(/.{2}/g).map(value => parseInt(value, 16));
    for (let step = 0; step < 24 && contrastRatio(`#${[r,g,b].map(value=>value.toString(16).padStart(2,'0')).join('')}`, '#fffaf5') < 4.5; step++) {
      r = Math.round(r * .88); g = Math.round(g * .88); b = Math.round(b * .88);
    }
    return `#${[r,g,b].map(value=>value.toString(16).padStart(2,'0')).join('')}`;
  }
  function applyTheme() {
    const party = activeParty();
    const theme = partyTheme(party.type);
    const primary = party.color || theme.color;
    document.documentElement.style.setProperty('--primary', primary);
    document.documentElement.style.setProperty('--primary-readable', readableThemeColor(primary));
    document.documentElement.style.setProperty('--accent', party.accent || theme.accent);
    document.documentElement.style.setProperty('--primary-ink', contrastColor(primary));
    $('#event-emoji').textContent = theme.emoji;
    $('#event-label').textContent = party.name;
    document.querySelector('meta[name="theme-color"]').content = primary;
  }
  function save() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); renderHeader(); }, 120);
  }
  function renderHeader() {
    applyTheme();
    $$('.nav-item').forEach(button => button.classList.toggle('active', button.dataset.go === currentScreen));
    $$('.screen').forEach(screen => screen.classList.toggle('active', screen.dataset.screen === currentScreen));
  }
  function go(screen) {
    currentScreen = screen;
    renderHeader();
    if (screen === 'inicio') renderHome();
    if (screen === 'convidados') renderGuests();
    if (screen === 'mesas') renderTables();
    if (screen === 'tarefas') renderTasks();
    if (screen === 'resumo') renderSummary();
    $('#app-main').focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function deadlineMarkup(task, partyName = '') {
    const overdue = taskOverdue(task);
    const label = overdue ? `Atrasada · ${fmtDateTime(task.due)}` : fmtDateTime(task.due);
    return `<div class="deadline ${overdue ? 'overdue' : ''}" data-task="${task.id}" data-party="${task.partyId || ''}"><span class="deadline-dot"></span><div class="deadline-main"><strong>${escapeHTML(task.title)}</strong><small>${escapeHTML(partyName || task.partyName || '')}</small></div><span class="deadline-date">${label}</span></div>`;
  }
  function renderHome() {
    const party = activeParty();
    const theme = partyTheme(party.type);
    const tasks = allTasks().filter(task => task.status !== 'concluida').sort((a, b) => new Date(a.due) - new Date(b.due)).slice(0, 5);
    const confirmed = party.guests.filter(guest => guest.status === 'confirmado').length;
    $('#screen-inicio').innerHTML = `<div class="welcome-row"><div class="party-home-heading"><p class="eyebrow">SEU EVENTO, SEM ESTRESSE</p><h1 id="home-title">Um dia lindo<br>começa por aqui.</h1><p class="subtext">Organize cada detalhe com carinho ✨</p></div><div class="welcome-art">${theme.emoji}</div></div>
      <article class="hero-card" data-decoration="${theme.decoration}"><p class="eyebrow">${escapeHTML(theme.label)}${party.theme ? ` · ${escapeHTML(party.theme)}` : ''}</p><h2>${escapeHTML(party.name)}</h2><div class="hero-meta">${fmtDate(party.date)}${party.time ? ` · ${party.time}` : ''}${party.venue ? ` · ${escapeHTML(party.venue)}` : ''}</div><div class="hero-stats"><div class="hero-stat"><strong>${party.guests.length}</strong><span>convidados</span></div><div class="hero-stat"><strong>${party.tables.length}</strong><span>mesas</span></div><div class="hero-stat"><strong>${confirmed}</strong><span>confirmados</span></div></div></article>
      <div class="section-heading"><h2>Suas festas</h2><button class="text-button" data-action="new-party">＋ Criar festa</button></div>
      <div class="party-grid">${data.parties.map(item => `<button class="party-card" type="button" data-action="select-party" data-id="${item.id}"><span class="party-emblem">${partyTheme(item.type).emoji}</span><span><h3>${escapeHTML(item.name)}</h3><p>${fmtDate(item.date)} · ${item.guests.length} convidados</p></span><span class="party-arrow">›</span></button>`).join('')}</div>
      <div class="section-heading"><h2>Próximos prazos</h2><button class="text-button" data-go="tarefas">Ver tarefas</button></div>
      ${tasks.length ? `<div class="deadline-list">${tasks.map(task => deadlineMarkup(task)).join('')}</div>` : `<div class="empty-state"><div class="empty-icon">☀️</div>Sem tarefas pendentes. Aproveite!</div>`}
      <p class="install-note">Dica: adicione à tela inicial para usar como app.</p>`;
  }
  function groupOptions(party) { return [...new Set(party.guests.map(guest => guest.group).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'pt-BR')); }
  function guestRowMarkup(guest, party) {
    const seat = guest.seatId ? party.tables.find(table => guest.seatId.startsWith(`${table.id}-`)) : null;
    return `<article class="guest-row"><span class="avatar">${escapeHTML(guest.name.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase())}</span><div class="guest-info"><strong>${escapeHTML(guest.name)}</strong><small>${escapeHTML(guest.group || 'Sem grupo')}</small><span class="guest-seat">${seat ? escapeHTML(seat.name) : 'Sem lugar'}</span></div><span class="status-pill status-${guest.status}">${guest.status === 'confirmado' ? 'Confirmado' : guest.status === 'recusou' ? 'Recusou' : 'Pendente'}</span><button class="row-edit" data-action="edit-guest" data-id="${guest.id}" aria-label="Editar ${escapeHTML(guest.name)}">⋯</button></article>`;
  }
  function renderGuests() {
    const party = activeParty();
    const query = guestFilters.query.toLocaleLowerCase('pt-BR');
    const guests = party.guests.filter(guest => (!query || `${guest.name} ${guest.group} ${guest.notes}`.toLocaleLowerCase('pt-BR').includes(query)) && (guestFilters.status === 'todos' || guest.status === guestFilters.status) && (guestFilters.group === 'todos' || guest.group === guestFilters.group) && (guestFilters.seat === 'todos' || (guestFilters.seat === 'com' ? !!guest.seatId : !guest.seatId)));
    $('#screen-convidados').innerHTML = `<div class="page-title-row"><div><p class="eyebrow">${escapeHTML(party.name)}</p><h1 id="guests-title">Convidados</h1></div><button class="button primary" data-action="new-guest">＋ Adicionar</button></div><div class="stats-grid"><div class="stat-card"><strong>${party.guests.length}</strong><span>na lista</span></div><div class="stat-card"><strong>${party.guests.filter(g => g.status === 'confirmado').length}</strong><span>confirmados</span></div><div class="stat-card"><strong>${party.guests.filter(g => !g.seatId && g.status !== 'recusou').length}</strong><span>sem lugar</span></div></div><input class="search-input" id="guest-search" type="search" placeholder="⌕  Buscar convidado" value="${escapeHTML(guestFilters.query)}"><div class="filter-row"><select id="filter-status" aria-label="Filtrar por confirmação"><option value="todos">Todos os status</option><option value="confirmado">Confirmado</option><option value="pendente">Pendente</option><option value="recusou">Recusou</option></select><select id="filter-group" aria-label="Filtrar por grupo"><option value="todos">Todos os grupos</option>${groupOptions(party).map(group => `<option value="${escapeHTML(group)}">${escapeHTML(group)}</option>`).join('')}</select><select id="filter-seat" aria-label="Filtrar por lugar"><option value="todos">Com e sem lugar</option><option value="com">Com lugar</option><option value="sem">Sem lugar</option></select></div><div class="guest-list">${guests.map(guest => guestRowMarkup(guest, party)).join('') || `<div class="empty-state">Nenhum convidado encontrado. Tente mudar os filtros.</div>`}</div>`;
    $('#filter-status').value = guestFilters.status; $('#filter-group').value = guestFilters.group; $('#filter-seat').value = guestFilters.seat;
  }
  const chairId = (table, index) => `${table.id}-c${index + 1}`;
  function tableLabelMarkup(table, index) {
    const seatIndex = index + 1;
    const radius = table.shape === 'round' ? 46 : table.shape === 'rectangular' ? 51 : 43;
    const angle = (Math.PI * 2 * index / table.chairs) - Math.PI / 2;
    const x = table.x + Math.cos(angle) * radius;
    const y = table.y + Math.sin(angle) * radius;
    const occupied = activeParty().guests.some(guest => guest.seatId === chairId(table, index));
    return `<circle class="map-chair ${occupied ? 'full' : ''}" data-chair-id="${chairId(table, index)}" data-table-id="${table.id}" data-seat-label="${seatIndex}" cx="${x}" cy="${y}" r="9"><title>Cadeira ${seatIndex} ${occupied ? 'ocupada' : 'livre'}</title></circle>`;
  }
  function mapTableMarkup(table) {
    const width = table.shape === 'rectangular' ? 106 : table.shape === 'square' ? 78 : 82;
    const height = table.shape === 'rectangular' ? 58 : table.shape === 'square' ? 78 : 82;
    const shape = table.shape === 'round' ? `<circle class="table-shape" cx="${table.x}" cy="${table.y}" r="37"/>` : `<rect class="table-shape" x="${table.x - width / 2}" y="${table.y - height / 2}" width="${width}" height="${height}" rx="${table.shape === 'square' ? 15 : 12}"/>`;
    const occupied = activeParty().guests.filter(guest => guest.seatId?.startsWith(`${table.id}-`)).length;
    return `<g class="map-table" data-table-id="${table.id}">${Array.from({ length: table.chairs }, (_, index) => tableLabelMarkup(table, index)).join('')}${shape}<text class="map-table-label" x="${table.x}" y="${table.y - 2}">${escapeHTML(table.name)}</text><text class="map-table-count" x="${table.x}" y="${table.y + 15}">${occupied}/${table.chairs} ocup.</text></g>`;
  }
  function renderTables() {
    const party = activeParty();
    const seatCount = party.tables.reduce((sum, table) => sum + table.chairs, 0);
    const occupied = party.guests.filter(guest => guest.seatId).length;
    const unseated = party.guests.filter(guest => !guest.seatId && guest.status !== 'recusou');
    $('#screen-mesas').innerHTML = `<div class="page-title-row"><div><p class="eyebrow">${escapeHTML(party.name)}</p><h1 id="tables-title">Mapa de mesas</h1></div><button class="button primary" data-action="new-table">＋ Mesa</button></div><div class="stats-grid map-stats"><div class="stat-card"><strong>${seatCount - occupied}</strong><span>livres</span></div><div class="stat-card"><strong>${occupied}</strong><span>ocupados</span></div><div class="stat-card"><strong>${unseated.length}</strong><span>sem lugar</span></div><div class="stat-card"><strong>${seatCount}</strong><span>capacidade</span></div></div><div class="map-tools"><span class="map-caption">Arraste as mesas para organizar o espaço</span><div class="map-zoom"><button data-action="zoom-out" aria-label="Diminuir zoom">−</button><button data-action="zoom-in" aria-label="Aumentar zoom">＋</button></div></div><div class="map-viewport" id="map-viewport"><svg id="table-map" viewBox="0 0 680 500" role="img" aria-label="Mapa interativo de mesas"><g id="map-world" transform="translate(${mapPan.x} ${mapPan.y}) scale(${mapZoom})">${party.tables.map(mapTableMarkup).join('')}</g></svg></div><div class="map-key"><span><i class="key-dot"></i> ○ Livre</span><span><i class="key-dot full"></i> ✓ Ocupada</span><span>Toque numa mesa para ver os lugares</span></div><div class="section-heading"><h2>Convidados sem lugar</h2><span class="muted" style="font-size:11px">Arraste até uma cadeira</span></div><div class="filter-row" style="flex-wrap:wrap">${unseated.map(guest => `<button class="chip guest-drag" data-guest-id="${guest.id}" type="button">⠿ ${escapeHTML(guest.name)}</button>`).join('') || '<span class="subtext">Todos os convidados têm lugar ✨</span>'}</div>`;
  }
  function renderTasks() {
    const party = activeParty();
    const tasks = [...party.tasks].sort((a, b) => new Date(a.due) - new Date(b.due)).filter(task => taskFilter === 'todas' || (taskFilter === 'pendentes' ? task.status !== 'concluida' : taskFilter === 'concluidas' ? task.status === 'concluida' : taskOverdue(task)));
    const pending = party.tasks.filter(task => task.status !== 'concluida').length;
    $('#screen-tarefas').innerHTML = `<div class="page-title-row"><div><p class="eyebrow">${escapeHTML(party.name)}</p><h1 id="tasks-title">Tarefas</h1></div><button class="button primary" data-action="new-task">＋ Nova</button></div><div class="notice"><strong>⏰ Lembretes no app</strong><br>Ative as notificações e mantenha o app instalado e aberto para receber lembretes. O navegador verifica prazos ao abrir, ao voltar ao app e a cada 30 segundos. Notificações push reais em segundo plano exigem um servidor.</div><div class="toolbar"><button class="button secondary" id="enable-notifications">${('Notification' in window && Notification.permission === 'granted') ? '✓ Notificações ativadas' : '♧ Ativar notificações'}</button></div><div class="section-heading"><h2>Ideias para não esquecer</h2><span class="muted" style="font-size:11px">toque para adicionar</span></div><div class="filter-row">${TASK_TEMPLATES.map(title => `<button class="filter-chip" data-action="template-task" data-title="${escapeHTML(title)}">＋ ${escapeHTML(title)}</button>`).join('')}</div><div class="task-filters">${[['todas','Todas'],['pendentes','Pendentes'],['atrasadas','Atrasadas'],['concluidas','Concluídas']].map(([key,label]) => `<button class="filter-chip ${taskFilter === key ? 'active' : ''}" data-action="task-filter" data-filter="${key}">${label}${key === 'pendentes' ? ` · ${pending}` : ''}</button>`).join('')}</div><div class="task-list">${tasks.map(task => taskCard(task)).join('') || `<div class="empty-state">Nada por aqui. Que tal aproveitar o momento? ✨</div>`}</div>`;
  }
  function reminderLabel(minutes) { return minutes >= 10080 ? `${minutes / 10080} sem. antes` : minutes >= 1440 ? `${minutes / 1440} dia(s) antes` : `${minutes} min antes`; }
  function taskCard(task) {
    const overdue = taskOverdue(task);
    return `<article class="task-card ${overdue ? 'overdue' : ''}"><div class="task-top"><button class="check-task ${task.status === 'concluida' ? 'done' : ''}" data-action="toggle-task" data-id="${task.id}" aria-label="${task.status === 'concluida' ? 'Reabrir tarefa' : 'Marcar como concluída'}">${task.status === 'concluida' ? '✓' : ''}</button><div class="task-copy"><h3>${escapeHTML(task.title)}</h3><div class="task-meta"><span class="${overdue ? 'task-late' : ''}">${overdue ? '⚠ Atrasada · ' : 'Prazo · '}${fmtDateTime(task.due)}</span>${task.owner ? `<br>Responsável: ${escapeHTML(task.owner)}` : ''}${task.reminders?.length ? `<br>⏰ ${task.reminders.map(reminderLabel).join(' · ')}` : ''}</div></div><button class="row-edit" data-action="edit-task" data-id="${task.id}" aria-label="Editar tarefa">⋯</button></div>${task.status !== 'concluida' ? `<div class="task-actions"><button class="button tiny secondary" data-action="snooze-task" data-id="${task.id}" data-minutes="60">Adiar 1h</button><button class="button tiny secondary" data-action="snooze-task" data-id="${task.id}" data-minutes="1440">Adiar 1 dia</button><button class="button tiny secondary" data-action="snooze-task" data-id="${task.id}" data-minutes="custom">Outro prazo</button><button class="button tiny ghost" data-action="toggle-task" data-id="${task.id}">Concluir</button></div>` : ''}</article>`;
  }
  function renderSummary() {
    const party = activeParty();
    const confirmed = party.guests.filter(g => g.status === 'confirmado').length;
    const occupied = party.guests.filter(g => g.seatId).length;
    const capacity = party.tables.reduce((sum, table) => sum + table.chairs, 0);
    const done = party.tasks.filter(task => task.status === 'concluida').length;
    const nextTasks = [...party.tasks].filter(task => task.status !== 'concluida').sort((a,b) => new Date(a.due) - new Date(b.due)).slice(0,3);
    $('#screen-resumo').innerHTML = `<div class="page-title-row"><div><p class="eyebrow">${escapeHTML(party.name)}</p><h1 id="summary-title">Tudo em um olhar</h1></div><span class="welcome-art">${partyTheme(party.type).emoji}</span></div><article class="hero-card" data-decoration="${partyTheme(party.type).decoration}"><p class="eyebrow">${escapeHTML(partyTheme(party.type).label)}${party.theme ? ` · ${escapeHTML(party.theme)}` : ''}</p><h2>${escapeHTML(party.name)}</h2><div class="hero-meta">${fmtDate(party.date)}${party.time ? ` · ${party.time}` : ''}<br>${escapeHTML(party.venue || 'Local a definir')}</div></article><div class="stats-grid"><div class="stat-card"><strong>${party.guests.length}</strong><span>convidados</span></div><div class="stat-card"><strong>${confirmed}</strong><span>confirmados</span></div><div class="stat-card"><strong>${occupied}/${capacity}</strong><span>lugares usados</span></div></div><div class="section-heading"><h2>Preparativos</h2><span class="muted" style="font-size:11px">${done}/${party.tasks.length} concluídas</span></div><div class="progress-track"><span style="width:${party.tasks.length ? Math.round(done / party.tasks.length * 100) : 0}%"></span></div><div class="progress-caption"><span>Progresso das tarefas</span><strong>${party.tasks.length ? Math.round(done / party.tasks.length * 100) : 0}%</strong></div><div class="summary-actions"><button class="button primary" data-action="export-png">⬇ Baixar mapa PNG</button><button class="button secondary" data-action="export-pdf">▤ PDF / Imprimir</button><button class="button ghost" data-action="share-event">↗ Compartilhar</button></div><div class="section-heading"><h2>Próximas tarefas</h2><button class="text-button" data-go="tarefas">Ver todas</button></div><div class="deadline-list">${nextTasks.map(task => deadlineMarkup(task, '')).join('') || '<div class="empty-state">Tudo concluído por aqui 🎉</div>'}</div><div class="section-heading"><h2>Convidados por mesa</h2></div><div class="summary-list">${party.tables.map(table => { const people = party.guests.filter(g => g.seatId?.startsWith(`${table.id}-`)); return `<div class="summary-row"><strong>${escapeHTML(table.name)}</strong><span>${people.length ? people.map(g => escapeHTML(g.name)).join(', ') : 'Nenhum convidado'} <span class="muted">· ${table.chairs - people.length} lugares livres</span></span></div>`; }).join('')}</div><div class="notice">Os dados ficam salvos automaticamente neste dispositivo. Para exportar PDF, escolha “Salvar como PDF” na janela de impressão.</div>`;
  }
  function showToast(message) {
    const toast = $('#toast'); toast.textContent = message; toast.classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }
  function openPartyForm(party = null) {
    const form = $('#party-form'); form.reset(); form.elements.id.value = party?.id || ''; $('#party-dialog-title').textContent = party ? 'Editar festa' : 'Criar festa'; $('#delete-party').classList.toggle('hidden', !party); const theme = partyTheme(party?.type || 'batizado');
    form.elements.name.value = party?.name || ''; form.elements.date.value = party?.date || dateInput(addDays(new Date(), 30)); form.elements.time.value = party?.time || '16:00'; form.elements.venue.value = party?.venue || ''; form.elements.type.value = party?.type || 'batizado'; form.elements.theme.value = party?.theme || ''; form.elements.color.value = party?.color || theme.color; form.elements.accent.value = party?.accent || theme.accent; form.elements.estimate.value = party?.estimate ?? 50; $('#party-dialog').showModal();
  }
  function openGuestForm(guest = null) {
    const form = $('#guest-form'); form.reset(); form.elements.id.value = guest?.id || ''; $('#guest-dialog-title').textContent = guest ? 'Editar convidado' : 'Novo convidado'; $('#delete-guest').classList.toggle('hidden', !guest); form.elements.name.value = guest?.name || ''; form.elements.group.value = guest?.group || ''; form.elements.status.value = guest?.status || 'pendente'; form.elements.notes.value = guest?.notes || ''; $('#guest-dialog').showModal();
  }
  function openTaskForm(task = null, title = '') {
    const form = $('#task-form'); form.reset(); form.elements.id.value = task?.id || ''; $('#task-dialog-title').textContent = task ? 'Editar tarefa' : 'Nova tarefa'; $('#delete-task').classList.toggle('hidden', !task); form.elements.title.value = task?.title || title; const dueDate = task?.due ? new Date(task.due) : addDays(new Date(), 1); form.elements.due.value = task?.due ? localDateTime(dueDate, `${String(dueDate.getHours()).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}`) : localDateTime(dueDate, '12:00'); form.elements.owner.value = task?.owner || ''; form.elements.notes.value = task?.notes || ''; customReminderValues = []; $$('#task-form input[name="reminders"]').forEach(input => input.checked = task?.reminders?.includes(Number(input.value)) || false); renderCustomReminders(); $('#task-dialog').showModal();
  }
  function renderCustomReminders() { $('#custom-reminder-chips').innerHTML = customReminderValues.map((value,index) => `<span class="chip">${reminderLabel(value)} <button type="button" data-remove-custom="${index}" aria-label="Remover lembrete">×</button></span>`).join(''); }
  function submitParty(form) {
    const fields = Object.fromEntries(new FormData(form)); const existing = data.parties.find(item => item.id === fields.id); const defaults = partyTheme(fields.type);
    if (existing) Object.assign(existing, { name: fields.name.trim(), date: fields.date, time: fields.time, venue: fields.venue.trim(), type: fields.type, theme: fields.theme.trim(), color: fields.color || defaults.color, accent: fields.accent || defaults.accent, estimate: Number(fields.estimate) || 0 });
    else { const party = { id: id(), name: fields.name.trim(), date: fields.date, time: fields.time, venue: fields.venue.trim(), type: fields.type, theme: fields.theme.trim(), color: fields.color || defaults.color, accent: fields.accent || defaults.accent, estimate: Number(fields.estimate) || 0, guests: [], tables: [], tasks: [] }; data.parties.push(party); data.activePartyId = party.id; }
    save(); $('#party-dialog').close(); renderHeader(); go('inicio'); showToast('Festa salva com carinho ✨');
  }
  function assignGuest(guestId, seatId) {
    const party = activeParty(); const marker = seatId.lastIndexOf('-c');
    const table = party.tables.find(item => item.id === seatId.slice(0, marker));
    if (!table || Number(seatId.slice(marker + 2)) > table.chairs) return;
    const occupant = party.guests.find(guest => guest.seatId === seatId);
    if (occupant?.id === guestId) return;
    const moving = party.guests.find(guest => guest.id === guestId);
    if (!moving) return;
    const previousSeat = moving.seatId;
    moving.seatId = seatId;
    if (occupant) occupant.seatId = previousSeat || null;
    save(); renderTables(); showToast(occupant ? 'Lugares trocados' : 'Lugar definido');
  }
  function openTable(tableId) {
    const party = activeParty(); const table = party.tables.find(item => item.id === tableId); if (!table) return;
    const guestsBySeat = seatLookup(party);
    $('#table-detail').innerHTML = `<div class="modal-head"><div><p class="eyebrow">MAPA DE MESAS</p><div class="table-detail-head"><h2>${escapeHTML(table.name)}</h2></div><p class="subtext">${table.chairs} cadeiras · ${table.shape === 'round' ? 'redonda' : table.shape === 'square' ? 'quadrada' : 'retangular'}</p></div><button class="close-button" data-close-table aria-label="Fechar">×</button></div><div class="chairs-list">${Array.from({length: table.chairs}, (_,index) => { const seat = chairId(table,index); const guest = guestsBySeat.get(seat); return `<div class="chair-row"><span class="chair-icon ${guest ? 'occupied' : 'free'}">${guest ? '✓' : '○'}</span><span class="chair-label">Cadeira ${index+1}<br><small class="muted">${guest ? 'Ocupada' : 'Livre'}</small></span><strong>${guest ? escapeHTML(guest.name) : 'Livre'}</strong><button data-action="pick-guest" data-seat="${seat}">${guest ? 'Trocar' : 'Escolher'}</button>${guest ? `<button data-action="remove-seat" data-guest="${guest.id}" aria-label="Remover convidado do lugar">×</button>` : ''}</div>`; }).join('')}</div><div class="form-grid"><label>Nome da mesa<input id="table-name-edit" value="${escapeHTML(table.name)}" maxlength="35"></label><label>Formato<select id="table-shape-edit"><option value="round" ${table.shape==='round'?'selected':''}>Redonda</option><option value="square" ${table.shape==='square'?'selected':''}>Quadrada</option><option value="rectangular" ${table.shape==='rectangular'?'selected':''}>Retangular</option></select></label></div><div class="form-grid"><label>Cadeiras<input id="table-chairs-edit" type="number" min="1" max="20" value="${table.chairs}" inputmode="numeric"></label><button class="button secondary" data-action="save-table" data-id="${table.id}" style="align-self:end;margin-bottom:12px">Salvar mesa</button></div><button class="button danger full" data-action="delete-table" data-id="${table.id}">Excluir mesa</button>`;
    if (!$('#table-dialog').open) $('#table-dialog').showModal();
  }
  function openGuestPicker(seatId) {
    const party = activeParty(); const guest = party.guests.find(item => item.seatId === seatId);
    const eligible = party.guests.filter(item => item.id !== guest?.id && item.status !== 'recusou');
    $('#guest-picker').innerHTML = `<div class="modal-head"><div><p class="eyebrow">ESCOLHER CONVIDADO</p><h2>Quem vai sentar aqui?</h2></div><button class="close-button" data-close-picker aria-label="Fechar">×</button></div><input class="search-input" id="picker-search" placeholder="⌕ Buscar convidado"><div class="picker-list">${eligible.map(item => `<button class="picker-guest" data-action="assign-guest" data-guest="${item.id}" data-seat="${seatId}"><span><strong>${escapeHTML(item.name)}</strong><br><small>${escapeHTML(item.group || 'Sem grupo')}</small></span><span>${item.seatId ? 'Trocar de lugar ↔' : '＋'}</span></button>`).join('') || '<div class="empty-state">Adicione convidados primeiro.</div>'}</div>`;
    $('#guest-picker-dialog').showModal();
  }
  function openPartyPicker() {
    $('#party-picker').innerHTML = `<div class="modal-head"><div><p class="eyebrow">SELECIONE UMA FESTA</p><h2>Seus eventos</h2></div><button class="close-button" data-close-party-picker aria-label="Fechar">×</button></div><div class="party-grid">${data.parties.map(party => `<button class="party-card" data-action="select-party" data-id="${party.id}"><span class="party-emblem">${partyTheme(party.type).emoji}</span><span><h3>${escapeHTML(party.name)}</h3><p>${fmtDate(party.date)} · ${party.guests.length} convidados</p></span></button>`).join('')}</div><button class="button primary full" data-action="new-party" style="margin-top:14px">＋ Criar outra festa</button>`;
    $('#party-picker-dialog').showModal();
  }
  function addTable(form) {
    const party = activeParty(); const fields = Object.fromEntries(new FormData(form)); const count = party.tables.length;
    party.tables.push({ id: id(), name: fields.name.trim() || `Mesa ${count + 1}`, shape: fields.shape, chairs: Math.max(1, Math.min(20, Number(fields.chairs) || 6)), x: 110 + (count % 3) * 220, y: 100 + (Math.floor(count / 3) % 2) * 220 });
    save(); $('#add-table-dialog').close(); renderTables(); showToast('Mesa adicionada');
  }
  function fillPrintSheet() {
    const party = activeParty();
    const rows = party.tables.map(table => `<section><h2>${escapeHTML(table.name)} · ${table.chairs} lugares</h2><table><thead><tr><th>Lugar</th><th>Convidado</th><th>Grupo</th></tr></thead><tbody>${Array.from({length:table.chairs},(_,index)=>{const guest=party.guests.find(item=>item.seatId===chairId(table,index));return `<tr><td>Cadeira ${index+1}</td><td>${guest?escapeHTML(guest.name):'Livre'}</td><td>${guest?escapeHTML(guest.group||'—'):'—'}</td></tr>`;}).join('')}</tbody></table></section>`).join('');
    let sheet = $('.print-sheet'); if (!sheet) { sheet=document.createElement('div'); sheet.className='print-sheet'; document.body.append(sheet); }
    sheet.innerHTML = `<h1>${escapeHTML(party.name)}</h1><p>${fmtDate(party.date)}${party.time ? ` · ${party.time}` : ''} · ${escapeHTML(party.venue||'')}</p><h2>Lista de convidados por mesa</h2>${rows}`;
  }
  function downloadBlob(blob, name) { const link=document.createElement('a');link.href=URL.createObjectURL(blob);link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(link.href),1000); }
  function exportPNG() {
    const party = activeParty(); const width = 1360, height = 1000; const ns='http://www.w3.org/2000/svg';
    const svg=document.createElementNS(ns,'svg');svg.setAttribute('xmlns',ns);svg.setAttribute('viewBox','0 0 680 500');svg.setAttribute('width',width);svg.setAttribute('height',height);
    const bg=document.createElementNS(ns,'rect');bg.setAttribute('width','680');bg.setAttribute('height','500');bg.setAttribute('fill','#fffaf5');svg.append(bg);
    const title=document.createElementNS(ns,'text');title.textContent=party.name;title.setAttribute('x','340');title.setAttribute('y','32');title.setAttribute('text-anchor','middle');title.setAttribute('font-size','20');title.setAttribute('font-family','sans-serif');title.setAttribute('font-weight','bold');title.setAttribute('fill','#342c2a');svg.append(title);
    const style=document.createElementNS(ns,'style');style.textContent='.table-shape{fill:#fff;stroke:'+party.color+';stroke-width:3}.map-table-label{font:700 16px sans-serif;fill:#342c2a;text-anchor:middle}.map-table-count{font:11px sans-serif;fill:#817a76;text-anchor:middle}.map-chair{fill:#fff;stroke:#b8aaa1;stroke-width:2}.map-chair.full{fill:#357a63;stroke:#357a63}';svg.append(style);const group=document.createElementNS(ns,'g');group.innerHTML=party.tables.map(mapTableMarkup).join('');svg.append(group);
    const source=new XMLSerializer().serializeToString(svg); const image=new Image();const url=URL.createObjectURL(new Blob([source],{type:'image/svg+xml;charset=utf-8'}));
    image.onload=()=>{const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const context=canvas.getContext('2d');context.drawImage(image,0,0,width,height);canvas.toBlob(blob=>{if(blob)downloadBlob(blob,`${party.name.toLowerCase().replace(/[^a-z0-9]+/g,'-')}-mapa.png`);URL.revokeObjectURL(url);showToast('Mapa exportado em PNG');},'image/png');};image.onerror=()=>{URL.revokeObjectURL(url);showToast('Não foi possível exportar o mapa');};image.src=url;
  }
  function shareEvent() {
    const party=activeParty();const text=`${party.name} · ${fmtDate(party.date)} · ${party.guests.length} convidados`;
    if(navigator.share) navigator.share({title:party.name,text}).catch(()=>{}); else { navigator.clipboard?.writeText(text).then(()=>showToast('Resumo copiado para compartilhar')).catch(()=>showToast('Use o botão PDF para salvar o resumo')); }
  }
  async function askNotificationPermission() {
    if (!('Notification' in window)) { showToast('Notificações não disponíveis neste navegador'); return; }
    const permission=await Notification.requestPermission(); $('#enable-notifications').textContent=permission==='granted'?'✓ Notificações ativadas':'♧ Ativar notificações';
    showToast(permission==='granted'?'Lembretes ativados!':'Permissão de notificação não concedida'); if(permission==='granted') checkReminders();
  }
  async function deliverNotification(title, options) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try { const registration=await navigator.serviceWorker?.ready; if(registration?.active) registration.active.postMessage({type:'SHOW_NOTIFICATION', title, options}); else new Notification(title,options); } catch(error) { console.warn('Falha ao exibir lembrete',error); }
  }
  function checkReminders() {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now=Date.now();let changed=false;
    for(const party of data.parties) for(const task of party.tasks) {
      if(task.status==='concluida') continue;
      if(task.snoozeUntil && new Date(task.snoozeUntil).getTime()<=now && !task.snoozeSent) { task.snoozeSent=true; changed=true; deliverNotification(task.title,{body:`Lembrete adiado · ${party.name}`,tag:`${task.id}-snooze`}); }
      if(task.snoozeUntil && new Date(task.snoozeUntil).getTime()>now) continue;
      if(new Date(task.due).getTime()<=now) continue;
      for(const minutes of task.reminders||[]) {
        const key=String(minutes);const trigger=new Date(task.due).getTime()-minutes*60000;
        if(now>=trigger&&!task.sentReminders?.includes(key)) { task.sentReminders=task.sentReminders||[];task.sentReminders.push(key);changed=true;deliverNotification(task.title,{body:`${reminderLabel(minutes)} · ${party.name}`,tag:`${task.id}-${key}`}); }
      }
    }
    if(changed) save();
  }
  function snoozeTask(taskId, minutes) {
    const task=activeParty().tasks.find(item=>item.id===taskId); if(!task) return;
    task.snoozeUntil=new Date(Date.now()+minutes*60000).toISOString();task.snoozeSent=false;save();renderTasks();showToast(`Lembrete adiado por ${minutes>=1440?'1 dia':'1 hora'}`);
  }
  function taskAction(taskId, action) {
    const task=activeParty().tasks.find(item=>item.id===taskId); if(!task) return;
    if(action==='toggle-task') { task.status=task.status==='concluida'?'pendente':'concluida'; if(task.status==='concluida'){task.snoozeUntil=null;task.sentReminders=(task.reminders||[]).map(String);} save();renderTasks();showToast(task.status==='concluida'?'Tarefa concluída ✨':'Tarefa reaberta'); }

  }
  function delegatedAction(event) {
    const target=event.target.closest('[data-action]'); if(!target) return;
    const action=target.dataset.action; const taskId=target.dataset.id;
    if(action==='new-party'){if($('#party-picker-dialog').open)$('#party-picker-dialog').close();openPartyForm();}
    if(action==='select-party'){data.activePartyId=target.dataset.id;save();$('#party-picker-dialog').close();go('inicio');}
    if(action==='new-guest') openGuestForm();
    if(action==='edit-guest') openGuestForm(activeParty().guests.find(item=>item.id===target.dataset.id));
    if(action==='new-task') openTaskForm();
    if(action==='template-task') openTaskForm(null,target.dataset.title);
    if(action==='edit-task') openTaskForm(activeParty().tasks.find(item=>item.id===target.dataset.id));
    if(action==='toggle-task') taskAction(taskId,'toggle-task');
    if(action==='snooze-task'){const minutes=target.dataset.minutes==='custom'?Number(prompt('Adiar por quantas horas?', '3'))*60:Number(target.dataset.minutes);if(Number.isFinite(minutes)&&minutes>0)snoozeTask(taskId,minutes);}
    if(action==='task-filter'){taskFilter=target.dataset.filter;renderTasks();}
    if(action==='new-table') $('#add-table-dialog').showModal();
    if(action==='zoom-in'){mapZoom=Math.min(2.1,mapZoom+.2);renderTables();}
    if(action==='zoom-out'){mapZoom=Math.max(.65,mapZoom-.2);renderTables();}
    if(action==='pick-guest') openGuestPicker(target.dataset.seat);
    if(action==='assign-guest'){assignGuest(target.dataset.guest,target.dataset.seat);$('#guest-picker-dialog').close();openTable(target.dataset.seat.slice(0,target.dataset.seat.lastIndexOf('-c')));}
    if(action==='remove-seat'){const guest=activeParty().guests.find(item=>item.id===target.dataset.guest);if(guest){guest.seatId=null;save();openTable(target.closest('dialog')?.querySelector('[data-action="save-table"]')?.dataset.id || activeParty().tables[0]?.id);renderTables();}}
    if(action==='save-table'){const table=activeParty().tables.find(item=>item.id===target.dataset.id);if(table){table.name=$('#table-name-edit').value.trim()||table.name;table.shape=$('#table-shape-edit').value;table.chairs=Math.max(1,Math.min(20,Number($('#table-chairs-edit').value)||1));for(const guest of activeParty().guests){const seat=guest.seatId;if(seat?.startsWith(`${table.id}-c`)&&Number(seat.split('-c')[1])>table.chairs)guest.seatId=null;}save();$('#table-dialog').close();renderTables();showToast('Mesa atualizada');}}
    if(action==='delete-table'){const table=activeParty().tables.find(item=>item.id===target.dataset.id);if(table&&confirm(`Excluir ${table.name}? Os convidados voltarão para a lista sem lugar.`)){activeParty().guests.forEach(guest=>{if(guest.seatId?.startsWith(`${table.id}-`))guest.seatId=null;});activeParty().tables=activeParty().tables.filter(item=>item.id!==table.id);save();$('#table-dialog').close();renderTables();}}
    if(action==='export-png') exportPNG();
    if(action==='export-pdf'){fillPrintSheet();window.print();}
    if(action==='share-event') shareEvent();
  }
  document.addEventListener('click', event => {
    if(event.target.closest('[data-go]')) {const screen=event.target.closest('[data-go]').dataset.go;go(screen);return;}
    if(event.target.closest('.nav-item')){go(event.target.closest('.nav-item').dataset.go);return;}
    if(event.target.closest('#edit-party')){openPartyForm(activeParty());return;}
    if(event.target.closest('#event-switch')){openPartyPicker();return;}
    if(event.target.closest('[data-close-table]')){$('#table-dialog').close();return;}
    if(event.target.closest('[data-close-picker]')){$('#guest-picker-dialog').close();return;}
    if(event.target.closest('[data-close-party-picker]')){$('#party-picker-dialog').close();return;}
    if(event.target.closest('#enable-notifications')){askNotificationPermission();return;}
    const remove=event.target.closest('[data-remove-custom]');if(remove){customReminderValues.splice(Number(remove.dataset.removeCustom),1);renderCustomReminders();return;}
    delegatedAction(event);
  });
  $('#party-form').addEventListener('submit',event=>{event.preventDefault();submitParty(event.currentTarget);});
  $('#party-form').elements.type.addEventListener('change',event=>{const theme=partyTheme(event.target.value);$('#party-form').elements.color.value=theme.color;$('#party-form').elements.accent.value=theme.accent;});
  $('#delete-party').addEventListener('click',()=>{const party=activeParty();if(data.parties.length<2){showToast('Mantenha ao menos uma festa');return;}if(confirm(`Excluir “${party.name}” e todos os dados dela?`)){data.parties=data.parties.filter(item=>item.id!==party.id);data.activePartyId=data.parties[0].id;save();$('#party-dialog').close();go('inicio');showToast('Festa removida');}});
  $('#guest-form').addEventListener('submit',event=>{event.preventDefault();const fields=Object.fromEntries(new FormData(event.currentTarget));const list=activeParty().guests;const guest=list.find(item=>item.id===fields.id);if(guest)Object.assign(guest,{name:fields.name.trim(),group:fields.group.trim(),status:fields.status,notes:fields.notes.trim()});else list.push({id:id(),name:fields.name.trim(),group:fields.group.trim(),status:fields.status,notes:fields.notes.trim(),seatId:null});save();$('#guest-dialog').close();renderGuests();showToast('Convidado salvo');});
  $('#delete-guest').addEventListener('click',()=>{const id=$('#guest-form').elements.id.value;if(confirm('Remover este convidado da festa?')){activeParty().guests=activeParty().guests.filter(item=>item.id!==id);save();$('#guest-dialog').close();renderGuests();showToast('Convidado removido');}});
  $('#task-form').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;const fields=Object.fromEntries(new FormData(form));const reminders=[...new Set([...$$('#task-form input[name="reminders"]:checked').map(input=>Number(input.value)),...customReminderValues])];const list=activeParty().tasks;const task=list.find(item=>item.id===fields.id);if(task)Object.assign(task,{title:fields.title.trim(),due:fields.due,owner:fields.owner.trim(),notes:fields.notes.trim(),reminders,status:task.status==='concluida'?'concluida':'pendente',sentReminders:[],snoozeUntil:null,snoozeSent:false});else list.push({id:id(),title:fields.title.trim(),due:fields.due,owner:fields.owner.trim(),notes:fields.notes.trim(),reminders,status:'pendente',sentReminders:[],snoozeUntil:null});save();$('#task-dialog').close();renderTasks();checkReminders();showToast('Tarefa salva');});
  $('#delete-task').addEventListener('click',()=>{const id=$('#task-form').elements.id.value;if(confirm('Remover esta tarefa e seus lembretes?')){activeParty().tasks=activeParty().tasks.filter(item=>item.id!==id);save();$('#task-dialog').close();renderTasks();showToast('Tarefa removida');}});
  $('#add-custom-reminder').addEventListener('click',()=>{const form=$('#task-form');const amount=Math.max(1,Number(form.elements.customValue.value)||1);const unit=Number(form.elements.customUnit.value);customReminderValues=[...new Set([...customReminderValues,amount*unit])];renderCustomReminders();});
  $('#add-table-form').addEventListener('submit',event=>{event.preventDefault();addTable(event.currentTarget);event.currentTarget.reset();});
  document.addEventListener('input',event=>{if(event.target.id==='guest-search'){guestFilters.query=event.target.value;const cursor=event.target.selectionStart;renderGuests();const search=$('#guest-search');search.focus();search.setSelectionRange(cursor,cursor);}if(event.target.id==='picker-search'){const query=event.target.value.toLocaleLowerCase('pt-BR');$$('.picker-guest').forEach(button=>button.classList.toggle('hidden',!button.textContent.toLocaleLowerCase('pt-BR').includes(query)));}});
  document.addEventListener('change',event=>{if(event.target.id==='filter-status'){guestFilters.status=event.target.value;renderGuests();}if(event.target.id==='filter-group'){guestFilters.group=event.target.value;renderGuests();}if(event.target.id==='filter-seat'){guestFilters.seat=event.target.value;renderGuests();}});
  document.addEventListener('pointerdown',event=>{
    const viewport=event.target.closest('#map-viewport');if(!viewport)return;
    const chair=event.target.closest('[data-chair-id]');
    if(chair){event.preventDefault();mapInteraction={kind:'chair',seat:chair.dataset.chairId,startX:event.clientX,startY:event.clientY,moved:false};return;}
    const mapTable=event.target.closest('.map-table');
    if(mapTable){event.preventDefault();const table=activeParty().tables.find(item=>item.id===mapTable.dataset.tableId);if(!table)return;mapInteraction={kind:'table',id:table.id,startX:event.clientX,startY:event.clientY,x:table.x,y:table.y,moved:false};return;}
    mapInteraction={kind:'pan',startX:event.clientX,startY:event.clientY,panX:mapPan.x,panY:mapPan.y,moved:false};viewport.setPointerCapture?.(event.pointerId);
  });
  document.addEventListener('pointermove',event=>{
    if(dragGuestId){if(!dragPreview){dragPreview=document.createElement('div');dragPreview.className='drag-preview';Object.assign(dragPreview.style,{position:'fixed',zIndex:'40',pointerEvents:'none',padding:'9px 12px',borderRadius:'999px',background:'var(--primary)',color:'var(--primary-ink)',fontSize:'12px',fontWeight:'700',boxShadow:'0 5px 18px #0002'});document.body.append(dragPreview);dragPreview.textContent=activeParty().guests.find(item=>item.id===dragGuestId)?.name||'Convidado';}dragPreview.style.left=`${event.clientX+12}px`;dragPreview.style.top=`${event.clientY+12}px`;return;}
    if(!mapInteraction)return;
    const dx=event.clientX-mapInteraction.startX,dy=event.clientY-mapInteraction.startY;if(Math.abs(dx)+Math.abs(dy)>4)mapInteraction.moved=true;if(!mapInteraction.moved)return;
    if(mapInteraction.kind==='pan'){const rect=$('#table-map').getBoundingClientRect();mapPan={x:mapInteraction.panX+dx*680/rect.width/mapZoom,y:mapInteraction.panY+dy*500/rect.height/mapZoom};$('#map-world').setAttribute('transform',`translate(${mapPan.x} ${mapPan.y}) scale(${mapZoom})`);}
    else {const rect=$('#table-map').getBoundingClientRect();const table=activeParty().tables.find(item=>item.id===mapInteraction.id);if(table){table.x=Math.max(55,Math.min(625,mapInteraction.x+dx*680/rect.width/mapZoom));table.y=Math.max(55,Math.min(445,mapInteraction.y+dy*500/rect.height/mapZoom));const node=$(`#map-world [data-table-id="${table.id}"]`);if(node)node.outerHTML=mapTableMarkup(table);}}
  });
  document.addEventListener('pointerup',event=>{
    if(dragGuestId){const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-chair-id]');if(target)assignGuest(dragGuestId,target.dataset.chairId);dragGuestId=null;dragPreview?.remove();dragPreview=null;return;}
    if(!mapInteraction)return;const interaction=mapInteraction;mapInteraction=null;
    if(interaction.kind==='chair'){if(!interaction.moved)openGuestPicker(interaction.seat);return;}
    if(interaction.kind==='table'){if(interaction.moved){save();renderTables();}else openTable(interaction.id);}
  });
  document.addEventListener('pointerdown',event=>{const item=event.target.closest('.guest-drag');if(!item)return;dragGuestId=item.dataset.guestId;event.preventDefault();});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)checkReminders();});
  window.addEventListener('focus',checkReminders);
  setInterval(checkReminders,30000);
  $('#party-dialog').addEventListener('click',event=>{if(event.target===$('#party-dialog')&&event.offsetY<0)$('#party-dialog').close();});
  if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('./sw.js').then(()=>checkReminders()).catch(error=>console.warn('Service worker indisponível',error));
  applyTheme();renderHeader();go('inicio');
})();
