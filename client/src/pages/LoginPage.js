import { useState } from "react";
import { useNavigate } from "react-router-dom";

function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault();

        const response = await fetch("http://localhost:8000/login", {
            method : 'POST',
            headers : {
                'Content-Type' : 'application/json'
            },
            body : JSON.stringify({username, password}),
        })

        const data = await response.json()

        if (data.token) {
            localStorage.setItem('token', data.token)
            navigate('/home')
        }

        console.log(data)
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    type="text"
                />

                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type="password"
                />

                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default LoginPage;