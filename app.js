    'use strict';

    const OWNER_NAME = 'Shawn Meendering';
    const LS_LOGS = 'cs_service_logs';
    const LS_TIMER = 'cs_timer_state';

    let serviceLogs = [];
    try { serviceLogs = JSON.parse(localStorage.getItem(LS_LOGS) || '[]'); } catch (e) { serviceLogs = []; }
    if (!Array.isArray(serviceLogs)) serviceLogs = [];

    let timerState = { running: false, startTime: null, elapsed: 0, activity: '', notes: '' };
    try { timerState = Object.assign(timerState, JSON.parse(localStorage.getItem(LS_TIMER) || '{}')); } catch (e) {}
    let timerInterval = null;

    function $(id) { return document.getElementById(id); }

    function escapeHtml(str) {
      return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
    }

    function showToast(msg) {
      const t = $('toast');
      t.textContent = msg;
      t.classList.add('show');
      clearTimeout(t._timer);
      t._timer = setTimeout(() => t.classList.remove('show'), 2600);
    }

    function downloadFile(content, fileName, contentType) {
      const a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([content], { type: contentType }));
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
    }

    function totalSeconds() {
      return serviceLogs.reduce((acc, i) => acc + (i.durationSeconds || 0), 0);
    }

    // Exact duration display down to the second, e.g. "1:23:45"
    function fmtHMS(sec) {
      sec = Math.max(0, Math.floor(sec || 0));
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = sec % 60;
      return h + ':' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    }

    function customCharPriority(ch) {
      if (!ch) return 0;
      const code = ch.charCodeAt(0);
      if (code >= 48 && code <= 57) return 2;
      if (code >= 65 && code <= 90) return 3;
      if (code >= 97 && code <= 122) return 4;
      return 1;
    }
    function compareCustomOrder(a, b) {
      const len = Math.min(a.length, b.length);
      for (let i = 0; i < len; i++) {
        if (a[i] !== b[i]) {
          const pa = customCharPriority(a[i]), pb = customCharPriority(b[i]);
          if (pa !== pb) return pa - pb;
          return a[i].localeCompare(b[i]);
        }
      }
      return a.length - b.length;
    }

    const TAB_IDS = { live: 'tabLive', history: 'tabHistory', manual: 'tabManual' };
    const NAV_IDS = { live: 'navLive', history: 'navHistory', manual: 'navManual' };

    function switchTab(tabKey) {
      Object.keys(TAB_IDS).forEach(k => {
        $(TAB_IDS[k]).classList.toggle('active', k === tabKey);
        $(NAV_IDS[k]).classList.toggle('active', k === tabKey);
      });
      if (timerState.running && tabKey !== 'live') saveTimerState();
    }

    // The data bar slides over the SAME row as the nav: pick an option or close it.
    function toggleDataOverlay(show) {
      $('dataOverlayBar').classList.toggle('open', show);
      $('mainNavBar').classList.toggle('hidden', show);
    }

    function saveLogs() {
      localStorage.setItem(LS_LOGS, JSON.stringify(serviceLogs));
      updateAutocompleteOptions();
    }

    function updateAutocompleteOptions() {
      const titles = [...new Set(serviceLogs.map(l => l.activity))].sort(compareCustomOrder);
      $('activitySuggestions').innerHTML = titles.map(t => `<option value="${escapeHtml(t)}"></option>`).join('');
    }

    function toggleTimer() {
      if (!timerState.running) {
        timerState.running = true;
        timerState.startTime = Date.now() - (timerState.elapsed || 0);
        timerState.activity = $('liveActivity').value;
        timerState.notes = $('liveNotes').value;
        timerInterval = setInterval(updateTimerUI, 1000);
        updateTimerUI();
      } else {
        timerState.running = false;
        clearInterval(timerInterval);
        const finalElapsedSec = Math.floor((Date.now() - timerState.startTime) / 1000);
        const activityName = $('liveActivity').value.trim() || 'General Community Service';
        const notes = $('liveNotes').value.trim();

        if (finalElapsedSec >= 5) {
          const now = new Date();
          const startDate = new Date(Date.now() - finalElapsedSec * 1000);
          serviceLogs.push({
            id: 'log_' + Date.now(),
            activity: activityName,
            date: startDate.toISOString().slice(0, 10),
            startTime: startDate.toTimeString().slice(0, 5),
            endTime: now.toTimeString().slice(0, 5),
            durationSeconds: finalElapsedSec,
            notes: notes
          });
          saveLogs();
          showToast('Session saved: ' + fmtHMS(finalElapsedSec) + ' logged');
        } else {
          showToast('Session under 5 seconds — not saved');
        }
        resetTimer(false);
        switchTab('history');
      }
      saveTimerState();
    }

    function resetTimer(clearForm) {
      timerState = { running: false, startTime: null, elapsed: 0, activity: '', notes: '' };
      clearInterval(timerInterval);
      $('timerDisplay').textContent = '00:00:00';
      if (clearForm !== false) {
        $('liveActivity').value = '';
        $('liveNotes').value = '';
      }
      updateTimerButtonState();
      saveTimerState();
    }

    function saveTimerState() {
      if (timerState.running) {
        timerState.activity = $('liveActivity').value;
        timerState.notes = $('liveNotes').value;
      }
      localStorage.setItem(LS_TIMER, JSON.stringify(timerState));
    }

    function restoreTimerState() {
      if (timerState.running && timerState.startTime) {
        $('liveActivity').value = timerState.activity || '';
        $('liveNotes').value = timerState.notes || '';
        timerInterval = setInterval(updateTimerUI, 1000);
        updateTimerUI();
      }
    }

    function updateTimerUI() {
      if (!timerState.running) return;
      const totalSec = Math.max(0, Math.floor((Date.now() - timerState.startTime) / 1000));
      const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
      const s = String(totalSec % 60).padStart(2, '0');
      $('timerDisplay').textContent = h + ':' + m + ':' + s;
      saveTimerState();
    }

    function updateTimerButtonState() {
      const btn = $('startTimerBtn'), status = $('timerStatus');
      if (timerState.running) {
        btn.textContent = 'Stop & save session';
        status.textContent = 'Session in progress';
        status.classList.add('running');
      } else {
        btn.textContent = 'Start session';
        status.textContent = 'Ready to start';
        status.classList.remove('running');
      }
    }

    function setDefaultDates() {
      $('manualDate').value = new Date().toISOString().slice(0, 10);
    }

    function computeDuration(date, startTime, endTime) {
      const start = new Date(date + 'T' + startTime);
      const end = new Date(date + 'T' + endTime);
      let sec = Math.floor((end - start) / 1000);
      if (sec < 0) sec += 86400;
      return sec;
    }

    function handleManualSubmit(e) {
      e.preventDefault();
      const date = $('manualDate').value;
      const startTime = $('manualStartTime').value;
      const endTime = $('manualEndTime').value;
      const durationSec = computeDuration(date, startTime, endTime);

      serviceLogs.push({
        id: 'log_' + Date.now(),
        activity: $('manualActivity').value.trim(),
        date: date,
        startTime: startTime,
        endTime: endTime,
        durationSeconds: durationSec,
        notes: $('manualNotes').value.trim()
      });
      saveLogs();

      $('manualActivity').value = '';
      $('manualNotes').value = '';
      $('manualStartTime').value = '';
      $('manualEndTime').value = '';
      setDefaultDates();
      showToast('Entry saved: ' + fmtHMS(durationSec));
      switchTab('history');
    }

    function renderHistory() {
      const container = $('historyList');
      const q = $('searchHistoryInput').value.toLowerCase();
      const sortMode = $('sortOrder').value;
      const total = totalSeconds();

      $('totalHoursDisplay').textContent = fmtHMS(total);
      $('totalHoursSub').textContent = '≈ ' + (total / 3600).toFixed(4) + ' hrs • ' +
        serviceLogs.length + (serviceLogs.length === 1 ? ' session' : ' sessions');

      let filtered = serviceLogs.filter(l =>
        l.activity.toLowerCase().includes(q) || (l.notes && l.notes.toLowerCase().includes(q))
      );
      filtered.sort((a, b) => {
        if (sortMode === 'date-desc') return new Date(b.date + 'T' + b.startTime) - new Date(a.date + 'T' + a.startTime);
        if (sortMode === 'date-asc') return new Date(a.date + 'T' + a.startTime) - new Date(b.date + 'T' + b.startTime);
        if (sortMode === 'duration-desc') return b.durationSeconds - a.durationSeconds;
        if (sortMode === 'duration-asc') return a.durationSeconds - b.durationSeconds;
        if (sortMode === 'title-custom') return compareCustomOrder(a.activity, b.activity);
        return 0;
      });

      if (filtered.length === 0) {
        container.innerHTML = '<div class="empty">No service records found.</div>';
        return;
      }

      container.innerHTML = filtered.map(log => {
        const title = escapeHtml(log.activity);
        return `
          <div class="log-card" style="margin-bottom:14px;">
            <div style="min-width:0;">
              <h3 title="${title}">${title}</h3>
              <div class="meta"><span>${escapeHtml(log.date)}</span><span>${escapeHtml(log.startTime)}&ndash;${escapeHtml(log.endTime)}</span></div>
              <span class="hrs-badge">${fmtHMS(log.durationSeconds || 0)}</span>
              ${log.notes ? `<div class="notes">${escapeHtml(log.notes)}</div>` : ''}
            </div>
            <div class="actions">
              <button onclick="openEditModal('${log.id}')" class="btn ghost small">Edit</button>
              <button onclick="deleteLog('${log.id}')" class="btn ghost small">Delete</button>
            </div>
          </div>`;
      }).join('');
    }

    function deleteLog(id) {
      const log = serviceLogs.find(l => l.id === id);
      if (!log) return;
      if (!confirm('Delete "' + log.activity + '" (' + fmtHMS(log.durationSeconds || 0) + ')?')) return;
      serviceLogs = serviceLogs.filter(l => l.id !== id);
      saveLogs();
      renderHistory();
      showToast('Entry deleted');
    }

    function openEditModal(id) {
      const log = serviceLogs.find(l => l.id === id);
      if (!log) return;
      $('editEntryId').value = log.id;
      $('editActivity').value = log.activity;
      $('editDate').value = log.date;
      $('editStartTime').value = log.startTime;
      $('editEndTime').value = log.endTime;
      $('editNotes').value = log.notes || '';
      $('editModal').classList.add('open');
    }

    function closeEditModal() { $('editModal').classList.remove('open'); }

    function handleEditSubmit(e) {
      e.preventDefault();
      const log = serviceLogs.find(l => l.id === $('editEntryId').value);
      if (!log) return closeEditModal();
      log.activity = $('editActivity').value.trim();
      log.date = $('editDate').value;
      log.startTime = $('editStartTime').value;
      log.endTime = $('editEndTime').value;
      log.notes = $('editNotes').value.trim();
      log.durationSeconds = computeDuration(log.date, log.startTime, log.endTime);
      saveLogs();
      renderHistory();
      closeEditModal();
      showToast('Entry updated');
    }

    function summaryByActivity() {
      const map = {};
      serviceLogs.forEach(l => {
        if (!map[l.activity]) map[l.activity] = { seconds: 0, count: 0 };
        map[l.activity].seconds += (l.durationSeconds || 0);
        map[l.activity].count += 1;
      });
      return Object.keys(map)
        .sort(compareCustomOrder)
        .map(a => ({ activity: a, seconds: map[a].seconds, count: map[a].count }));
    }

    function directExportMarkdown() {
      if (serviceLogs.length === 0) return showToast('No service logs to export yet');
      const total = totalSeconds();

      let md = '# Community Service Log — ' + OWNER_NAME + '\n\n';
      md += '**Total Hours:** ' + fmtHMS(total) + ' (' + (total / 3600).toFixed(4) + ' hrs) across ' + serviceLogs.length + ' session' + (serviceLogs.length === 1 ? '' : 's') + '\n\n';
      md += '## Summary by Activity\n\n';
      summaryByActivity().forEach(s => {
        md += '- **' + s.activity + '** — ' + fmtHMS(s.seconds) + ' (' + (s.seconds / 3600).toFixed(4) + ' hrs, ' + s.count + ' session' + (s.count === 1 ? '' : 's') + ')\n';
      });
      md += '\n## Sessions\n\n';
      [...serviceLogs].sort((a, b) => new Date(b.date + 'T' + b.startTime) - new Date(a.date + 'T' + a.startTime)).forEach(log => {
        md += '### ' + log.activity + '\n';
        md += '- **Date:** ' + log.date + '\n';
        md += '- **Time:** ' + log.startTime + ' – ' + log.endTime + ' (' + fmtHMS(log.durationSeconds || 0) + ', ' + ((log.durationSeconds || 0) / 3600).toFixed(4) + ' hrs)\n';
        if (log.notes) md += '- **Details:** ' + log.notes + '\n';
        md += '\n';
      });
      downloadFile(md, 'community_service_resume.md', 'text/markdown');
      toggleDataOverlay(false);
      showToast('Resume Markdown downloaded');
    }

    function directExportCSV() {
      if (serviceLogs.length === 0) return showToast('No service logs to export yet');
      const esc = v => '"' + String(v || '').replace(/"/g, '""') + '"';
      const rows = [['Activity', 'Date', 'Start', 'End', 'Duration (h:mm:ss)', 'Hours', 'Notes']];
      serviceLogs.forEach(l => rows.push([
        l.activity, l.date, l.startTime, l.endTime,
        fmtHMS(l.durationSeconds || 0), ((l.durationSeconds || 0) / 3600).toFixed(4), l.notes || ''
      ]));
      const csv = rows.map(r => r.map(esc).join(',')).join('\n');
      downloadFile(csv, 'community_service_log.csv', 'text/csv');
      toggleDataOverlay(false);
      showToast('CSV downloaded');
    }

    function directExportJSON() {
      if (serviceLogs.length === 0) return showToast('No service logs to export yet');
      downloadFile(JSON.stringify(serviceLogs, null, 2), 'community_service_backup.json', 'application/json');
      toggleDataOverlay(false);
      showToast('JSON backup downloaded');
    }

    function triggerImportFileDialog() { $('importFileInput').click(); }

    function handleImportFile(event) {
      const file = event.target.files[0];
      event.target.value = '';
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function (e) {
        try {
          const imported = JSON.parse(e.target.result);
          if (Array.isArray(imported)) {
            const existing = new Set(serviceLogs.map(l => l.id));
            const fresh = imported.filter(l => l && l.activity && !existing.has(l.id));
            serviceLogs = serviceLogs.concat(fresh);
            saveLogs();
            renderHistory();
            toggleDataOverlay(false);
            showToast('Imported ' + fresh.length + ' new entr' + (fresh.length === 1 ? 'y' : 'ies') + (fresh.length < imported.length ? ' (' + (imported.length - fresh.length) + ' duplicates skipped)' : ''));
          } else {
            showToast('Invalid backup file format');
          }
        } catch (err) {
          showToast('Error parsing JSON backup file');
        }
      };
      reader.readAsText(file);
    }

    setDefaultDates();
    updateAutocompleteOptions();
    renderHistory();
    restoreTimerState();
    updateTimerButtonState();

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeEditModal();
    });
    $('editModal').addEventListener('click', e => { if (e.target === $('editModal')) closeEditModal(); });

    if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
      navigator.serviceWorker.register('sw.js').catch(function () {});
    }
