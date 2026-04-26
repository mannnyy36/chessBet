import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './MyBetsPage.css';
import { API_URL } from '../config.js';

function MyBetsPage() {
    const [bets, setBets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            setError('You must be logged in to view your bets.')
            setLoading(false)
            return
        }

        fetch(`${API_URL}/bets`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(res => res.json().then(data => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (ok) setBets(data.bets || [])
                else setError(data.error || 'Could not load bets.')
                setLoading(false)
            })
            .catch(err => {
                setError(err.message)
                setLoading(false)
            })
    }, [])

    const pending = bets.filter(b => b.status === 'pending')
    const settled = bets.filter(b => b.status !== 'pending')

    return (
        <div className="bets-page">
            <Link to="/home" className="bets-back">← Back to tournaments</Link>
            <h1 className="bets-title">My bets</h1>

            {loading && <p className="bets-status">Loading…</p>}
            {error && <p className="bets-status bets-error">{error}</p>}

            {!loading && !error && bets.length === 0 && (
                <p className="bets-status">You haven't placed any bets yet.</p>
            )}

            {!loading && !error && pending.length > 0 && (
                <>
                    <div className="bets-section-label">Pending</div>
                    <div className="bets-list">
                        {pending.map(bet => <BetRow key={bet.id} bet={bet} />)}
                    </div>
                </>
            )}

            {!loading && !error && settled.length > 0 && (
                <>
                    <div className="bets-section-label">Settled</div>
                    <div className="bets-list">
                        {settled.map(bet => <BetRow key={bet.id} bet={bet} />)}
                    </div>
                </>
            )}
        </div>
    )
}

function BetRow({ bet }) {
    const selectionLabel =
        bet.selection === 'win' ? `${bet.player} wins`
        : bet.selection === 'loss' ? `${bet.opponent} wins`
        : 'Draw'

    const amount = Number(bet.amount)
    const odds = Number(bet.odds)
    const potentialReturn = (amount * odds).toFixed(2)
    const payout = bet.payout != null ? Number(bet.payout).toFixed(2) : null

    const dateLabel = new Date(bet.created_at).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    })

    return (
        <div className="bet-row">
            <div className="bet-row-main">
                <div className="bet-row-pairing">{bet.player} vs {bet.opponent}</div>
                <div className="bet-row-selection">{selectionLabel}</div>
                <div className="bet-row-meta">
                    {dateLabel} · staked {amount.toFixed(2)} @ {odds.toFixed(2)}×
                </div>
            </div>
            <div className="bet-row-status">
                <span className={`bet-status-pill bet-status-${bet.status}`}>
                    {bet.status}
                </span>
                <span className="bet-row-payout">
                    {bet.status === 'won' && `+${payout}`}
                    {bet.status === 'lost' && `−${amount.toFixed(2)}`}
                    {bet.status === 'pending' && `to win ${potentialReturn}`}
                </span>
            </div>
        </div>
    )
}

export default MyBetsPage;
