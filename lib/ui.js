module.exports = function renderApp({ email }) {
  const who = email ? String(email).replace(/[<>&"]/g, "") : "Invo";
  return `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Invo</title>
<style>
:root{--bg:#0E0E12;--card:#15151A;--line:#1E1E24;--line2:#2A2A34;--text:#F4F4F5;--muted:#8A8A94;--dim:#5A5A60;--accent:#0d9488;--ok:#34d399;--bad:#f87171}
*{box-sizing:border-box}html,body{margin:0;padding:0;background:var(--bg);color:var(--text);font-family:Inter,system-ui,sans-serif}
body{min-height:100vh}
header{display:flex;justify-content:space-between;align-items:flex-end;padding:20px 22px 12px;border-bottom:1px solid var(--line)}
h1{margin:0;font-size:20px;font-weight:800;letter-spacing:-.02em}
.sub{color:var(--muted);font-size:12px;margin-top:4px}
.who{font-size:11px;color:var(--dim);background:var(--card);border:1px solid var(--line);padding:6px 10px;border-radius:999px}
main{padding:18px 22px 40px;max-width:920px}
.row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin-bottom:16px}
button{appearance:none;border:0;cursor:pointer;font-weight:700;font-size:13px;border-radius:10px;padding:10px 14px}
.primary{background:var(--accent);color:#fff}
.ghost{background:var(--card);color:var(--text);border:1px solid var(--line2)}
a.ghost{display:inline-flex;align-items:center;text-decoration:none}
.grid{display:grid;gap:10px}
.card{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:14px 16px}
.inv{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center}
.num{font-size:11px;color:var(--dim);letter-spacing:.08em;font-weight:700}
.cust{font-weight:700;font-size:14px}
.meta{font-size:12px;color:var(--muted);margin-top:3px}
.amt{font-weight:800;font-size:15px;text-align:right}
.badge{display:inline-block;font-size:10px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:999px;background:#1A1A22;color:var(--muted)}
.badge.paid{color:#052e1a;background:#34d399}.badge.sent{color:#3b2a00;background:#fbbf24}.badge.draft{color:#99f6e4;background:#134e4a}
form{display:grid;grid-template-columns:1fr 1fr;gap:10px}
form .full{grid-column:1/-1}
label{display:block;font-size:11px;color:var(--muted);margin-bottom:4px;font-weight:600}
input,select{width:100%;background:#111115;border:1px solid var(--line2);color:var(--text);border-radius:10px;padding:10px 12px;font:inherit}
.empty{padding:36px 16px;text-align:center;color:var(--muted)}
.empty b{display:block;color:var(--text);margin-bottom:6px;font-size:15px}
.err{color:var(--bad);font-size:12px;margin:8px 0}
.ok{color:var(--ok);font-size:12px}
.actions{display:flex;gap:6px;justify-content:flex-end;margin-top:8px}
.hidden{display:none}
@media(max-width:640px){form{grid-template-columns:1fr}header,main{padding-left:14px;padding-right:14px}}
</style>
</head>
<body>
<header>
  <div>
    <h1>Invo</h1>
    <div class="sub">Fakturera på 30 sekunder</div>
  </div>
  <div class="who" id="who">${who}</div>
</header>
<main>
  <div class="row">
    <button class="primary" id="newBtn" type="button">Ny faktura</button>
    <button class="ghost" id="refreshBtn" type="button">Uppdatera</button>
    <a class="ghost" href="https://www.invoic.se/" target="_blank" rel="noopener">PDF-skapare</a>
    <span class="sub" id="count"></span>
  </div>
  <div id="msg"></div>
  <form id="form" class="card hidden">
    <div class="full"><b>Ny faktura</b></div>
    <div><label>Kund</label><input name="customer_name" required placeholder="Acme AB"/></div>
    <div><label>E-post</label><input name="customer_email" type="email" placeholder="ekonomi@acme.se"/></div>
    <div class="full"><label>Beskrivning</label><input name="description" placeholder="Konsultation augusti"/></div>
    <div><label>Belopp (ex moms)</label><input name="amount" type="number" min="0" step="0.01" required placeholder="12000"/></div>
    <div><label>Valuta</label>
      <select name="currency"><option>SEK</option><option>EUR</option><option>USD</option><option>GBP</option></select>
    </div>
    <div><label>Moms %</label><input name="tax_rate" type="number" min="0" max="100" step="0.1" value="25"/></div>
    <div><label>Förfallodatum</label><input name="due_date" type="date"/></div>
    <div class="full actions">
      <button class="ghost" type="button" id="cancelBtn">Avbryt</button>
      <button class="primary" type="submit">Spara faktura</button>
    </div>
  </form>
  <div class="grid" id="list"><div class="empty">Laddar fakturor...</div></div>
</main>
<script>
const $ = (id) => document.getElementById(id);
const msg = (t, ok) => { $('msg').innerHTML = t ? '<div class="'+(ok?'ok':'err')+'">'+t+'</div>' : ''; };
const money = (n, c) => new Intl.NumberFormat('sv-SE', {style:'currency', currency:c||'SEK'}).format(Number(n||0));
let token = '';
try { token = localStorage.getItem('sf_token') || ''; } catch (e) {}
const api = (path, opt={}) => {
  const headers = {'content-type':'application/json', ...(opt.headers||{})};
  if (token) headers.authorization = 'Bearer ' + token;
  return fetch(path, {credentials:'include', ...opt, headers});
};
function esc(s){
  return String(s||'').replace(/[&<>"]/g, function(ch){
    if(ch==='&') return String.fromCharCode(38)+'amp;';
    if(ch==='<') return String.fromCharCode(38)+'lt;';
    if(ch==='>') return String.fromCharCode(38)+'gt;';
    return String.fromCharCode(38)+'quot;';
  });
}
async function load() {
  $('count').textContent = '';
  const r = await api('/api/invoices');
  if (r.status === 401) {
    $('list').innerHTML = '<div class="empty"><b>Inte inloggad</b>Logga in för att spara fakturor i molnet.</div>';
    return;
  }
  if (!r.ok) { $('list').innerHTML = '<div class="empty"><b>Kunde inte hämta</b>'+r.status+'</div>'; return; }
  const data = await r.json();
  const items = data.invoices || [];
  $('count').textContent = items.length + ' fakturor';
  if (!items.length) {
    $('list').innerHTML = '<div class="card empty"><b>Inga fakturor ännu</b>Skapa den första.</div>';
    return;
  }
  $('list').innerHTML = items.map(inv => {
    const total = Number(inv.amount||0) * (1 + Number(inv.tax_rate||0)/100);
    return '<article class="card inv" data-id="'+inv.id+'">'+
      '<div><div class="num">'+esc(inv.number)+'</div><div class="cust">'+esc(inv.customer_name||'Utan kund')+'</div>'+
      '<div class="meta">'+esc(inv.description||'')+' · '+esc(inv.due_date||'')+'</div></div>'+
      '<div><div class="amt">'+money(total, inv.currency)+'</div>'+
      '<div style="text-align:right;margin-top:6px"><span class="badge '+esc(inv.status)+'">'+esc(inv.status)+'</span></div>'+
      '<div class="actions"><button class="ghost" data-act="paid">Markera betald</button><button class="ghost" data-act="del">Ta bort</button></div></div></article>';
  }).join('');
}
$('newBtn').onclick = () => { $('form').classList.remove('hidden'); };
$('cancelBtn').onclick = () => { $('form').classList.add('hidden'); };
$('refreshBtn').onclick = () => load();
$('form').onsubmit = async (e) => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const body = Object.fromEntries(fd.entries());
  body.amount = Number(body.amount);
  body.tax_rate = Number(body.tax_rate);
  const r = await api('/api/invoices', {method:'POST', body: JSON.stringify(body)});
  if (!r.ok) { msg('Kunde inte spara ('+r.status+')'); return; }
  e.target.reset();
  $('form').classList.add('hidden');
  msg('Faktura sparad', true);
  load();
};
$('list').onclick = async (e) => {
  const btn = e.target.closest('button[data-act]');
  if (!btn) return;
  const card = btn.closest('[data-id]');
  const id = card && card.dataset.id;
  if (!id) return;
  if (btn.dataset.act === 'del') {
    if (!confirm('Ta bort fakturan?')) return;
    await api('/api/invoices/'+id, {method:'DELETE'});
  } else if (btn.dataset.act === 'paid') {
    await api('/api/invoices/'+id, {method:'PUT', body: JSON.stringify({status:'paid'})});
  }
  load();
};
api('/api/auth/me').then(r => r.ok ? r.json() : null).then(d => {
  if (d && d.user && d.user.email) $('who').textContent = d.user.email;
}).catch(() => {});
load();
</script>
</body>
</html>`;
};
