import type { Node } from '@xyflow/react';
import type { NodeData, NodeType } from '../../types';
import { NODE_REGISTRY } from '../../nodeRegistry';

// ─── Sub-components ───────────────────────────────────────────────────────────
const FIELD = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div className="config-field">
        <label className="config-label">{label}</label>
        {children}
    </div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input className="config-input" {...props} />
);

const TextArea = ({ rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { rows?: number }) => (
    <textarea className="config-input config-textarea" rows={rows} {...props} />
);

const Select = ({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) => (
    <select className="config-input config-select" {...props}>{children}</select>
);

const CodeArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
    <textarea className="config-input config-code" rows={8} spellCheck={false} {...props} />
);

const MockBadge = ({ label }: { label: string }) => (
    <div className="config-mock-badge">🔌 {label} — Mock Integration (UI only)</div>
);

// ─── Props ─────────────────────────────────────────────────────────────────────
interface ConfigPanelProps {
    node: Node<NodeData> | null;
    onUpdate: (id: string, key: string, value: unknown) => void;
    onClose: () => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
export default function ConfigPanel({ node, onUpdate, onClose }: ConfigPanelProps): JSX.Element | null {
    if (!node || node.type === 'start' || node.type === 'end') return null;

    const type = node.type as NodeType;
    const data = (node.data ?? {}) as Record<string, unknown>;
    const meta = NODE_REGISTRY[type] ?? { label: type, icon: '⚙️', color: '#6b7280', typeLabel: 'node', category: null };

    const ch = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
        onUpdate(node.id, key, e.target.value);

    const renderFields = (): React.ReactNode => {
        switch (type) {
            case 'sendEmail':
                return <>
                    <FIELD label="To"><Input type="email" placeholder="recipient@example.com" value={(data.to as string) || ''} onChange={ch('to')} /></FIELD>
                    <FIELD label="Subject"><Input type="text" placeholder="Email subject" value={(data.subject as string) || ''} onChange={ch('subject')} /></FIELD>
                    <FIELD label="Message"><TextArea placeholder="Email body..." rows={5} value={(data.message as string) || ''} onChange={ch('message')} /></FIELD>
                </>;

            case 'pushNotification':
                return <>
                    <FIELD label="Title"><Input type="text" placeholder="Notification title" value={(data.title as string) || ''} onChange={ch('title')} /></FIELD>
                    <FIELD label="Message"><TextArea placeholder="Notification body..." value={(data.message as string) || ''} onChange={ch('message')} /></FIELD>
                    <FIELD label="Action URL (optional)"><Input type="url" placeholder="https://..." value={(data.url as string) || ''} onChange={ch('url')} /></FIELD>
                </>;

            case 'apiRequest':
                return <>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <FIELD label="Method">
                            <Select value={(data.method as string) || 'GET'} onChange={ch('method')} style={{ width: 100 }}>
                                {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map(m => <option key={m}>{m}</option>)}
                            </Select>
                        </FIELD>
                        <FIELD label="URL">
                            <Input type="url" placeholder="https://api.example.com/endpoint" value={(data.url as string) || ''} onChange={ch('url')} />
                        </FIELD>
                    </div>
                    <FIELD label="Headers (JSON)"><CodeArea placeholder='{\n  "Authorization": "Bearer token"\n}' value={(data.headers as string) || ''} onChange={ch('headers')} rows={4} /></FIELD>
                    <FIELD label="Body (JSON)"><CodeArea placeholder='{\n  "key": "value"\n}' value={(data.body as string) || ''} onChange={ch('body')} rows={4} /></FIELD>
                    <div className="config-hint">Output: response body is passed to the next node</div>
                </>;

            case 'delay':
                return <>
                    <FIELD label="Duration">
                        <div style={{ display: 'flex', gap: 8 }}>
                            <Input type="number" min={1} value={(data.duration as number) || 1} onChange={ch('duration')} style={{ width: 100 }} />
                            <Select value={(data.unit as string) || 'seconds'} onChange={ch('unit')}>
                                <option value="seconds">Seconds</option>
                                <option value="minutes">Minutes</option>
                                <option value="hours">Hours</option>
                                <option value="days">Days</option>
                            </Select>
                        </div>
                    </FIELD>
                    <div className="config-hint">⏱ Execution pauses for this duration before continuing.</div>
                </>;

            case 'condition':
                return <>
                    <FIELD label="Field / Variable"><Input type="text" placeholder="e.g. data.status" value={(data.field as string) || ''} onChange={ch('field')} /></FIELD>
                    <FIELD label="Operator">
                        <Select value={(data.operator as string) || 'equals'} onChange={ch('operator')}>
                            {['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'is_empty', 'is_not_empty'].map(op =>
                                <option key={op} value={op}>{op.replace(/_/g, ' ')}</option>
                            )}
                        </Select>
                    </FIELD>
                    <FIELD label="Value"><Input type="text" placeholder="comparison value" value={(data.value as string) || ''} onChange={ch('value')} /></FIELD>
                    <div className="config-hint-box">
                        <span className="hint-badge hint-yes">Yes → left</span>
                        <span className="hint-badge hint-no">No → right</span>
                    </div>
                </>;

            case 'loop':
                return <>
                    <FIELD label="Array / Collection"><Input type="text" placeholder="e.g. data.items" value={(data.source as string) || ''} onChange={ch('source')} /></FIELD>
                    <FIELD label="Max Iterations"><Input type="number" min={1} max={1000} value={(data.maxIterations as number) || 10} onChange={ch('maxIterations')} /></FIELD>
                    <div className="config-hint-box">
                        <span className="hint-badge" style={{ background: '#dbeafe', color: '#1e40af' }}>Item → loop body</span>
                        <span className="hint-badge" style={{ background: '#f3f4f6', color: '#374151' }}>Done → after loop</span>
                    </div>
                </>;

            case 'setVariable':
                return <>
                    <FIELD label="Variable Name"><Input type="text" placeholder="myVariable" value={(data.name as string) || ''} onChange={ch('name')} /></FIELD>
                    <FIELD label="Value"><Input type="text" placeholder="value or {{expression}}" value={(data.value as string) || ''} onChange={ch('value')} /></FIELD>
                    <FIELD label="Type">
                        <Select value={(data.type as string) || 'string'} onChange={ch('type')}>
                            {['string', 'number', 'boolean', 'object', 'array'].map(t => <option key={t} value={t}>{t}</option>)}
                        </Select>
                    </FIELD>
                    <div className="config-hint">Available as <code>{`{{${(data.name as string) || 'name'}}}`}</code> in subsequent nodes.</div>
                </>;

            case 'dataTransformer':
                return <>
                    <FIELD label="Output Key (optional)"><Input type="text" placeholder="transformed" value={(data.outputKey as string) || ''} onChange={ch('outputKey')} /></FIELD>
                    <FIELD label="Transform Expression (JavaScript)">
                        <CodeArea rows={10} value={(data.expression as string) || ''} onChange={ch('expression')}
                            placeholder={'// `data` contains the input\nreturn {\n  ...data,\n  fullName: data.first + " " + data.last,\n};'} />
                    </FIELD>
                    <div className="config-hint">💡 Use JavaScript. Access previous node output via <code>data</code>.</div>
                </>;

            case 'gmail':
                return <>
                    <MockBadge label="Gmail" />
                    <FIELD label="To"><Input type="email" placeholder="recipient@gmail.com" value={(data.to as string) || ''} onChange={ch('to')} /></FIELD>
                    <FIELD label="CC (optional)"><Input type="email" placeholder="cc@gmail.com" value={(data.cc as string) || ''} onChange={ch('cc')} /></FIELD>
                    <FIELD label="Subject"><Input type="text" placeholder="Email subject" value={(data.subject as string) || ''} onChange={ch('subject')} /></FIELD>
                    <FIELD label="Body (HTML)"><TextArea rows={6} placeholder="<p>Hello {{name}},</p>" value={(data.body as string) || ''} onChange={ch('body')} /></FIELD>
                </>;

            case 'slack':
                return <>
                    <MockBadge label="Slack" />
                    <FIELD label="Channel"><Input type="text" placeholder="#general" value={(data.channel as string) || ''} onChange={ch('channel')} /></FIELD>
                    <FIELD label="Message"><TextArea rows={4} placeholder="Your message here..." value={(data.message as string) || ''} onChange={ch('message')} /></FIELD>
                    <FIELD label="Bot Username"><Input type="text" placeholder="WorkflowBot" value={(data.username as string) || ''} onChange={ch('username')} /></FIELD>
                </>;

            case 'whatsapp':
                return <>
                    <MockBadge label="WhatsApp Business" />
                    <FIELD label="Phone Number"><Input type="tel" placeholder="+1234567890" value={(data.phone as string) || ''} onChange={ch('phone')} /></FIELD>
                    <FIELD label="Message"><TextArea rows={4} placeholder="Hello {{name}}!" value={(data.message as string) || ''} onChange={ch('message')} /></FIELD>
                    <FIELD label="Template Name (optional)"><Input type="text" placeholder="hello_world" value={(data.template as string) || ''} onChange={ch('template')} /></FIELD>
                </>;

            case 'customCode':
                return <>
                    <div className="config-code-header">
                        <span>JavaScript</span>
                        <span className="config-badge">{'{ } Editor'}</span>
                    </div>
                    <FIELD label="Code">
                        <CodeArea rows={14} value={(data.code as string) || ''} onChange={ch('code')}
                            placeholder={'// Input from previous node\nconst result = data;\nreturn result;'} />
                    </FIELD>
                    <div className="config-hint">💡 <code>data</code> contains the input. Return your result.</div>
                </>;

            case 'webhookResponse':
                return <>
                    <FIELD label="Status Code">
                        <Select value={(data.statusCode as number) || 200} onChange={ch('statusCode')}>
                            {[200, 201, 204, 400, 401, 403, 404, 500].map(c => <option key={c}>{c}</option>)}
                        </Select>
                    </FIELD>
                    <FIELD label="Response Headers (JSON)"><CodeArea rows={3} placeholder='{ "Content-Type": "application/json" }' value={(data.headers as string) || ''} onChange={ch('headers')} /></FIELD>
                    <FIELD label="Response Body (JSON)"><CodeArea rows={5} placeholder='{ "success": true }' value={(data.body as string) || ''} onChange={ch('body')} /></FIELD>
                </>;

            case 'database':
                return <>
                    <FIELD label="Operation">
                        <Select value={(data.operation as string) || 'select'} onChange={ch('operation')}>
                            {['select', 'insert', 'update', 'delete'].map(op => <option key={op} value={op}>{op.toUpperCase()}</option>)}
                        </Select>
                    </FIELD>
                    <FIELD label="Table / Collection"><Input type="text" placeholder="users" value={(data.table as string) || ''} onChange={ch('table')} /></FIELD>
                    <FIELD label="Conditions / WHERE"><CodeArea rows={3} placeholder='{ "id": "{{data.userId}}" }' value={(data.conditions as string) || ''} onChange={ch('conditions')} /></FIELD>
                    {(['insert', 'update'] as string[]).includes((data.operation as string) || 'select') && (
                        <FIELD label="Data / SET"><CodeArea rows={4} placeholder='{ "name": "{{data.name}}" }' value={(data.data as string) || ''} onChange={ch('data')} /></FIELD>
                    )}
                    <div className="config-hint">🗄 Mock database — configure for backend integration.</div>
                </>;

            default:
                return <div className="config-hint">No configuration available for this node type.</div>;
        }
    };

    return (
        <aside className="config-panel">
            <div
                className="config-header"
                style={{ '--panel-accent': meta.color } as React.CSSProperties}
            >
                <div className="config-title">
                    <span className="config-icon">{meta.icon}</span>
                    {meta.label}
                </div>
                <div className="config-header-right">
                    <span
                        className="config-badge config-badge-special"
                        style={{
                            background: `${meta.color}18`,
                            color: meta.color,
                            borderColor: `${meta.color}35`,
                        }}
                    >
                        {meta.typeLabel}
                    </span>
                    <button className="config-close" onClick={onClose}>✕</button>
                </div>
            </div>

            <div className="config-body">{renderFields()}</div>

            <div className="config-footer">
                <span className="config-node-id">Node · {node.id.slice(0, 8)}…</span>
                <span className="config-node-type">{type}</span>
            </div>
        </aside>
    );
}
