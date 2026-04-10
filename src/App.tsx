import React, { useState, useRef, useCallback } from 'react';
import Sidebar from './components/sidebar/Sidebar';
import WorkflowCanvas from './components/canvas/WorkflowCanvas';
import ConfigPanel from './components/panel/ConfigPanel';
import type { CanvasRef } from './types';
import type { Node } from '@xyflow/react';
import type { NodeData } from './types';
import './App.css';

export default function App(): JSX.Element {
  const [selectedNode, setSelectedNode] = useState<Node<NodeData> | null>(null);
  const canvasRef = useRef<CanvasRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleNodeSelect = useCallback((node: Node<NodeData> | null) => {
    setSelectedNode(node);
  }, []);

  const handleUpdate = useCallback((id: string, key: string, value: unknown) => {
    canvasRef.current?.updateNodeData(id, key, value);
    setSelectedNode((prev) =>
      prev?.id === id
        ? { ...prev, data: { ...prev.data, [key]: value } as NodeData }
        : prev,
    );
  }, []);

  const handleSave = () => canvasRef.current?.saveWorkflow();
  const handleLayout = () => canvasRef.current?.autoLayout();
  const handleLoadClick = () => fileInputRef.current?.click();

  const handleFileLoad = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        canvasRef.current?.loadWorkflow(ev.target.result as string);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="app-root">
      <Sidebar />
      <div className="main-area">
        <div className="toolbar">
          <div className="toolbar-title">
            <span className="toolbar-logo">⚙️</span>
            <span>FlowBuilder</span>
            <span className="toolbar-subtitle">Workflow Automation</span>
          </div>
          <div className="toolbar-actions">
            <button className="btn-layout" onClick={handleLayout}>📐 Layout</button>
            <button className="btn-load" onClick={handleLoadClick}>📂 Load</button>
            <button className="btn-export" onClick={handleSave}>⬇ Save &amp; Download</button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleFileLoad}
            />
          </div>
        </div>

        <div className="canvas-panel-row">
          <WorkflowCanvas ref={canvasRef} onNodeSelect={handleNodeSelect} />
          <ConfigPanel
            node={selectedNode}
            onUpdate={handleUpdate}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      </div>
    </div>
  );
}
