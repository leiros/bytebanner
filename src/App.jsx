import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PublicProfile from './pages/PublicProfile';
import CategoryResults from './pages/CategoryResults';
import AdminDashboard from './pages/AdminDashboard';
import { useEffect } from 'react';
import { supabase } from './supabase';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/p/:username" element={<PublicProfile />} />
            <Route path="/category/:categoryId" element={<CategoryResults />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </main>
      </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
