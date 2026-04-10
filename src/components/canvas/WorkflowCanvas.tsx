import React, {
    useCallback, useRef, forwardRef, useImperativeHandle,
} from 'react';
import {
    ReactFlow, Background, Controls, addEdge,
    useNodesState, useEdgesState,
} from '@xyflow/react';
import type { Node, Edge, Connection, NodeTypes, EdgeTypes } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { v4 as uuidv4 } from 'uuid';

import { NODE_REGISTRY } from '../../nodeRegistry';
import type { NodeData, CanvasRef } from '../../types';
import StartNode from '../nodes/StartNode';
import EndNode from '../nodes/EndNode';
import ConditionNode from '../nodes/ConditionNode';
import LoopNode from '../nodes/LoopNode';
import UniversalNode from '../nodes/UniversalNode';
import ButtonEdge from '../edges/ButtonEdge';

// ─── Node Type Map ─────────────────────────────────────────────────────────────
const UNIVERSAL_TYPES = [
    'sendEmail', 'pushNotification', 'apiRequest', 'delay',
    'setVariable', 'dataTransformer', 'gmail', 'slack', 'whatsapp',
    'customCode', 'webhookResponse', 'database',
] as const;

// Build stable component references for universal node types
const universalComponents: NodeTypes = {};
UNIVERSAL_TYPES.forEach((t) => {
    universalComponents[t] = (props) => <UniversalNode {...props} type={t} />;
});

const nodeTypes: NodeTypes = {
    start: StartNode,
    end: EndNode,
    condition: ConditionNode,
    loop: LoopNode,
    ...universalComponents,
};

const edgeTypes: EdgeTypes = { buttonEdge: ButtonEdge };

// ─── Initial State ─────────────────────────────────────────────────────────────
const INITIAL_NODES: Node<NodeData>[] = [
    { id: 'start', type: 'start', position: { x: 260, y: 40 }, data: {}, deletable: false },
];

// ─── Props ─────────────────────────────────────────────────────────────────────
interface WorkflowCanvasProps {
    onNodeSelect: (node: Node<NodeData> | null) => void;
}

