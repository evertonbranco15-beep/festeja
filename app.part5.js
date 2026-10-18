    if(action==='assign-guest'){assignGuest(target.dataset.guest,target.dataset.seat);$('#guest-picker-dialog').close();openTable(target.dataset.seat.slice(0,target.dataset.seat.lastIndexOf('-c')));}
    if(action==='remove-seat'){const guest=activeParty().guests.find(item=>item.id===target.dataset.guest);if(guest){guest.seatId=null;save();openTable(target.closest('dialog')?.querySelector('[data-action="save-table"]')?.dataset.id || activeParty().tables[0]?.id);renderTables();}}
    if(action==='save-table'){const table=activeParty().tables.find(item=>item.id===target.dataset.id);if(table){table.name=$('#table-name-edit').value.trim()||table.name;table.shape=$('#table-shape-edit').value;table.chairs=Math.max(1,Math.min(20,Number($('#table-chairs-edit').value)||1));for(const guest of activeParty().guests){const seat=guest.seatId;if(seat?.startsWith(`${table.id}-c`)&&Number(seat.split('-c')[1])>table.chairs)guest.seatId=null;}save();$('#table-dialog').close();renderTables();showToast('Mesa atualizada');}}
    if(action==='delete-table'){const table=activeParty().tables.find(item=>item.id===target.dataset.id);if(table&&confirm(`Excluir ${table.name}? Os convidados voltarão para a lista sem lugar.`)){activeParty().guests.forEach(guest=>{if(guest.seatId?.startsWith(`${table.id}-`))guest.seatId=null;});activeParty().tables=activeParty().tables.filter(item=>item.id!==table.id);save();$('#table-dialog').close();renderTables();}}
    if(action==='export-png') exportPNG();
    if(action==='export-pdf'){fillPrintSheet();window.print();}
    if(action==='share-event') shareEvent();
    if(action==='share-edit') shareForEditing(activeParty().id, target);
    if(action==='stop-sync') stopSync(activeParty());
  }
  document.addEventListener('click', event => {
    if(event.target.closest('[data-go]')) {const screen=event.target.closest('[data-go]').dataset.go;go(screen);return;}
    if(event.target.closest('.nav-item')){go(event.target.closest('.nav-item').dataset.go);return;}
    if(event.target.closest('#edit-party')){openPartyForm(activeParty());return;}
    if(event.target.closest('[data-close-dialog]')){event.target.closest('dialog').close();return;}
    if(event.target.closest('#event-switch')){openPartyPicker();return;}
    if(event.target.closest('[data-close-table]')){$('#table-dialog').close();return;}
    if(event.target.closest('[data-close-picker]')){$('#guest-picker-dialog').close();return;}
    if(event.target.closest('[data-close-party-picker]')){$('#party-picker-dialog').close();return;}
    if(event.target.closest('#party-share-actions')) return;
    if(event.target.closest('#enable-notifications')){askNotificationPermission();return;}
    const remove=event.target.closest('[data-remove-custom]');if(remove){customReminderValues.splice(Number(remove.dataset.removeCustom),1);renderCustomReminders();return;}
    delegatedAction(event);
  });
  $('#party-share-actions').addEventListener('click', event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    const party = data.parties.find(item => item.id === $('#party-form').elements.id.value);
    if (!party) return;
    if (button.dataset.action === 'share-edit') {
      if (!$('#party-form').reportValidity()) return;
      submitParty($('#party-form'));
      shareForEditing(party.id, button);
    }
    if (button.dataset.action === 'stop-sync') { stopSync(party); $('#party-dialog').close(); }
  });
  $('#copy-share-link').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText($('#share-link').value); showToast('Link copiado!'); }
    catch (error) { $('#share-link').select(); showToast('Selecione e copie o link'); }
  });
  $('#web-share').addEventListener('click', () => {
    if (navigator.share) navigator.share({ title: activeParty().name, url: $('#share-link').value }).catch(() => {});
  });
  $('#party-form').addEventListener('submit',event=>{event.preventDefault();submitParty(event.currentTarget);});
  $('#party-form').elements.type.addEventListener('change',event=>{const theme=partyTheme(event.target.value);$('#party-form').elements.color.value=theme.color;$('#party-form').elements.accent.value=theme.accent;});
  $('#delete-party').addEventListener('click',()=>{const party=activeParty();if(data.parties.length<2){showToast('Mantenha ao menos uma festa');return;}if(confirm(`Excluir “${party.name}” e todos os dados dela?`)){data.parties=data.parties.filter(item=>item.id!==party.id);data.activePartyId=data.parties[0].id;save(false);$('#party-dialog').close();go('inicio');showToast('Festa removida');}});
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
  document.addEventListener('visibilitychange',()=>{if(!document.hidden){checkReminders();pollShared();}});
  window.addEventListener('focus',()=>{checkReminders();pollShared();});
  window.addEventListener('online',()=>{syncError = false; for (const party of data.parties) if (party.sharedId && party.syncPending) schedulePush(party.sharedId, 0); pollShared(); updateSyncStatus();});
  window.addEventListener('offline', updateSyncStatus);
  window.addEventListener('hashchange', openSharedLink);
  document.querySelectorAll('dialog').forEach(dialog => dialog.addEventListener('close', applyDeferredRemote));
  setInterval(pollShared, 5000);
  setInterval(checkReminders,30000);
  $('#party-dialog').addEventListener('click',event=>{if(event.target===$('#party-dialog')&&event.offsetY<0)$('#party-dialog').close();});
  if('serviceWorker' in navigator && location.protocol!=='file:') navigator.serviceWorker.register('./sw.js').then(()=>checkReminders()).catch(error=>console.warn('Service worker indisponível',error));
  applyTheme();renderHeader();go('inicio');
  for (const party of data.parties) if (party.sharedId && party.syncPending) schedulePush(party.sharedId, 0);
  openSharedLink(); pollShared();
})();
