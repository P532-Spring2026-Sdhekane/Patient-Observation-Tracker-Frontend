// ── Tab switching ─────────────────────────────────────────────────────────────

function switchCatTab(name, clickedEl) {
  ["phentypes", "protocols", "rules"].forEach(function (t) {
    document.getElementById("cat-" + t).style.display =
      t === name ? "" : "none";
  });
  document.querySelectorAll(".tab").forEach(function (t) {
    t.classList.remove("active");
  });
  clickedEl.classList.add("active");
}

// ── Phenomenon Type form: toggle fields on kind change ────────────────────────

function onPtKindChange() {
  var kind = document.getElementById("pt-kind").value;
  document.getElementById("pt-units-row").style.display =
    kind === "QUANTITATIVE" ? "" : "none";
  document.getElementById("pt-phenomena-row").style.display =
    kind === "QUALITATIVE" ? "" : "none";
}

// ── Load and display Phenomenon Types list ────────────────────────────────────

async function loadCataloguePhentypes() {
  var container = document.getElementById("pt-list-container");
  container.innerHTML = '<p class="empty">Loading…</p>';
  try {
    var types = await getPhenomenonTypes();
    if (!types.length) {
      container.innerHTML =
        '<p class="empty">No phenomenon types yet. Use the form to add one.</p>';
      // Clear existing-qual dropdown
      document.getElementById("existing-qual-select").innerHTML =
        '<option value="">— no qualitative types yet —</option>';
      return;
    }

    var rows = "";
    types.forEach(function (t) {
      var detail =
        t.kind === "QUANTITATIVE"
          ? esc(t.allowedUnitsRaw || "—")
          : (t.phenomena || [])
              .map(function (p) {
                return esc(p.name);
              })
              .join(", ") || "—";
      rows +=
        "<tr>" +
        "<td>" +
        t.id +
        "</td>" +
        "<td><strong>" +
        esc(t.name) +
        "</strong></td>" +
        '<td><span class="badge ' +
        (t.kind === "QUANTITATIVE" ? "badge-meas" : "badge-cat") +
        '">' +
        t.kind +
        "</span></td>" +
        '<td style="font-size:.8rem">' +
        detail +
        "</td>" +
        "</tr>";
    });
    container.innerHTML =
      "<table>" +
      "<thead><tr><th>#</th><th>Name</th><th>Kind</th><th>Units / Phenomena</th></tr></thead>" +
      "<tbody>" +
      rows +
      "</tbody>" +
      "</table>";

    // Refresh the "add phenomenon to existing" dropdown
    var qualTypes = types.filter(function (t) {
      return t.kind === "QUALITATIVE";
    });
    var sel = document.getElementById("existing-qual-select");
    if (!qualTypes.length) {
      sel.innerHTML = '<option value="">— no qualitative types yet —</option>';
    } else {
      var opts = '<option value="">— select type —</option>';
      qualTypes.forEach(function (t) {
        opts += '<option value="' + t.id + '">' + esc(t.name) + "</option>";
      });
      sel.innerHTML = opts;
    }
  } catch (e) {
    container.innerHTML =
      '<p class="empty" style="color:red">' + esc(e.message) + "</p>";
  }
}

// ── Create Phenomenon Type ────────────────────────────────────────────────────

async function handleCreatePhenomenonType() {
  var name = document.getElementById("pt-name").value.trim();
  var kind = document.getElementById("pt-kind").value;
  var allowedUnits = document.getElementById("pt-units").value.trim();
  var firstPhen = document.getElementById("pt-first-phenomenon").value.trim();

  if (!name) {
    showAlert("pt-alert", "Name is required.");
    return;
  }
  if (kind === "QUANTITATIVE" && !allowedUnits) {
    showAlert("pt-alert", "Enter at least one allowed unit (e.g. °C,°F).");
    return;
  }

  try {
    var created = await createPhenomenonTypeApi({
      name: name,
      kind: kind,
      allowedUnits: allowedUnits,
    });

    // If qualitative and a first phenomenon was given, save it too
    if (kind === "QUALITATIVE" && firstPhen) {
      await createPhenomenonApi(created.id, { name: firstPhen });
    }

    showAlert(
      "pt-alert",
      'Phenomenon type "' + esc(created.name) + '" created!',
      "success",
    );
    clearFields("pt-name", "pt-units", "pt-first-phenomenon");
    loadCataloguePhentypes();
  } catch (e) {
    showAlert("pt-alert", e.message);
  }
}

