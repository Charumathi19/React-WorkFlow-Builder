import { Handle, Position, useReactFlow } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import type { ConditionData } from '../../types';

export default function ConditionNode({ id, data, selected }: NodeProps<ConditionData>) {
    const { deleteElements } = useReactFlow();
    const d = data as ConditionData;

    return (
        <div
            className={`node-card ${selected ? 'node-selected' : ''}`}
            style={{ '--node-accent': '#d97706' } as React.CSSProperties}
        >
            <Handle type="target" position={Position.Top} className="handle-top" />

            <div className="node-header">
                <div className="node-header-left">
                    <span className="node-icon-badge" style={{ background: '#d9770618' }}>🔀</span>
                    <div>
                        <div className="node-name">Condition Split</div>
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
                <button className="node-cta-btn node-cta-condition">
                    {d?.field ? `✓ ${d.field} ${d.operator ?? ''} ${d.value ?? ''}` : 'Set Up Condition'}
                </button>
            </div>

            <div className="condition-handle-labels">
                <span className="condition-label condition-yes">Yes</span>
                <span className="condition-label condition-no">No</span>
            </div>

            <Handle type="source" position={Position.Bottom} id="yes"
                style={{ left: '30%' }} className="handle-bottom handle-yes" />
            <Handle type="source" position={Position.Bottom} id="no"
                style={{ left: '70%' }} className="handle-bottom handle-no" />
        </div>
    );
}
