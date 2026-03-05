import { eventConfig } from "../config/eventConfig";
import type { Edition } from "../types";

const editions = Object.entries(eventConfig.editions) as [
  Edition,
  (typeof eventConfig.editions)[Edition],
][];

interface EditionToggleProps {
  value: Edition;
  onChange: (edition: Edition) => void;
}

export default function EditionToggle({ value, onChange }: EditionToggleProps) {
  return (
    <div className="flex rounded-full bg-[#e8e8e8] p-1 gap-1">
      {editions.map(([key, config]) => {
        const isActive = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`rounded-full px-7 py-2.5 text-[15px] font-medium transition-all duration-200 ${
              isActive
                ? "bg-primary text-white"
                : "bg-transparent text-[#555] hover:bg-black/5"
            }`}
          >
            {config.label}
          </button>
        );
      })}
    </div>
  );
}
