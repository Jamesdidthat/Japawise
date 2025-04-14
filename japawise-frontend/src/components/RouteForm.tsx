import React, { useState } from 'react';
import { getRouteFromOpenAI } from '../utils/openaiClient'; // Make sure the path is correct

const RouteForm: React.FC = () => {
  const [from, setFrom] = useState('Lekki');
  const [to, setTo] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuggestRoute = async () => {
    if (!from || !to) {
      setError("Please enter both locations");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult('');
    
    try {
      console.log(`Finding route from ${from} to ${to}...`);
      const response = await getRouteFromOpenAI(from, to);
      console.log("Got response:", response);
      setResult(response);
    } catch (error: any) {
      console.error("Error in component:", error);
      setError(error.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto border border-gray-200 rounded-lg overflow-hidden">
      {/* Inputs */}
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm text-gray-500 mb-1">Where u dey?</label>
        <input
          type="text"
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          className="w-full text-lg focus:outline-none"
          placeholder="Enter starting point"
        />
      </div>
      <div className="p-4 border-b border-gray-100">
        <label className="block text-sm text-gray-500 mb-1">Where u dey go?</label>
        <input
          type="text"
          value={to}
          onChange={(e) => setTo(e.target.value)}
          className="w-full text-lg focus:outline-none"
          placeholder="Enter destination"
        />
      </div>
      
      {/* Button */}
      <button
        className="w-full bg-orange-500 text-white py-4 px-6 text-lg font-medium"
        onClick={handleSuggestRoute}
        disabled={loading}
      >
        {loading ? "Finding..." : "Suggest route"}
      </button>
      
      {/* Error message */}
      {error && (
        <div className="p-4 border-t border-gray-100 text-sm text-red-600">
          {error}
        </div>
      )}
      
      {/* Result */}
      {result && (
        <div className="p-4 border-t border-gray-100 text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}
    </div>
  );
};

export default RouteForm;