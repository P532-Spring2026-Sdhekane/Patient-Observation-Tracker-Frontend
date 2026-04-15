var currentPatientId = null;

async function loadPatientDetail(patientId) {
  currentPatientId = patientId;
  document.getElementById("inferences-box").style.display = "none";
  document.getElementById("detail-alert").innerHTML = "";

  try {
    var p = await getPatient(patientId);
    document.getElementById("detail-name").textContent = p.fullName;
    document.getElementById("detail-meta").textContent =
      "ID: " +
      p.id +
      " | DOB: " +
      (p.dateOfBirth || "N/A") +
      " | Note: " +
      (p.note || "None");
  } catch (e) {
    /* silent — name stays blank */
  }

  loadObservations(patientId);
  populatePhenTypeDropdowns();
  populateProtocolDropdowns();
}

// ── Observations table ────────────────────────────────────────────────────────

async function loadObservations(patientId) {
  var container = document.getElementById("observations-table-container");
  container.innerHTML = '<p class="empty">Loading…</p>';
  try {
    var obs = await getObservations(patientId);
    if (!obs.length) {
      container.innerHTML =
        '<p class="empty">No observations recorded yet.</p>';
      return;
    }

    var rows = "";
    obs.forEach(function (o) {
      var isRej = o.status === "REJECTED";

      var typeLabel =
        o.observationType === "measurement"
          ? '<span class="badge badge-meas">Measurement</span>'
          : '<span class="badge badge-cat">Category</span>';

      var phenomenon =
        o.observationType === "measurement"
          ? esc((o.phenomenonType && o.phenomenonType.name) || "—")
          : esc((o.phenomenon && o.phenomenon.name) || "—");

      var value =
        o.observationType === "measurement"
          ? esc(String(o.amount)) + " " + esc(o.unit)
          : esc(o.presence);

      var statusBadge = isRej
        ? '<span class="badge badge-rejected">REJECTED</span>'
        : '<span class="badge badge-active">ACTIVE</span>';

      var action = !isRej
        ? '<button class="btn btn-danger btn-sm" onclick="handleRejectObs(' +
          o.id +
          ')">Reject</button>'
        : '<span style="font-size:.75rem;color:var(--muted)">' +
          esc(o.rejectionReason || "") +
          "</span>";

      rows +=
        "<tr>" +
        "<td>" +
        typeLabel +
        "</td>" +
        "<td>" +
        phenomenon +
        "</td>" +
        "<td>" +
        value +
        "</td>" +
        '<td style="font-size:.78rem">' +
        "Rec: " +
        fmtTime(o.recordingTime) +
        "<br/>" +
        "App: " +
        fmtTime(o.applicabilityTime) +
        "</td>" +
        "<td>" +
        (o.protocol ? esc(o.protocol.name) : "—") +
        "</td>" +
        "<td>" +
        statusBadge +
        "</td>" +
        "<td>" +
        action +
        "</td>" +
        "</tr>";
    });

    container.innerHTML =
      "<table>" +
      "<thead><tr>" +
      "<th>Type</th><th>Phenomenon</th><th>Value</th>" +
      "<th>Timestamps</th><th>Protocol</th><th>Status</th><th></th>" +
      "</tr></thead>" +
      "<tbody>" +
      rows +
      "</tbody>" +
      "</table>";
  } catch (e) {
    container.innerHTML =
      '<p class="empty" style="color:red">' + esc(e.message) + "</p>";
  }
}

// ── Reject ────────────────────────────────────────────────────────────────────

async function handleRejectObs(obsId) {
  var reason = prompt("Rejection reason:");
  if (reason === null) return;
  try {
    await rejectObservationApi(obsId, { reason: reason });
    showAlert("detail-alert", "Observation rejected.", "success");
    loadObservations(currentPatientId);
  } catch (e) {
    showAlert("detail-alert", e.message);
  }
}

// ── Evaluate Rules ────────────────────────────────────────────────────────────

async function handleEvaluateRules() {
  var box = document.getElementById("inferences-box");
  try {
    var result = await evaluateRulesApi(currentPatientId);
    var inferences = result.inferredConcepts || [];
    box.style.display = "block";
    if (!inferences.length) {
      box.innerHTML =
        '<div class="alert alert-info">No rules fired for this patient\'s current observations.</div>';
    } else {
      var items = "";
      inferences.forEach(function (i) {
        items += "<li>🔬 " + esc(i) + "</li>";
      });
      box.innerHTML =
        '<div class="alert alert-success">' +
        "<strong>Inferred Concepts:</strong>" +
        '<ul class="inference-list">' +
        items +
        "</ul>" +
        "</div>";
    }
  } catch (e) {
    showAlert("detail-alert", e.message);
  }
}

// ── Populate dropdowns ────────────────────────────────────────────────────────

