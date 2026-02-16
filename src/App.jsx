import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Listings from './pages/Listings';
import ListingDetail from './pages/ListingDetail';
import Consultants from './pages/Consultants';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Admin/Login';
import Dashboard from './pages/Admin/Dashboard';
import { ListingProvider } from './context/ListingContext';
import { AuthProvider, useAuth } from './context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <ListingProvider>
        <Router>
          <ScrollToTop />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ilanlar" element={<Listings />} />
            <Route path="/ilan/:slug" element={<ListingDetail />} />
            <Route path="/danismanlar" element={<Consultants />} />
            <Route path="/hakkimizda" element={<About />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/admin/login" element={<Login />} />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={
              <div className="pt-32 pb-20 text-center min-h-screen bg-primary">
                <h1 className="text-4xl font-bold text-white mb-4">404</h1>
                <p className="text-slate-300 mb-6">Aradığınız sayfa bulunamadı.</p>
                <a href="/" className="text-secondary hover:underline font-medium">Ana Sayfaya Dön</a>
              </div>
            } />
          </Routes>
          <Footer />
        </Router>
      </ListingProvider>
    </AuthProvider>
  );
}

export default App;
