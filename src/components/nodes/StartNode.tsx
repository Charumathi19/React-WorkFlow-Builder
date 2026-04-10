import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export default function StartNode({ selected }: NodeProps) {
    return (
        <div className={`node-start ${selected ? 'node-selected' : ''}`}>
            <div className="start-label">▶ Start</div>
            <Handle type="source" position={Position.Bottom} className="handle-bottom" />
        </div>
    );
}
