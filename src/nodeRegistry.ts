import type { NodeCategory, NodeMeta, CategoryMeta, NodeType } from './types';

// ─── Category Metadata ────────────────────────────────────────────────────────
export const CATEGORIES: Record<NodeCategory, CategoryMeta> = {
    actions: { label: 'Basic Actions', color: '#4f46e5' },
    logic: { label: 'Logic', color: '#d97706' },
    integrations: { label: 'Integrations', color: '#16a34a' },
    advanced: { label: 'Advanced', color: '#334155' },
};

// ─── Node Registry ────────────────────────────────────────────────────────────
export const NODE_REGISTRY: Record<NodeType, NodeMeta> = {
    start: {
        label: 'Start', icon: '▶', color: '#6366f1',
        category: null, typeLabel: 'trigger', defaultData: {},
    },
    end: {
        label: 'End', icon: '⏹', color: '#6b7280',
        category: null, typeLabel: 'terminal', defaultData: {},
    },
    sendEmail: {
        label: 'Email', icon: '✉️', color: '#4f46e5',
        category: 'actions', typeLabel: 'action',
        defaultData: { to: '', subject: '', message: '' },
    },
    pushNotification: {
        label: 'Push Notification', icon: '🔔', color: '#0891b2',
        category: 'actions', typeLabel: 'action',
        defaultData: { title: '', message: '', url: '' },
    },
    apiRequest: {
        label: 'API Request', icon: '🌐', color: '#059669',
        category: 'actions', typeLabel: 'action',
        defaultData: { method: 'GET', url: '', headers: '{}', body: '' },
    },
    delay: {
        label: 'Delay / Wait', icon: '⏱️', color: '#7c3aed',
        category: 'actions', typeLabel: 'action',
        defaultData: { duration: 1, unit: 'seconds' },
    },
    condition: {
        label: 'Condition Split', icon: '🔀', color: '#d97706',
        category: 'logic', typeLabel: 'logic',
        defaultData: { field: '', operator: 'equals', value: '' },
    },
    loop: {
        label: 'Loop / Iterator', icon: '🔁', color: '#c2410c',
        category: 'logic', typeLabel: 'logic',
        defaultData: { source: '', maxIterations: 10 },
    },
    setVariable: {
        label: 'Set Variable', icon: '📦', color: '#0d9488',
        category: 'logic', typeLabel: 'logic',
        defaultData: { name: '', value: '', type: 'string' },
    },
    dataTransformer: {
        label: 'Transform Data', icon: '⚡', color: '#6d28d9',
        category: 'logic', typeLabel: 'logic',
        defaultData: { expression: '// Access input as `data`\nreturn { ...data };', outputKey: '' },
    },
    gmail: {
        label: 'Gmail', icon: '📧', color: '#dc2626',
        category: 'integrations', typeLabel: 'integration',
        defaultData: { to: '', cc: '', subject: '', body: '' },
    },
    slack: {
        label: 'Slack', icon: '💬', color: '#7c3aed',
        category: 'integrations', typeLabel: 'integration',
        defaultData: { channel: '#general', message: '', username: 'WorkflowBot' },
    },
    whatsapp: {
        label: 'WhatsApp', icon: '📱', color: '#16a34a',
        category: 'integrations', typeLabel: 'integration',
        defaultData: { phone: '', message: '', template: '' },
    },
    customCode: {
        label: 'Custom Code', icon: '{ }', color: '#1e293b',
        category: 'advanced', typeLabel: 'advanced',
        defaultData: { code: '// Input data is available as `data`\nreturn data;', language: 'javascript' },
    },
    webhookResponse: {
        label: 'Webhook Response', icon: '🔗', color: '#0369a1',
        category: 'advanced', typeLabel: 'advanced',
        defaultData: { statusCode: 200, headers: '{}', body: '{}' },
    },
    database: {
        label: 'Database', icon: '🗄️', color: '#92400e',
        category: 'advanced', typeLabel: 'advanced',
        defaultData: { operation: 'select', table: '', conditions: '', data: '' },
    },
};

// ─── Sidebar layout ───────────────────────────────────────────────────────────
export const SIDEBAR_NODES: Record<NodeCategory, NodeType[]> = {
    actions: ['sendEmail', 'pushNotification', 'apiRequest', 'delay'],
    logic: ['condition', 'loop', 'setVariable', 'dataTransformer'],
    integrations: ['gmail', 'slack', 'whatsapp'],
    advanced: ['customCode', 'webhookResponse', 'database'],
};
