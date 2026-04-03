import { useState } from "react"
import { useNavigate } from "react-router-dom"

function RegisterPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()
  
  const handleSubmit = async (e) => {
      e.preventDefault()
      
      const response = await fetch('http://localhost:8000/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ username, email, password })
      })
      
      const data = await response.json()
      if(response.ok) {
        navigate('/login')        
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

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
        />

        <button type="submit">Register</button>
      </form>
    </div>
  )
}

export default RegisterPage;