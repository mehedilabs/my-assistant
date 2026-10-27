type VoiceOrbProps = {
  listening: boolean;
  onClick: () => void;
  disabled?: boolean;
};

export default function VoiceOrb({
  listening,
  onClick,
  disabled = false,
}: VoiceOrbProps) {
  return (
    <button
      type="button"
      className={`voice-orb ${listening ? "voice-orb-listening" : ""}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={listening ? "ভয়েস ইনপুট বন্ধ করুন" : "কথা বলা শুরু করুন"}
    >
      <span className="orb-ring orb-ring-one" />
      <span className="orb-ring orb-ring-two" />

      <span className="orb-core">
        <svg
          width="31"
          height="31"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="9" y="3" width="6" height="12" rx="3" />
          <path d="M5 11a7 7 0 0 0 14 0" />
          <path d="M12 18v3" />
          <path d="M8 21h8" />
        </svg>
      </span>
    </button>
  );
}
