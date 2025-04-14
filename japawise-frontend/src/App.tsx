import React from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';

// Simple router implementation
// In a real app, you'd likely use React Router or similar
const App: React.FC = () => {
  // Basic routing logic
  const path = window.location.pathname;
  
  return (
    <Layout>
      {path === '/about' ? <AboutPage /> : <HomePage />}
    </Layout>
  );
};

export default App;