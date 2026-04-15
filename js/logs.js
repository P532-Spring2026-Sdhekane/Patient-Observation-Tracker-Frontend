async function loadLogs() {
  loadCommandLog();
  loadAuditLog();
}

async function loadCommandLog() {
  const container = document.getElementById("command-log-container");
  container.innerHTML = '<p class="empty">Loading…</p>';
  try {
    const entries = await getCommandLog();
    if (!entries.length) {
      container.innerHTML = '<p class="empty">No commands recorded yet.</p>';
      return;
    }
    let html = "";
    entries.forEach(function (e) {
      html +=
        '<div class="log-entry">' +
        '<span class="log-time">' +
        fmtTime(e.executedAt) +
        "</span>" +
        " <strong>" +
        esc(e.commandType) +
        "</strong>" +
        ' <span style="color:var(--muted)">by ' +
        esc(e.user) +
        "</span>" +
        '<div class="log-payload">' +
        esc(e.payload) +
        "</div>" +
        "</div>";
    });
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML =
      '<p class="empty" style="color:red">' + esc(e.message) + "</p>";
  }
}

async function loadAuditLog() {
  const container = document.getElementById("audit-log-container");
  container.innerHTML = '<p class="empty">Loading…</p>';
  try {
    const entries = await getAuditLog();
    if (!entries.length) {
      container.innerHTML = '<p class="empty">No audit entries yet.</p>';
      return;
    }
    let html = "";
    entries.forEach(function (e) {
      html +=
        '<div class="log-entry">' +
        '<span class="log-time">' +
        fmtTime(e.timestamp) +
        "</span>" +
        " <span>" +
        esc(e.event) +
        "</span>" +
        "</div>";
    });
    container.innerHTML = html;
  } catch (e) {
    container.innerHTML =
      '<p class="empty" style="color:red">' + esc(e.message) + "</p>";
  }
}
