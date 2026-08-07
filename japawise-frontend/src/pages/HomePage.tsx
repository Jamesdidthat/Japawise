// HomePage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import RouteForm from '../components/RouteForm';
import PopularRoutes from '../components/PopularRoutes';
import RouteHistory, { type RouteHistoryItem } from '../components/RouteHistory';
import { auth } from '../firebase';
import { onAuthStateChanged, type User } from 'firebase/auth';


const HomePage: React.FC = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [history, setHistory] = useState<RouteHistoryItem[]>([]);

  const historyStorageKey = useMemo(() => {
    return `japawise-route-history:${currentUser?.uid ?? 'guest'}`;
  }, [currentUser?.uid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const storedHistory = window.localStorage.getItem(historyStorageKey);
    if (!storedHistory) {
      setHistory([]);
      return;
    }

    try {
      setHistory(JSON.parse(storedHistory));
    } catch {
      setHistory([]);
    }
  }, [historyStorageKey]);

  useEffect(() => {
    window.localStorage.setItem(historyStorageKey, JSON.stringify(history));
  }, [history, historyStorageKey]);

  const handleRouteResult = ({ from: routeFrom, to: routeTo, result }: { from: string; to: string; result: string }) => {
    const entry: RouteHistoryItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      from: routeFrom,
      to: routeTo,
      result,
      searchedAt: new Date().toISOString(),
    };

    setHistory((previousHistory) => [entry, ...previousHistory].slice(0, 10));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  const highlights = [
    'Fast route suggestions',
    'Local Lagos transport tone',
    'Built for danfo, keke, and okada',
  ];

  const howItWorks = [
    {
      title: '1. Enter locations',
      description: 'Type where you are and where you want to go in Lagos.',
    },
    {
      title: '2. Get a route',
      description: 'JapaWise gives a short, local route explanation you can follow.',
    },
    {
      title: '3. Move with confidence',
      description: 'Use the guidance to ask the conductor, find the junction, and continue.',
    },
  ];

  const handleSelectRoute = (selectedFrom: string, selectedTo: string) => {
    setFrom(selectedFrom);
    setTo(selectedTo);
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url('/japawise_background.png')` }}
    >
      <div className="min-h-screen bg-[#f8f3e7]/85 backdrop-blur-sm px-4 py-8">
        <div className="max-w-screen-xl mx-auto">
          <section className="grid gap-10 lg:grid-cols-2 lg:items-center pt-6 pb-12">
            <div className="space-y-6">
              <span className="inline-flex items-center rounded-full border border-[#8a6b2f]/30 bg-white/80 px-4 py-1 text-sm font-semibold text-[#6f5520] shadow-sm">
                Lagos route assistant
              </span>
              <h1 className="text-4xl md:text-6xl font-extrabold leading-tight text-[#2f2614]">
                Find the best route
                <br />
                for your journey.
              </h1>
              <p className="max-w-xl text-lg md:text-xl text-[#5c4b2a]">
                JapaWise helps you navigate Lagos transport in a local, simple way. Ask where you are and where you want to go, then get a clear danfo-style route.
              </p>

              <div className="flex flex-wrap gap-3">
                {highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-[#3f341d] shadow-sm border border-[#e3d7bd]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm border border-[#eadfca]">
                  <p className="text-2xl font-bold text-[#8a5d10]">Lagos</p>
                  <p className="text-sm text-[#675632]">Built for city routes</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm border border-[#eadfca]">
                  <p className="text-2xl font-bold text-[#8a5d10]">Local</p>
                  <p className="text-sm text-[#675632]">Friendly commuter tone</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm border border-[#eadfca]">
                  <p className="text-2xl font-bold text-[#8a5d10]">Quick</p>
                  <p className="text-sm text-[#675632]">Fast route answers</p>
                </div>
              </div>
            </div>

            <div className="lg:pl-10">
              <div className="rounded-3xl border border-white/60 bg-white/90 p-6 md:p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-[#2f2614] mb-3">Ask for a route</h2>
                <p className="text-sm text-[#6a5a36] mb-6">
                  Try a popular route below or type your own starting point and destination.
                </p>
                <RouteForm
                  from={from}
                  to={to}
                  setFrom={setFrom}
                  setTo={setTo}
                  onRouteResult={handleRouteResult}
                />
              </div>
            </div>
          </section>

          <PopularRoutes onSelectRoute={handleSelectRoute} />

          <RouteHistory history={history} onClear={handleClearHistory} />

          <section className="mt-14 grid gap-6 lg:grid-cols-3">
            {howItWorks.map((step) => (
              <div
                key={step.title}
                className="rounded-3xl bg-white/90 p-6 shadow-sm border border-[#eadfca]"
              >
                <h3 className="text-lg font-bold text-[#2f2614]">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#635337]">{step.description}</p>
              </div>
            ))}
          </section>

          <section className="mt-14 rounded-3xl border border-[#eadfca] bg-[#fffaf0]/90 p-6 md:p-8 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-2 lg:items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#2f2614]">
                  What JapaWise is trying to solve
                </h2>
                <p className="mt-4 text-[#5d4e2d] leading-7 max-w-2xl">
                  Lagos transport is fast, noisy, and full of local shortcuts. This home page gives you a clean way to ask for directions, while the backend handles the route response.
                </p>
              </div>
              <div className="grid gap-3 text-sm text-[#4f4124]">
                <div className="rounded-2xl bg-white px-4 py-3 border border-[#eadfca]">
                  Better for commuters who want local-style directions
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-[#eadfca]">
                  Useful for danfo, keke, and short okada connections
                </div>
                <div className="rounded-2xl bg-white px-4 py-3 border border-[#eadfca]">
                  Clear enough to grow into a real Lagos route tool later
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
