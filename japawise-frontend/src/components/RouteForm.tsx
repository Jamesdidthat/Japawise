import React, { useState } from 'react';
import { HashLoader } from 'react-spinners';

interface RouteFormProps {
  from: string;
  to: string;
  setFrom: React.Dispatch<React.SetStateAction<string>>;
  setTo: React.Dispatch<React.SetStateAction<string>>;
  onRouteResult?: (payload: { from: string; to: string; result: string }) => void;
}

const RouteForm: React.FC<RouteFormProps> = ({ from, to, setFrom, setTo, onRouteResult }) => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

  const handleSuggestRoute = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!from || !to) {
      setError("Please enter both locations");
      return;
    }

    setLoading(true);
    setError(null);
    setResult('');

    try {
      const response = await fetch(`${apiBaseUrl}/api/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to }),
      });

      const rawText = await response.text();
      const data = rawText ? JSON.parse(rawText) : {};

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Failed to fetch route.');
      }

      const routeResult = data.result || 'No route found.';
      setResult(routeResult);
      onRouteResult?.({ from, to, result: routeResult });
    } catch (error: any) {
      setError(error?.message || 'Failed to fetch route.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 justify-center items-center w-full max-w-4xl mx-auto">
      {/* RouteForm */}
      <form
        onSubmit={handleSuggestRoute}
        className="w-full max-w-md border border-gray-200 rounded-lg overflow-hidden shadow-sm transition-all duration-500 bg-white"
      >
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

        {/* Button with spinner */}
        <button
          type="submit"
          className="w-full bg-orange-500 text-white py-4 px-6 text-lg font-medium flex justify-center items-center"
          disabled={loading}
        >
          {loading ? <HashLoader size={25} color="#fff" /> : "Suggest route"}
        </button>

        {/* Optional loading text */}
        {loading && (
          <p className="text-sm text-gray-500 mt-2 text-center">
            Finding best danfo for you 🚐...
          </p>
        )}

        {/* Error message */}
        {error && (
          <div className="p-4 border-t border-gray-100 text-sm text-red-600">
            {error}
          </div>
        )}
      </form>

      {/* Route response */}
      {result && (
        <div className="w-full max-w-md bg-white shadow-lg border border-gray-200 rounded-lg p-4 text-lg whitespace-pre-wrap text-gray-900">
          {result}
        </div>
      )}
    </div>
  );
};

export default RouteForm;
