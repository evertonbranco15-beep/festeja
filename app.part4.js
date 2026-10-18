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
    $('#party-picker').innerHTML = `<div class="modal-head"><div><p class="eyebrow">SELECIONE UMA FESTA</p><h2>Seus eventos</h2></div><button class="close-button" data-close-party-picker aria-label="Fechar">×</button></div><div class="party-grid">${data.parties.map(party => `<button class="party-card" data-action="select-party" data-id="${party.id}"><span class="party-emblem">${partyTheme(party.type).emoji}</span><span><h3>${escapeHTML(party.name)}</h3><p>${fmtDate(party.date)} · ${party.guests.length} convidados ${party.sharedId ? '· <span class="shared-badge">🔗 Compartilhada</span>' : ''}</p></span></button>`).join('')}</div><button class="button primary full" data-action="new-party" style="margin-top:14px">＋ Criar outra festa</button>`;
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
    if(changed) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  }
  function snoozeTask(taskId, minutes) {
    const task=activeParty().tasks.find(item=>item.id===taskId); if(!task) return;
    task.snoozeUntil=new Date(Date.now()+minutes*60000).toISOString();task.snoozeSent=false;save(false);renderTasks();showToast(`Lembrete adiado por ${minutes>=1440?'1 dia':'1 hora'}`);
  }
  function taskAction(taskId, action) {
    const task=activeParty().tasks.find(item=>item.id===taskId); if(!task) return;
    if(action==='toggle-task') { task.status=task.status==='concluida'?'pendente':'concluida'; if(task.status==='concluida'){task.snoozeUntil=null;task.sentReminders=(task.reminders||[]).map(String);} save();renderTasks();showToast(task.status==='concluida'?'Tarefa concluída ✨':'Tarefa reaberta'); }

  }
  function delegatedAction(event) {
    const target=event.target.closest('[data-action]'); if(!target) return;
    const action=target.dataset.action; const taskId=target.dataset.id;
    if(action==='new-party'){if($('#party-picker-dialog').open)$('#party-picker-dialog').close();openPartyForm();}
    if(action==='select-party'){data.activePartyId=target.dataset.id;save(false);$('#party-picker-dialog').close();go('inicio');pollShared();}
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
