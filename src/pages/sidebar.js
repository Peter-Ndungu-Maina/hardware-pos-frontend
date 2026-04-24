/**
 * Elite Hardware POS — Shared Sidebar
 * Place AFTER auth.js in every page <head>:
 *   <script src="/src/pages/sidebar.js" data-active="inventory.html"></script>
 */

// ── 0. Apply saved theme immediately to avoid flash ───────────────────────────
(function () {
    if (localStorage.getItem('eliteTheme') === 'light') {
        document.documentElement.classList.add('light');
        document.addEventListener('DOMContentLoaded', function () {
            document.body.classList.add('light');
        });
    }
})();

// ── 1. API BASE
window.API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'https://hardware-pos-backend.onrender.com/api'
    : 'https://hardware-pos-backend.onrender.com/api';
window.API_URL = window.API_BASE;
// ── 2. SHARED FUNCTIONS
window.eliteLogout = function () {
    localStorage.clear();
    document.cookie = 'authToken=; path=/; SameSite=Strict; max-age=0';
    window.location.replace('/');
};
window.logout = window.eliteLogout;

window.toggleMobileMenu = function () {
    var s = document.getElementById('sidebar');
    if (s) s.classList.toggle('open');
};

// ── 3. NAV ITEMS
var NAV = [

   { href: '/',                  icon: '🏠', label: 'Dashboard',           roles: null },
    { href: '/inventory',         icon: '📦', label: 'Inventory & POS',     roles: null },

    // ── Customer & Sales Flow (Pre & Post-Sale Actions) ────────────────────────
    { href: '/sales_orders',      icon: '📝', label: 'Quotes / Sales Orders', roles: null }, // <--- ADDED HERE
    { href: '/customer_statement',icon: '👥', label: 'Customer Statements', roles: ['admin','manager'] },
    { href: '/debt_status',       icon: '⚠️', label: 'Debt Status',         roles: null },
    { href: '/payments_report',   icon: '💳', label: 'Payments Audit',      roles: null },
    { href: '/returns_audit',     icon: '🔄', label: 'Returns & Exchanges', roles: ['admin','manager'] },
    { href: '/returns_statement', icon: '📄', label: 'Returns Statements',  roles: ['admin','manager'] }, 

    // ── Supply Chain & Inventory Flow (Inbound Logistics) ────────────────────
    { href: '/suppliers',         icon: '🏭', label: 'Suppliers',           roles: ['admin','manager'] },
    { href: '/supplier_statement',icon: '🧾', label: 'Supplier Statements', roles: ['admin','manager'] },
    { href: '/purchase_orders',   icon: '📋', label: 'Purchase Orders',     roles: ['admin','manager'] },
    { href: '/add_product',       icon: '➕', label: 'Add Stock',           roles: ['admin','manager'] },
    { href: '/stock_movement',    icon: '📊', label: 'Stock Movement',      roles: ['admin','manager'] },
    { href: '/stock_audit',       icon: '🧾', label: 'Stock Audit',         roles: ['admin','manager'] },

    // ── Financial Intelligence & Back Office (Analytics) ───────────────────────
    { href: '/debtors_report',    icon: '📋', label: 'Debtors Report',      roles: ['admin','manager'] },
    { href: '/debts_repayment',   icon: '🧾', label: 'Debt Audit Logs',     roles: ['admin'] },
    { href: '/expenses',          icon: '💸', label: 'Expenses',            roles: ['admin'] },
    { href: '/accounting',        icon: '📒', label: 'Accounting',          roles: ['admin','manager'] },
    { href: '/stock_valuation',   icon: '💰', label: 'Stock Valuation',     roles: ['admin'] },
    { href: '/reports',           icon: '📉', label: 'Sales Reports',       roles: ['admin'] },
    { href: '/profit_loss',       icon: '📈', label: 'Profit & Loss',       roles: ['admin'] },

    // ── System Administration ──────────────────────────────────────────────────
    { href: '/billing',           icon: '💳', label: 'Billing',             roles: ['admin'] },
];


