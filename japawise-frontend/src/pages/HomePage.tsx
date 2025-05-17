// HomePage.tsx
import React, { useState } from 'react';
import RouteForm from '../components/RouteForm';
import PopularRoutes from '../components/PopularRoutes';


const HomePage: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const handleSelectRoute = (selectedFrom: string, selectedTo: string) => {
    setFrom(selectedFrom);
    setTo(selectedTo);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/japawise_background.png')` }}
    >
      <div className="backdrop-blur-sm bg-white/70 min-h-screen px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
          Find the best route<br />for your journey
        </h1>

      <RouteForm from={from} to={to} setFrom={setFrom} setTo={setTo} />
      <PopularRoutes onSelectRoute={handleSelectRoute} />
      </div>
    </div>
  );
};

export default HomePage;
