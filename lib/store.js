const { SUPABASE_URL, SUPABASE_ANON_KEY } = require("./config");

function headers(token, extra = {}) {
  return {
    Authorization: `Bearer ${token}`,
    apikey: SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function sb(token, path, init = {}) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: headers(token, init.headers || {}),
  });
  const text = await r.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { ok: r.ok, status: r.status, data };
}

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
  return "inv_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function normalizeInvoice(input, userId, prev = {}) {
  const now = new Date().toISOString();
  const amount = Number(input.amount ?? prev.amount ?? 0);
  const taxRate = Number(input.tax_rate ?? prev.tax_rate ?? 25);
  const lines = Array.isArray(input.lines) ? input.lines : prev.lines || [];
  return {
    id: prev.id || input.id || newId(),
    user_id: userId,
    number: String(input.number || prev.number || `INV-${now.slice(0, 10).replace(/-/g, "")}-${String(Date.now()).slice(-4)}`),
    customer_name: String(input.customer_name || prev.customer_name || "").slice(0, 200),
    customer_email: String(input.customer_email || prev.customer_email || "").slice(0, 200),
    customer_orgnr: String(input.customer_orgnr || prev.customer_orgnr || "").slice(0, 40),
    description: String(input.description || prev.description || "").slice(0, 2000),
    amount: Number.isFinite(amount) ? amount : 0,
    currency: String(input.currency || prev.currency || "SEK").slice(0, 8).toUpperCase(),
    tax_rate: Number.isFinite(taxRate) ? taxRate : 25,
    status: ["draft", "sent", "paid", "overdue", "cancelled"].includes(input.status)
      ? input.status
      : prev.status || "draft",
    issue_date: input.issue_date || prev.issue_date || now.slice(0, 10),
    due_date: input.due_date || prev.due_date || now.slice(0, 10),
    lines,
    notes: String(input.notes || prev.notes || "").slice(0, 2000),
    created_at: prev.created_at || now,
    updated_at: now,
  };
}

async function listFromTable(token, userId) {
  const r = await sb(token, `invoices?user_id=eq.${userId}&select=*&order=created_at.desc`);
  if (r.ok && Array.isArray(r.data)) return { invoices: r.data, source: "invoices" };
  if (r.status === 404 || (r.data && String(r.data.code || "").startsWith("PGRST"))) return null;
  if (!r.ok) return null;
  return { invoices: [], source: "invoices" };
}

async function insertTable(token, inv) {
  const r = await sb(token, "invoices", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(inv),
  });
  if (r.ok) return { invoice: Array.isArray(r.data) ? r.data[0] : r.data, source: "invoices" };
  return null;
}

async function updateTable(token, userId, id, inv) {
  const r = await sb(token, `invoices?id=eq.${encodeURIComponent(id)}&user_id=eq.${userId}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify(inv),
  });
  if (r.ok) return { invoice: Array.isArray(r.data) ? r.data[0] : r.data, source: "invoices" };
  return null;
}

async function deleteTable(token, userId, id) {
  const r = await sb(token, `invoices?id=eq.${encodeURIComponent(id)}&user_id=eq.${userId}`, {
    method: "DELETE",
    headers: { Prefer: "return=representation" },
  });
  return r.ok;
}

async function ensureCompany(token, userId, email) {
  const existing = await sb(token, `companies?user_id=eq.${userId}&select=id,metadata,company_name&limit=1`);
  if (existing.ok && Array.isArray(existing.data) && existing.data[0]) return existing.data[0];
  const created = await sb(token, "companies", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      user_id: userId,
      company_name: email ? `Fakturor · ${email}` : "SnabbFaktura",
      country: "SE",
      currency: "SEK",
      vat_rate: 0.25,
      metadata: { invoices: [] },
    }),
  });
  if (created.ok) return Array.isArray(created.data) ? created.data[0] : created.data;
  return null;
}

async function listFromCompany(token, userId, email) {
  const company = await ensureCompany(token, userId, email);
  if (!company) return { invoices: [], source: "none", company: null };
  const invoices = Array.isArray(company.metadata && company.metadata.invoices)
    ? company.metadata.invoices
    : [];
  invoices.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
  return { invoices, source: "company_metadata", company };
}

async function writeCompanyInvoices(token, company, invoices) {
  const metadata = { ...(company.metadata || {}), invoices };
  const r = await sb(token, `companies?id=eq.${company.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ metadata }),
  });
  return r.ok;
}

async function listInvoices(user) {
  const table = await listFromTable(user.access_token, user.id);
  if (table) return table;
  return listFromCompany(user.access_token, user.id, user.email);
}

async function createInvoice(user, input) {
  const inv = normalizeInvoice(input || {}, user.id);
  const table = await insertTable(user.access_token, inv);
  if (table && table.invoice) return table;
  const pack = await listFromCompany(user.access_token, user.id, user.email);
  const invoices = [inv, ...pack.invoices];
  if (pack.company) await writeCompanyInvoices(user.access_token, pack.company, invoices);
  return { invoice: inv, source: pack.company ? "company_metadata" : "ephemeral" };
}

async function getInvoice(user, id) {
  const pack = await listInvoices(user);
  const invoice = pack.invoices.find((x) => String(x.id) === String(id));
  return { invoice: invoice || null, source: pack.source };
}

async function updateInvoice(user, id, input) {
  const current = await getInvoice(user, id);
  if (!current.invoice) return { invoice: null };
  const inv = normalizeInvoice(input || {}, user.id, current.invoice);
  if (current.source === "invoices") {
    const table = await updateTable(user.access_token, user.id, id, inv);
    if (table && table.invoice) return table;
  }
  const pack = await listFromCompany(user.access_token, user.id, user.email);
  const invoices = pack.invoices.map((x) => (String(x.id) === String(id) ? inv : x));
  if (pack.company) await writeCompanyInvoices(user.access_token, pack.company, invoices);
  return { invoice: inv, source: "company_metadata" };
}

async function deleteInvoice(user, id) {
  const current = await getInvoice(user, id);
  if (!current.invoice) return false;
  if (current.source === "invoices") {
    const ok = await deleteTable(user.access_token, user.id, id);
    if (ok) return true;
  }
  const pack = await listFromCompany(user.access_token, user.id, user.email);
  const invoices = pack.invoices.filter((x) => String(x.id) !== String(id));
  if (pack.company) return writeCompanyInvoices(user.access_token, pack.company, invoices);
  return false;
}

module.exports = {
  listInvoices,
  createInvoice,
  getInvoice,
  updateInvoice,
  deleteInvoice,
  normalizeInvoice,
};
