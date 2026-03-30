import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const COUNTRY_CODE_MAP: Record<string, string> = {
  "United States": "US",
  "United States of America": "US",
  "United Kingdom": "UK",
  "Great Britain": "UK",
  "Russia": "RU",
  "Russian Federation": "RU",
  "Kazakhstan": "KZ",
  "Ukraine": "UA",
  "Belarus": "BY",
  "Germany": "DE",
  "France": "FR",
  "Italy": "IT",
  "Spain": "ES",
  "Poland": "PL",
  "Netherlands": "NL",
  "Sweden": "SE",
  "Norway": "NO",
  "Finland": "FI",
  "Denmark": "DK",
  "Canada": "CA",
  "Mexico": "MX",
  "Brazil": "BR",
  "Argentina": "AR",
  "Chile": "CL",
  "China": "CN",
  "Japan": "JP",
  "South Korea": "KR",
  "Korea, Republic of": "KR",
  "Turkey": "TR",
  "India": "IN",
  "Australia": "AU",
  "New Zealand": "NZ",
  "United Arab Emirates": "AE",
  "Israel": "IL",
  "Saudi Arabia": "SA",
  "Local": "LOCAL",
  "Unknown": "UNK",
}

export function toCountryCode(country: string): string {
  const trimmed = country.trim()
  if (!trimmed) return "UNK"
  const upper = trimmed.toUpperCase()
  if (/^[A-Z]{2,3}$/.test(upper)) return upper
  return COUNTRY_CODE_MAP[trimmed] || COUNTRY_CODE_MAP[upper] || trimmed
}