// ── 4. INJECT CSS
// ── 4. INJECT CSS
// ── 4. INJECT CSS
// ── 4. INJECT CSS
(function () {
    var style = document.createElement('style');
    style.textContent =
        "@import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=DM+Sans:wght@300;400;500;700;900&display=swap');\n" +
        ":root {\n" +
        "  --bg:#090a0f; --surface:#14171f; --surface2:#1e222d;\n" +
        "  --border:rgba(255,255,255,0.08);\n" +
        "  --green:#10b981; --green-dim:rgba(16,185,129,0.12);\n" +
        "  --red:#ef4444;   --red-dim:rgba(239,68,68,0.12);\n" +
        "  --blue:#3b82f6;  --blue-dim:rgba(59,130,246,0.12);\n" +
        "  --amber:#f59e0b; --amber-dim:rgba(245,158,11,0.12);\n" +
        "  --purple:#8b5cf6; --purple-dim:rgba(139,92,246,0.12);\n" +
        "  --text:#f8fafc; --muted:#94a3b8;\n" +
        "  --mono:'Space Mono',monospace; --sans:'DM Sans',sans-serif;\n" +
        "}\n" +
        "body.light { \n" +
        "  --bg:#e2e8f0; --surface:#f1f5f9; --surface2:#cbd5e1; \n" +
        "  --border:rgba(15,23,42,0.12); \n" +
        "  --green:#059669; --green-dim:rgba(5,150,105,0.10); \n" +
        "  --red:#dc2626;   --red-dim:rgba(220,38,38,0.10); \n" +
        "  --blue:#2563eb;  --blue-dim:rgba(37,99,235,0.10); \n" +
        "  --amber:#d97706; --amber-dim:rgba(217,119,6,0.10); \n" +
        "  --purple:#7c3aed; --purple-dim:rgba(124,58,237,0.10); \n" +
        "  --text:#0f172a; --muted:#475569; \n" +
        "}\n" +
        "* { box-sizing:border-box; margin:0; padding:0; }\n" +
        "body,*,*::before,*::after { transition:background-color 0.3s ease,color 0.3s ease; }\n" +
        "body { \n" +
        "  font-family:var(--sans); \n" +
        "  background:radial-gradient(circle at 50% 0%, #1a1e29 0%, var(--bg) 100%); \n" +
        "  background-attachment:fixed; \n" +
        "  color:var(--text); overflow-x:hidden; \n" +
        "}\n" +
        
        /* ── STRICTLY FORCE FLAT BACKGROUND IN LIGHT MODE ── */
        "body.light { background:var(--bg) !important; }\n" +
        
        /* ── AGGRESSIVE LIGHT MODE TAILWIND OVERRIDES ── */
        "body.light .bg-white, body.light .chart-card, body.light .kpi-card, body.light .kpi, body.light .card { background:var(--surface) !important; }\n" +
        "body.light .bg-gray-50, body.light .bg-slate-50, body.light .bg-slate-100 { background:var(--bg) !important; }\n" +
        "body.light .bg-slate-900:not(#sidebar):not([style]) { background:var(--green) !important; color:#fff !important; }\n" +
        "body.light main, body.light .page-main { background:var(--bg) !important; }\n" +
        "body.light .text-slate-900, body.light .text-slate-800 { color:var(--text) !important; }\n" +
        "body.light .text-slate-700 { color:#334155 !important; }\n" +
        "body.light .text-slate-600, body.light .text-slate-500, body.light .text-slate-400 { color:var(--muted) !important; }\n" +
        "body.light input:not([type=range]), body.light select, body.light textarea { background:var(--surface2) !important; color:var(--text) !important; border-color:var(--border) !important; }\n" +
        "body.light thead { background:rgba(15,23,42,0.03) !important; border-bottom:1px solid var(--border) !important; }\n" +
        "body.light thead th, body.light thead tr { color:var(--text) !important; }\n" +
        "body.light .rounded-3xl, body.light .rounded-2xl, body.light .kpi-card, body.light .chart-card, body.light .kpi, body.light .card { box-shadow:0 4px 12px rgba(0,0,0,0.05) !important; }\n" +
        "body.light ::-webkit-scrollbar-thumb { background:#94a3b8; }\n" +
        "body.light .nav-link:hover { background:rgba(15,23,42,0.05) !important; color:var(--text) !important; }\n" +
        "body.light .nav-link.active { background:var(--green-dim) !important; color:var(--green) !important; }\n" +
        
        /* Dark theme overrides for Tailwind pages */
        ".bg-white { background:var(--surface) !important; }\n" +
        ".bg-gray-50,.bg-gray-100 { background:var(--surface2) !important; }\n" +
        ".bg-slate-50,.bg-slate-100 { background:var(--surface2) !important; }\n" +
        ".bg-slate-200 { background:#1e222d !important; }\n" +
        ".bg-slate-700,.bg-slate-800 { background:#1e222d !important; }\n" +
        ".bg-emerald-50,.bg-emerald-100 { background:rgba(16,185,129,0.10) !important; }\n" +
        ".bg-emerald-500,.bg-emerald-600 { background:var(--green) !important; color:#000 !important; }\n" +
        ".bg-red-50,.bg-red-100 { background:rgba(239,68,68,0.10) !important; }\n" +
        ".bg-red-500,.bg-red-600,.bg-red-700 { background:var(--red) !important; color:#fff !important; }\n" +
        ".bg-blue-50,.bg-blue-100 { background:rgba(59,130,246,0.10) !important; }\n" +
        ".bg-blue-600,.bg-blue-700 { background:var(--blue) !important; color:#fff !important; }\n" +
        ".bg-orange-50,.bg-orange-100,.bg-yellow-100,.bg-amber-100 { background:rgba(245,158,11,0.10) !important; }\n" +
        ".bg-slate-900:not(#sidebar):not([style]) { background:var(--green) !important; color:#000 !important; }\n" +
        ".text-slate-900,.text-slate-800 { color:var(--text) !important; }\n" +
        ".text-slate-700 { color:#cbd5e1 !important; }\n" +
        ".text-slate-600,.text-slate-500,.text-slate-400 { color:var(--muted) !important; }\n" +
        ".text-emerald-600,.text-emerald-500 { color:var(--green) !important; }\n" +
        ".text-red-600,.text-red-500 { color:var(--red) !important; }\n" +
        ".text-blue-600,.text-blue-500 { color:var(--blue) !important; }\n" +
        ".text-orange-600 { color:var(--amber) !important; }\n" +
        ".border,.border-b,.border-t,.border-l,.border-r,.border-slate-100,.border-slate-200,.border-slate-300 { border-color:var(--border) !important; }\n" +
        ".divide-y>* { border-color:var(--border) !important; }\n" +
        ".border-emerald-500 { border-color:var(--green) !important; }\n" +
        ".border-red-500,.border-red-600 { border-color:var(--red) !important; }\n" +
        ".border-blue-500 { border-color:var(--blue) !important; }\n" +
        ".border-slate-800 { border-color:#334155 !important; }\n" +
        ".border-t-4 { border-top-width:4px !important; }\n" +
        ".hover\\:bg-slate-50:hover { background:var(--surface2) !important; }\n" +
        "thead,.bg-slate-50\\/50 { background:rgba(255,255,255,0.03) !important; }\n" +
        "input:not([type=range]),select,textarea { background:var(--surface2) !important; color:var(--text) !important; border-color:rgba(255,255,255,0.08) !important; }\n" +
        "input::placeholder,textarea::placeholder { color:var(--muted) !important; }\n" +
        ".rounded-3xl,.rounded-2xl { box-shadow:0 8px 24px rgba(0,0,0,0.4) !important; }\n" +
        "main,.page-main { background:transparent !important; }\n" +
        ".low-stock-row { background:rgba(239,68,68,0.07) !important; border-left:4px solid var(--red) !important; }\n" +
        "::-webkit-scrollbar { width:4px; }\n" +
        "::-webkit-scrollbar-track { background:transparent; }\n" +
        "::-webkit-scrollbar-thumb { background:#334155; border-radius:4px; }\n" +
        /* Sidebar */
        "#sidebar { position:fixed; left:0; top:0; bottom:0; width:256px; background:var(--surface); border-right:1px solid var(--border); display:flex; flex-direction:column; z-index:200; transition:transform 0.3s ease; }\n" +
        "#sidebarMount { flex-shrink:0; width:256px; position:relative; }\n" +
        /* Nav links */
        ".nav-link { display:flex; align-items:center; gap:10px; padding:10px 14px; border-radius:10px; font-size:13px; font-weight:600; color:var(--muted); cursor:pointer; transition:all 0.15s; border:none; background:none; width:100%; text-align:left; }\n" +
        ".nav-link:hover { background:rgba(255,255,255,0.05); color:var(--text); }\n" +
        ".nav-link.active { background:var(--green-dim); color:var(--green); }\n" +
        /* Mobile */
        "#mobileBar { display:none; }\n" +
        "@media (max-width:768px) {\n" +
        "  #sidebar { transform:translateX(-100%); }\n" +
        "  #sidebar.open { transform:translateX(0); }\n" +
        "  #sidebarMount { width:0; }\n" +
        "  #mobileBar { display:flex !important; }\n" +
        "}\n" +
        "@media print { .no-print { display:none !important; } body { background:white; } }\n";
    document.head.appendChild(style);
})();

