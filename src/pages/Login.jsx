import { useState, useEffect } from 'react';

const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'https://hardware-pos-backend.onrender.com/api'
    : '/api';

const Login = () => {
    const [empId, setEmpId] = useState('');
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [lockoutTimer, setLockoutTimer] = useState(0);

    // Effect to handle the visual countdown timer if a user is locked
    useEffect(() => {
        if (lockoutTimer > 0) {
            const timer = setTimeout(() => setLockoutTimer(lockoutTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [lockoutTimer]);

    const handleSubmit = async () => {
        setError('');
        const currentId = empId.trim().toUpperCase();

        if (!currentId || !pin.trim()) {
            setError('Employee ID and PIN are required.');
            return;
        }
        if (pin.trim().length < 4) {
            setError('PIN must be at least 4 digits.');
            return;
        }

        // --- CLIENT-SIDE LOCKOUT CHECK (Specific to Employee ID) ---
        const attemptData = JSON.parse(localStorage.getItem(`login_attempts_${currentId}`) || '{"count":0, "lockedUntil":0}');
        
        if (attemptData.lockedUntil > Date.now()) {
            const secs = Math.ceil((attemptData.lockedUntil - Date.now()) / 1000);
            setLockoutTimer(secs);
            setError(`Account locked. Please wait ${secs}s before trying again.`);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employeeId: currentId, pin: pin.trim() }),
            });
            
            const data = await res.json();
            
            if (res.ok && data.token) {
                // Success: Clear attempts for this ID
                localStorage.removeItem(`login_attempts_${currentId}`);

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('userRole', data.role);
                localStorage.setItem('userName', data.name);
                document.cookie = `authToken=${data.token}; path=/; SameSite=Strict; max-age=28800`;
                window.location.replace('/');
            } else {
                // Failure: Increment attempts for this specific ID
                attemptData.count += 1;
                
                if (attemptData.count >= 5) {
                    attemptData.lockedUntil = Date.now() + 30 * 1000; // 30 second lock
                    attemptData.count = 0; // Reset count for after the lock expires
                    setLockoutTimer(30);
                    setError('Too many failed attempts. Locked for 30 seconds.');
                } else {
                    setError(data.message || 'Invalid credentials. Please try again.');
                }
                
                localStorage.setItem(`login_attempts_${currentId}`, JSON.stringify(attemptData));
            }
        } catch {
            setError('Cannot connect to server. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', background: '#0a0f1e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px', fontFamily: "'DM Sans', sans-serif",
        }}>
            <div style={{
                background: '#111827', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 24, padding: '40px', width: '100%', maxWidth: 400,
            }}>
                <div style={{ textAlign: 'center', marginBottom: 32 }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>🛠️</div>
                    <h1 style={{ fontFamily: "'Space Mono', monospace", fontSize: 19, fontWeight: 700, color: '#00e5a0', margin: 0 }}>
                        ELITE HARDWARE
                    </h1>
                    <p style={{ fontSize: 10, color: '#64748b', marginTop: 4, fontFamily: "'Space Mono', monospace", textTransform: 'uppercase', letterSpacing: '1.5px' }}>
                        POS Intelligence System
                    </p>
                </div>

                {error && (
                    <div style={{ background: 'rgba(255,77,109,0.12)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, fontSize: 12, color: '#ff4d6d', fontWeight: 600 }}>
                        {lockoutTimer > 0 ? `Account locked. Please wait ${lockoutTimer}s.` : error}
                    </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                        <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#64748b', display: 'block', marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>
                            Employee ID
                        </label>
                        <input type="text" value={empId} onChange={e => {
                                setEmpId(e.target.value);
                                setError(''); // Clear error when typing a new ID
                            }}
                            onKeyDown={e => { if (e.key === 'Enter') document.getElementById('pinInput').focus(); }}
                            placeholder="e.g. HW-01"
                            disabled={lockoutTimer > 0}
                            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)', color: '#f1f5f9', fontWeight: 600, outline: 'none', fontSize: 14, boxSizing: 'border-box', opacity: lockoutTimer > 0 ? 0.5 : 1 }}
                        />
                    </div>
                    <div>
                        <label style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#64748b', display: 'block', marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>
                            Access PIN
                        </label>
                        <input id="pinInput" type="password" inputMode="numeric" value={pin}
                            onChange={e => setPin(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                            placeholder="••••"
                            disabled={lockoutTimer > 0}
                            style={{ width: '100%', padding: '13px 16px', borderRadius: 12, background: '#1a2235', border: '1px solid rgba(255,255,255,0.06)', color: '#f1f5f9', fontWeight: 600, outline: 'none', fontSize: 22, letterSpacing: 8, boxSizing: 'border-box', opacity: lockoutTimer > 0 ? 0.5 : 1 }}
                        />
                    </div>
                    <button onClick={handleSubmit} disabled={loading || lockoutTimer > 0}
                        style={{ width: '100%', padding: 14, borderRadius: 12, background: (loading || lockoutTimer > 0) ? '#008f62' : '#00e5a0', color: '#000', fontWeight: 900, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, cursor: (loading || lockoutTimer > 0) ? 'not-allowed' : 'pointer', border: 'none', opacity: (loading || lockoutTimer > 0) ? 0.8 : 1 }}>
                        {loading ? 'Authenticating...' : lockoutTimer > 0 ? `Locked (${lockoutTimer}s)` : 'Login to Dashboard'}
                    </button>
                </div>

                <p style={{ textAlign: 'center', marginTop: 18, fontSize: 11, color: '#64748b' }}>
                    Forgot PIN? Contact Manager
                </p>
            </div>
        </div>
    );
};

export default Login;