import { useState, useRef, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Sidebar from './components/sidebar/Sidebar';
import WorkflowCanvas from './components/canvas/WorkflowCanvas';
import ConfigPanel from './components/panel/ConfigPanel';
import type { CanvasRef } from './types';
import type { Node } from '@xyflow/react';
import type { NodeData } from './types';
import './App.css';

// AMS Pages & Layout
import AmsLayout from './ams/components/layout/AmsLayout';
import Dashboard from './ams/pages/Dashboard';
import CasesList from './ams/pages/CasesList';
import NewCase from './ams/pages/NewCase';
import CaseDetail from './ams/pages/CaseDetail';
import DomainManagement from './ams/pages/DomainManagement';
import KeywordManagement from './ams/pages/KeywordManagement';
import AuditLog from './ams/pages/AuditLog';
import Analytics from './ams/pages/Analytics';

// ─── Workflow Builder page ────────────────────────────────────────────────────
function WorkflowBuilder() {
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
      <SidebarWithScreeningLink />
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

// ─── Workflow sidebar enriched with AMS link ──────────────────────────────────
function SidebarWithScreeningLink() {
  const location = useLocation();
  const isAms = location.pathname.startsWith('/ams');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
      <Sidebar />
      {/* Screening platform shortcut pinned at bottom of existing sidebar */}
      <div
        style={{
          position: 'absolute',
          bottom: 64,
          left: 0,
          right: 0,
          padding: '0 10px',
        }}
      >
        <Link
          to="/ams"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '9px 10px',
            borderRadius: 7,
            fontSize: 13,
            fontWeight: 600,
            textDecoration: 'none',
            background: isAms ? 'rgba(232,83,10,0.15)' : 'rgba(232,83,10,0.08)',
            color: isAms ? '#e8530a' : '#cc4a08',
            border: '1px solid rgba(232,83,10,0.25)',
            transition: 'background 0.15s',
          }}
        >
          🛡️ Screening Platform
        </Link>
      </div>
    </div>
  );
}

// ─── App (Router root) ────────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Workflow Builder */}
      <Route path="/" element={<WorkflowBuilder />} />

      {/* Adverse Media Screening Platform */}
      <Route path="/ams" element={<AmsLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="cases" element={<CasesList />} />
        <Route path="cases/new" element={<NewCase />} />
        <Route path="cases/:id" element={<CaseDetail />} />
        <Route path="domains" element={<DomainManagement />} />
        <Route path="keywords" element={<KeywordManagement />} />
        <Route path="audit" element={<AuditLog />} />
        <Route path="analytics" element={<Analytics />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
