function showPage(name) {
  document.querySelectorAll(".page").forEach(function (p) {
    p.classList.remove("active");
  });
  document.querySelectorAll("nav a").forEach(function (a) {
    a.classList.remove("active");
  });

  document.getElementById("page-" + name).classList.add("active");
  const navEl = document.getElementById("nav-" + name);
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
}

// Boot — show patients page on load
showPage("patients");
