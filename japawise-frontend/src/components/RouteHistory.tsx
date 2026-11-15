import React from 'react';
import type { RouteStep } from './RouteJourney';

export type RouteHistoryItem = {
  id: string;
  from: string;
  to: string;
  result: string;
  steps?: RouteStep[];
  searchedAt: string;
};

interface RouteHistoryProps {
  history: RouteHistoryItem[];
  onClear: () => void;
}

const RouteHistory: React.FC<RouteHistoryProps> = ({ history, onClear }) => {
  if (history.length === 0) {
    return (
      <section className="mt-14 rounded-3xl border border-dashed border-[#dbc9a7] bg-white/75 p-6 md:p-8 shadow-sm">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-[#2f2614]">Search history</h2>
            <p className="mt-2 text-sm text-[#6a5a36]">
              Your past route searches will appear here after you ask for directions.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-14 rounded-3xl border border-[#eadfca] bg-white/90 p-6 md:p-8 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#2f2614]">Search history</h2>
          <p className="mt-2 text-sm text-[#6a5a36]">
            Recent searches and the route responses you saw most recently.
          </p>
        </div>

        <button
          onClick={onClear}
          className="w-fit rounded-full border border-[#d7c4a1] px-4 py-2 text-sm font-semibold text-[#7a5f27] transition hover:bg-[#faf2df]"
        >
          Clear history
        </button>
      </div>

      <div className="mt-6 grid gap-4">
        {history.map((item) => (
          <article
            key={item.id}
            className="rounded-2xl border border-[#eadfca] bg-[#fffaf0] p-4 shadow-sm"
          >
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9b7a34]">
                  {item.from} to {item.to}
                </p>
                <p className="mt-1 text-xs text-[#7d6a45]">
                  {new Date(item.searchedAt).toLocaleString()}
                </p>
              </div>
            </div>
            <pre className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#44381f]">
              {item.result}
            </pre>
          </article>
        ))}
      </div>
    </section>
  );
};

export default RouteHistory;
