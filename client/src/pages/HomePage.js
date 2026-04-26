import { useEffect, useState } from "react";
import './HomePage.css';
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from '../config.js';

function HomePage() {
    const [tournaments, setTournaments] = useState([])
    const [token, setToken] = useState(localStorage.getItem('token'))
    const navigate = useNavigate()

    const handleLogout = () => {
        localStorage.removeItem('token')
        setToken(null)
        navigate('/home')
    }

    useEffect(() => {
        const fetchTournaments = async () => {
            const response = await fetch(`${API_URL}/tournaments`)
            const data = await response.json()
            setTournaments(data)
        }
        fetchTournaments()
    }, [])

    const getTimeUntil = (startsAt) => {
        const now = Date.now()
        const diff = startsAt - now
        if (diff <= 0) return 'Starting soon'
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        if (days > 0) return `in ${days}d ${hours}h`
        if (hours > 0) return `in ${hours}h ${minutes}m`
        return `in ${minutes}m`
    }

    const liveTournaments = tournaments.filter(t => t.round.ongoing)
    const upcomingTournaments = tournaments
        .filter(t => !t.round.ongoing)
        .sort((a, b) => a.round.startsAt - b.round.startsAt)

    const TournamentCard = ({ t }) => (
        <div className="card">
            {t.tour.image
                ? <img className="card-img" src={t.tour.image} alt="" />
                : <div className="card-img-placeholder" />
            }
            <div className="card-body">
                <div className="card-name">{t.tour.name}</div>
                <div className="card-location">{t.tour.info?.location}</div>
                <div className="card-footer">
                    {t.round.ongoing
                        ? <span className="badge badge-live">Live</span>
                        : <span className="badge badge-soon">{getTimeUntil(t.round.startsAt)}</span>
                    }
                    <span className="tc">{t.tour.info?.tc}</span>
                </div>
            </div>
        </div>
    )

    return (
        <div className="page">
            <div className="header">
                <Link to="/home" className="brand">
                    <div className="logo">♟</div>
                    <span className="site-name">ChessBet</span>
                </Link>
                <div className="account">
                    {token ? (
                        <>
                            <Link to="/profile" className="account-link">Profile</Link>
                            <button type="button" className="account-link account-link-button" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="account-link">Login</Link>
                            <Link to="/register" className="account-link account-link-primary">Register</Link>
                        </>
                    )}
                </div>
            </div>

            <nav className="nav">
                <span className="nav-item active">Tournaments</span>
                <Link to="/my-bets" className="nav-item nav-link">My Bets</Link>
                <span className="nav-item">Leaderboard</span>
            </nav>

            {liveTournaments.length > 0 && (
                <>
                    <div className="section-label">Live now</div>
                    <div className="grid">
                        {liveTournaments.map(t => (
                            <Link key={t.tour.id} to={`/tournament/${t.tour.id}`} style={{ textDecoration: 'none' }}>
                                <TournamentCard t={t} />
                            </Link>
                        ))}
                    </div>
                </>
            )}

            {upcomingTournaments.length > 0 && (
                <>
                    <div className="section-label" style={{ marginTop: '1.5rem' }}>Upcoming</div>
                    <div className="grid">
                        {upcomingTournaments.map(t => (
                            <Link key={t.tour.id} to={`/tournament/${t.tour.id}`} style={{ textDecoration: 'none' }}>
                                <TournamentCard t={t} />
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}

export default HomePage;