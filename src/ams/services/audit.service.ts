import { apiCaller } from './api-caller';
import type { AuditEvent, HealthDetailed } from '../types';

export const getGlobalAudit = (limit = 200) =>
    apiCaller
        .get<AuditEvent[]>('/api/v1/audit/recent', { params: { limit } })
        .then((r) => r.data);

export const getHealth = () =>
    apiCaller.get<HealthDetailed>('/health/detailed').then((r) => r.data);
