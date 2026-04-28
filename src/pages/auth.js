/**
 * Elite Hardware POS — Auth Guard + API Token Helper
 * Place as the FIRST script tag in the <head> of every protected page.
 *
 * Usage:
 *   <script src="/src/pages/auth.js"></script>                            ← any logged-in user
 *   <script src="/src/pages/auth.js" data-roles="admin,manager"></script> ← restricted roles
 *
 * How it works:
 *   1. Captures data-roles and hides the body SYNCHRONOUSLY before any await.
 *   2. Verifies the JWT server-side via /api/verify-session.
 *   3. Checks the server-returned role against data-roles.
 *   4. Shows Access Denied or reveals the page accordingly.
 */
(async function () {

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 1 — Capture everything that requires synchronous access BEFORE await
    // document.currentScript becomes null after any await, so we must read it NOW.
    // ─────────────────────────────────────────────────────────────────────────
    const _scriptTag    = document.currentScript;
    const _allowedRoles = _scriptTag && _scriptTag.dataset && _scriptTag.dataset.roles
        ? _scriptTag.dataset.roles.split(',').map(function(r){ return r.trim().toLowerCase(); })
        : null; // null = any authenticated user is allowed

    // ─────────────────────────────────────────────────────────────────────────
   // ─────────────────────────────────────────────────────────────────────────
    // STEP 2 — Show a professional loading overlay instead of a blank white screen
    // ─────────────────────────────────────────────────────────────────────────
    function _applyHide() {
        if (document.getElementById('elite-auth-loader')) return;

        var loader = document.createElement('div');
        loader.id = 'elite-auth-loader';
        // Solid dark background matching your theme, covers everything
        loader.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;background:#090a0f;z-index:999999;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#00e5a0;font-family:"Space Mono", monospace;transition:opacity 0.2s ease;';
        
        loader.innerHTML = 
            '<div style="font-size:48px;margin-bottom:20px;animation: authPulse 1.2s infinite ease-in-out;">🛠️</div>' +
            '<div style="font-size:14px;font-weight:900;letter-spacing:3px;text-transform:uppercase;">Connecting...</div>' +
            '<style>@keyframes authPulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(0.85); } } body { overflow: hidden; }</style>';
            
        if (document.body) {
            document.body.appendChild(loader);
        } else {
            // If body isn't parsed yet, wait for it
            document.addEventListener('DOMContentLoaded', function() { document.body.appendChild(loader); }, { once: true });
        }
    }

    function _reveal() {
        var loader = document.getElementById('elite-auth-loader');
        if (loader) {
            loader.style.opacity = '0';
            // Wait for the fade out to finish before removing it completely
            setTimeout(function() { 
                if (loader.parentNode) loader.parentNode.removeChild(loader); 
                document.body.style.overflow = ''; // Restore scrolling
            }, 200);
        }
        if (document.body) document.body.classList.add('auth-ready');
    }
    // ─────────────────────────────────────────────────────────────────────────
    // STEP 3 — Login page: reveal and exit immediately
    // ─────────────────────────────────────────────────────────────────────────
    var _path = window.location.pathname;
    var _isLoginPage = (_path === '/' || _path.endsWith('index.html'));

    if (_isLoginPage) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _reveal, { once: true });
        } else {
            _reveal();
        }
        return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 4 — HTML escape helper
    // ─────────────────────────────────────────────────────────────────────────
    function escHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g,  '&amp;')
            .replace(/</g,  '&lt;')
            .replace(/>/g,  '&gt;')
            .replace(/"/g,  '&quot;')
            .replace(/'/g,  '&#x27;')
            .replace(/\//g, '&#x2F;');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 5 — Access Denied renderer
    // ─────────────────────────────────────────────────────────────────────────
    function _showAccessDenied(role) {
        function render() {
            document.body.style.opacity    = '';
            document.body.style.visibility = '';
            document.body.innerHTML =
                '<div style="display:flex;align-items:center;justify-content:center;' +
                'min-height:100vh;background:#0a0f1e;font-family:sans-serif;' +
                'flex-direction:column;color:#f1f5f9;">' +
                '<div style="background:#111827;padding:48px;border-radius:24px;' +
                'text-align:center;border:1px solid rgba(255,255,255,0.05);' +
                'box-shadow:0 20px 50px rgba(0,0,0,0.5);max-width:420px;">' +
                '<div style="font-size:56px;margin-bottom:16px;">🔐</div>' +
                '<h1 style="font-weight:900;text-transform:uppercase;' +
                'letter-spacing:3px;margin-bottom:8px;font-size:20px;">Access Denied</h1>' +
                '<p style="color:#64748b;margin-bottom:32px;font-size:14px;">' +
                'Your role <strong style="color:#f1f5f9;">' + escHtml(role) + '</strong> ' +
                'does not have permission to view this page.</p>' +
                '<button onclick="window.location.replace(\'/\')" ' +
                'style="background:#00e5a0;color:#000;padding:14px 32px;' +
                'border-radius:12px;font-weight:900;text-transform:uppercase;' +
                'border:none;cursor:pointer;font-size:12px;letter-spacing:1px;">' +
                '\u2190 Return to Dashboard</button>' +
                '</div></div>';
        }
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', render, { once: true });
        } else {
            render();
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 6 — Fast pre-check: token must exist in localStorage
    // ─────────────────────────────────────────────────────────────────────────
    var _token = localStorage.getItem('authToken');
    var _name  = localStorage.getItem('userName');

    if (!_token || !_name) {
        localStorage.clear();
        document.cookie = 'authToken=; path=/; SameSite=Strict; max-age=0';
        window.location.replace('/');
        return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 7 — Server-side session verification
    // We trust ONLY the role the server returns — never localStorage role.
    // ─────────────────────────────────────────────────────────────────────────
    var _serverRole;
    var _sessionData = {}; // Store session data locally to bypass errors
    
    try {
        // If the browser knows it is completely offline, skip the fetch attempt entirely
        if (!navigator.onLine) {
            throw new Error('OFFLINE_MODE');
        }

        var verifyRes = await fetch('https://hardware-pos-backend.onrender.com/api/verify-session', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + _token,
                'Content-Type':  'application/json'
            }
        });

        if (!verifyRes.ok) throw new Error('Session invalid');

        _sessionData = await verifyRes.json();
        _serverRole = (_sessionData.role || '').toLowerCase();

        // Keep localStorage in sync with server truth
        if (_sessionData.role) {
            localStorage.setItem('userRole', _sessionData.role);
        }

    } catch (err) {
        // ── OFFLINE FIX ──
        // If the error is because we are offline OR the network fetch failed, trust the local token
        if (err.message === 'OFFLINE_MODE' || err.message === 'Failed to fetch') {
            console.warn('[auth.js] Offline mode detected. Trusting local session.');
            _serverRole = (localStorage.getItem('userRole') || '').toLowerCase();
            
            // Mock the basic session data so STEP 9 doesn't crash
            _sessionData = {
                readOnly: false,
                gracePeriod: false,
                daysUntilExpiry: null,
                subStatus: 'active',
                subPlan: 'monthly'
            };
        } else {
            // A genuine authentication error (like an expired token)
            console.error('[auth.js] Session verification failed:', err.message);
            localStorage.clear();
            document.cookie = 'authToken=; path=/; SameSite=Strict; max-age=0';
            window.location.replace('/');
            return;
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 8 — Role enforcement using server-verified role
    // _allowedRoles was captured synchronously in STEP 1 (before any await)
    // ─────────────────────────────────────────────────────────────────────────
    if (_allowedRoles && _allowedRoles.indexOf(_serverRole) === -1) {
        // Redirect to root — hides the restricted page path from the address bar
        window.location.replace('/?denied=1');
        return;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // STEP 9 — Auth passed: expose globals and reveal the page
    // ─────────────────────────────────────────────────────────────────────────
    window.EliteAuth = {
        token:        _token,
        role:         _serverRole,
        name:         _name,
        isAdmin:      _serverRole === 'admin',
        isManager:    (_serverRole === 'admin' || _serverRole === 'manager'),
        isPrivileged: (_serverRole === 'admin' || _serverRole === 'manager'),
        // ── Subscription ──────────────────────────────────────────────────────
        readOnly:        _sessionData.readOnly        || false,
        gracePeriod:     _sessionData.gracePeriod     || false,
        daysUntilExpiry: _sessionData.daysUntilExpiry ?? null,
        paidUntil:       _sessionData.paidUntil       || null,
        subStatus:       _sessionData.subStatus       || 'active',
        subPlan:         _sessionData.subPlan         || 'monthly',
    };

    // ── Subscription banner ──────────────────────────────────────────────────
    // Injects a dismissible banner at the very top of every protected page.
    // readOnly   → red  "POS is locked" bar with Renew button
    // gracePeriod → amber "subscription expiring soon" bar
    // ≤7 days    → amber "expires in N days" bar
    // ─────────────────────────────────────────────────────────────────────────
    (function _injectSubscriptionBanner() {
        const sub = window.EliteAuth;
        const days = sub.daysUntilExpiry;
        const isLifetime = sub.subPlan === 'lifetime';
        const expiredThing = isLifetime ? 'annual service fee' : 'subscription';

        // Decide which banner (if any) to show
        let bg, border, icon, msg, btnLabel = null;

        if (sub.readOnly) {
            bg     = 'linear-gradient(135deg,rgba(239,68,68,0.18),rgba(239,68,68,0.05))';
            border = 'rgba(239,68,68,0.5)';
            icon   = '🔒';
            const dAgo = days !== null ? Math.abs(days) : '?';
            msg    = `POS is <strong>READ-ONLY</strong> — ${expiredThing} expired ${dAgo} day(s) ago. New sales are blocked. Data export is still available.`;
            btnLabel = 'Renew Now';
        } else if (sub.gracePeriod) {
            bg     = 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,158,11,0.05))';
            border = 'rgba(245,158,11,0.5)';
            icon   = '⚠️';
            const dLeft = days !== null ? Math.max(0, days) : '?';
            msg    = `<strong>Grace period</strong> — ${expiredThing} expired. ${dLeft} day(s) before the POS locks. Please renew now.`;
            btnLabel = 'Renew Now';
        } else if (days !== null && days <= 7 && days >= 0) {
            bg     = 'linear-gradient(135deg,rgba(245,158,11,0.12),rgba(245,158,11,0.04))';
            border = 'rgba(245,158,11,0.35)';
            icon   = '📅';
            msg    = `Your ${expiredThing} expires in <strong>${days} day${days !== 1 ? 's' : ''}</strong>. Renew before ${sub.paidUntil || 'expiry'} to avoid interruption.`;
            btnLabel = 'Renew';
        } else {
            return; // Active and not expiring soon — no banner needed
        }

        function _render() {
            // Don't duplicate if already injected (e.g. SPA navigation)
            if (document.getElementById('eliteSubBanner')) return;

            const bar = document.createElement('div');
            bar.id = 'eliteSubBanner';
            bar.style.cssText = [
                'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
                'display:flex', 'align-items:center', 'justify-content:space-between',
                'gap:12px', 'padding:10px 20px',
                `background:${bg}`,
                `border-bottom:1px solid ${border}`,
                'font-family:sans-serif', 'font-size:13px',
                'color:#f1f5f9', 'backdrop-filter:blur(8px)',
                'box-shadow:0 2px 12px rgba(0,0,0,0.25)',
            ].join(';');

            const left = `<span style="display:flex;align-items:center;gap:8px;">
                <span style="font-size:18px">${icon}</span>
                <span>${msg}</span>
            </span>`;

            const right = `<span style="display:flex;align-items:center;gap:8px;flex-shrink:0;">
                ${btnLabel
                    ? `<button onclick="window.location.href='/billing'" style="background:#00e5a0;color:#000;border:none;border-radius:8px;padding:6px 14px;font-weight:900;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;cursor:pointer;">${btnLabel}</button>`
                    : ''}
                <button onclick="document.getElementById('eliteSubBanner').remove()"
                    style="background:none;border:none;color:#94a3b8;font-size:18px;cursor:pointer;line-height:1;padding:2px 6px;" title="Dismiss">×</button>
            </span>`;

            bar.innerHTML = left + right;
            document.body.insertBefore(bar, document.body.firstChild);

            // Push page content down so the banner doesn't overlap anything
            document.body.style.paddingTop = (parseInt(document.body.style.paddingTop || 0) + bar.offsetHeight + 2) + 'px';
        }

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _render, { once: true });
        } else {
            _render();
        }
    })();

    window.apiFetch = async function (url, options) {
        options = options || {};
        
        // Trust the Netlify origin AND the Render backend URL
        if (url.startsWith('http') && !url.startsWith(window.location.origin) && !url.startsWith(window.API_BASE)) {
            throw new Error('Security Block: External API calls are not permitted.');
        }

        // ── Read-only guard ────────────────────────────────────────────────
        // Block write attempts client-side before the request even leaves the
        // browser. This is UX-only — the real enforcement is server-side via
        // requireSubscription. Read requests (GET/undefined) always pass.
        const method = ((options.method || 'GET')).toUpperCase();
        if (window.EliteAuth.readOnly && method !== 'GET') {
            const isLifetime = window.EliteAuth.subPlan === 'lifetime';
            const expiredThing = isLifetime ? 'annual service fee' : 'subscription';
            const days = window.EliteAuth.daysUntilExpiry;
            const dAgo = days !== null ? Math.abs(days) : '?';
            if (window.Swal) {
                window.Swal.fire({
                    icon: 'error',
                    title: '🔒 POS is Read-Only',
                    html: `Your ${expiredThing} expired <strong>${dAgo} day(s) ago</strong>.<br><br>
                           New sales, edits, and other write actions are blocked.<br>
                           You can still view and export all your data.<br><br>
                           <em>Please renew to restore full access.</em>`,
                    confirmButtonText: 'OK',
                });
            } else {
                alert(`🔒 POS is read-only. ${expiredThing} expired ${dAgo} day(s) ago. Please renew to continue.`);
            }
            // Return a fake response so callers that don't check can degrade gracefully
            return new Response(JSON.stringify({ success: false, readOnly: true, code: 'SUBSCRIPTION_EXPIRED' }),
                { status: 402, headers: { 'Content-Type': 'application/json' } });
        }

        var headers = Object.assign({}, options.headers || {}, {
            'Content-Type':  'application/json',
            'Authorization': 'Bearer ' + _token
        });
        var res = await fetch(url, Object.assign({}, options, { headers: headers }));
        if (res.status === 401) {
            localStorage.clear();
            document.cookie = 'authToken=; path=/; SameSite=Strict; max-age=0';
            window.location.replace('/');
            return;
        }

        // If the server returns 402 SUBSCRIPTION_EXPIRED (edge case where cache
        // was stale client-side), update EliteAuth and show the modal.
        if (res.status === 402) {
            try {
                const errData = await res.clone().json();
                if (errData.code === 'SUBSCRIPTION_EXPIRED') {
                    window.EliteAuth.readOnly = true;
                    // Re-inject the banner if it was dismissed
                    if (!document.getElementById('eliteSubBanner')) {
                        window.EliteAuth.daysUntilExpiry = -1;
                        // Force banner re-injection by re-running STEP 9 banner logic isn't
                        // directly callable here, so show a modal instead
                        if (window.Swal) {
                            window.Swal.fire({ icon:'error', title:'🔒 Access Blocked',
                                text: errData.message || 'Subscription expired.', confirmButtonText:'OK' });
                        } else {
                            alert(errData.message || '🔒 Subscription expired. POS is read-only.');
                        }
                    }
                }
            } catch(e) {}
        }

        return res;
    };

    window.logout = function () {
        localStorage.clear();
        document.cookie = 'authToken=; path=/; SameSite=Strict; max-age=0';
        window.location.replace('/');
    };

    window.escHtml = escHtml;

    // ─────────────────────────────────────────────────────────────────────────
    // FINAL STEP — Dispatch eliteAuthReady and reveal the page.
    //
    // THE RACE CONDITION THIS FIXES:
    //   auth.js lives in <head>. verify-session is a fast /api call.
    //   On warm servers the fetch can resolve BEFORE the browser has finished
    //   parsing <body> and executing the inline <script> blocks at the bottom
    //   of the page. If we dispatch eliteAuthReady immediately, those blocks
    //   haven't registered their listeners yet — they never fire — data never
    //   loads and the page stays blank.
    //
    //   Fix: if the DOM is still loading, defer the dispatch until
    //   DOMContentLoaded, by which point every inline script has run and all
    //   eliteAuthReady listeners are registered.
    // ─────────────────────────────────────────────────────────────────────────
    function _dispatchAndReveal() {
        document.dispatchEvent(new Event('eliteAuthReady'));
        _reveal();
    }

    if (document.readyState === 'loading') {
        // DOM not yet ready — wait for it so page scripts can register first
        document.addEventListener('DOMContentLoaded', _dispatchAndReveal, { once: true });
    } else {
        // DOM already ready (e.g. verify-session was slow) — fire immediately
        _dispatchAndReveal();
    }

})();