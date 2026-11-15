import React, { useEffect, useState } from 'react';

export type RouteStep = {
  instruction: string;
  place?: string;
};

type RouteJourneyProps = {
  from: string;
  to: string;
  result: string;
  steps: RouteStep[];
};

function isBoardingDanfo(instruction: string) {
  return /\b(board|catch|take|get on|hop on)\b.*\b(danfo|bus|brt)\b/i.test(instruction);
}

const DanfoIcon: React.FC = () => (
  <svg className="danfo-icon" viewBox="0 0 48 34" role="img" aria-label="Danfo bus">
    <rect x="4" y="4" width="40" height="23" rx="5" fill="#f4bd42" stroke="#76571d" strokeWidth="2" />
    <rect x="8" y="8" width="10" height="7" rx="1.5" fill="#e7f1f0" />
    <rect x="20" y="8" width="10" height="7" rx="1.5" fill="#e7f1f0" />
    <rect x="32" y="8" width="8" height="7" rx="1.5" fill="#e7f1f0" />
    <rect x="8" y="18" width="22" height="5" rx="1" fill="#de7732" />
    <rect x="33" y="18" width="7" height="9" rx="1" fill="#8a6422" />
    <circle cx="14" cy="28" r="3.2" fill="#332b1d" />
    <circle cx="36" cy="28" r="3.2" fill="#332b1d" />
  </svg>
);

function getSteps(result: string, steps: RouteStep[]): RouteStep[] {
  if (steps.length) return steps;
  const cleanValue = (value: string) => {
    try {
      return JSON.parse(`"${value}"`) as string;
    } catch {
      return value.replace(/\\n/g, ' ').replace(/\\r/g, ' ').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
  };

  try {
    const parsed = JSON.parse(result) as { steps?: Array<{ instruction?: unknown; place?: unknown }> };
    if (Array.isArray(parsed.steps)) {
      const parsedSteps = parsed.steps
        .filter((step) => typeof step.instruction === 'string')
        .map((step) => ({
          instruction: step.instruction as string,
          place: typeof step.place === 'string' ? step.place : '',
        }));
      if (parsedSteps.length) return parsedSteps;
    }
  } catch {
    const instructions: string[] = [];
    const places: string[] = [];
    const extract = (field: 'instruction' | 'place', into: string[]) => {
      const matcher = new RegExp(`"${field}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"?`, 'g');
      let match: RegExpExecArray | null;
      while ((match = matcher.exec(result)) !== null) into.push(cleanValue(match[1]));
    };
    extract('instruction', instructions);
    extract('place', places);
    if (instructions.length) {
      return instructions.map((instruction, index) => ({ instruction, place: places[index] ?? '' }));
    }
  }

  if (/^\s*[\[{]/.test(result)) return [];
  return result
    .split('\n')
    .map((line) => line.replace(/^\s*[•*-]\s*/, '').trim())
    .filter(Boolean)
    .map((instruction) => ({ instruction, place: '' }));
}

const RouteJourney: React.FC<RouteJourneyProps> = ({ from, to, result, steps }) => {
  const journeySteps = getSteps(result, steps);
  const [selectedStep, setSelectedStep] = useState(0);

  useEffect(() => setSelectedStep(0), [from, to, result]);

  return (
    <section className="journey-card" aria-label="Interactive route steps">
      {journeySteps.length ? (
        <ol className="journey-steps">
          {journeySteps.map((step, index) => (
            <li key={`${index}-${step.instruction}`} className={selectedStep === index ? 'journey-step-active' : ''}>
              <button
                type="button"
                className="journey-step-button"
                onClick={() => setSelectedStep(index)}
                aria-pressed={selectedStep === index}
                aria-label={step.instruction}
              >
                <span className="journey-visual-marker">
                  {isBoardingDanfo(step.instruction) ? <DanfoIcon /> : <i aria-hidden="true" />}
                </span>
                <span className="journey-step-content">
                  {isBoardingDanfo(step.instruction) && (
                    <span className="journey-board-label">GET ON{step.place ? ` AT ${step.place}` : ' THE DANFO'}</span>
                  )}
                  <span className="journey-step-instruction">{step.instruction}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      ) : (
        <p className="journey-empty">No route details are available.</p>
      )}
    </section>
  );
};

export default RouteJourney;