async function populatePhenTypeDropdowns() {
  try {
    var types = await getPhenomenonTypes();
    var quant = types.filter(function (t) {
      return t.kind === "QUANTITATIVE";
    });
    var qual = types.filter(function (t) {
      return t.kind === "QUALITATIVE";
    });

    // Measurement: quantitative types
    var mSel = document.getElementById("m-phentype");
    if (!quant.length) {
      mSel.innerHTML =
        '<option value="">— no quantitative types yet (add in Catalogue) —</option>';
    } else {
      var quantOpts = "";
      quant.forEach(function (t) {
        quantOpts +=
          '<option value="' +
          t.id +
          '">' +
          esc(t.name) +
          " [" +
          esc(t.allowedUnitsRaw || "") +
          "]" +
          "</option>";
      });
      mSel.innerHTML = quantOpts;
    }

    // Category: qualitative types
    var cSel = document.getElementById("c-phentype");
    if (!qual.length) {
      cSel.innerHTML =
        '<option value="">— no qualitative types yet (add in Catalogue) —</option>';
      document.getElementById("c-phenomenon").innerHTML =
        '<option value="">— select a type first —</option>';
    } else {
      var qualOpts = "";
      qual.forEach(function (t) {
        qualOpts += '<option value="' + t.id + '">' + esc(t.name) + "</option>";
      });
      cSel.innerHTML = qualOpts;
      loadPhenomenaForSelectedType();
    }
  } catch (e) {
    document.getElementById("m-phentype").innerHTML =
      '<option value="">— could not load types —</option>';
  }
}

async function loadPhenomenaForSelectedType() {
  var typeId = document.getElementById("c-phentype").value;
  var sel = document.getElementById("c-phenomenon");
  if (!typeId) {
    sel.innerHTML = '<option value="">— select a type first —</option>';
    return;
  }
  try {
    var phenomena = await getPhenomena(typeId);
    if (!phenomena.length) {
      sel.innerHTML =
        '<option value="">— no phenomena for this type yet (add in Catalogue) —</option>';
      return;
    }
    var opts = "";
    phenomena.forEach(function (p) {
      opts += '<option value="' + p.id + '">' + esc(p.name) + "</option>";
    });
    sel.innerHTML = opts;
  } catch (e) {
    sel.innerHTML = '<option value="">— error loading phenomena —</option>';
  }
}

async function populateProtocolDropdowns() {
  try {
    var protocols = await getProtocols();
    var opts = '<option value="">— none —</option>';
    protocols.forEach(function (p) {
      opts +=
        '<option value="' +
        p.id +
        '">' +
        esc(p.name) +
        " [" +
        p.accuracyRating +
        "]</option>";
    });
    document.getElementById("m-protocol").innerHTML = opts;
    document.getElementById("c-protocol").innerHTML = opts;
  } catch (e) {
    /* silent — protocol is optional */
  }
}

// ── Record Measurement ────────────────────────────────────────────────────────

async function handleRecordMeasurement() {
  var phenomenonTypeId = document.getElementById("m-phentype").value;
  var amount = document.getElementById("m-amount").value;
  var unit = document.getElementById("m-unit").value.trim();
  var timeVal = document.getElementById("m-time").value;
  var protocolId = document.getElementById("m-protocol").value || null;

  if (!phenomenonTypeId) {
    showAlert(
      "detail-alert",
      "No quantitative phenomenon types available. Add one in the Catalogue first.",
    );
    return;
  }
  if (!amount) {
    showAlert("detail-alert", "Amount is required.");
    return;
  }
  if (!unit) {
    showAlert("detail-alert", "Unit is required.");
    return;
  }

  try {
    await recordMeasurementApi({
      patientId: currentPatientId,
      phenomenonTypeId: Number(phenomenonTypeId),
      amount: Number(amount),
      unit: unit,
      applicabilityTime: timeVal ? new Date(timeVal).toISOString() : null,
      protocolId: protocolId ? Number(protocolId) : null,
    });
    showAlert("detail-alert", "Measurement recorded!", "success");
    clearFields("m-amount", "m-unit", "m-time");
    loadObservations(currentPatientId);
  } catch (e) {
    showAlert("detail-alert", e.message);
  }
}

// ── Record Category Observation ───────────────────────────────────────────────

async function handleRecordCategory() {
  var phenomenonId = document.getElementById("c-phenomenon").value;
  var presence = document.getElementById("c-presence").value;
  var timeVal = document.getElementById("c-time").value;
  var protocolId = document.getElementById("c-protocol").value || null;

  if (!phenomenonId) {
    showAlert(
      "detail-alert",
      "No phenomena available. Add qualitative types and their phenomena in the Catalogue first.",
    );
    return;
  }

  try {
    await recordCategoryApi({
      patientId: currentPatientId,
      phenomenonId: Number(phenomenonId),
      presence: presence,
      applicabilityTime: timeVal ? new Date(timeVal).toISOString() : null,
      protocolId: protocolId ? Number(protocolId) : null,
    });
    showAlert("detail-alert", "Category observation recorded!", "success");
    clearFields("c-time");
    loadObservations(currentPatientId);
  } catch (e) {
    showAlert("detail-alert", e.message);
  }
}
