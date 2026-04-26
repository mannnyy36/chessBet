import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import './Auth.css';
import { API_URL } from '../config.js';

function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(null)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)
        setSubmitting(true)

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            })

            const data = await response.json()

            if (response.ok) {
                navigate('/login')
            } else {
                setError(data.error || 'Registration failed.')
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

                <h1 className="auth-title">Create your account</h1>
                <p className="auth-subtitle">Join ChessBet to start betting on live tournaments.</p>

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
                        <label className="auth-label" htmlFor="email">Email</label>
                        <input
                            id="email"
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            type="email"
                            autoComplete="email"
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
                            autoComplete="new-password"
                            required
                        />
                    </div>

                    {error && <div className="auth-error">{error}</div>}

                    <button type="submit" className="auth-submit" disabled={submitting}>
                        {submitting ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    )
}

export default RegisterPage;
