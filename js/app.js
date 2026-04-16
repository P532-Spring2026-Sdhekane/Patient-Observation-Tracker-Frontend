var currentRole = "staff";
var currentPatientUser = null; // { id, fullName } of the logged-in patient

// ── Boot ──────────────────────────────────────────────────────────────────────
showPage("patients");
applyRole();

// ── Role switching ────────────────────────────────────────────────────────────

async function onRoleChange() {
  currentRole = document.getElementById("role-select").value;

  if (currentRole === "patient") {
    // Show patient picker, populate it from the API
    await populatePatientPicker();
    document.getElementById("patient-picker-wrap").style.display = "flex";
  } else {
    // Back to staff — hide picker, clear selection
    document.getElementById("patient-picker-wrap").style.display = "none";
    currentPatientUser = null;
    applyRole();
  }
}

async function populatePatientPicker() {
  var sel = document.getElementById("patient-picker");
  sel.innerHTML = '<option value="">— select your name —</option>';
  try {
    var patients = await getPatients();
    patients.forEach(function (p) {
      var opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent =
        p.fullName + (p.dateOfBirth ? " (DOB: " + p.dateOfBirth + ")" : "");
      sel.appendChild(opt);
    });
  } catch (e) {
    sel.innerHTML = '<option value="">— could not load patients —</option>';
  }
}

function onPatientPicked() {
  var sel = document.getElementById("patient-picker");
  var selectedId = sel.value;
  var selectedName = sel.options[sel.selectedIndex].textContent;

  if (!selectedId) return;

  currentPatientUser = {
    id: Number(selectedId),
    fullName: selectedName.split(" (DOB")[0],
  };
  applyRole();

  // Auto-navigate to their own detail page
  showDetail(currentPatientUser.id);
}

function applyRole() {
  var isStaff = currentRole === "staff";

  // Nav tabs
  document.getElementById("nav-catalogue").style.display = isStaff
    ? ""
    : "none";
  document.getElementById("nav-logs").style.display = isStaff ? "" : "none";

  // Patients page
  var createCard = document.getElementById("create-patient-card");
  if (createCard) createCard.style.display = isStaff ? "" : "none";

  // Patient detail
  var recordForms = document.getElementById("record-forms");
  if (recordForms) recordForms.style.display = isStaff ? "" : "none";

  var evalBtn = document.getElementById("evaluate-btn");
  if (evalBtn) evalBtn.style.display = isStaff ? "" : "none";

  // Redirect off staff-only pages
  if (!isStaff) {
    var cataloguePage = document.getElementById("page-catalogue");
    var logsPage = document.getElementById("page-logs");
    if (cataloguePage && cataloguePage.classList.contains("active"))
      showPage("patients");
    if (logsPage && logsPage.classList.contains("active")) showPage("patients");
  }

  // Badge
  var badge = document.getElementById("role-badge");
  if (badge) {
    if (isStaff) {
      badge.textContent = "Staff";
      badge.style.background = "var(--primary)";
    } else if (currentPatientUser) {
      badge.textContent = currentPatientUser.fullName;
      badge.style.background = "#16a34a";
    } else {
      badge.textContent = "Patient";
      badge.style.background = "#16a34a";
    }
  }
}

// ── Navigation ────────────────────────────────────────────────────────────────

function showPage(name) {
  if (currentRole === "patient" && (name === "catalogue" || name === "logs")) {
    // Silently redirect to their own page
    if (currentPatientUser) {
      showDetail(currentPatientUser.id);
    } else {
      _activatePage("patients");
      loadPatients();
    }
    return;
  }
  _activatePage(name);
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
  document.querySelectorAll("nav a").forEach(function (a) {
    a.classList.remove("active");
  });
  document.getElementById("page-detail").classList.add("active");
  loadPatientDetail(patientId);
  applyRole();
}

function _activatePage(name) {
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  document.querySelectorAll("nav a").forEach(function (a) {
    a.classList.remove("active");
  });
  document.getElementById("page-" + name).classList.add("active");
  var navEl = document.getElementById("nav-" + name);
  if (navEl) navEl.classList.add("active");
}
