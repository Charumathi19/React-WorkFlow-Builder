import { useState, useEffect } from 'react';
import { getHealth } from '../../services/audit.service';
import type { HealthDetailed } from '../../types';

export default function HealthIndicator() {
    const [health, setHealth] = useState<HealthDetailed | null>(null);
    const [error, setError] = useState(false);

    useEffect(() => {
        getHealth()
            .then(setHealth)
            .catch(() => setError(true));
    }, []);

    if (error || !health) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '6px 14px',
                    background: 'rgba(239,68,68,0.1)',
                    border: '1px solid rgba(239,68,68,0.2)',
                    borderRadius: 8,
                    fontSize: 12,
                    color: '#ef4444',
                }}
            >
                <span className="health-dot health-offline" />
                Backend unreachable
            </div>
        );
    }

    const dot = (status: string) => {
        if (status === 'online') return 'health-online';
        if (status === 'degraded') return 'health-degraded';
        return 'health-offline';
    };

    return (
        <div
            style={{
                display: 'flex',
                gap: 16,
                alignItems: 'center',
                fontSize: 12,
                color: '#888',
            }}
        >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className={`health-dot ${dot(health.database.status)}`} />
                DB
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span className={`health-dot ${dot(health.search_engine.status)}`} />
                Search
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span
                    className={`health-dot ${health.llm_provider.status === 'not_configured'
                        ? 'health-degraded'
                        : dot(health.llm_provider.status)
                        }`}
                />
                LLM
            </span>
        </div>
    );
}
