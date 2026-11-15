import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut, type User } from 'firebase/auth';
import { auth } from '../firebase';
import RouteJourney, { type RouteStep } from '../components/RouteJourney';
import RouteForm from '../components/RouteForm';
import japawiseLogo from '../assets/JapaWise logo.svg';

export type RouteConversation = {
  id: string;
  from: string;
  to: string;
  result: string;
  steps?: RouteStep[];
  searchedAt: string;
};

const RouteChatPage: React.FC = () => {
  const location = useLocation();
  const routeId = location.pathname.split('/')[2];
  const navigate = useNavigate();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [history, setHistory] = useState<RouteConversation[]>([]);
  const [historyLoadedFor, setHistoryLoadedFor] = useState<string | null>(null);

  const historyStorageKey = useMemo(
    () => `japawise-route-history:${currentUser?.uid ?? 'guest'}`,
    [currentUser?.uid],
  );

  useEffect(() => onAuthStateChanged(auth, setCurrentUser), []);

  useEffect(() => {
    if (routeId === 'new') {
      setFrom('');
      setTo('');
    }
  }, [routeId]);

  const startNewRoute = () => {
    setFrom('');
    setTo('');
  };

  const handleSignOut = async () => {
    await signOut(auth);
    navigate('/', { replace: true });
  };

  useEffect(() => {
    try {
      setHistory(JSON.parse(window.localStorage.getItem(historyStorageKey) || '[]'));
    } catch {
      setHistory([]);
    }
    setHistoryLoadedFor(historyStorageKey);
  }, [historyStorageKey]);

  const visibleHistory = historyLoadedFor === historyStorageKey ? history : [];
  const navigationState = location.state as { conversation?: RouteConversation; historyStorageKey?: string } | null;
  const navigationConversation = navigationState?.historyStorageKey === historyStorageKey
    ? navigationState.conversation
    : undefined;
  const conversation = visibleHistory.find((item) => item.id === routeId)
    ?? (historyLoadedFor === historyStorageKey && navigationConversation?.id === routeId ? navigationConversation : undefined);
  const isNewRoute = routeId === 'new';

  const handleNewRouteResult = ({ routeFrom, routeTo, result, steps }: {
    routeFrom: string;
    routeTo: string;
    result: string;
    steps: RouteStep[];
  }) => {
    const targetHistoryKey = `japawise-route-history:${auth.currentUser?.uid ?? currentUser?.uid ?? 'guest'}`;
    const entry: RouteConversation = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      from: routeFrom,
      to: routeTo,
      result,
      steps,
      searchedAt: new Date().toISOString(),
    };
    let currentHistory = historyLoadedFor === targetHistoryKey ? history : [];
    if (historyLoadedFor !== targetHistoryKey) {
      try {
        currentHistory = JSON.parse(window.localStorage.getItem(targetHistoryKey) || '[]');
      } catch {
        currentHistory = [];
      }
    }
    const nextHistory = [entry, ...currentHistory].slice(0, 10);
    window.localStorage.setItem(targetHistoryKey, JSON.stringify(nextHistory));
    setHistory(nextHistory);
    setHistoryLoadedFor(targetHistoryKey);
    navigate(`/chat/${entry.id}`, { state: { conversation: entry, historyStorageKey: targetHistoryKey } });
  };

  return (
    <div className="chat-shell">
      <aside className="chat-sidebar">
        <div className="chat-sidebar-top">
          <Link to="/" className="chat-brand" aria-label="JapaWise home">
            <img src={japawiseLogo} alt="JapaWise" className="chat-brand-logo" />
          </Link>
          <Link to="/chat/new" onClick={startNewRoute} className="chat-new-route"><span aria-hidden="true">＋</span> New route</Link>
        </div>

        <div className="chat-history-heading">RECENT</div>
        <nav className="chat-history-list" aria-label="Recent route conversations">
          {visibleHistory.length ? visibleHistory.map((item) => (
            <Link
              key={item.id}
              to={`/chat/${item.id}`}
              className={`chat-history-item ${item.id === routeId ? 'chat-history-item-active' : ''}`}
            >
              <span className="chat-history-icon" aria-hidden="true">↗</span>
              <span className="chat-history-label">{item.from} <span>to</span> {item.to}</span>
            </Link>
          )) : (
            <p className="chat-history-empty">Your route searches will appear here.</p>
          )}
        </nav>
        {currentUser && (
          <div className="chat-account">
            <span className="chat-account-avatar">{(currentUser.displayName || currentUser.email || 'J').slice(0, 1).toUpperCase()}</span>
            <span className="chat-account-name">{currentUser.displayName || currentUser.email}</span>
            <button type="button" onClick={handleSignOut}>Log out</button>
          </div>
        )}
      </aside>

      <main className="chat-main">
        {isNewRoute ? (
          <>
            <header className="chat-topbar">
              <Link to="/chat/new" onClick={startNewRoute} className="chat-mobile-new">＋ New route</Link>
            </header>
            <div className="chat-new-conversation">
              <div className="chat-new-heading">
                <img src={japawiseLogo} alt="JapaWise" className="chat-assistant-logo" />
                <h1>Where are you headed?</h1>
                <p>Enter your starting point and destination to get a Lagos route.</p>
              </div>
              <RouteForm
                from={from}
                to={to}
                setFrom={setFrom}
                setTo={setTo}
                onRouteResult={({ from: routeFrom, to: routeTo, result, steps }) =>
                  handleNewRouteResult({ routeFrom, routeTo, result, steps })}
              />
            </div>
          </>
        ) : conversation ? (
          <>
            <header className="chat-topbar">
              <Link to="/chat/new" onClick={startNewRoute} className="chat-mobile-new">＋ New route</Link>
            </header>

            <div className="chat-conversation">
              <div className="chat-title-block">
                <h1>{conversation.from} <span aria-hidden="true">→</span> {conversation.to}</h1>
              </div>

              <RouteJourney
                key={conversation.id}
                from={conversation.from}
                to={conversation.to}
                result={conversation.result}
                steps={conversation.steps ?? []}
              />
            </div>
          </>
        ) : (
          <div className="chat-missing-route">
            <img src={japawiseLogo} alt="JapaWise" className="chat-assistant-logo" />
            <h1>Route not found</h1>
            <p>This route may have been cleared from your browser history.</p>
            <Link to="/chat/new" className="chat-new-route">Start a new route</Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default RouteChatPage;
