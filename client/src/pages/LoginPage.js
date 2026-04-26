import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Auth.css';

function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null)
        setSubmitting(true)

        try {
            const response = await fetch("http://localhost:8000/login", {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const data = await response.json()

            if (response.ok && data.token) {
                localStorage.setItem('token', data.token)
                navigate('/home')
            } else {
                setError(data.error || 'Login failed.')
            }
        } catch (err) {
            setError(err.message)
        }

        setSubmitting(false)
    }

    return (
        <div className="auth-page">
            <div className="auth-card">
                <Link to="/home" className="auth-brand">
                    <div className="auth-logo">♟</div>
                    <span className="auth-brand-name">ChessBet</span>
                </Link>

                <h1 className="auth-title">Welcome back</h1>
                <p className="auth-subtitle">Sign in to place bets and track your tournaments.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="auth-field">
                        <label className="auth-label" htmlFor="username">Username</label>
                        <input
                            id="username"
                            className="auth-input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            type="text"
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="auth-field">
                        <label className="auth-label" htmlFor="password">Password</label>
                        <input
                            id="password"
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="password"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-submit" disabled={submitting}>
                        {submitting ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>

                <p className="auth-switch">
                    Don't have an account? <Link to="/register">Register</Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage;
