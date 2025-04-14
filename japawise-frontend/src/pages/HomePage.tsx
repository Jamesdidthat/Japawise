import React, { useState } from 'react';
import RouteForm from '../components/RouteForm';
import PopularRoutes from '../components/PopularRoutes';

const HomePage: React.FC = () => {
  const [from, setFrom] = useState('Lekki');
  const [to, setTo] = useState('');
  const [showToInput, setShowToInput] = useState(false);

  const handleSelectRoute = (from: string, to: string) => {
    setFrom(from);
    setTo(to);
    setShowToInput(true);
    // You might want to implement additional logic here
  };

  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-10">
        Find the best route<br />for your journey
      </h1>
      
      <RouteForm />
      <PopularRoutes onSelectRoute={handleSelectRoute} />
    </div>
  );
};

export default HomePage;