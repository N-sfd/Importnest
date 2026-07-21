/**
 * Regenerates distinct product thumbnails under public/images/products/{category}/.
 * Each subtype gets a unique filled product illustration on a light studio background —
 * not crops of a shared category collage, and not stroke-only line icons.
 *
 * Usage: node scripts/generate-distinct-product-thumbs.mjs
 */
import sharp from "sharp";
import fs from "fs";
import path from "path";

const SIZE = 480;
const BG = "#F7FAFC";

function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/** Soft studio backdrop + ground shadow shared by every thumb. */
function frame(inner, accent = "#94a3b8") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="${BG}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="38%" r="55%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="14" flood-color="#0b2748" flood-opacity="0.12"/>
    </filter>
    <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="45%" stop-color="#cbd5e1"/>
      <stop offset="100%" stop-color="#64748b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${accent}"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <ellipse cx="240" cy="400" rx="150" ry="22" fill="#0b2748" opacity="0.08"/>
  <g filter="url(#soft)">${inner}</g>
</svg>`;
}

/** Catalog of unique product drawings — one path per output file. */
const CATALOG = {
  accessories: {
    wallet: {
      accent: "#1e3a5f",
      draw: () => `
        <rect x="130" y="160" width="220" height="150" rx="16" fill="#1e3a5f"/>
        <rect x="130" y="160" width="220" height="36" rx="16" fill="#0f2744"/>
        <rect x="150" y="210" width="120" height="14" rx="4" fill="#94a3b8" opacity="0.5"/>
        <circle cx="300" cy="250" r="10" fill="#c4a35a"/>
        <rect x="155" y="255" width="90" height="8" rx="3" fill="#334155"/>`,
    },
    backpack: {
      accent: "#0ea5e9",
      draw: () => `
        <path d="M170 150 h140 a28 28 0 0 1 28 28 v170 a24 24 0 0 1 -24 24 h-148 a24 24 0 0 1 -24 -24 v-170 a28 28 0 0 1 28 -28z" fill="#0f766e"/>
        <rect x="195" y="120" width="90" height="40" rx="18" fill="none" stroke="#134e4a" stroke-width="14"/>
        <rect x="195" y="200" width="90" height="70" rx="10" fill="#115e59"/>
        <rect x="210" y="215" width="60" height="8" rx="3" fill="#5eead4" opacity="0.5"/>
        <rect x="155" y="300" width="24" height="70" rx="8" fill="#134e4a"/>
        <rect x="301" y="300" width="24" height="70" rx="8" fill="#134e4a"/>`,
    },
    "phone-case": {
      accent: "#334155",
      draw: () => `
        <rect x="175" y="90" width="130" height="280" rx="28" fill="#111827"/>
        <rect x="186" y="108" width="108" height="230" rx="16" fill="#1f2937"/>
        <rect x="198" y="120" width="42" height="42" rx="10" fill="#0f172a"/>
        <circle cx="210" cy="132" r="6" fill="#38bdf8"/>
        <circle cx="226" cy="132" r="6" fill="#38bdf8"/>
        <circle cx="218" cy="148" r="5" fill="#38bdf8"/>
        <rect x="210" y="300" width="60" height="6" rx="3" fill="#475569"/>`,
    },
    sunglasses: {
      accent: "#0f172a",
      draw: () => `
        <rect x="95" y="200" width="110" height="70" rx="22" fill="#0f172a"/>
        <rect x="275" y="200" width="110" height="70" rx="22" fill="#0f172a"/>
        <path d="M205 230 h70" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <path d="M95 220 c-30 -10 -50 10 -55 40" fill="none" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <path d="M385 220 c30 -10 50 10 55 40" fill="none" stroke="#334155" stroke-width="10" stroke-linecap="round"/>
        <ellipse cx="150" cy="235" rx="38" ry="24" fill="#38bdf8" opacity="0.35"/>
        <ellipse cx="330" cy="235" rx="38" ry="24" fill="#38bdf8" opacity="0.35"/>`,
    },
    "watch-band": {
      accent: "#ef4444",
      draw: () => `
        <rect x="200" y="80" width="80" height="320" rx="18" fill="#1e293b"/>
        <rect x="210" y="170" width="60" height="70" rx="12" fill="#0ea5e9"/>
        <rect x="218" y="182" width="44" height="28" rx="6" fill="#e0f2fe"/>
        <rect x="220" y="100" width="40" height="12" rx="4" fill="#64748b"/>
        <rect x="220" y="360" width="40" height="12" rx="4" fill="#64748b"/>
        <circle cx="240" cy="140" r="5" fill="#94a3b8"/>
        <circle cx="240" cy="330" r="5" fill="#94a3b8"/>`,
    },
    "cable-set": {
      accent: "#22c55e",
      draw: () => `
        <path d="M140 160 c40 80 80 80 120 0 c40 -80 80 -80 120 0" fill="none" stroke="#111827" stroke-width="18" stroke-linecap="round"/>
        <path d="M140 200 c40 70 80 70 120 0 c40 -70 80 -70 120 0" fill="none" stroke="#334155" stroke-width="12" stroke-linecap="round"/>
        <rect x="100" y="145" width="36" height="24" rx="6" fill="#22c55e"/>
        <rect x="344" y="145" width="36" height="24" rx="6" fill="#0ea5e9"/>
        <rect x="210" y="280" width="60" height="28" rx="8" fill="#1e293b"/>`,
    },
    "travel-organizer": {
      accent: "#78716c",
      draw: () => `
        <rect x="120" y="150" width="240" height="180" rx="20" fill="#57534e"/>
        <rect x="120" y="150" width="240" height="40" rx="20" fill="#44403c"/>
        <rect x="145" y="210" width="190" height="70" rx="10" fill="#292524"/>
        <rect x="160" y="225" width="100" height="10" rx="3" fill="#a8a29e" opacity="0.5"/>
        <circle cx="300" cy="245" r="8" fill="#d6d3d1"/>
        <path d="M180 150 v-20 h120 v20" fill="none" stroke="#292524" stroke-width="10" stroke-linecap="round"/>`,
    },
    "crossbody-bag": {
      accent: "#b45309",
      draw: () => `
        <path d="M160 200 h160 a20 20 0 0 1 20 20 v120 a24 24 0 0 1 -24 24 h-152 a24 24 0 0 1 -24 -24 v-120 a20 20 0 0 1 20 -20z" fill="#92400e"/>
        <rect x="200" y="230" width="80" height="60" rx="10" fill="#78350f"/>
        <circle cx="240" cy="260" r="8" fill="#fbbf24"/>
        <path d="M180 200 C160 120 320 120 300 200" fill="none" stroke="#78350f" stroke-width="14" stroke-linecap="round"/>`,
    },
    "laptop-sleeve": {
      accent: "#64748b",
      draw: () => `
        <rect x="90" y="150" width="300" height="200" rx="22" fill="#334155"/>
        <rect x="110" y="170" width="260" height="150" rx="10" fill="#0f172a"/>
        <rect x="130" y="190" width="180" height="12" rx="4" fill="#94a3b8" opacity="0.4"/>
        <rect x="130" y="215" width="120" height="10" rx="4" fill="#64748b" opacity="0.35"/>
        <rect x="90" y="150" width="40" height="200" rx="18" fill="#1e293b"/>`,
    },
    "wireless-charging-pad": {
      accent: "#06b6d4",
      draw: () => `
        <circle cx="240" cy="240" r="120" fill="#0f172a"/>
        <circle cx="240" cy="240" r="88" fill="#164e63"/>
        <circle cx="240" cy="240" r="50" fill="#22d3ee" opacity="0.35"/>
        <circle cx="240" cy="240" r="18" fill="#ecfeff"/>
        <rect x="226" y="360" width="28" height="40" rx="6" fill="#334155"/>`,
    },
    "wireless-charger": {
      accent: "#06b6d4",
      draw: () => `
        <circle cx="240" cy="240" r="120" fill="#0f172a"/>
        <circle cx="240" cy="240" r="88" fill="#164e63"/>
        <circle cx="240" cy="240" r="50" fill="#22d3ee" opacity="0.35"/>
        <circle cx="240" cy="240" r="18" fill="#ecfeff"/>
        <rect x="226" y="360" width="28" height="40" rx="6" fill="#334155"/>`,
    },
  },
  kitchen: {
    cookware: {
      accent: "#94a3b8",
      draw: () => `
        <ellipse cx="240" cy="280" rx="130" ry="28" fill="#64748b"/>
        <path d="M120 200 h240 l-20 80 h-200z" fill="url(#metal)"/>
        <rect x="340" y="210" width="90" height="18" rx="8" fill="#475569"/>
        <ellipse cx="240" cy="200" rx="120" ry="22" fill="#cbd5e1"/>`,
    },
    dinnerware: {
      accent: "#e2e8f0",
      draw: () => `
        <ellipse cx="240" cy="250" rx="140" ry="140" fill="#f8fafc" stroke="#cbd5e1" stroke-width="8"/>
        <ellipse cx="240" cy="250" rx="90" ry="90" fill="#ffffff" stroke="#e2e8f0" stroke-width="4"/>
        <ellipse cx="240" cy="250" rx="40" ry="40" fill="#f1f5f9"/>`,
    },
    utensils: {
      accent: "#64748b",
      draw: () => `
        <rect x="150" y="100" width="18" height="220" rx="6" fill="#94a3b8"/>
        <ellipse cx="159" cy="100" rx="28" ry="36" fill="#cbd5e1"/>
        <rect x="230" y="100" width="18" height="220" rx="6" fill="#64748b"/>
        <path d="M210 100 h58 l-10 50 h-38z" fill="#94a3b8"/>
        <rect x="310" y="100" width="16" height="220" rx="6" fill="#475569"/>
        <rect x="300" y="90" width="36" height="50" rx="8" fill="#64748b"/>`,
    },
    blender: {
      accent: "#ef4444",
      draw: () => `
        <path d="M180 120 h120 l20 160 h-160z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="4"/>
        <rect x="165" y="280" width="150" height="90" rx="16" fill="#dc2626"/>
        <circle cx="240" cy="325" r="16" fill="#fef2f2"/>
        <rect x="210" y="100" width="60" height="24" rx="6" fill="#64748b"/>`,
    },
    "coffee-machine": {
      accent: "#78350f",
      draw: () => `
        <rect x="150" y="120" width="180" height="240" rx="20" fill="#1c1917"/>
        <rect x="170" y="145" width="140" height="70" rx="10" fill="#292524"/>
        <rect x="200" y="240" width="80" height="70" rx="8" fill="#44403c"/>
        <ellipse cx="240" cy="255" rx="28" ry="10" fill="#fbbf24" opacity="0.7"/>
        <rect x="220" y="330" width="40" height="20" rx="6" fill="#a8a29e"/>`,
    },
    kettle: {
      accent: "#0ea5e9",
      draw: () => `
        <path d="M170 180 h140 a40 40 0 0 1 40 40 v80 a50 50 0 0 1 -50 50 h-120 a50 50 0 0 1 -50 -50 v-80 a40 40 0 0 1 40 -40z" fill="#e2e8f0"/>
        <rect x="210" y="140" width="60" height="50" rx="10" fill="#94a3b8"/>
        <path d="M310 220 c40 10 50 50 20 80" fill="none" stroke="#64748b" stroke-width="16" stroke-linecap="round"/>
        <rect x="200" y="300" width="80" height="12" rx="4" fill="#0ea5e9"/>`,
    },
    "cutting-board": {
      accent: "#b45309",
      draw: () => `
        <rect x="100" y="140" width="280" height="200" rx="24" fill="#d97706"/>
        <rect x="120" y="160" width="240" height="160" rx="14" fill="#f59e0b" opacity="0.35"/>
        <ellipse cx="150" cy="240" rx="14" ry="18" fill="#92400e" opacity="0.4"/>
        <rect x="340" y="200" width="30" height="80" rx="10" fill="#78350f"/>`,
    },
    "food-storage": {
      accent: "#22c55e",
      draw: () => `
        <rect x="150" y="160" width="180" height="140" rx="16" fill="#ecfdf5" stroke="#86efac" stroke-width="6"/>
        <rect x="150" y="140" width="180" height="36" rx="12" fill="#16a34a"/>
        <rect x="175" y="200" width="130" height="10" rx="3" fill="#86efac" opacity="0.6"/>
        <rect x="175" y="225" width="90" height="8" rx="3" fill="#bbf7d0" opacity="0.7"/>`,
    },
    bakeware: {
      accent: "#64748b",
      draw: () => `
        <rect x="110" y="180" width="260" height="140" rx="12" fill="#94a3b8"/>
        <rect x="125" y="195" width="230" height="100" rx="8" fill="#e2e8f0"/>
        <circle cx="170" cy="245" r="22" fill="#cbd5e1"/>
        <circle cx="240" cy="245" r="22" fill="#cbd5e1"/>
        <circle cx="310" cy="245" r="22" fill="#cbd5e1"/>`,
    },
    "knife-block": {
      accent: "#78350f",
      draw: () => `
        <path d="M160 340 h160 l-20 -180 h-120z" fill="#92400e"/>
        <rect x="195" y="120" width="14" height="140" rx="4" fill="url(#metal)"/>
        <rect x="225" y="100" width="14" height="160" rx="4" fill="url(#metal)"/>
        <rect x="255" y="130" width="14" height="130" rx="4" fill="url(#metal)"/>
        <rect x="185" y="110" width="34" height="18" rx="4" fill="#1e293b"/>
        <rect x="215" y="90" width="34" height="18" rx="4" fill="#1e293b"/>`,
    },
    "knife-set": {
      accent: "#78350f",
      draw: () => `
        <path d="M160 340 h160 l-20 -180 h-120z" fill="#92400e"/>
        <rect x="195" y="120" width="14" height="140" rx="4" fill="url(#metal)"/>
        <rect x="225" y="100" width="14" height="160" rx="4" fill="url(#metal)"/>
        <rect x="255" y="130" width="14" height="130" rx="4" fill="url(#metal)"/>
        <rect x="185" y="110" width="34" height="18" rx="4" fill="#1e293b"/>
        <rect x="215" y="90" width="34" height="18" rx="4" fill="#1e293b"/>`,
    },
    "kitchen-organizer": {
      accent: "#0f766e",
      draw: () => `
        <rect x="120" y="160" width="240" height="160" rx="12" fill="#f8fafc" stroke="#94a3b8" stroke-width="4"/>
        <rect x="140" y="180" width="60" height="120" rx="6" fill="#ccfbf1"/>
        <rect x="210" y="180" width="60" height="120" rx="6" fill="#99f6e4"/>
        <rect x="280" y="180" width="60" height="120" rx="6" fill="#5eead4"/>`,
    },
    "pour-over": {
      accent: "#78350f",
      draw: () => `
        <path d="M180 140 h120 l30 80 h-180z" fill="#e7e5e4"/>
        <ellipse cx="240" cy="140" rx="60" ry="14" fill="#a8a29e"/>
        <rect x="200" y="220" width="80" height="100" rx="10" fill="#fafaf9" stroke="#d6d3d1" stroke-width="4"/>
        <ellipse cx="240" cy="220" rx="40" ry="10" fill="#e7e5e4"/>`,
    },
    "stand-mixer": {
      accent: "#e11d48",
      draw: () => `
        <rect x="150" y="260" width="180" height="90" rx="18" fill="#be123c"/>
        <path d="M200 140 h80 v140 h-40z" fill="#e11d48"/>
        <circle cx="240" cy="240" r="36" fill="#fecdd3"/>
        <rect x="220" y="100" width="40" height="50" rx="10" fill="#9f1239"/>`,
    },
    "cast-iron": {
      accent: "#1e293b",
      draw: () => `
        <ellipse cx="240" cy="260" rx="140" ry="40" fill="#0f172a"/>
        <path d="M110 220 h260 a20 20 0 0 1 0 40 h-260 a20 20 0 0 1 0 -40z" fill="#1e293b"/>
        <rect x="70" y="225" width="70" height="20" rx="8" fill="#334155"/>
        <rect x="340" y="225" width="70" height="20" rx="8" fill="#334155"/>`,
    },
  },
  appliances: {
    dishwasher: {
      accent: "#64748b",
      draw: () => `
        <rect x="130" y="90" width="220" height="300" rx="16" fill="#e2e8f0" stroke="#94a3b8" stroke-width="4"/>
        <rect x="150" y="120" width="180" height="120" rx="8" fill="#cbd5e1"/>
        <rect x="150" y="260" width="180" height="100" rx="8" fill="#f8fafc"/>
        <circle cx="240" cy="310" r="14" fill="#64748b"/>`,
    },
    refrigerator: {
      accent: "#94a3b8",
      draw: () => `
        <rect x="145" y="80" width="190" height="320" rx="16" fill="#f1f5f9" stroke="#94a3b8" stroke-width="4"/>
        <line x1="145" y1="220" x2="335" y2="220" stroke="#cbd5e1" stroke-width="6"/>
        <rect x="310" y="120" width="10" height="60" rx="4" fill="#64748b"/>
        <rect x="310" y="250" width="10" height="80" rx="4" fill="#64748b"/>`,
    },
    vacuum: {
      accent: "#ef4444",
      draw: () => `
        <rect x="210" y="80" width="28" height="200" rx="10" fill="#334155"/>
        <rect x="180" y="260" width="120" height="100" rx="28" fill="#dc2626"/>
        <circle cx="210" cy="360" r="22" fill="#1e293b"/>
        <circle cx="270" cy="360" r="22" fill="#1e293b"/>
        <rect x="230" y="100" width="50" height="24" rx="8" fill="#f87171"/>`,
    },
    "upright-vacuum": {
      accent: "#2563eb",
      draw: () => `
        <rect x="220" y="70" width="24" height="220" rx="10" fill="#1e3a8a"/>
        <rect x="175" y="270" width="130" height="110" rx="24" fill="#2563eb"/>
        <circle cx="205" cy="380" r="20" fill="#0f172a"/>
        <circle cx="275" cy="380" r="20" fill="#0f172a"/>`,
    },
    microwave: {
      accent: "#334155",
      draw: () => `
        <rect x="100" y="150" width="280" height="180" rx="14" fill="#1e293b"/>
        <rect x="120" y="170" width="180" height="140" rx="8" fill="#0f172a"/>
        <rect x="320" y="180" width="40" height="120" rx="8" fill="#334155"/>
        <circle cx="340" cy="230" r="12" fill="#94a3b8"/>
        <circle cx="340" cy="270" r="8" fill="#64748b"/>`,
    },
    "toaster-oven": {
      accent: "#78716c",
      draw: () => `
        <rect x="110" y="160" width="260" height="170" rx="14" fill="#44403c"/>
        <rect x="130" y="180" width="170" height="120" rx="8" fill="#1c1917"/>
        <rect x="320" y="190" width="30" height="100" rx="6" fill="#78716c"/>
        <rect x="140" y="320" width="40" height="16" rx="4" fill="#292524"/>
        <rect x="300" y="320" width="40" height="16" rx="4" fill="#292524"/>`,
    },
    "air-fryer": {
      accent: "#0f172a",
      draw: () => `
        <rect x="150" y="140" width="180" height="220" rx="28" fill="#1e293b"/>
        <rect x="170" y="250" width="140" height="90" rx="14" fill="#334155"/>
        <circle cx="240" cy="190" r="28" fill="#0ea5e9" opacity="0.5"/>
        <rect x="210" y="180" width="60" height="20" rx="6" fill="#38bdf8"/>`,
    },
    "coffee-maker": {
      accent: "#92400e",
      draw: () => `
        <rect x="160" y="100" width="160" height="260" rx="18" fill="#1c1917"/>
        <rect x="185" y="130" width="110" height="50" rx="8" fill="#44403c"/>
        <path d="M190 220 h100 v90 h-100z" fill="#78716c"/>
        <ellipse cx="240" cy="220" rx="50" ry="12" fill="#a8a29e"/>
        <rect x="220" y="320" width="40" height="24" rx="6" fill="#f59e0b"/>`,
    },
    freezer: {
      accent: "#38bdf8",
      draw: () => `
        <rect x="130" y="100" width="220" height="280" rx="16" fill="#e0f2fe" stroke="#7dd3fc" stroke-width="4"/>
        <line x1="130" y1="240" x2="350" y2="240" stroke="#bae6fd" stroke-width="6"/>
        <rect x="300" y="140" width="12" height="50" rx="4" fill="#0284c7"/>
        <rect x="300" y="270" width="12" height="50" rx="4" fill="#0284c7"/>`,
    },
    "window-ac": {
      accent: "#fff",
      draw: () => `
        <rect x="100" y="160" width="280" height="160" rx="14" fill="#f8fafc" stroke="#cbd5e1" stroke-width="4"/>
        <rect x="120" y="180" width="180" height="120" rx="8" fill="#e2e8f0"/>
        <rect x="320" y="190" width="40" height="100" rx="8" fill="#94a3b8"/>
        <line x1="140" y1="210" x2="280" y2="210" stroke="#94a3b8" stroke-width="4"/>
        <line x1="140" y1="240" x2="280" y2="240" stroke="#94a3b8" stroke-width="4"/>`,
    },
    "air-conditioner": {
      accent: "#e0f2fe",
      draw: () => `
        <rect x="100" y="150" width="280" height="180" rx="16" fill="#f0f9ff" stroke="#7dd3fc" stroke-width="4"/>
        <rect x="120" y="175" width="200" height="130" rx="10" fill="#e0f2fe"/>
        <rect x="340" y="190" width="24" height="100" rx="6" fill="#38bdf8"/>`,
    },
    dehumidifier: {
      accent: "#14b8a6",
      draw: () => `
        <rect x="160" y="110" width="160" height="260" rx="24" fill="#f0fdfa" stroke="#5eead4" stroke-width="4"/>
        <rect x="180" y="140" width="120" height="80" rx="12" fill="#ccfbf1"/>
        <rect x="190" y="250" width="100" height="90" rx="12" fill="#99f6e4"/>
        <circle cx="240" cy="180" r="18" fill="#14b8a6"/>`,
    },
    "air-purifier": {
      accent: "#a78bfa",
      draw: () => `
        <rect x="175" y="90" width="130" height="300" rx="40" fill="#1e1b4b"/>
        <rect x="195" y="130" width="90" height="160" rx="16" fill="#312e81"/>
        <circle cx="240" cy="360" r="16" fill="#a78bfa"/>
        <rect x="210" y="150" width="60" height="8" rx="3" fill="#c4b5fd" opacity="0.6"/>
        <rect x="210" y="170" width="60" height="8" rx="3" fill="#c4b5fd" opacity="0.45"/>`,
    },
    "washing-machine": {
      accent: "#94a3b8",
      draw: () => `
        <rect x="140" y="90" width="200" height="300" rx="18" fill="#f1f5f9" stroke="#94a3b8" stroke-width="4"/>
        <circle cx="240" cy="240" r="80" fill="#e2e8f0" stroke="#64748b" stroke-width="8"/>
        <circle cx="240" cy="240" r="50" fill="#cbd5e1"/>
        <circle cx="300" cy="130" r="10" fill="#64748b"/>`,
    },
    "slow-cooker": {
      accent: "#b45309",
      draw: () => `
        <ellipse cx="240" cy="300" rx="120" ry="30" fill="#78350f"/>
        <rect x="140" y="180" width="200" height="130" rx="20" fill="#92400e"/>
        <ellipse cx="240" cy="180" rx="100" ry="24" fill="#b45309"/>
        <rect x="210" y="150" width="60" height="30" rx="8" fill="#44403c"/>`,
    },
  },
  beauty: {
    "hair-dryer": {
      accent: "#f472b6",
      draw: () => `
        <ellipse cx="220" cy="180" rx="70" ry="55" fill="#fbcfe8"/>
        <rect x="250" y="165" width="120" height="36" rx="14" fill="#db2777"/>
        <rect x="200" y="220" width="36" height="120" rx="12" fill="#be185d"/>
        <circle cx="180" cy="180" r="28" fill="#831843"/>`,
    },
    "curling-iron": {
      accent: "#f43f5e",
      draw: () => `
        <rect x="200" y="90" width="28" height="220" rx="12" fill="url(#metal)"/>
        <rect x="185" y="300" width="60" height="80" rx="16" fill="#e11d48"/>
        <path d="M214 90 c40 -30 70 10 40 40" fill="none" stroke="#94a3b8" stroke-width="10"/>`,
    },
    "hair-straightener": {
      accent: "#64748b",
      draw: () => `
        <rect x="150" y="200" width="200" height="28" rx="10" fill="#1e293b"/>
        <rect x="150" y="240" width="200" height="28" rx="10" fill="#334155"/>
        <rect x="120" y="195" width="40" height="80" rx="12" fill="#e11d48"/>
        <rect x="330" y="210" width="50" height="14" rx="6" fill="#94a3b8"/>`,
    },
    "electric-shaver": {
      accent: "#94a3b8",
      draw: () => `
        <rect x="195" y="120" width="90" height="240" rx="28" fill="#e2e8f0"/>
        <rect x="205" y="100" width="70" height="40" rx="12" fill="#64748b"/>
        <rect x="215" y="200" width="50" height="80" rx="10" fill="#cbd5e1"/>
        <circle cx="240" cy="320" r="10" fill="#0ea5e9"/>`,
    },
    "facial-cleansing-brush": {
      accent: "#fb7185",
      draw: () => `
        <circle cx="240" cy="170" r="70" fill="#fda4af"/>
        <circle cx="240" cy="170" r="40" fill="#fff1f2"/>
        <rect x="220" y="230" width="40" height="130" rx="16" fill="#e11d48"/>`,
    },
    "skincare-fridge": {
      accent: "#67e8f9",
      draw: () => `
        <rect x="160" y="110" width="160" height="260" rx="20" fill="#ecfeff" stroke="#22d3ee" stroke-width="4"/>
        <rect x="180" y="140" width="120" height="90" rx="10" fill="#a5f3fc"/>
        <rect x="180" y="250" width="120" height="90" rx="10" fill="#cffafe"/>
        <circle cx="280" cy="185" r="8" fill="#0891b2"/>`,
    },
    "led-mirror": {
      accent: "#fde68a",
      draw: () => `
        <circle cx="240" cy="220" r="120" fill="#fef3c7"/>
        <circle cx="240" cy="220" r="90" fill="#e0f2fe" stroke="#94a3b8" stroke-width="6"/>
        <rect x="220" y="340" width="40" height="50" rx="8" fill="#64748b"/>`,
    },
    "massage-tool": {
      accent: "#c084fc",
      draw: () => `
        <circle cx="240" cy="160" r="55" fill="#e9d5ff"/>
        <rect x="215" y="200" width="50" height="140" rx="20" fill="#7e22ce"/>
        <circle cx="240" cy="160" r="25" fill="#f5f3ff"/>`,
    },
    "manicure-kit": {
      accent: "#f9a8d4",
      draw: () => `
        <rect x="120" y="160" width="240" height="160" rx="18" fill="#831843"/>
        <rect x="140" y="180" width="200" height="120" rx="12" fill="#fce7f3"/>
        <rect x="160" y="200" width="70" height="14" rx="4" fill="#f9a8d4"/>
        <rect x="160" y="230" width="100" height="10" rx="4" fill="#fbcfe8"/>
        <circle cx="300" cy="240" r="16" fill="#db2777"/>`,
    },
    "grooming-kit": {
      accent: "#334155",
      draw: () => `
        <rect x="130" y="150" width="220" height="180" rx="16" fill="#0f172a"/>
        <rect x="150" y="170" width="80" height="140" rx="10" fill="#1e293b"/>
        <rect x="250" y="170" width="80" height="60" rx="10" fill="#334155"/>
        <rect x="250" y="250" width="80" height="60" rx="10" fill="#475569"/>`,
    },
  },
  footwear: {
    "running-shoe": {
      accent: "#22c55e",
      draw: () => `
        <path d="M90 280 c40 -60 120 -90 220 -70 c60 10 90 40 100 70 l-20 30 h-280z" fill="#14532d"/>
        <path d="M120 270 c50 -40 140 -50 220 -20" fill="none" stroke="#86efac" stroke-width="8"/>
        <ellipse cx="160" cy="300" rx="50" ry="16" fill="#166534"/>
        <rect x="280" y="240" width="50" height="24" rx="8" fill="#22c55e"/>`,
    },
    "trail-runner": {
      accent: "#ea580c",
      draw: () => `
        <path d="M90 285 c45 -65 130 -95 230 -70 c55 12 85 42 95 70 l-18 28 h-290z" fill="#9a3412"/>
        <path d="M130 265 c60 -35 150 -40 230 -10" fill="none" stroke="#fdba74" stroke-width="7"/>
        <rect x="290" y="235" width="48" height="22" rx="8" fill="#ea580c"/>`,
    },
    "canvas-sneaker": {
      accent: "#f8fafc",
      draw: () => `
        <path d="M95 290 c40 -55 110 -80 210 -60 c55 10 90 35 100 60 l-15 25 h-280z" fill="#f1f5f9" stroke="#94a3b8" stroke-width="4"/>
        <path d="M140 270 c40 -20 100 -25 160 -8" fill="none" stroke="#64748b" stroke-width="5"/>
        <rect x="300" y="250" width="40" height="18" rx="6" fill="#ef4444"/>`,
    },
    sneaker: {
      accent: "#f8fafc",
      draw: () => `
        <path d="M95 290 c40 -55 110 -80 210 -60 c55 10 90 35 100 60 l-15 25 h-280z" fill="#e2e8f0"/>
        <rect x="300" y="250" width="40" height="18" rx="6" fill="#3b82f6"/>`,
    },
    "hiking-boot": {
      accent: "#78350f",
      draw: () => `
        <path d="M110 250 h100 v40 c0 40 40 70 120 70 h80 l10 30 h-320z" fill="#78350f"/>
        <rect x="120" y="180" width="90" height="80" rx="12" fill="#92400e"/>
        <path d="M210 260 h140" stroke="#fbbf24" stroke-width="6"/>`,
    },
    loafer: {
      accent: "#92400e",
      draw: () => `
        <path d="M100 290 c35 -45 100 -70 200 -55 c50 8 85 30 95 55 l-12 22 h-270z" fill="#78350f"/>
        <path d="M180 265 c30 -15 80 -18 120 -5" fill="none" stroke="#b45309" stroke-width="8"/>
        <ellipse cx="300" cy="280" rx="30" ry="12" fill="#451a03"/>`,
    },
    sandal: {
      accent: "#f59e0b",
      draw: () => `
        <ellipse cx="240" cy="300" rx="140" ry="28" fill="#d97706"/>
        <path d="M150 280 c40 -60 140 -60 180 0" fill="none" stroke="#92400e" stroke-width="16" stroke-linecap="round"/>
        <path d="M170 300 c50 -40 120 -40 160 0" fill="none" stroke="#b45309" stroke-width="12" stroke-linecap="round"/>`,
    },
    "winter-boot": {
      accent: "#1e3a5f",
      draw: () => `
        <path d="M130 200 h90 v80 c0 50 50 90 140 90 h50 l10 30 h-300z" fill="#0f172a"/>
        <rect x="135" y="140" width="85" height="70" rx="14" fill="#1e293b"/>
        <rect x="145" y="155" width="65" height="20" rx="6" fill="#e2e8f0" opacity="0.5"/>`,
    },
    "training-shoe": {
      accent: "#2563eb",
      draw: () => `
        <path d="M90 285 c40 -60 120 -85 220 -65 c55 10 90 38 100 65 l-18 28 h-285z" fill="#1d4ed8"/>
        <path d="M140 265 c55 -30 140 -35 210 -8" fill="none" stroke="#93c5fd" stroke-width="7"/>
        <rect x="295" y="240" width="46" height="20" rx="8" fill="#60a5fa"/>`,
    },
    "chukka-boot": {
      accent: "#a16207",
      draw: () => `
        <path d="M120 230 h95 v50 c0 45 45 80 130 80 h60 l10 28 h-300z" fill="#a16207"/>
        <rect x="125" y="170" width="90" height="70" rx="12" fill="#ca8a04"/>
        <circle cx="150" cy="210" r="5" fill="#422006"/>
        <circle cx="175" cy="210" r="5" fill="#422006"/>`,
    },
    "casual-shoe": {
      accent: "#64748b",
      draw: () => `
        <path d="M100 295 c35 -50 105 -75 205 -55 c50 8 85 32 95 55 l-12 22 h-275z" fill="#475569"/>
        <path d="M160 275 c35 -18 95 -20 145 -5" fill="none" stroke="#94a3b8" stroke-width="6"/>`,
    },
    "dress-shoe": {
      accent: "#0f172a",
      draw: () => `
        <path d="M105 295 c30 -48 95 -72 195 -52 c48 8 82 30 92 52 l-12 22 h-265z" fill="#0f172a"/>
        <path d="M200 275 c25 -12 70 -14 105 -4" fill="none" stroke="#334155" stroke-width="5"/>
        <ellipse cx="320" cy="295" rx="28" ry="10" fill="#1e293b"/>`,
    },
    "slip-on": {
      accent: "#0ea5e9",
      draw: () => `
        <path d="M100 300 c35 -50 110 -70 210 -50 c50 8 85 30 95 50 l-12 20 h-280z" fill="#0369a1"/>
        <ellipse cx="220" cy="270" rx="70" ry="24" fill="#0ea5e9" opacity="0.5"/>`,
    },
  },
  electronics: {
    phone: {
      accent: "#0ea5e9",
      draw: () => `
        <rect x="175" y="80" width="130" height="300" rx="26" fill="#0f172a"/>
        <rect x="188" y="105" width="104" height="240" rx="12" fill="#1e293b"/>
        <circle cx="240" cy="360" r="10" fill="#334155"/>
        <rect x="220" y="95" width="40" height="8" rx="3" fill="#334155"/>`,
    },
    laptop: {
      accent: "#94a3b8",
      draw: () => `
        <rect x="110" y="120" width="260" height="170" rx="10" fill="#1e293b"/>
        <rect x="125" y="135" width="230" height="140" rx="6" fill="#0ea5e9" opacity="0.35"/>
        <path d="M90 290 h300 l20 40 h-340z" fill="#334155"/>
        <rect x="200" y="300" width="80" height="8" rx="3" fill="#64748b"/>`,
    },
    ultrabook: {
      accent: "#64748b",
      draw: () => `
        <rect x="100" y="130" width="280" height="160" rx="10" fill="#0f172a"/>
        <rect x="115" y="145" width="250" height="130" rx="6" fill="#38bdf8" opacity="0.25"/>
        <path d="M85 290 h310 l15 35 h-340z" fill="#1e293b"/>`,
    },
    tablet: {
      accent: "#6366f1",
      draw: () => `
        <rect x="130" y="90" width="220" height="300" rx="22" fill="#1e1b4b"/>
        <rect x="148" y="115" width="184" height="250" rx="10" fill="#312e81"/>
        <circle cx="240" cy="375" r="8" fill="#a5b4fc"/>`,
    },
    earbuds: {
      accent: "#f8fafc",
      draw: () => `
        <rect x="175" y="200" width="130" height="160" rx="28" fill="#0f172a"/>
        <ellipse cx="200" cy="160" rx="28" ry="40" fill="#e2e8f0"/>
        <ellipse cx="280" cy="160" rx="28" ry="40" fill="#e2e8f0"/>
        <rect x="190" y="175" width="16" height="40" rx="6" fill="#94a3b8"/>
        <rect x="274" y="175" width="16" height="40" rx="6" fill="#94a3b8"/>`,
    },
    headphones: {
      accent: "#111827",
      draw: () => `
        <path d="M140 220 a100 100 0 0 1 200 0" fill="none" stroke="#1e293b" stroke-width="22" stroke-linecap="round"/>
        <rect x="110" y="210" width="50" height="90" rx="18" fill="#0f172a"/>
        <rect x="320" y="210" width="50" height="90" rx="18" fill="#0f172a"/>
        <rect x="118" y="225" width="34" height="50" rx="10" fill="#38bdf8" opacity="0.4"/>`,
    },
    monitor: {
      accent: "#0ea5e9",
      draw: () => `
        <rect x="90" y="110" width="300" height="200" rx="12" fill="#0f172a"/>
        <rect x="110" y="130" width="260" height="160" rx="6" fill="#38bdf8" opacity="0.3"/>
        <rect x="210" y="310" width="60" height="30" rx="4" fill="#334155"/>
        <rect x="170" y="340" width="140" height="16" rx="6" fill="#1e293b"/>`,
    },
    smartwatch: {
      accent: "#22c55e",
      draw: () => `
        <rect x="200" y="80" width="80" height="70" rx="14" fill="#14532d"/>
        <rect x="190" y="150" width="100" height="120" rx="22" fill="#052e16"/>
        <rect x="205" y="165" width="70" height="70" rx="14" fill="#22c55e"/>
        <rect x="200" y="270" width="80" height="90" rx="14" fill="#14532d"/>`,
    },
    speaker: {
      accent: "#a78bfa",
      draw: () => `
        <rect x="160" y="120" width="160" height="240" rx="28" fill="#1e1b4b"/>
        <circle cx="240" cy="220" r="50" fill="#312e81"/>
        <circle cx="240" cy="220" r="28" fill="#c4b5fd"/>
        <circle cx="240" cy="320" r="12" fill="#a78bfa"/>`,
    },
    camera: {
      accent: "#334155",
      draw: () => `
        <rect x="110" y="170" width="260" height="150" rx="24" fill="#1e293b"/>
        <circle cx="240" cy="245" r="48" fill="#0f172a" stroke="#94a3b8" stroke-width="8"/>
        <circle cx="240" cy="245" r="24" fill="#38bdf8" opacity="0.5"/>
        <rect x="140" y="150" width="70" height="30" rx="8" fill="#334155"/>`,
    },
    gaming: {
      accent: "#22c55e",
      draw: () => `
        <rect x="110" y="190" width="260" height="120" rx="40" fill="#14532d"/>
        <circle cx="170" cy="250" r="22" fill="#22c55e"/>
        <rect x="280" y="230" width="18" height="40" rx="4" fill="#bbf7d0"/>
        <rect x="268" y="242" width="42" height="16" rx="4" fill="#bbf7d0"/>
        <rect x="130" y="300" width="40" height="20" rx="8" fill="#052e16"/>
        <rect x="310" y="300" width="40" height="20" rx="8" fill="#052e16"/>`,
    },
    keyboard: {
      accent: "#64748b",
      draw: () => `
        <rect x="80" y="180" width="320" height="130" rx="14" fill="#1e293b"/>
        <g fill="#334155">${Array.from({ length: 12 }, (_, i) => `<rect x="${100 + i * 24}" y="200" width="18" height="18" rx="3"/>`).join("")}
        ${Array.from({ length: 11 }, (_, i) => `<rect x="${112 + i * 24}" y="230" width="18" height="18" rx="3"/>`).join("")}
        <rect x="160" y="265" width="160" height="20" rx="4"/></g>`,
    },
    ssd: {
      accent: "#0ea5e9",
      draw: () => `
        <rect x="130" y="180" width="220" height="120" rx="16" fill="#0f172a"/>
        <rect x="150" y="200" width="120" height="16" rx="4" fill="#38bdf8"/>
        <rect x="150" y="230" width="80" height="12" rx="3" fill="#64748b"/>
        <circle cx="310" cy="240" r="16" fill="#22d3ee"/>`,
    },
    "streaming-stick": {
      accent: "#7c3aed",
      draw: () => `
        <rect x="160" y="200" width="200" height="50" rx="16" fill="#4c1d95"/>
        <rect x="140" y="210" width="30" height="30" rx="6" fill="#a78bfa"/>
        <circle cx="320" cy="225" r="10" fill="#ddd6fe"/>`,
    },
  },
  home: {
    blanket: {
      accent: "#fda4af",
      draw: () => `
        <rect x="100" y="140" width="280" height="200" rx="18" fill="#fb7185"/>
        <path d="M100 180 h280 M100 220 h280 M100 260 h280" stroke="#fda4af" stroke-width="6" opacity="0.6"/>
        <rect x="120" y="160" width="80" height="50" rx="8" fill="#fff1f2" opacity="0.5"/>`,
    },
    "table-lamp": {
      accent: "#fde68a",
      draw: () => `
        <path d="M170 160 h140 l30 90 h-200z" fill="#fef3c7"/>
        <rect x="225" y="250" width="30" height="90" rx="6" fill="#78716c"/>
        <ellipse cx="240" cy="350" rx="50" ry="12" fill="#57534e"/>`,
    },
    "storage-bins": {
      accent: "#fdba74",
      draw: () => `
        <rect x="100" y="200" width="120" height="140" rx="12" fill="#fb923c"/>
        <rect x="240" y="170" width="130" height="170" rx="12" fill="#f97316"/>
        <rect x="120" y="190" width="80" height="16" rx="6" fill="#fdba74"/>
        <rect x="265" y="160" width="80" height="16" rx="6" fill="#fdba74"/>`,
    },
    "throw-pillow": {
      accent: "#c4b5fd",
      draw: () => `
        <rect x="130" y="150" width="220" height="180" rx="36" fill="#a78bfa"/>
        <rect x="160" y="180" width="160" height="120" rx="24" fill="#ddd6fe" opacity="0.5"/>`,
    },
    "air-filter": {
      accent: "#86efac",
      draw: () => `
        <rect x="150" y="120" width="180" height="240" rx="16" fill="#ecfdf5" stroke="#86efac" stroke-width="6"/>
        ${Array.from({ length: 8 }, (_, i) => `<line x1="170" y1="${150 + i * 24}" x2="310" y2="${150 + i * 24}" stroke="#4ade80" stroke-width="4"/>`).join("")}`,
    },
    "air-purifier": {
      accent: "#a78bfa",
      draw: () => `
        <rect x="175" y="100" width="130" height="280" rx="36" fill="#312e81"/>
        <rect x="195" y="140" width="90" height="140" rx="14" fill="#4c1d95"/>
        <circle cx="240" cy="340" r="14" fill="#c4b5fd"/>`,
    },
    "wall-clock": {
      accent: "#f8fafc",
      draw: () => `
        <circle cx="240" cy="240" r="120" fill="#ffffff" stroke="#94a3b8" stroke-width="10"/>
        <circle cx="240" cy="240" r="8" fill="#0f172a"/>
        <line x1="240" y1="240" x2="240" y2="160" stroke="#0f172a" stroke-width="8" stroke-linecap="round"/>
        <line x1="240" y1="240" x2="300" y2="240" stroke="#0f172a" stroke-width="6" stroke-linecap="round"/>`,
    },
    diffuser: {
      accent: "#99f6e4",
      draw: () => `
        <ellipse cx="240" cy="300" rx="80" ry="24" fill="#0f766e"/>
        <path d="M180 300 v-100 a60 60 0 0 1 120 0 v100" fill="#14b8a6"/>
        <path d="M220 160 c0 -40 40 -40 40 0" fill="none" stroke="#99f6e4" stroke-width="8" opacity="0.7"/>
        <path d="M240 140 c0 -40 40 -40 40 0" fill="none" stroke="#ccfbf1" stroke-width="6" opacity="0.5"/>`,
    },
    curtains: {
      accent: "#93c5fd",
      draw: () => `
        <rect x="100" y="100" width="110" height="280" rx="8" fill="#3b82f6"/>
        <rect x="270" y="100" width="110" height="280" rx="8" fill="#60a5fa"/>
        <path d="M100 120 q55 30 110 0" fill="none" stroke="#93c5fd" stroke-width="10"/>
        <path d="M270 120 q55 30 110 0" fill="none" stroke="#bfdbfe" stroke-width="10"/>
        <rect x="90" y="90" width="300" height="16" rx="6" fill="#1e3a8a"/>`,
    },
    rug: {
      accent: "#fca5a5",
      draw: () => `
        <ellipse cx="240" cy="250" rx="170" ry="110" fill="#f87171"/>
        <ellipse cx="240" cy="250" rx="120" ry="70" fill="#fecaca" opacity="0.5"/>
        <ellipse cx="240" cy="250" rx="60" ry="30" fill="#fee2e2"/>`,
    },
    "home-organizer": {
      accent: "#fdba74",
      draw: () => `
        <rect x="120" y="140" width="240" height="200" rx="12" fill="#fff7ed" stroke="#fdba74" stroke-width="4"/>
        <line x1="200" y1="140" x2="200" y2="340" stroke="#fed7aa" stroke-width="4"/>
        <line x1="280" y1="140" x2="280" y2="340" stroke="#fed7aa" stroke-width="4"/>
        <line x1="120" y1="240" x2="360" y2="240" stroke="#fed7aa" stroke-width="4"/>`,
    },
  },
  automotive: {
    "dash-cam": {
      accent: "#0f172a",
      draw: () => `
        <rect x="150" y="180" width="180" height="100" rx="20" fill="#0f172a"/>
        <circle cx="240" cy="230" r="28" fill="#38bdf8" opacity="0.6"/>
        <rect x="220" y="150" width="40" height="40" rx="8" fill="#334155"/>`,
    },
    "jump-starter": {
      accent: "#ef4444",
      draw: () => `
        <rect x="140" y="150" width="200" height="180" rx="20" fill="#1e293b"/>
        <rect x="160" y="175" width="160" height="60" rx="10" fill="#334155"/>
        <rect x="170" y="260" width="50" height="40" rx="8" fill="#ef4444"/>
        <rect x="240" y="260" width="50" height="40" rx="8" fill="#22c55e"/>`,
    },
    "cargo-organizer": {
      accent: "#78716c",
      draw: () => `
        <rect x="110" y="160" width="260" height="170" rx="14" fill="#57534e"/>
        <line x1="200" y1="160" x2="200" y2="330" stroke="#44403c" stroke-width="8"/>
        <line x1="280" y1="160" x2="280" y2="330" stroke="#44403c" stroke-width="8"/>`,
    },
    "headlight-kit": {
      accent: "#fde68a",
      draw: () => `
        <ellipse cx="180" cy="240" rx="50" ry="70" fill="#fef3c7" stroke="#fbbf24" stroke-width="6"/>
        <ellipse cx="300" cy="240" rx="50" ry="70" fill="#fef3c7" stroke="#fbbf24" stroke-width="6"/>
        <circle cx="180" cy="240" r="20" fill="#fde68a"/>
        <circle cx="300" cy="240" r="20" fill="#fde68a"/>`,
    },
    "phone-mount": {
      accent: "#64748b",
      draw: () => `
        <rect x="195" y="120" width="90" height="160" rx="14" fill="#0f172a"/>
        <rect x="210" y="280" width="60" height="50" rx="10" fill="#334155"/>
        <rect x="225" y="330" width="30" height="40" rx="6" fill="#64748b"/>
        <circle cx="240" cy="390" r="18" fill="#94a3b8"/>`,
    },
    "floor-mats": {
      accent: "#1e293b",
      draw: () => `
        <path d="M120 160 h140 v200 h-140z" fill="#0f172a"/>
        <path d="M280 140 h100 v220 h-100z" fill="#1e293b"/>
        <path d="M140 200 h100 M140 240 h100 M140 280 h100" stroke="#334155" stroke-width="4"/>`,
    },
    "tire-inflator": {
      accent: "#0ea5e9",
      draw: () => `
        <rect x="160" y="160" width="160" height="160" rx="20" fill="#0f172a"/>
        <circle cx="240" cy="230" r="40" fill="#0369a1"/>
        <rect x="300" y="220" width="70" height="24" rx="8" fill="#38bdf8"/>
        <rect x="200" y="300" width="80" height="20" rx="6" fill="#334155"/>`,
    },
    "car-vacuum": {
      accent: "#ef4444",
      draw: () => `
        <rect x="170" y="140" width="140" height="180" rx="40" fill="#b91c1c"/>
        <rect x="210" y="100" width="60" height="50" rx="12" fill="#7f1d1d"/>
        <circle cx="240" cy="350" r="24" fill="#1e293b"/>
        <rect x="300" y="200" width="50" height="20" rx="8" fill="#fca5a5"/>`,
    },
    "battery-charger": {
      accent: "#22c55e",
      draw: () => `
        <rect x="140" y="160" width="200" height="150" rx="18" fill="#14532d"/>
        <rect x="160" y="185" width="160" height="50" rx="10" fill="#166534"/>
        <rect x="180" y="260" width="50" height="28" rx="6" fill="#ef4444"/>
        <rect x="250" y="260" width="50" height="28" rx="6" fill="#22c55e"/>`,
    },
    "car-charger": {
      accent: "#0ea5e9",
      draw: () => `
        <rect x="200" y="120" width="80" height="200" rx="24" fill="#0f172a"/>
        <circle cx="240" cy="160" r="22" fill="#38bdf8"/>
        <rect x="220" y="300" width="40" height="50" rx="10" fill="#334155"/>
        <rect x="230" y="350" width="20" height="40" rx="6" fill="#94a3b8"/>`,
    },
    "seat-cover": {
      accent: "#334155",
      draw: () => `
        <path d="M160 320 h160 v-80 a40 40 0 0 0 -40 -40 h-80 a40 40 0 0 0 -40 40z" fill="#1e293b"/>
        <rect x="180" y="120" width="120" height="140" rx="28" fill="#334155"/>
        <rect x="200" y="150" width="80" height="60" rx="12" fill="#475569"/>`,
    },
    "windshield-wipers": {
      accent: "#94a3b8",
      draw: () => `
        <path d="M100 300 L360 160" stroke="#1e293b" stroke-width="14" stroke-linecap="round"/>
        <path d="M120 320 L380 180" stroke="#64748b" stroke-width="10" stroke-linecap="round"/>
        <rect x="90" y="290" width="30" height="30" rx="6" fill="#334155"/>
        <rect x="350" y="150" width="30" height="30" rx="6" fill="#334155"/>`,
    },
    "tool-kit": {
      accent: "#f59e0b",
      draw: () => `
        <rect x="120" y="160" width="240" height="170" rx="16" fill="#92400e"/>
        <rect x="140" y="140" width="200" height="40" rx="12" fill="#b45309"/>
        <rect x="160" y="210" width="70" height="80" rx="8" fill="#fbbf24"/>
        <rect x="250" y="210" width="70" height="80" rx="8" fill="#f59e0b"/>`,
    },
  },
  outdoors: {
    backpack: {
      accent: "#15803d",
      draw: () => `
        <path d="M170 150 h140 a24 24 0 0 1 24 24 v180 a20 20 0 0 1 -20 20 h-148 a20 20 0 0 1 -20 -20 v-180 a24 24 0 0 1 24 -24z" fill="#166534"/>
        <rect x="200" y="120" width="80" height="36" rx="14" fill="none" stroke="#14532d" stroke-width="12"/>
        <rect x="195" y="200" width="90" height="70" rx="10" fill="#14532d"/>`,
    },
    daypack: {
      accent: "#0d9488",
      draw: () => `
        <path d="M175 155 h130 a22 22 0 0 1 22 22 v170 a18 18 0 0 1 -18 18 h-138 a18 18 0 0 1 -18 -18 v-170 a22 22 0 0 1 22 -22z" fill="#0f766e"/>
        <rect x="205" y="125" width="70" height="32" rx="12" fill="none" stroke="#115e59" stroke-width="10"/>
        <rect x="200" y="210" width="80" height="50" rx="8" fill="#115e59"/>`,
    },
    tent: {
      accent: "#f97316",
      draw: () => `
        <path d="M240 120 L380 340 H100 Z" fill="#ea580c"/>
        <path d="M240 120 L240 340" stroke="#9a3412" stroke-width="6"/>
        <path d="M180 340 L240 200 L300 340" fill="#c2410c" opacity="0.5"/>`,
    },
    "sleeping-bag": {
      accent: "#3b82f6",
      draw: () => `
        <rect x="140" y="140" width="200" height="220" rx="80" fill="#1d4ed8"/>
        <ellipse cx="240" cy="160" rx="70" ry="40" fill="#93c5fd"/>
        <rect x="170" y="220" width="140" height="20" rx="6" fill="#60a5fa" opacity="0.5"/>`,
    },
    "camp-stove": {
      accent: "#ef4444",
      draw: () => `
        <rect x="150" y="220" width="180" height="100" rx="14" fill="#1e293b"/>
        <circle cx="200" cy="200" r="28" fill="#64748b"/>
        <circle cx="280" cy="200" r="28" fill="#64748b"/>
        <rect x="210" y="250" width="60" height="20" rx="6" fill="#ef4444"/>`,
    },
    "hiking-bottle": {
      accent: "#0ea5e9",
      draw: () => `
        <rect x="190" y="120" width="100" height="240" rx="28" fill="#0369a1"/>
        <rect x="205" y="90" width="70" height="40" rx="10" fill="#0f172a"/>
        <rect x="210" y="180" width="60" height="80" rx="8" fill="#38bdf8" opacity="0.4"/>`,
    },
    "water-bottle": {
      accent: "#22d3ee",
      draw: () => `
        <rect x="195" y="110" width="90" height="250" rx="26" fill="#0891b2"/>
        <rect x="210" y="80" width="60" height="40" rx="10" fill="#164e63"/>
        <rect x="215" y="170" width="50" height="90" rx="8" fill="#a5f3fc" opacity="0.45"/>`,
    },
    "trekking-poles": {
      accent: "#94a3b8",
      draw: () => `
        <rect x="180" y="80" width="16" height="320" rx="6" fill="#64748b"/>
        <rect x="280" y="80" width="16" height="320" rx="6" fill="#475569"/>
        <circle cx="188" cy="100" r="14" fill="#1e293b"/>
        <circle cx="288" cy="100" r="14" fill="#1e293b"/>
        <rect x="170" y="360" width="36" height="20" rx="6" fill="#0f172a"/>
        <rect x="270" y="360" width="36" height="20" rx="6" fill="#0f172a"/>`,
    },
    lantern: {
      accent: "#fbbf24",
      draw: () => `
        <rect x="185" y="160" width="110" height="160" rx="16" fill="#fef3c7" stroke="#f59e0b" stroke-width="6"/>
        <rect x="200" y="120" width="80" height="40" rx="10" fill="#78350f"/>
        <rect x="210" y="320" width="60" height="30" rx="8" fill="#92400e"/>
        <circle cx="240" cy="240" r="24" fill="#fde68a"/>`,
    },
    "camp-chair": {
      accent: "#2563eb",
      draw: () => `
        <path d="M140 200 h200 v80 h-200z" fill="#1d4ed8"/>
        <path d="M140 200 l-30 120 M340 200 l30 120 M140 280 l-20 100 M340 280 l20 100" stroke="#1e3a8a" stroke-width="12" stroke-linecap="round"/>
        <path d="M160 160 h160 v50 h-160z" fill="#3b82f6"/>`,
    },
    cooler: {
      accent: "#38bdf8",
      draw: () => `
        <rect x="120" y="170" width="240" height="170" rx="20" fill="#0369a1"/>
        <rect x="120" y="150" width="240" height="40" rx="14" fill="#0ea5e9"/>
        <rect x="200" y="155" width="80" height="24" rx="8" fill="#075985"/>
        <rect x="150" y="230" width="60" height="40" rx="8" fill="#7dd3fc" opacity="0.4"/>`,
    },
    "picnic-blanket": {
      accent: "#f472b6",
      draw: () => `
        <rect x="100" y="140" width="280" height="200" rx="12" fill="#fbcfe8"/>
        ${Array.from({ length: 4 }, (_, r) =>
          Array.from({ length: 5 }, (_, c) =>
            (r + c) % 2 === 0
              ? `<rect x="${120 + c * 50}" y="${160 + r * 40}" width="50" height="40" fill="#db2777" opacity="0.35"/>`
              : "",
          ).join(""),
        ).join("")}`,
    },
    "travel-bag": {
      accent: "#57534e",
      draw: () => `
        <rect x="110" y="170" width="260" height="160" rx="24" fill="#44403c"/>
        <rect x="150" y="140" width="180" height="40" rx="12" fill="#292524"/>
        <circle cx="180" cy="330" r="18" fill="#1c1917"/>
        <circle cx="300" cy="330" r="18" fill="#1c1917"/>
        <rect x="200" y="210" width="80" height="50" rx="10" fill="#78716c"/>`,
    },
  },
};

async function writeThumb(category, slug, entry) {
  const svg = frame(entry.draw(), entry.accent);
  const outDir = path.join("public/images/products", category);
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${slug}.jpg`);
  await sharp(Buffer.from(svg))
    .resize(SIZE, SIZE)
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(outPath);
  return outPath;
}

let count = 0;
for (const [category, items] of Object.entries(CATALOG)) {
  for (const [slug, entry] of Object.entries(items)) {
    const out = await writeThumb(category, slug, entry);
    count += 1;
    console.log("wrote", out.replace(/\\/g, "/"));
  }
}
console.log(`done — ${count} distinct product thumbnails`);
