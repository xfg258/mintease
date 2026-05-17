import { useState } from "react";
import { TOUR_STEPS, markOnboardingDone } from "../lib/onboarding";
import "./ui/ui.css";

interface Props {
  onDone: () => void;
}

export function OnboardingTour({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const current = TOUR_STEPS[step];
  const isLast = step >= TOUR_STEPS.length - 1;

  function finish() {
    markOnboardingDone();
    onDone();
  }

  function next() {
    if (isLast) finish();
    else setStep((s) => s + 1);
  }

  return (
    <div className="me-modal-backdrop" role="dialog" aria-modal="true">
      <div className="me-modal onboarding-modal">
        <span className="me-badge">
          新手引导 {step + 1}/{TOUR_STEPS.length}
        </span>
        <h2>{current.title}</h2>
        <p>{current.body}</p>
        <div className="onboarding-dots">
          {TOUR_STEPS.map((_, i) => (
            <span key={i} className={i === step ? "is-on" : ""} />
          ))}
        </div>
        <div className="me-modal-actions">
          <button type="button" className="me-btn me-btn--ghost" onClick={finish}>
            跳过
          </button>
          <button type="button" className="me-btn me-btn--primary" onClick={next}>
            {isLast ? "开始使用" : "下一步"}
          </button>
        </div>
      </div>
    </div>
  );
}
