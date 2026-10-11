import { Coins, X } from "lucide-react";
import { useDispatch } from "react-redux";
import { setBillingOpen } from "../redux/billingSlice";

type NoCreditsProps = {
  cost: number;
  remainingCredits: number;
  onDismiss: () => void;
};

// Shown above the composer when the agent rejects a message with 402
const NoCredits = ({ cost, remainingCredits, onDismiss }: NoCreditsProps) => {
  const dispatch = useDispatch();

  return (
    <div
      role="alert"
      className="flex items-center gap-3 rounded-[20px] bg-sf p-3.5 shadow-soft"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sf2">
        <Coins size={18} className="text-ac" />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="text-sm font-extrabold text-ink">
          {remainingCredits === 0
            ? "You're out of credits"
            : "Not enough credits"}
        </div>
        <div className="text-xs text-mu">
          This needs {cost} {cost === 1 ? "credit" : "credits"}, you have{" "}
          {remainingCredits} left. Upgrade or wait for your credits to reset.
        </div>
      </div>
      <button
        type="button"
        onClick={() => dispatch(setBillingOpen(true))}
        className="ml-auto flex h-9 shrink-0 cursor-pointer items-center rounded-xl bg-ink px-3.5 text-[13px] font-extrabold text-bg transition-opacity hover:opacity-85"
      >
        Get more
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full text-mu transition-colors hover:text-ink"
      >
        <X size={16} strokeWidth={3} />
      </button>
    </div>
  );
};

export default NoCredits;
