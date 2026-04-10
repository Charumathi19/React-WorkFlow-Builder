import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { NodeData } from '../../types';
import { NODE_REGISTRY } from '../../nodeRegistry';

type UniversalNodeProps = NodeProps & {
    data: NodeData;
};

export default function UniversalNode({ id, type = 'sendEmail', data, selected }: UniversalNodeProps) {
    const { deleteElements } = useReactFlow();
    const meta = NODE_REGISTRY[type as keyof typeof NODE_REGISTRY] ?? {
        label: type, icon: '⚙️', color: '#6b7280', typeLabel: 'node', defaultData: {},
    };

    const isConfigured =
        data != null &&
        Object.values(data as Record<string, unknown>).some((v) => v !== '' && v != null);

    return (
        <div
            className={`node-card ${selected ? 'node-selected' : ''}`}
            style={{ '--node-accent': meta.color } as React.CSSProperties}
        >
            <Handle type="target" position={Position.Top} className="handle-top" />

            <div className="node-header">
                <div className="node-header-left">
                    <span className="node-icon-badge" style={{ background: `${meta.color}18` }}>
                        {meta.icon}
                    </span>
                    <div>
                        <div className="node-name">{meta.label}</div>
                        <div className="node-type-label">{meta.typeLabel}</div>
                    </div>
                </div>
                <button
                    className="node-delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteElements({ nodes: [{ id }] }); }}
                    title="Delete node"
                >
                    ✕
                </button>
            </div>

            <div className="node-body">
                <button className="node-cta-btn">
                    {isConfigured ? '✓ Configured' : `Set Up ${meta.label}`}
                </button>
            </div>

            <Handle type="source" position={Position.Bottom} className="handle-bottom" />
        </div>
    );
}
