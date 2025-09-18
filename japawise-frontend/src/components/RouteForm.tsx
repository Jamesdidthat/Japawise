import React, { useState } from 'react';
import { HashLoader } from 'react-spinners';

interface RouteFormProps {
  from: string;
  to: string;
  setFrom: React.Dispatch<React.SetStateAction<string>>;
  setTo: React.Dispatch<React.SetStateAction<string>>;
}

const RouteForm: React.FC<RouteFormProps> = ({ from, to, setFrom, setTo }) => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch('https://japawise.onrender.com/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from, to }),
      });

      const data = await response.json();
      setResult(data.result);
    } catch (error: any) {
      setError("Failed to fetch route.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md mx-auto">
      <form
        onSubmit={handleSuggestRoute}
        className="border border-gray-200 rounded-lg overflow-hidden shadow-sm"
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

      {/* Response box (auto expands with content) */}
      {result && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-white shadow-sm text-sm whitespace-pre-wrap">
          {result}
        </div>
      )}

    </div>
  );
};

export default RouteForm;
