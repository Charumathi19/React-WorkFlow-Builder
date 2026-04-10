// ─── Node Category ───────────────────────────────────────────────────────────
export type NodeCategory = 'actions' | 'logic' | 'integrations' | 'advanced';

// ─── Node Type Union ──────────────────────────────────────────────────────────
export type NodeType =
    | 'start'
    | 'end'
    | 'sendEmail'
    | 'pushNotification'
    | 'apiRequest'
    | 'delay'
    | 'condition'
    | 'loop'
    | 'setVariable'
    | 'dataTransformer'
    | 'gmail'
    | 'slack'
    | 'whatsapp'
    | 'customCode'
    | 'webhookResponse'
    | 'database';

// ─── Per-Node Data Interfaces ─────────────────────────────────────────────────
export interface StartData { [key: string]: never }
export interface EndData { [key: string]: never }

export interface SendEmailData {
    to: string;
    subject: string;
    message: string;
}
export interface PushNotificationData {
    title: string;
    message: string;
    url: string;
}
export interface ApiRequestData {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    url: string;
    headers: string;
    body: string;
}
export interface DelayData {
    duration: number;
    unit: 'seconds' | 'minutes' | 'hours' | 'days';
}
export interface ConditionData {
    field: string;
    operator: string;
    value: string;
}
export interface LoopData {
    source: string;
    maxIterations: number;
}
export interface SetVariableData {
    name: string;
    value: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
}
export interface DataTransformerData {
    expression: string;
    outputKey: string;
}
export interface GmailData {
    to: string;
    cc: string;
    subject: string;
    body: string;
}
export interface SlackData {
    channel: string;
    message: string;
    username: string;
}
export interface WhatsAppData {
    phone: string;
    message: string;
    template: string;
}
export interface CustomCodeData {
    code: string;
    language: string;
}
export interface WebhookResponseData {
    statusCode: number;
    headers: string;
    body: string;
}
export interface DatabaseData {
    operation: 'select' | 'insert' | 'update' | 'delete';
    table: string;
    conditions: string;
    data: string;
}

/** Discriminated union of all node data shapes */
export type NodeData =
    | SendEmailData
    | PushNotificationData
    | ApiRequestData
    | DelayData
    | ConditionData
    | LoopData
    | SetVariableData
    | DataTransformerData
    | GmailData
    | SlackData
    | WhatsAppData
    | CustomCodeData
    | WebhookResponseData
    | DatabaseData
    | Record<string, unknown>;

// ─── Registry Metadata ────────────────────────────────────────────────────────
export interface NodeMeta {
    label: string;
    icon: string;
    color: string;
    category: NodeCategory | null;
    typeLabel: string;
    defaultData: NodeData;
}

export interface CategoryMeta {
    label: string;
    color: string;
}

// ─── Workflow State ───────────────────────────────────────────────────────────
export interface WorkflowState {
    nodes: import('@xyflow/react').Node<NodeData>[];
    edges: import('@xyflow/react').Edge[];
    savedAt?: string;
}

// ─── Canvas Ref API ───────────────────────────────────────────────────────────
export interface CanvasRef {
    updateNodeData: (id: string, key: string, value: unknown) => void;
    saveWorkflow: () => void;
    loadWorkflow: (json: string) => void;
    autoLayout: () => void;
    getWorkflow: () => WorkflowState;
}
