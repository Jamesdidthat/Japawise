import React from 'react';

interface PopularRoutesProps {
  onSelectRoute: (from: string, to: string) => void;
}

const PopularRoutes: React.FC<PopularRoutesProps> = ({ onSelectRoute }) => {
  const popularRoutes = [
    { from: 'Ajah', to: 'Yaba' },
    { from: 'CMS', to: 'Ikeja' },
    { from: 'Ikeja', to: 'Ikorodu' }
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h3 className="text-xl font-semibold mb-4">Popular routes</h3>
      <div className="flex flex-wrap gap-4">
        {popularRoutes.map((route, index) => (
          <button 
            key={index} 
            className="text-blue-600 hover:underline focus:outline-none"
            onClick={() => onSelectRoute(route.from, route.to)}
          >
            {route.from} to {route.to}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PopularRoutes;