// ── 5. BUILD AND MOUNT SIDEBAR
function mountSidebar() {
    var mount = document.getElementById('sidebarMount');
    if (!mount) return;

    // 1. Get the active page from the script tag
    var scripts    = document.querySelectorAll('script[data-active]');
    var activePage = scripts.length ? scripts[scripts.length - 1].dataset.active : '';

    /** * 2. ROLE CHECK FIX
     * Your auth.js saves the role to 'userRole'.
     * We check window.EliteAuth first, then fallback to localStorage directly.
     */
    // Only trust the server-verified role from EliteAuth — never raw localStorage
    var rawRole = (window.EliteAuth && window.EliteAuth.role) || '';
    var role       = rawRole.toLowerCase();
    
    // Check if the user is high-privileged (Admin or Manager)
    var isPrivileged = (role === 'admin' || role === 'manager');

    // 3. Filter navigation items based on the user's role
    var links = NAV
        .filter(function (item) {
            // If item.roles is null/undefined, everyone sees it.
            // Otherwise, we check if the current user's role is in the allowed list.
            if (!item.roles) return true;
            return item.roles.indexOf(role) !== -1;
        })
        .map(function (item) {
            var isActive = item.href.endsWith('/' + activePage) || item.href === activePage;
            var onclick  = isActive ? 'location.reload()'
                         : item.href === '/#scripts' ? 'typeof openScriptsPanel==="function"?openScriptsPanel():window.location.href="/"'
                         : "window.location.href='" + item.href + "'";
            return '<button onclick="' + onclick + '" class="nav-link' + (isActive ? ' active' : '') + '">'
                + item.icon + ' ' + item.label + '</button>';
        })
        .join('');

    // 4. Staff Management Button (Visible to Admin only)
    var staffBtn = (role === 'admin')
        ? '<button onclick="typeof openStaffManage===\'function\'?openStaffManage():window.location.href=\'/\'" class="nav-link" style="color:var(--blue);">👥 Manage Staff</button>'
        : '';

    // 5. Build and Inject the HTML
    mount.innerHTML =
        '<div id="mobileBar" class="no-print" style="position:fixed;top:0;left:0;right:0;z-index:150;background:var(--surface);border-bottom:1px solid var(--border);padding:14px 16px;align-items:center;justify-content:space-between;">'
        +   '<span style="font-family:var(--mono);font-weight:700;font-size:13px;color:var(--green);">ELITE HW 🛠️</span>'
        +   '<button onclick="toggleMobileMenu()" style="background:var(--surface2);border:1px solid var(--border);border-radius:8px;padding:7px 11px;color:var(--text);cursor:pointer;font-size:16px;">☰</button>'
        + '</div>'
        + '<div id="sidebar" class="no-print">'
        +   '<div style="padding:22px 18px 14px;">'
        +     '<div style="font-family:var(--mono);font-weight:700;font-size:14px;color:var(--green);">ELITE HW 🛠️</div>'
        +     '<div style="display:flex;align-items:center;gap:6px;margin-top:8px;">'
        +       '<div style="width:5px;height:5px;border-radius:50%;background:var(--green);"></div>'
        +       '<span style="font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);font-family:var(--mono);">Intelligence System</span>'
        +     '</div>'
        +   '</div>'
        +   '<nav style="flex:1;overflow-y:auto;padding:6px 10px;display:flex;flex-direction:column;gap:1px;">'
        +     links + staffBtn
        +   '</nav>'
        +   '<div style="padding:14px 10px;border-top:1px solid var(--border);display:flex;flex-direction:column;gap:8px;">'
        +     '<button id="themeToggleBtn" onclick="window.toggleTheme()" style="width:100%;padding:10px;border-radius:10px;border:1px solid var(--border);background:var(--surface2);color:var(--muted);font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:7px;">'
        +       '<span id="themeIcon">' + (localStorage.getItem('eliteTheme') === 'light' ? '🌙' : '☀️') + '</span>'
        +       '<span id="themeLabel">' + (localStorage.getItem('eliteTheme') === 'light' ? 'Dark Mode' : 'Light Mode') + '</span>'
        +     '</button>'
        +     '<button onclick="eliteLogout()" style="width:100%;padding:11px;border-radius:10px;background:rgba(255,77,109,0.08);color:var(--red);font-weight:900;font-size:10px;text-transform:uppercase;letter-spacing:1px;cursor:pointer;border:none;">Logout</button>'
        +   '</div>'
        + '</div>';
}

