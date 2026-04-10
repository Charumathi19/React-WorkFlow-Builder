import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { LoopData } from '../../types';

export default function LoopNode({ id, data, selected }: NodeProps<LoopData>) {
    const { deleteElements } = useReactFlow();
    const d = data as LoopData;

    return (
        <div
            className={`node-card ${selected ? 'node-selected' : ''}`}
            style={{ '--node-accent': '#c2410c' } as React.CSSProperties}
        >
            <Handle type="target" position={Position.Top} className="handle-top" />

            <div className="node-header">
                <div className="node-header-left">
                    <span className="node-icon-badge" style={{ background: '#c2410c18' }}>🔁</span>
                    <div>
                        <div className="node-name">Loop / Iterator</div>
                        <div className="node-type-label">logic</div>
                    </div>
                </div>
                <button
                    className="node-delete-btn"
                    onClick={(e) => { e.stopPropagation(); deleteElements({ nodes: [{ id }] }); }}
                    title="Delete"
                >
                    ✕
                </button>
            </div>

            <div className="node-body">
                <button className="node-cta-btn">
                    {d?.source
                        ? `✓ ${d.source} (max ${d.maxIterations})`
                        : 'Configure Loop'}
                </button>
            </div>

            <div className="condition-handle-labels">
                <span className="condition-label" style={{ background: '#dbeafe', color: '#1e40af' }}>Item</span>
                <span className="condition-label" style={{ background: '#f3f4f6', color: '#374151' }}>Done</span>
            </div>

            <Handle type="source" position={Position.Bottom} id="item"
                style={{ left: '30%', background: '#3b82f6' }} className="handle-bottom" />
            <Handle type="source" position={Position.Bottom} id="done"
                style={{ left: '70%' }} className="handle-bottom" />
        </div>
    );
}
