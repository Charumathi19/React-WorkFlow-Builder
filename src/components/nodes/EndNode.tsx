import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';

export default function EndNode({ selected }: NodeProps) {
    return (
        <div className={`node-end ${selected ? 'node-selected' : ''}`}>
            <Handle type="target" position={Position.Top} className="handle-top" />
            <div className="end-label">⏹ End</div>
        </div>
    );
}
