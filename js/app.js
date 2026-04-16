var currentRole = "staff";
function onRoleChange() {
  currentRole = document.getElementById("role-select").value;
  applyRole();
}

function applyRole() {
  var isStaff = currentRole === "staff";

  document.getElementById("nav-catalogue").style.display = isStaff
    ? ""
    : "none";
  document.getElementById("nav-logs").style.display = isStaff ? "" : "none";
  var createCard = document.getElementById("create-patient-card");
  if (createCard) createCard.style.display = isStaff ? "" : "none";

  // Patient detail
  var recordForms = document.getElementById("record-forms");
  if (recordForms) recordForms.style.display = isStaff ? "" : "none";

  var evalBtn = document.getElementById("evaluate-btn");
  if (evalBtn) evalBtn.style.display = isStaff ? "" : "none";

  // If currently on a staff
  if (!isStaff) {
    var cataloguePage = document.getElementById("page-catalogue");
    var logsPage = document.getElementById("page-logs");
    if (cataloguePage && cataloguePage.classList.contains("active"))
      showPage("patients");
    if (logsPage && logsPage.classList.contains("active")) showPage("patients");
  }

  // Role badge colour
  var badge = document.getElementById("role-badge");
  if (badge) {
    badge.textContent = isStaff ? "Staff" : "Patient";
    badge.style.background = isStaff ? "#2563eb" : "#16a34a";
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function showPage(name) {
  if (currentRole === "patient" && (name === "catalogue" || name === "logs")) {
    showPage("patients");
    return;
  }

  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  document.querySelectorAll("nav a").forEach(function (a) {
    a.classList.remove("active");
  });

  document.getElementById("page-" + name).classList.add("active");
  var navEl = document.getElementById("nav-" + name);
  if (navEl) navEl.classList.add("active");

  if (name === "patients") loadPatients();
  if (name === "catalogue") {
    loadCataloguePhentypes();
    loadProtocols();
    loadRules();
  }
  if (name === "logs") loadLogs();
}

function showDetail(patientId) {
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  document.getElementById("page-detail").classList.add("active");
  loadPatientDetail(patientId);
  applyRole();
}
showPage("patients");
applyRole();
