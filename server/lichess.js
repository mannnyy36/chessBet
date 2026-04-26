// Thin wrapper around Lichess broadcast endpoints.
// Centralised so the bet placement, settlement, and round-list
// routes all hit the API consistently.

const BASE = 'https://lichess.org/api/broadcast/'

export async function fetchRound(tourSlug, roundSlug, roundId) {
    const url = `${BASE}${tourSlug}/${roundSlug}/${roundId}`
    const response = await fetch(url)
    if (!response.ok) {
        throw new Error(`Lichess responded with ${response.status}`)
    }
    return response.json()
}

// Translate Lichess game status to our 'win' | 'draw' | 'loss' enum,
// where the perspective is the white player ('player' in our schema).
// Returns null if the game hasn't finished yet.
export function outcomeFromStatus(status) {
    if (!status || status === '*') return null
    if (status === '1-0') return 'win'
    if (status === '0-1') return 'loss'
    if (status === '1/2-1/2' || status === '½-½') return 'draw'
    return null
}
