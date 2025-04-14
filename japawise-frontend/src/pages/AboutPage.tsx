import React from 'react';

const AboutPage: React.FC = () => {
  return (
    <div className="px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">About JapaWise</h1>
      
      <div className="prose max-w-none">
        <p className="mb-4">
          JapaWise is a route planning service that helps you find the best routes for your journeys in Nigeria.
          Whether you're commuting to work, visiting friends, or exploring new areas, JapaWise helps you navigate
          efficiently and safely.
        </p>
        
        <p className="mb-4">
          Our service considers real-time traffic conditions, transport options, and user experiences to suggest
          the most optimal routes for your travel needs.
        </p>
        
        <h2 className="text-xl font-semibold mt-6 mb-3">Our Mission</h2>
        <p>
          To simplify transportation in Nigeria by providing accurate, reliable, and user-friendly route guidance
          that saves time and reduces stress for commuters and travelers.
        </p>
      </div>
    </div>
  );
};

export default AboutPage;