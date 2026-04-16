async function loadPatients() {
  var container = document.getElementById("patients-table-container");
  container.innerHTML = '<p class="empty">Loading…</p>';
  try {
    var patients = await getPatients();
    if (!patients.length) {
      container.innerHTML = '<p class="empty">No patients registered yet.</p>';
      return;
    }
    var rows = "";
    patients.forEach(function (p) {
      rows +=
        "<tr>" +
        "<td>" +
        p.id +
        "</td>" +
        "<td><strong>" +
        esc(p.fullName) +
        "</strong></td>" +
        "<td>" +
        (p.dateOfBirth || "—") +
        "</td>" +
        "<td>" +
        esc(p.note || "—") +
        "</td>" +
        '<td><button class="btn btn-primary btn-sm" onclick="showDetail(' +
        p.id +
        ')">View</button></td>' +
        "</tr>";
    });
    container.innerHTML =
      "<table>" +
      "<thead><tr><th>#</th><th>Name</th><th>Date of Birth</th><th>Note</th><th></th></tr></thead>" +
      "<tbody>" +
      rows +
      "</tbody>" +
      "</table>";
  } catch (e) {
    container.innerHTML =
      '<p class="empty" style="color:red">' + esc(e.message) + "</p>";
  }
}

async function handleCreatePatient() {
  var fullName = document.getElementById("p-name").value.trim();
  var dateOfBirth = document.getElementById("p-dob").value;
  var note = document.getElementById("p-note").value.trim();

  if (!fullName) {
    showAlert("patients-alert", "Full name is required.");
    return;
  }
  if (!dateOfBirth) {
    showAlert("patients-alert", "Date of birth is required.");
    return;
  }
  if (!note) {
    showAlert("patients-alert", "Note is required.");
    return;
  }

  try {
    await createPatient({
      fullName: fullName,
      dateOfBirth: dateOfBirth,
      note: note,
    });
    showAlert("patients-alert", "Patient created successfully!", "success");
    clearFields("p-name", "p-dob", "p-note");
    loadPatients();
  } catch (e) {
    showAlert("patients-alert", e.message);
  }
}
