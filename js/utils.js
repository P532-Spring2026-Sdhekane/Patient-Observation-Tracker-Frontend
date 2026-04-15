function esc(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function fmtTime(isoStr) {
  if (!isoStr) return "—";
  return new Date(isoStr).toLocaleString();
}

function showAlert(containerId, msg, type) {
  type = type || "error";
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = '<div class="alert alert-' + type + '">' + esc(msg) + "</div>";
  setTimeout(function () {
    el.innerHTML = "";
  }, 5000);
}

function clearFields() {
  for (let i = 0; i < arguments.length; i++) {
    const el = document.getElementById(arguments[i]);
    if (el) el.value = "";
  }
}
