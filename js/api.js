const BASE_URL = "https://patient-observation-tracker-backend.onrender.com/api";

async function apiRequest(method, path, body) {
  const opts = { method, headers: { "Content-Type": "application/json" } };
  if (body !== undefined) opts.body = JSON.stringify(body);
  const res = await fetch(BASE_URL + path, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

function getPatients() {
  return apiRequest("GET", "/patients");
}
function getPatient(id) {
  return apiRequest("GET", `/patients/${id}`);
}
function createPatient(body) {
  return apiRequest("POST", "/patients", body);
}
function getObservations(pid) {
  return apiRequest("GET", `/patients/${pid}/observations`);
}
function evaluateRulesApi(pid) {
  return apiRequest("POST", `/patients/${pid}/evaluate`);
}

function recordMeasurementApi(body) {
  return apiRequest("POST", "/observations/measurement", body);
}
function recordCategoryApi(body) {
  return apiRequest("POST", "/observations/category", body);
}
function rejectObservationApi(id, body) {
  return apiRequest("POST", `/observations/${id}/reject`, body);
}

function getPhenomenonTypes() {
  return apiRequest("GET", "/phenomenon-types");
}
function createPhenomenonTypeApi(body) {
  return apiRequest("POST", "/phenomenon-types", body);
}
function getPhenomena(typeId) {
  return apiRequest("GET", `/phenomenon-types/${typeId}/phenomena`);
}
function createPhenomenonApi(typeId, body) {
  return apiRequest("POST", `/phenomenon-types/${typeId}/phenomena`, body);
}
function getProtocols() {
  return apiRequest("GET", "/protocols");
}
function createProtocolApi(body) {
  return apiRequest("POST", "/protocols", body);
}
function getRules() {
  return apiRequest("GET", "/rules");
}
function createRuleApi(body) {
  return apiRequest("POST", "/rules", body);
}

function getCommandLog() {
  return apiRequest("GET", "/command-log");
}
function getAuditLog() {
  return apiRequest("GET", "/audit-log");
}
