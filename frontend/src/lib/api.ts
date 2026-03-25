const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

function handleUnauthorized(res: Response): void {
  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
}

export async function apiRegister(username: string, email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Registration failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
}

export async function apiLogin(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error || 'Login failed');
  }
  const data = await res.json();
  localStorage.setItem('token', data.token);
  return data;
}

export function apiLogout() {
  localStorage.removeItem('token');
}

export function isLoggedIn(): boolean {
  return !!getToken();
}

export async function apiGetMe() {
  const res = await fetch(`${API_BASE}/me`, { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Failed to fetch user');
  }
  return res.json();
}

export async function apiUpdateMe(username: string, email: string) {
  const res = await fetch(`${API_BASE}/me`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ username, email }),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Failed to update user');
  }
  return res.json();
}

export interface LinkData {
  id: number;
  slug: string;
  target_url: string;
  created_at: string;
  is_active: boolean;
  custom_domain_id?: string;
}

export async function apiCreateLink(url: string, customDomainId?: string): Promise<LinkData> {
  const body: Record<string, string> = { url };
  if (customDomainId) body.custom_domain_id = customDomainId;
  const res = await fetch(`${API_BASE}/links`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    throw new Error(data.error || 'Failed to create link');
  }
  return res.json();
}

export async function apiGetLinks(): Promise<LinkData[]> {
  const res = await fetch(`${API_BASE}/links`, { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Failed to fetch links');
  }
  return res.json();
}

export async function apiDeleteLink(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/links/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Failed to delete link');
  }
}

export interface OverviewStats {
  total_links: number;
  total_clicks: number;
  avg_per_link: number;
  avg_per_day: number;
  clicks_over_time: { date: string; clicks: number }[] | null;
  countries: { country: string; clicks: number }[] | null;
  devices: { device: string; clicks: number }[] | null;
  browsers: { browser: string; clicks: number }[] | null;
  os_stats: { os: string; clicks: number }[] | null;
}

export async function apiGetAnalytics(): Promise<OverviewStats> {
  const res = await fetch(`${API_BASE}/analytics/overview`, { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    if (data.error === 'analytics_locked') {
      throw new Error('analytics_locked');
    }
    throw new Error('Failed to fetch analytics');
  }
  return res.json();
}

export function getQRCodeURL(slug: string): string {
  return `${API_BASE}/qr/${slug}`;
}

// Per-link analytics

export interface LinkDetailStats {
  link_id: number;
  slug: string;
  target_url: string;
  created_at: string;
  total_clicks: number;
  clicks_today: number;
  clicks_week: number;
  clicks_month: number;
  clicks_over_time: { date: string; clicks: number }[] | null;
  countries: { country: string; clicks: number }[] | null;
  devices: { device: string; clicks: number }[] | null;
  browsers: { browser: string; clicks: number }[] | null;
  os_stats: { os: string; clicks: number }[] | null;
  referers: { referer: string; clicks: number }[] | null;
  hourly_map: { hour: number; clicks: number }[] | null;
  recent_clicks: { event_id: number; slug: string; clicked_at: string; country: string; device: string; browser: string; os: string; referer: string }[] | null;
}

export interface LinkDetailResponse {
  stats: LinkDetailStats;
  plan_name: string;
}

export async function apiGetLinkDetail(linkId: number): Promise<LinkDetailResponse> {
  const res = await fetch(`${API_BASE}/analytics/link/${linkId}`, { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Failed to fetch link analytics');
  }
  return res.json();
}

// Billing

export interface PlanData {
  plan_id: number;
  name: string;
  price_kop: number;
  max_links: number;
  has_analytics: boolean;
}

export async function apiGetPlans(): Promise<PlanData[]> {
  const res = await fetch(`${API_BASE}/plans`);
  if (!res.ok) throw new Error('Failed to fetch plans');
  return res.json();
}

export async function apiGetUserPlan(): Promise<PlanData> {
  const res = await fetch(`${API_BASE}/billing/plan`, { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Failed to fetch user plan');
  }
  return res.json();
}

export async function apiCreatePayment(plan: string): Promise<{ redirect_url: string; message?: string }> {
  const res = await fetch(`${API_BASE}/billing/pay`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ plan }),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    throw new Error(data.error || 'Payment failed');
  }
  return res.json();
}

export function getShortURL(slug: string): string {
  return `${window.location.origin}/r/${slug}`;
}

// Custom Domains

export interface CustomDomainData {
  id: number;
  domain: string;
  verified: boolean;
  ssl_status: string;
  created_at: string;
}

export async function apiAddDomain(domain: string): Promise<CustomDomainData> {
  const res = await fetch(`${API_BASE}/domains`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ domain }),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    if (data.error === 'custom_domains_locked') {
      throw new Error('custom_domains_locked');
    }
    throw new Error(data.error || 'Failed to add domain');
  }
  return res.json();
}

export async function apiGetDomains(): Promise<CustomDomainData[]> {
  const res = await fetch(`${API_BASE}/domains`, { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    if (data.error === 'custom_domains_locked') {
      throw new Error('custom_domains_locked');
    }
    throw new Error('Failed to fetch domains');
  }
  return res.json();
}

export async function apiVerifyDomain(id: number): Promise<{ domain: CustomDomainData; verified: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/domains/${id}/verify`, {
    method: 'POST',
    headers: authHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    throw new Error(data.error || 'Verification failed');
  }
  return res.json();
}

export async function apiDeleteDomain(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/domains/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) {
    handleUnauthorized(res);
    throw new Error('Failed to delete domain');
  }
}

// Advanced Analytics (Unlimited)

export interface AdvancedStats {
  referers: { referer: string; clicks: number }[] | null;
  hourly_map: { hour: number; clicks: number }[] | null;
  top_links: { link_id: number; slug: string; target_url: string; clicks: number }[] | null;
  recent_clicks: {
    event_id: number;
    slug: string;
    clicked_at: string;
    country: string;
    device: string;
    browser: string;
    os: string;
    referer: string;
  }[] | null;
}

export async function apiGetAdvancedAnalytics(): Promise<AdvancedStats> {
  const res = await fetch(`${API_BASE}/analytics/advanced`, { headers: authHeaders() });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    if (data.error === 'advanced_locked') {
      throw new Error('advanced_locked');
    }
    if (data.error === 'analytics_locked') {
      throw new Error('analytics_locked');
    }
    throw new Error('Failed to fetch advanced analytics');
  }
  return res.json();
}

export function getCSVExportURL(): string {
  return `${API_BASE}/analytics/export`;
}

export async function apiExportCSV(): Promise<void> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/analytics/export`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    handleUnauthorized(res);
    const data = await res.json();
    throw new Error(data.error || 'Export failed');
  }
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'analytics_export.csv';
  a.click();
  window.URL.revokeObjectURL(url);
}
