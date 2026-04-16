import { apiCaller } from './api-caller';
import type { Domain } from '../types';

export const getDomains = () =>
    apiCaller.get<Domain[]>('/api/v1/domains').then((r) => r.data);

export const createDomain = (payload: Partial<Domain>) =>
    apiCaller.post<Domain>('/api/v1/domains', payload).then((r) => r.data);

export const updateDomain = (id: string, payload: Partial<Domain>) =>
    apiCaller.patch<Domain>(`/api/v1/domains/${id}`, payload).then((r) => r.data);

export const toggleDomain = (id: string) =>
    apiCaller.patch(`/api/v1/domains/${id}/toggle`).then((r) => r.data);

export const deleteDomain = (id: string) =>
    apiCaller.delete(`/api/v1/domains/${id}`).then((r) => r.data);

export const getEntityTypes = () =>
    apiCaller.get<string[]>('/api/v1/entity-types').then((r) => r.data);
