import React from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getStraightPath,
    useReactFlow,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';

interface ButtonEdgeData {
    onAdd?: (edgeId: string, position: { x: number; y: number }) => void;
    [key: string]: unknown;
}

export default function ButtonEdge({
    id,
    sourceX, sourceY, targetX, targetY,
    data,
}: EdgeProps<ButtonEdgeData>) {
    const [edgePath, labelX, labelY] = getStraightPath({ sourceX, sourceY, targetX, targetY });
    const { screenToFlowPosition } = useReactFlow();

    const handleAdd = (e: React.MouseEvent) => {
        e.stopPropagation();
        const flowPos = screenToFlowPosition({ x: labelX, y: labelY });
        (data as ButtonEdgeData)?.onAdd?.(id, flowPos);
    };

    return (
        <>
            <BaseEdge id={id} path={edgePath} style={{ stroke: '#94a3b8', strokeWidth: 1.5 }} />
            <EdgeLabelRenderer>
                <div
                    style={{
                        position: 'absolute',
                        transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
                        pointerEvents: 'all',
                    }}
                >
                    <button className="edge-add-btn" onClick={handleAdd}>+</button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
}
