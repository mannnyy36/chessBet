import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import './TournamentPage.css';

// Mirrors the server-side odds calculation in routes/bets.js so users see
// the same odds they'll be charged at. Source of truth is still the server.
const calculateOdds = (ratingA, ratingB) => {
    const drawRate = 0.35
    const winProb = (1 / (1 + Math.pow(10, (ratingB - ratingA) / 400))) * (1 - drawRate)
    const lossProb = (1 / (1 + Math.pow(10, (ratingA - ratingB) / 400))) * (1 - drawRate)
    return {
        win: parseFloat((1 / winProb).toFixed(2)),
        draw: parseFloat((1 / drawRate).toFixed(2)),
        loss: parseFloat((1 / lossProb).toFixed(2)),
    }
}

function TournamentPage() {
    const { id } = useParams()
    const [tournament, setTournament] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedRoundId, setSelectedRoundId] = useState(null)
    const [games, setGames] = useState([])
    const [gamesLoading, setGamesLoading] = useState(false)
    const [gamesError, setGamesError] = useState(null)

    useEffect(() => {
        const fetchTournament = async () => {
            const response = await fetch(`http://localhost:8000/game/${id}`)
            const data = await response.json()
            setTournament(data.game)
            setLoading(false)
        }
        fetchTournament()
    }, [id])

    const handleSelectRound = async (round) => {
        // Toggle off if already open
        if (selectedRoundId === round.id) {
            setSelectedRoundId(null)
            setGames([])
            setGamesError(null)
            return
        }

        setSelectedRoundId(round.id)
        setGames([])
        setGamesError(null)
        setGamesLoading(true)

        try {
            const tourSlug = tournament.tour.slug
            const roundSlug = round.slug
            const response = await fetch(
                `http://localhost:8000/round/${tourSlug}/${roundSlug}/${round.id}/games`
            )
            const data = await response.json()
            if (!response.ok) {
                setGamesError(data.error || 'Could not load games.')
            } else {
                setGames(data.games || [])
            }
        } catch (err) {
            setGamesError(err.message)
        }

        setGamesLoading(false)
    }

    if (loading) return <div className="page"><p>Loading...</p></div>
    if (!tournament) return <div className="page"><p>Tournament not found.</p></div>

    return (
        <div className="page">
            <div className="tournament-header">
                {tournament.tour.image && (
                    <img className="tournament-img" src={tournament.tour.image} alt="" />
                )}
                <div className="tournament-info">
                    <h1 className="tournament-name">{tournament.tour.name}</h1>
                    <p className="tournament-location">{tournament.tour.info?.location}</p>
                    <div className="tournament-meta">
                        <span className="meta-tag">{tournament.tour.info?.format}</span>
                        <span className="meta-tag">{tournament.tour.info?.tc}</span>
                        <span className="meta-tag">{tournament.tour.info?.fideTC}</span>
                    </div>
                </div>
            </div>

            <div className="section-label">Rounds</div>
            <div className="rounds-list">
                {tournament.rounds?.map(round => {
                    const isOpen = selectedRoundId === round.id
                    return (
                        <div key={round.id} className="round-wrap">
                            <button
                                type="button"
                                className={`round-card ${isOpen ? 'round-card-open' : ''}`}
                                onClick={() => handleSelectRound(round)}
                            >
                                <div className="round-header">
                                    <span className="round-name">{round.name}</span>
                                    {round.ongoing && <span className="badge badge-live">Live</span>}
                                    {round.finished && <span className="badge badge-done">Finished</span>}
                                    {!round.ongoing && !round.finished && (
                                        <span className="badge badge-soon">
                                            {new Date(round.startsAt).toLocaleDateString('en-GB', {
                                                day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                            })}
                                        </span>
                                    )}
                                </div>
                            </button>

                            {isOpen && (
                                <div className="games-panel">
                                    {gamesLoading && <p className="games-status">Loading games…</p>}
                                    {gamesError && <p className="games-status games-error">{gamesError}</p>}
                                    {!gamesLoading && !gamesError && games.length === 0 && (
                                        <p className="games-status">No games available for this round.</p>
                                    )}
                                    {!gamesLoading && !gamesError && games.map(game => (
                                        <GameBetCard
                                            key={game.id}
                                            game={game}
                                            roundId={round.id}
                                            roundFinished={round.finished}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function GameBetCard({ game, roundId, roundFinished }) {
    const players = game.players || []
    const white = players[0]
    const black = players[1]

    const [selection, setSelection] = useState(null)
    const [amount, setAmount] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState(null)

    if (!white || !black) return null

    const odds = calculateOdds(white.rating || 1500, black.rating || 1500)
    // Lichess uses '*' for ongoing; anything else (1-0, 0-1, ½-½) means it's settled.
    const gameFinished = roundFinished || (game.status && game.status !== '*')

    const submitBet = async () => {
        if (!selection) {
            setMessage({ type: 'error', text: 'Pick an outcome first.' })
            return
        }
        const numAmount = Number(amount)
        if (!numAmount || numAmount <= 0) {
            setMessage({ type: 'error', text: 'Enter an amount greater than 0.' })
            return
        }
        const token = localStorage.getItem('token')
        if (!token) {
            setMessage({ type: 'error', text: 'You must be logged in to place a bet.' })
            return
        }

        setSubmitting(true)
        setMessage(null)

        try {
            const response = await fetch('http://localhost:8000/bets', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    game_id: game.id,
                    round_id: roundId,
                    player: white.name,
                    opponent: black.name,
                    player_rating: white.rating,
                    opponent_rating: black.rating,
                    selection,
                    amount: numAmount,
                }),
            })
            const data = await response.json()
            if (response.ok) {
                setMessage({
                    type: 'success',
                    text: `Bet placed at ${data.bet.odds}× — potential return ${(data.bet.odds * numAmount).toFixed(2)}.`,
                })
                setSelection(null)
                setAmount('')
            } else {
                setMessage({ type: 'error', text: data.error || 'Bet failed.' })
            }
        } catch (err) {
            setMessage({ type: 'error', text: err.message })
        }

        setSubmitting(false)
    }

    const options = [
        { key: 'win', label: `${white.name} wins`, odds: odds.win },
        { key: 'draw', label: 'Draw', odds: odds.draw },
        { key: 'loss', label: `${black.name} wins`, odds: odds.loss },
    ]

    return (
        <div className="game-card">
            <div className="game-players">
                <div className="player">
                    {white.title && <span className="player-title">{white.title}</span>}
                    <span className="player-name">{white.name}</span>
                    <span className="player-rating">{white.rating ?? '—'}</span>
                </div>
                <span className="vs">vs</span>
                <div className="player player-right">
                    <span className="player-rating">{black.rating ?? '—'}</span>
                    <span className="player-name">{black.name}</span>
                    {black.title && <span className="player-title">{black.title}</span>}
                </div>
            </div>

            {gameFinished ? (
                <div className="game-finished">
                    Result: {game.status && game.status !== '*' ? game.status : 'Round closed'}
                </div>
            ) : (
                <>
                    <div className="bet-options">
                        {options.map(opt => (
                            <button
                                key={opt.key}
                                type="button"
                                className={`bet-option ${selection === opt.key ? 'bet-option-selected' : ''}`}
                                onClick={() => setSelection(opt.key)}
                            >
                                <span className="bet-label">{opt.label}</span>
                                <span className="bet-odds">{opt.odds}×</span>
                            </button>
                        ))}
                    </div>

                    <div className="bet-actions">
                        <input
                            type="number"
                            className="bet-amount"
                            placeholder="Amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="1"
                        />
                        <button
                            type="button"
                            className="bet-submit"
                            onClick={submitBet}
                            disabled={submitting}
                        >
                            {submitting ? 'Placing…' : 'Place bet'}
                        </button>
                    </div>

                    {message && (
                        <div className={`bet-message bet-message-${message.type}`}>{message.text}</div>
                    )}
                </>
            )}
        </div>
    )
}

export default TournamentPage;
