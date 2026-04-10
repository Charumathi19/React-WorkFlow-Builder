import { CATEGORIES, SIDEBAR_NODES, NODE_REGISTRY } from '../../nodeRegistry';
import type { NodeCategory } from '../../types';

export default function Sidebar(): JSX.Element {
    const onDragStart = (e: React.DragEvent<HTMLDivElement>, nodeType: string): void => {
        e.dataTransfer.setData('application/reactflow', nodeType);
        e.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">
                    <span className="logo-icon">⚙️</span>
                    <span className="logo-text">FlowBuilder</span>
                </div>
                <div className="sidebar-logo-sub">Workflow Automation</div>
            </div>

            {(Object.keys(SIDEBAR_NODES) as NodeCategory[]).map((catKey) => {
                const cat = CATEGORIES[catKey];
                const nodeTypes = SIDEBAR_NODES[catKey];
                return (
                    <div key={catKey} className="sidebar-category">
                        <div className="sidebar-category-title" style={{ '--cat-color': cat.color } as React.CSSProperties}>
                            <span className="sidebar-category-dot" style={{ background: cat.color }} />
                            {cat.label}
                        </div>
                        {nodeTypes.map((type) => {
                            const meta = NODE_REGISTRY[type];
                            return (
                                <div
                                    key={type}
                                    className="sidebar-node-item"
                                    draggable
                                    onDragStart={(e) => onDragStart(e, type)}
                                    style={{ '--node-color': meta.color } as React.CSSProperties}
                                >
                                    <div
                                        className="sidebar-node-icon"
                                        style={{
                                            background: `${meta.color}20`,
                                            border: `1px solid ${meta.color}40`,
                                        }}
                                    >
                                        {meta.icon}
                                    </div>
                                    <div className="sidebar-node-info">
                                        <div className="sidebar-node-name">{meta.label}</div>
                                        {catKey === 'integrations' && (
                                            <div className="sidebar-node-badge">Integration</div>
                                        )}
                                        {catKey === 'advanced' && (
                                            <div className="sidebar-node-badge sidebar-node-badge-adv">Advanced</div>
                                        )}
                                    </div>
                                    <div className="sidebar-drag-dots">⠿</div>
                                </div>
                            );
                        })}
                    </div>
                );
            })}

            <div className="sidebar-footer">
                <p>Drag nodes · Click to configure</p>
                <p>✕ to delete · Delete key works too</p>
            </div>
        </aside>
    );
}
