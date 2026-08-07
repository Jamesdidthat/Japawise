import React from 'react';
import { useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

// Simple router implementation
// In a real app, you'd likely use React Router or similar
const App: React.FC = () => {
  const { pathname } = useLocation();
  
  return (
    <Layout>
      {pathname === '/about' ? <AboutPage /> : <HomePage />}
    </Layout>
  );
};

export default App;
