import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import './ProfilePage.css';
import { API_URL } from '../config.js';

function ProfilePage() {
    const [userData, setUserData] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`${API_URL}/profile`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setUserData(data)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    const username = userData?.userInfo?.username
    const balance = userData?.userInfo?.balance
    const initial = username ? username.charAt(0).toUpperCase() : '?'

    return (
        <div className="profile-page">
            <Link to="/home" className="profile-back">← Back to tournaments</Link>

            {loading ? (
                <p className="profile-loading">Loading…</p>
            ) : !username ? (
                <p className="profile-loading">Could not load profile. Please <Link to="/login">log in</Link>.</p>
            ) : (
                <div className="profile-card">
                    <div className="profile-avatar">{initial}</div>
                    <div className="profile-username">{username}</div>

                    <div className="profile-row">
                        <span className="profile-row-label">Balance</span>
                        <span className="profile-row-value">{balance}</span>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProfilePage;
