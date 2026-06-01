import { useEffect, useState } from 'react';

export type AccessCountdownInfo = {
  expired: boolean;
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function getAccessCountdownInfo(
  expiresAt: string | Date | null | undefined,
  nowMs: number = Date.now(),
): AccessCountdownInfo | null {
  if (!expiresAt) return null;

  const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
  const expiryMs = expiry.getTime();
  if (Number.isNaN(expiryMs)) return null;

  const rawMs = expiryMs - nowMs;
  const expired = rawMs <= 0;
  const totalMs = Math.max(0, rawMs);
  const totalSeconds = Math.floor(totalMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { expired, totalMs, days, hours, minutes, seconds };
}

export function hasAccessTimeRemaining(
  expiresAt: string | Date | null | undefined,
  nowMs: number = Date.now(),
): boolean {
  const info = getAccessCountdownInfo(expiresAt, nowMs);
  return Boolean(info && !info.expired);
}

export function formatPreciseAccessCountdown(
  expiresAt: string | Date | null | undefined,
  locale: string,
  nowMs: number = Date.now(),
): string | null {
  const info = getAccessCountdownInfo(expiresAt, nowMs);
  if (!info) return null;
  if (info.expired) return locale === 'cs' ? 'Přístup vypršel' : 'Access expired';

  if (locale === 'cs') {
    return `Zbývá ${info.days} d ${pad(info.hours)} h ${pad(info.minutes)} m ${pad(info.seconds)} s`;
  }

  return `${info.days}d ${pad(info.hours)}h ${pad(info.minutes)}m ${pad(info.seconds)}s left`;
}

export function useAccessCountdownNow(enabled: boolean = true): number {
  const [nowMs, setNowMs] = useState(() => Date.now());

  useEffect(() => {
    if (!enabled) return;

    setNowMs(Date.now());
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [enabled]);

  return nowMs;
}