"use client";

import { useEffect, useState } from "react";

type ChannelId = "email" | "web-push" | "sms";

type ChannelPref = {
  id: ChannelId;
  label: string;
  description: string;
  /** Honest status — none of these channels are connected yet. */
  status: "coming-soon";
};

const CHANNELS: ChannelPref[] = [
  {
    id: "email",
    label: "Email",
    description: "Send alert emails when Total Known Cost hits your target.",
    status: "coming-soon",
  },
  {
    id: "web-push",
    label: "Web push",
    description: "Browser notifications while Importnest is open or in the background.",
    status: "coming-soon",
  },
  {
    id: "sms",
    label: "SMS",
    description: "Text messages for urgent price drops on saved products.",
    status: "coming-soon",
  },
];

const STORAGE_KEY = "importnest.alert-channel-intent";

type IntentMap = Partial<Record<ChannelId, boolean>>;

/**
 * Honest notification-channel preferences. Channels are not wired yet —
 * toggles capture intent in localStorage and stay labeled "Coming soon"
 * so shoppers aren't promised delivery that doesn't exist.
 */
export function NotificationPreferencesPanel({ className = "" }: { className?: string }) {
  const [intent, setIntent] = useState<IntentMap>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setIntent(JSON.parse(raw) as IntentMap);
    } catch {
      // Ignore corrupt storage — preferences are optional intent only.
    }
    setHydrated(true);
  }, []);

  function toggle(id: ChannelId) {
    setIntent((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Private mode / quota — still update UI for this session.
      }
      return next;
    });
  }

  return (
    <section
      className={`rounded-2xl border border-border bg-panel px-4 py-4 shadow-[var(--shadow-panel)] sm:px-5 ${className}`}
      aria-labelledby="notif-prefs-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 id="notif-prefs-heading" className="text-sm font-bold tracking-tight text-navy-900">
            Notification preferences
          </h2>
          <p className="mt-0.5 text-xs text-muted sm:text-sm">
            Choose how you&apos;d like to hear about price drops. Delivery channels are not
            connected yet — your choices are saved as intent for when they ship.
          </p>
        </div>
        <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-900 ring-1 ring-amber-200">
          Coming soon
        </span>
      </div>

      <ul className="mt-4 space-y-3">
        {CHANNELS.map((channel) => {
          const on = Boolean(intent[channel.id]);
          return (
            <li
              key={channel.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-border bg-surface/60 px-3 py-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-semibold text-navy-900">{channel.label}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted">{channel.description}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${channel.label} notifications (coming soon)`}
                disabled={!hydrated}
                onClick={() => toggle(channel.id)}
                className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 ${
                  on ? "bg-cta" : "bg-navy-100"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
                    on ? "left-5" : "left-0.5"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