// ─── Component ─────────────────────────────────────────────────────────────────
const WorkflowCanvas = forwardRef<CanvasRef, WorkflowCanvasProps>(
    function WorkflowCanvas({ onNodeSelect }, ref) {
        const [nodes, setNodes, onNodesChange] = useNodesState<NodeData>(INITIAL_NODES);
        const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
        const rfInstance = useRef<ReturnType<typeof import('@xyflow/react').useReactFlow> | null>(null);

        // ── Edge helpers ────────────────────────────────────────────────────────────
        const buildEdge = useCallback(
            (source: string, target: string, sourceHandle?: string): Edge => ({
                id: `${source}-${target}-${Date.now()}`,
                source, target,
                ...(sourceHandle ? { sourceHandle } : {}),
                type: 'buttonEdge',
                data: { onAdd: addNodeOnEdge },
            }),
            [],
        );

        // ── Insert node on edge midpoint ────────────────────────────────────────────
        const addNodeOnEdge = useCallback(
            (edgeId: string, position: { x: number; y: number }) => {
                setEdges((currentEdges) => {
                    const edge = currentEdges.find((e) => e.id === edgeId);
                    if (!edge) return currentEdges;
                    const newId = uuidv4();
                    const meta = NODE_REGISTRY.sendEmail;
                    setNodes((nds) => [
                        ...nds,
                        {
                            id: newId, type: 'sendEmail',
                            position: { x: position.x - 110, y: position.y },
                            data: { ...(meta.defaultData as NodeData) },
                        },
                    ]);
                    return [
                        ...currentEdges.filter((e) => e.id !== edgeId),
                        buildEdge(edge.source, newId, edge.sourceHandle ?? undefined),
                        buildEdge(newId, edge.target),
                    ];
                });
            },
            [setNodes, setEdges, buildEdge],
        );

        const onConnect = useCallback(
            (params: Connection) =>
                setEdges((eds) =>
                    addEdge({ ...params, type: 'buttonEdge', data: { onAdd: addNodeOnEdge } }, eds),
                ),
            [setEdges, addNodeOnEdge],
        );

        const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
        }, []);

        const onDrop = useCallback(
            (e: React.DragEvent<HTMLDivElement>) => {
                e.preventDefault();
                const type = e.dataTransfer.getData('application/reactflow') as keyof typeof NODE_REGISTRY;
                if (!type || !rfInstance.current) return;
                const position = rfInstance.current.screenToFlowPosition({ x: e.clientX, y: e.clientY });
                const meta = NODE_REGISTRY[type];
                setNodes((nds) => [
                    ...nds,
                    { id: uuidv4(), type, position, data: { ...(meta?.defaultData ?? {}) } as NodeData },
                ]);
            },
            [setNodes],
        );

        const onNodeClick = useCallback(
            (_: React.MouseEvent, node: Node<NodeData>) => onNodeSelect(node),
            [onNodeSelect],
        );

        const onPaneClick = useCallback(() => onNodeSelect(null), [onNodeSelect]);

        // ── Exposed API via ref ─────────────────────────────────────────────────────
        const updateNodeData = useCallback(
            (id: string, key: string, value: unknown) => {
                setNodes((nds) =>
                    nds.map((n) =>
                        n.id === id ? { ...n, data: { ...n.data, [key]: value } } : n,
                    ),
                );
            },
            [setNodes],
        );

        const saveWorkflow = useCallback(() => {
            const workflow = { nodes, edges, savedAt: new Date().toISOString() };
            const json = JSON.stringify(workflow, null, 2);
            localStorage.setItem('flowbuilder_workflow', json);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'workflow.json'; a.click();
            URL.revokeObjectURL(url);
        }, [nodes, edges]);

        const loadWorkflow = useCallback(
            (jsonString: string) => {
                try {
                    const data = JSON.parse(jsonString) as { nodes?: Node<NodeData>[]; edges?: Edge[] };
                    if (data.nodes) setNodes(data.nodes);
                    if (data.edges) setEdges(data.edges);
                } catch {
                    alert('Invalid workflow JSON');
                }
            },
            [setNodes, setEdges],
        );

        const autoLayout = useCallback(() => {
            const NODE_W = 240, NODE_H = 120, GAP_Y = 90, GAP_X = 70;
            const childrenMap: Record<string, string[]> = {};
            const visited = new Set<string>();
            nodes.forEach((n) => { childrenMap[n.id] = []; });
            edges.forEach((e) => { childrenMap[e.source]?.push(e.target); });

            const levelNodes: Record<number, { id: string }[]> = {};
            const levelCounter: Record<number, number> = {};
            const queue: { id: string; level: number }[] = [{ id: 'start', level: 0 }];

            while (queue.length) {
                const { id, level } = queue.shift()!;
                if (visited.has(id)) continue;
                visited.add(id);
                levelCounter[level] = (levelCounter[level] ?? 0) + 1;
                if (!levelNodes[level]) levelNodes[level] = [];
                levelNodes[level].push({ id });
                (childrenMap[id] ?? []).forEach((cid) => {
                    if (!visited.has(cid)) queue.push({ id: cid, level: level + 1 });
                });
            }

            const positions: Record<string, { x: number; y: number }> = {};
            (Object.keys(levelNodes).map(Number).sort((a, b) => a - b)).forEach((level) => {
                const items = levelNodes[level];
                const totalW = items.length * NODE_W + (items.length - 1) * GAP_X;
                items.forEach((item, idx) => {
                    positions[item.id] = {
                        x: -totalW / 2 + NODE_W / 2 + idx * (NODE_W + GAP_X),
                        y: level * (NODE_H + GAP_Y),
                    };
                });
            });

            setNodes((nds) =>
                nds.map((n) => (positions[n.id] ? { ...n, position: positions[n.id] } : n)),
            );
        }, [nodes, edges, setNodes]);

        useImperativeHandle(ref, () => ({
            updateNodeData,
            saveWorkflow,
            loadWorkflow,
            autoLayout,
            getWorkflow: () => ({ nodes, edges }),
        }));

        return (
            <div className="canvas-wrapper">
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    nodeTypes={nodeTypes}
                    edgeTypes={edgeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    onNodeClick={onNodeClick}
                    onPaneClick={onPaneClick}
                    onInit={(inst) => { (rfInstance as React.MutableRefObject<typeof inst>).current = inst; }}
                    fitView
                    deleteKeyCode="Delete"
                >
                    <Background color="#d1d5db" gap={20} size={1} variant={'dots' as any} />
                    <Controls showInteractive={false} />
                </ReactFlow>
            </div>
        );
    },
);

export default WorkflowCanvas;
