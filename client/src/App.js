import './App.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import RegisterPage from './pages/RegisterPage.js'
import LoginPage from './pages/LoginPage.js';
import HomePage from './pages/HomePage.js';
import ProfilePage from './pages/ProfilePage.js';
import TournamentPage from './pages/TournamentPage.js';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace/>}/>
        <Route path="/home" element={<HomePage/>}/> 
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage/>}/>
        <Route path="/tournament/:id" element={<TournamentPage />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;
