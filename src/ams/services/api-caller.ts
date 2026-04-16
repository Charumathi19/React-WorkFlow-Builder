import axios from 'axios';

/**
 * Base Axios instance for all AMS API requests.
 * All feature services import this and call .get()/.post() etc.
 * The API base URL is configured via VITE_API_BASE_URL env variable.
 */
const BASE_URL =
    (import.meta as unknown as { env: Record<string, string> }).env
        .VITE_API_BASE_URL ?? 'http://localhost:8000';

export const apiCaller = axios.create({
    baseURL: BASE_URL,
    timeout: 30_000,
    headers: { 'Content-Type': 'application/json' },
});

/** Base URL string — used to construct download links */
export const API_BASE_URL = BASE_URL;