// ── Add Phenomenon to existing Qualitative type ───────────────────────────────

async function handleAddPhenomenon() {
  var typeId = document.getElementById("existing-qual-select").value;
  var name = document.getElementById("extra-ph-name").value.trim();

  if (!typeId) {
    showAlert("pt-alert", "Select a qualitative phenomenon type first.");
    return;
  }
  if (!name) {
    showAlert("pt-alert", "Phenomenon name is required.");
    return;
  }

  try {
    await createPhenomenonApi(typeId, { name: name });
    showAlert("pt-alert", '"' + esc(name) + '" added successfully!', "success");
    clearFields("extra-ph-name");
    loadCataloguePhentypes();
  } catch (e) {
    showAlert("pt-alert", e.message);
  }
}

// ── Protocols ─────────────────────────────────────────────────────────────────

async function loadProtocols() {
  var container = document.getElementById("proto-list-container");
  container.innerHTML = '<p class="empty">Loading…</p>';
  try {
    var protocols = await getProtocols();
    if (!protocols.length) {
      container.innerHTML = '<p class="empty">No protocols yet.</p>';
      return;
    }
    var rows = "";
    protocols.forEach(function (p) {
      rows +=
        "<tr>" +
        "<td>" +
        p.id +
        "</td>" +
        "<td><strong>" +
        esc(p.name) +
        "</strong></td>" +
        "<td>" +
        p.accuracyRating +
        "</td>" +
        '<td style="font-size:.8rem">' +
        esc(p.description || "—") +
        "</td>" +
        "</tr>";
    });
    container.innerHTML =
      "<table>" +
      "<thead><tr><th>#</th><th>Name</th><th>Rating</th><th>Description</th></tr></thead>" +
      "<tbody>" +
      rows +
      "</tbody>" +
      "</table>";
  } catch (e) {
    container.innerHTML =
      '<p class="empty" style="color:red">' + esc(e.message) + "</p>";
  }
}

async function handleCreateProtocol() {
  var name = document.getElementById("pr-name").value.trim();
  var description = document.getElementById("pr-desc").value.trim();
  var accuracyRating = document.getElementById("pr-rating").value;

  if (!name) {
    showAlert("proto-alert", "Name is required.");
    return;
  }
  try {
    await createProtocolApi({
      name: name,
      description: description,
      accuracyRating: accuracyRating,
    });
    showAlert("proto-alert", "Protocol created!", "success");
    clearFields("pr-name", "pr-desc");
    loadProtocols();
  } catch (e) {
    showAlert("proto-alert", e.message);
  }
}

// ── Diagnostic Rules ──────────────────────────────────────────────────────────

async function loadRules() {
  var container = document.getElementById("rules-list-container");
  container.innerHTML = '<p class="empty">Loading…</p>';
  try {
    var rules = await getRules();
    if (!rules.length) {
      container.innerHTML = '<p class="empty">No diagnostic rules yet.</p>';
      return;
    }
    var rows = "";
    rules.forEach(function (r) {
      rows +=
        "<tr>" +
        "<td>" +
        r.id +
        "</td>" +
        "<td><strong>" +
        esc(r.name) +
        "</strong></td>" +
        '<td style="font-size:.8rem">' +
        esc(r.argumentConceptIds) +
        "</td>" +
        "<td>" +
        esc(r.productConcept) +
        "</td>" +
        "</tr>";
    });
    container.innerHTML =
      "<table>" +
      "<thead><tr><th>#</th><th>Name</th><th>Argument Type IDs</th><th>Infers</th></tr></thead>" +
      "<tbody>" +
      rows +
      "</tbody>" +
      "</table>";
  } catch (e) {
    container.innerHTML =
      '<p class="empty" style="color:red">' + esc(e.message) + "</p>";
  }
}

async function handleCreateRule() {
  var name = document.getElementById("rl-name").value.trim();
  var argumentConceptIds = document.getElementById("rl-args").value.trim();
  var productConcept = document.getElementById("rl-product").value.trim();

  if (!name || !argumentConceptIds || !productConcept) {
    showAlert("rules-alert", "All fields are required.");
    return;
  }
  try {
    await createRuleApi({
      name: name,
      argumentConceptIds: argumentConceptIds,
      productConcept: productConcept,
    });
    showAlert("rules-alert", "Rule created!", "success");
    clearFields("rl-name", "rl-args", "rl-product");
    loadRules();
  } catch (e) {
    showAlert("rules-alert", e.message);
  }
}
