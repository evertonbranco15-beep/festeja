      const revision = revisions.get(party.id) || 0;
      const rows = await rpc('create_shared_party', { p_data: sharedPayload(party) });
      if (!rows.length) throw new Error('Não foi possível criar o link');
      party.sharedId = rows[0].id;
      party.sharedVersion = Number(rows[0].version);
      party.syncPending = (revisions.get(party.id) || 0) !== revision;
      syncError = false; persist(); renderCurrent();
      if (party.syncPending) schedulePush(party.sharedId);
      if ($('#party-dialog').open) $('#party-dialog').close();
      showShareDialog(party);
    } catch (error) { console.warn('Não foi possível compartilhar.', error); showToast('Erro ao compartilhar. Tente novamente.'); }
    finally { button.disabled = false; }
  }
  function stopSync(party) {
    if (!party.sharedId) return;
    clearTimeout(syncTimers.get(party.sharedId)); syncTimers.delete(party.sharedId);
    deferredRemote.delete(party.sharedId);
    if (location.hash.toLowerCase() === `#/p/${party.sharedId.toLowerCase()}`) history.replaceState(null, '', location.href.split('#')[0]);
    delete party.sharedId; delete party.sharedVersion; delete party.syncPending;
    persist(); renderCurrent(); showToast('Sincronização desativada neste dispositivo');
  }
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
    updateSyncStatus();
    document.querySelector('meta[name="theme-color"]').content = primary;
  }
  function save(sync = true) {
    const party = activeParty();
    if (sync && party.sharedId) {
      party.syncPending = true;
      revisions.set(party.sharedId, (revisions.get(party.sharedId) || 0) + 1);
      schedulePush(party.sharedId);
    }
    persist();
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
      <div class="party-grid">${data.parties.map(item => `<button class="party-card" type="button" data-action="select-party" data-id="${item.id}"><span class="party-emblem">${partyTheme(item.type).emoji}</span><span><h3>${escapeHTML(item.name)}</h3><p>${fmtDate(item.date)} · ${item.guests.length} convidados ${item.sharedId ? '· <span class="shared-badge">🔗 Compartilhada</span>' : ''}</p></span><span class="party-arrow">›</span></button>`).join('')}</div>
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
