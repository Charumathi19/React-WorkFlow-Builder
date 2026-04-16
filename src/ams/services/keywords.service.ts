import { apiCaller } from './api-caller';
import type { Keyword } from '../types';

export const getKeywords = () =>
    apiCaller.get<Keyword[]>('/api/v1/keywords').then((r) => r.data);

export const createKeyword = (payload: Partial<Keyword>) =>
    apiCaller.post<Keyword>('/api/v1/keywords', payload).then((r) => r.data);

export const updateKeyword = (id: string, payload: Partial<Keyword>) =>
    apiCaller.patch<Keyword>(`/api/v1/keywords/${id}`, payload).then((r) => r.data);

export const toggleKeyword = (id: string) =>
    apiCaller.patch(`/api/v1/keywords/${id}/toggle`).then((r) => r.data);

export const deleteKeyword = (id: string) =>
    apiCaller.delete(`/api/v1/keywords/${id}`).then((r) => r.data);