// Mount sidebar only after auth.js has verified the session and set window.EliteAuth.
// auth.js dispatches 'eliteAuthReady' when done; we fall back to DOMContentLoaded
// (e.g. on the login page where auth.js exits early without dispatching the event).
document.addEventListener('eliteAuthReady', mountSidebar);
document.addEventListener('DOMContentLoaded', function () {
    // If EliteAuth is already set by the time DOM is ready, mount immediately.
    // Otherwise wait for eliteAuthReady (auth.js will fire it after verify-session).
    if (window.EliteAuth) mountSidebar();
});

// ── THEME FUNCTIONS (global — callable from any page) ─────────────────────────
window.applyTheme = function (theme) {
    if (theme === 'light') {
        document.body.classList.add('light');
    } else {
        document.body.classList.remove('light');
    }
    var icon  = document.getElementById('themeIcon');
    var label = document.getElementById('themeLabel');
    if (icon)  icon.textContent  = theme === 'light' ? '🌙' : '☀️';
    if (label) label.textContent = theme === 'light' ? 'Dark Mode' : 'Light Mode';
};

window.toggleTheme = function () {
    var isLight = document.body.classList.contains('light');
    var next    = isLight ? 'dark' : 'light';
    localStorage.setItem('eliteTheme', next);
    window.applyTheme(next);
};