import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Database,
  GitBranch,
  Cpu,
  Network,
  CheckCircle2,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Download,
  Share2,
  Eye,
  Brain,
  Layers,
  ArrowRight,
  CircleDot,
  Hexagon,
  Box,
  Target
} from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'entity' | 'relation' | 'attribute' | 'concept';
  category: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  properties?: Record<string, any>;
  connections: string[];
}

interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  type: string;
  weight: number;
}

interface WorkflowStage {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  status: 'pending' | 'active' | 'complete';
  items: string[];
}

export function DataFusion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showWorkflow, setShowWorkflow] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const workflowStages: WorkflowStage[] = [
    {
      id: 'data-selection',
      name: '数据选择',
      description: '界定建模边界，识别业务对象和数据源',
      icon: Database,
      status: 'complete',
      items: ['目标系统识别', '数据源清单', '业务范围定义', '结构探查完成']
    },
    {
      id: 'schema-mapping',
      name: '数据源表',
      description: '将表结构转换为可建模的语义输入',
      icon: GitBranch,
      status: 'complete',
      items: ['表结构解析', '字段语义识别', '主键候选选择', '增量策略配置']
    },
    {
      id: 'data-processing',
      name: '数据处理',
      description: '清洗、规范化、衍生处理，生成图谱原料',
      icon: Cpu,
      status: 'active',
      items: ['格式统一', '枚举值标准化', '实体标识归并', '关系映射完成']
    },
    {
      id: 'subgraph-modeling',
      name: '子图建模',
      description: '定义实体、关系、属性和计算逻辑',
      icon: Network,
      status: 'pending',
      items: ['对象类型定义', '属性映射', '函数规则配置', 'Schema校验']
    },
    {
      id: 'ontology-library',
      name: '本体库',
      description: '沉淀统一语义资产，支持查询和推理',
      icon: Brain,
      status: 'pending',
      items: ['本体入库', '查询构建', 'API接口开放', 'MCP工具暴露']
    }
  ];

  const graphNodes: GraphNode[] = [
    // 核心概念层 (Concept)
    { id: 'c1', label: '作战域本体', type: 'concept', category: '核心概念', x: 600, y: 80, radius: 35, color: '#8b956d', connections: ['e1', 'e2', 'e3'], properties: { definition: '军事指挥领域的统一语义框架', version: 'v2.4' } },
    
    // 实体层 (Entity)
    { id: 'n1', label: 'SA-15防空系统', type: 'entity', category: '武器装备', x: 300, y: 200, radius: 28, color: '#8b4444', connections: ['e1', 'e4', 'e5'], properties: { type: '防空导弹系统', range: '12km', threatLevel: 'HIGH', status: 'ACTIVE' } },
    { id: 'n2', label: 'T-72坦克营', type: 'entity', category: '部队编制', x: 500, y: 280, radius: 28, color: '#d4a574', connections: ['e2', 'e6', 'e7'], properties: { strength: 'Medium', vehicles: 31, location: 'Obj LION' } },
    { id: 'n3', label: 'MQ-9死神', type: 'entity', category: '情报资产', x: 750, y: 200, radius: 28, color: '#5a7a8a', connections: ['e3', 'e8', 'e9'], properties: { type: 'UAV', endurance: '24h', sensors: ['EO/IR', 'SAR', 'SIGINT'] } },
    { id: 'n4', label: '伊朗革命卫队', type: 'entity', category: '组织机构', x: 200, y: 350, radius: 30, color: '#4a7c59', connections: ['e4', 'e10'], properties: { type: 'MilitaryForce', level: 'Strategic' } },
    { id: 'n5', label: '狮子目标区', type: 'entity', category: '地理区域', x: 450, y: 420, radius: 26, color: '#c9a050', connections: ['e5', 'e6', 'e11'], properties: { coordinates: '32.4°N, 53.7°E', priority: 'CRITICAL' } },
    { id: 'n6', label: '渡鸦目标区', type: 'entity', category: '地理区域', x: 700, y: 380, radius: 26, color: '#c9a050', connections: ['e7', 'e8', 'e12'], properties: { coordinates: '32.1°N, 54.2°E', priority: 'HIGH' } },
    { id: 'n7', label: 'Tomahawk导弹', type: 'entity', category: '武器装备', x: 900, y: 280, radius: 25, color: '#8b4444', connections: ['e9', 'e13'], properties: { type: 'CruiseMissile', range: '2500km', accuracy: '95%' } },

    // 关系层 (Relation)
    { id: 'r1', label: '部署于', type: 'relation', category: '空间关系', x: 380, y: 150, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r2', label: '隶属于', type: 'relation', category: '组织关系', x: 550, y: 180, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r3', label: '侦察', type: 'relation', category: '任务关系', x: 680, y: 140, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r4', label: '隶属', type: 'relation', category: '组织关系', x: 240, y: 270, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r5', label: '位于', type: 'relation', category: '空间关系', x: 380, y: 350, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r6', label: '包含', type: 'relation', category: '组成关系', x: 600, y: 350, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r7', label: '监视', type: 'relation', category: '任务关系', x: 720, y: 290, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r8', label: '打击', type: 'relation', category: '任务关系', x: 820, y: 230, radius: 18, color: '#6366f1', connections: [] },

    // 属性层 (Attribute)
    { id: 'a1', label: '威胁等级: HIGH', type: 'attribute', category: '评估指标', x: 150, y: 150, radius: 15, color: '#ef4444', connections: [] },
    { id: 'a2', label: '置信度: 94%', type: 'attribute', category: '评估指标', x: 850, y: 120, radius: 15, color: '#22c55e', connections: [] },
    { id: 'a3', label: '杀伤链时间: 4.2min', type: 'attribute', category: '性能指标', x: 1000, y: 180, radius: 15, color: '#f59e0b', connections: [] },
    { id: 'a4', label: '数据源: SIGINT', type: 'attribute', category: '元数据', x: 120, y: 450, radius: 15, color: '#06b6d4', connections: [] },
    { id: 'a5', label: '更新频率: 实时', type: 'attribute', category: '元数据', x: 900, y: 450, radius: 15, color: '#06b6d4', connections: [] }
  ];

  const graphEdges: GraphEdge[] = [
    { id: 'e1', source: 'c1', target: 'n1', label: '包含', type: 'composition', weight: 3 },
    { id: 'e2', source: 'c1', target: 'n2', label: '描述', type: 'description', weight: 2 },
    { id: 'e3', source: 'c1', target: 'n3', label: '监控', type: 'monitoring', weight: 2 },
    { id: 'e4', source: 'n1', target: 'n4', label: '隶属', type: 'affiliation', weight: 3 },
    { id: 'e5', source: 'n1', target: 'n5', label: '部署于', type: 'deployment', weight: 3 },
    { id: 'e6', source: 'n2', target: 'n5', label: '位于', type: 'location', weight: 2 },
    { id: 'e7', source: 'n2', target: 'n6', label: '机动至', type: 'movement', weight: 2 },
    { id: 'e8', source: 'n3', target: 'n6', label: '侦察', type: 'reconnaissance', weight: 3 },
    { id: 'e9', source: 'n3', target: 'n7', label: '引导', type: 'guide', weight: 2 },
    { id: 'e10', source: 'n4', target: 'a4', label: '来源', type: 'source', weight: 1 },
    { id: 'e11', source: 'n5', target: 'a1', label: '具有', type: 'hasAttribute', weight: 1 },
    { id: 'e12', source: 'n6', target: 'a2', label: '置信度', type: 'confidence', weight: 1 },
    { id: 'e13', source: 'n7', target: 'a3', label: '参数', type: 'parameter', weight: 1 }
  ];

  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    const getNodeById = (id: string) => graphNodes.find(n => n.id === id);

    // Draw grid background
    ctx.strokeStyle = 'rgba(33, 38, 45, 0.3)';
    ctx.lineWidth = 0.5;
    const gridSize = 40 * zoom;
    for (let x = -pan.x % gridSize; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = -pan.y % gridSize; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Draw edges
    graphEdges.forEach(edge => {
      const sourceNode = getNodeById(edge.source);
      const targetNode = getNodeById(edge.target);
      if (!sourceNode || !targetNode) return;

      const isHighlighted = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);

      // Curved line for better visualization
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2 - 20;
      ctx.quadraticCurveTo(midX, midY, targetNode.x, targetNode.y);

      ctx.strokeStyle = isHighlighted ? '#8b956d' : 'rgba(99, 102, 241, 0.4)';
      ctx.lineWidth = isHighlighted ? 2.5 : 1.5;
      ctx.stroke();

      // Edge label
      if (isHighlighted) {
        ctx.fillStyle = '#8b956d';
        ctx.font = '11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(edge.label, midX, midY - 8);
      }

      // Animated particles along edges
      const time = Date.now() / 1000;
      const particlePos = (Math.sin(time + edge.source.charCodeAt(0)) + 1) / 2;
      const px = sourceNode.x + (targetNode.x - sourceNode.x) * particlePos;
      const py = sourceNode.y + (targetNode.y - sourceNode.y) * particlePos;

      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = isHighlighted ? '#8b956d' : 'rgba(139, 149, 109, 0.6)';
      ctx.fill();
    });

    // Draw nodes
    graphNodes.forEach(node => {
      if (filterType !== 'all' && node.type !== filterType) return;
      if (searchTerm && !node.label.toLowerCase().includes(searchTerm.toLowerCase())) return;

      const isSelected = selectedNode?.id === node.id;
      const isHovered = hoveredNode?.id === node.id;
      let isConnected = false;
      if (selectedNode) {
        isConnected = selectedNode.connections.some(function(c) {
          var edge1 = graphEdges.find(function(e) { return e.id === c; });
          if (edge1 && edge1.source === node.id) return true;
          var edge2 = graphEdges.find(function(e) { return e.id === c; });
          if (edge2 && edge2.target === node.id) return true;
          return false;
        });
      }

      // Node glow effect
      if (isSelected || isHovered) {
        const gradient = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius * 2);
        gradient.addColorStop(0, `${node.color}40`);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // Connection highlight
      if (isConnected && !isSelected) {
        ctx.strokeStyle = `${node.color}60`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Node shape based on type
      ctx.fillStyle = isSelected ? node.color : isHovered ? node.color : `${node.color}cc`;
      ctx.strokeStyle = node.color;
      ctx.lineWidth = 2;

      ctx.beginPath();

      switch (node.type) {
        case 'concept':
          // Hexagon for concepts
          for (let i = 0; i < 6; i++) {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            const x = node.x + node.radius * Math.cos(angle);
            const y = node.y + node.radius * Math.sin(angle);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.closePath();
          break;
        case 'entity':
          // Rounded rectangle for entities
          const r = 6;
          const w = node.radius * 1.8;
          const h = node.radius * 1.2;
          ctx.roundRect(node.x - w/2, node.y - h/2, w, h, r);
          break;
        case 'relation':
          // Diamond for relations
          ctx.moveTo(node.x, node.y - node.radius);
          ctx.lineTo(node.x + node.radius, node.y);
          ctx.lineTo(node.x, node.y + node.radius);
          ctx.lineTo(node.x - node.radius, node.y);
          ctx.closePath();
          break;
        default:
          // Circle for attributes
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      }

      ctx.fill();
      if (!isSelected) ctx.stroke();

      // Node label
      ctx.fillStyle = isSelected ? '#ffffff' : '#e2e8f0';
      ctx.font = `${isSelected ? 'bold' : 'normal'} ${node.type === 'concept' ? '12px' : node.type === 'entity' ? '11px' : '10px'} sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      const lines = node.label.split(' ');
      if (lines.length > 1) {
        ctx.fillText(lines[0], node.x, node.y - 6);
        ctx.fillText(lines[1], node.x, node.y + 6);
      } else {
        ctx.fillText(node.label, node.x, node.y);
      }

      // Type badge
      if (isSelected || isHovered) {
        const typeColors: Record<string, string> = {
          concept: '#8b956d',
          entity: '#5a7a8a',
          relation: '#6366f1',
          attribute: '#06b6d4'
        };

        ctx.fillStyle = typeColors[node.type];
        ctx.font = '9px monospace';
        ctx.fillText(`[${node.category}]`, node.x, node.y + node.radius + 14);
      }

      // Pulse animation for active nodes
      if (node.properties?.status === 'ACTIVE') {
        const pulseRadius = node.radius + 8 + Math.sin(Date.now() / 300) * 4;
        ctx.beginPath();
        ctx.arc(node.x, node.y, pulseRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.3 - Math.sin(Date.now() / 300) * 0.15})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    });

    ctx.restore();
  }, [selectedNode, hoveredNode, zoom, pan, filterType, searchTerm]);

  useEffect(() => {
    drawGraph();
    const animationId = requestAnimationFrame(function animate() {
      drawGraph();
      requestAnimationFrame(animate);
    });
    return () => cancelAnimationFrame(animationId);
  }, [drawGraph]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const clickedNode = graphNodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius + 5;
    });

    if (clickedNode) {
      setSelectedNode(clickedNode);
    } else {
      setSelectedNode(null);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (isDragging) {
      const rect = canvas.getBoundingClientRect();
      setPan({
        x: e.clientX - rect.left - dragStart.x,
        y: e.clientY - rect.top - dragStart.y
      });
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    const hovered = graphNodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius + 5;
    });

    setHoveredNode(hovered || null);
    canvas.style.cursor = hovered ? 'pointer' : isDragging ? 'grabbing' : 'default';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - rect.left - pan.x,
      y: e.clientY - rect.top - pan.y
    });
    canvas.style.cursor = 'grabbing';
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = 'default';
    }
  };

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.3));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const stats = {
    totalNodes: graphNodes.length,
    totalEdges: graphEdges.length,
    concepts: graphNodes.filter(n => n.type === 'concept').length,
    entities: graphNodes.filter(n => n.type === 'entity').length,
    relations: graphNodes.filter(n => n.type === 'relation').length,
    attributes: graphNodes.filter(n => n.type === 'attribute').length
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-3 border-b border-[#21262d] bg-[#161b22]/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#8b956d]" />
              <h2 className="text-lg font-bold text-white">数据融合与本体建模</h2>
              <span className="text-xs text-slate-500 bg-[#21262d] px-2 py-1 rounded">ONTOFLOW ENGINE</span>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
                <Network className="w-3.5 h-3.5 text-[#8b956d]" />
                <span className="text-slate-400">节点:</span>
                <span className="text-white font-bold">{stats.totalNodes}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
                <GitBranch className="w-3.5 h-3.5 text-[#6366f1]" />
                <span className="text-slate-400">边:</span>
                <span className="text-white font-bold">{stats.totalEdges}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
                <Brain className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400">本体:</span>
                <span className="text-emerald-400 font-bold">v2.4</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Workflow */}
        {showWorkflow && (
          <div className="w-72 border-r border-[#21262d] bg-[#161b22]/30 overflow-y-auto p-4 space-y-3">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#21262d]">
              <h3 className="font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#8b956d]" />
                本体建模工作流
              </h3>
              <button onClick={() => setShowWorkflow(false)} className="p-1 hover:bg-[#21262d] rounded">
                ✕
              </button>
            </div>

            {workflowStages.map((stage, index) => {
              const isActive = stage.status === 'active';
              const isComplete = stage.status === 'complete';

              return (
                <div key={stage.id} className={`rounded-lg border p-3 transition-all ${
                  isActive ? 'border-[#8b956d] bg-[#8b956d]/10 shadow-lg shadow-[#8b956d]/20' :
                  isComplete ? 'border-[#4a7c59]/30 bg-[#4a7c59]/5' :
                  'border-[#21262d] bg-[#0d1117]'
                }`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      isActive ? 'bg-[#8b956d] animate-pulse' :
                      isComplete ? 'bg-[#4a7c59]' :
                      'bg-[#21262d]'
                    }`}>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-white" />
                      ) : (
                        <span className="text-sm font-bold text-slate-400">{index + 1}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-semibold text-sm ${
                          isActive ? 'text-[#8b956d]' : isComplete ? 'text-[#4a7c59]' : 'text-white'
                        }`}>{stage.name}</span>
                        {isActive && <div className="w-2 h-2 rounded-full bg-[#8b956d] animate-pulse" />}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">{stage.description}</p>

                      <div className="mt-2 space-y-1">
                        {stage.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                              isActive ? 'bg-[#8b956d]' : isComplete ? 'bg-[#4a7c59]' : 'bg-[#30363d]'
                            }`} />
                            <span className={isActive ? 'text-[#8b956d]' : isComplete ? 'text-[#4a7c59]' : 'text-slate-500'}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Progress connector */}
                  {index < workflowStages.length - 1 && (
                    <div className="ml-4 my-2 w-0.5 h-4 bg-[#21262d] relative">
                      <div className={`absolute top-0 left-0 h-full ${
                        isComplete ? 'bg-[#4a7c59]' : 'bg-[#30363d]'
                      }`} style={{ width: isComplete ? '100%' : '30%' }} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Main Content - Graph */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Toolbar */}
          <div className="px-4 py-2 border-b border-[#21262d] bg-[#0d1117] flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!showWorkflow && (
                <button
                  onClick={() => setShowWorkflow(true)}
                  className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white transition-colors"
                  title="显示工作流"
                >
                  <Layers className="w-4 h-4" />
                </button>
              )}

              <div className="h-5 w-px bg-[#21262d]" />

              {/* Filter buttons */}
              <button
                onClick={() => setFilterType('all')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  filterType === 'all' ? 'bg-[#8b956d] text-[#0d1117]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                全部
              </button>
              <button
                onClick={() => setFilterType('entity')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  filterType === 'entity' ? 'bg-[#5a7a8a] text-[#0d1117]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                实体
              </button>
              <button
                onClick={() => setFilterType('relation')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  filterType === 'relation' ? 'bg-[#6366f1] text-[#0d1117]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                关系
              </button>
              <button
                onClick={() => setFilterType('attribute')}
                className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                  filterType === 'attribute' ? 'bg-[#06b6d4] text-[#0d1117]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                }`}
              >
                属性
              </button>

              <div className="h-5 w-px bg-[#21262d]" />

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="搜索节点..."
                  className="pl-8 pr-3 py-1 bg-[#161b22] border border-[#21262d] rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8b956d] w-40"
                />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="缩小">
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 font-mono min-w-[45px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="放大">
                <ZoomIn className="w-4 h-4" />
              </button>
              <button onClick={handleResetView} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="重置视图">
                <Maximize2 className="w-4 h-4" />
              </button>
              <div className="h-5 w-px bg-[#21262d]" />
              <button className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="刷新">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="导出">
                <Download className="w-4 h-4" />
              </button>
              <button className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="分享">
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 relative bg-[#0a0f14] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={1200}
              height={700}
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="w-full h-full cursor-grab"
            />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-[#161b22]/90 backdrop-blur-sm border border-[#21262d] rounded-lg p-3">
              <h4 className="text-xs font-bold text-white mb-2">图例</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                <div className="flex items-center gap-2">
                  <Hexagon className="w-3 h-3 text-[#8b956d]" /> 
                  <span className="text-slate-400">核心概念</span>
                </div>
                <div className="flex items-center gap-2">
                  <Box className="w-3 h-3 text-[#5a7a8a]" /> 
                  <span className="text-slate-400">实体对象</span>
                </div>
                <div className="flex items-center gap-2">
                  <CircleDot className="w-3 h-3 text-[#6366f1]" /> 
                  <span className="text-slate-400">关系连接</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-3 h-3 text-[#06b6d4]" /> 
                  <span className="text-slate-400">属性值</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Node Details */}
        {selectedNode && (
          <div className="w-80 border-l border-[#21262d] bg-[#161b22] overflow-y-auto">
            <div className="p-4 border-b border-[#21262d] sticky top-0 bg-[#161b22] z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {selectedNode.type === 'concept' && <Hexagon className="w-5 h-5 text-[#8b956d]" />}
                  {selectedNode.type === 'entity' && <Box className="w-5 h-5 text-[#5a7a8a]" />}
                  {selectedNode.type === 'relation' && <CircleDot className="w-5 h-5 text-[#6366f1]" />}
                  {selectedNode.type === 'attribute' && <Target className="w-5 h-5 text-[#06b6d4]" />}
                  <h3 className="font-bold text-white">{selectedNode.label}</h3>
                </div>
                <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-[#21262d] rounded text-slate-400">
                  ✕
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              {/* Type & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">类型</span>
                  <span className="text-sm font-medium text-white capitalize">{selectedNode.type}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-1">分类</span>
                  <span className="text-sm font-medium" style={{ color: selectedNode.color }}>{selectedNode.category}</span>
                </div>
              </div>

              {/* Connections */}
              <div>
                <span className="text-[10px] text-slate-500 block mb-2">关联关系 ({selectedNode.connections.length})</span>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedNode.connections.map(edgeId => {
                    const edge = graphEdges.find(e => e.id === edgeId);
                    const connectedNodeId = edge?.source === selectedNode.id ? edge?.target : edge?.source;
                    const connectedNode = graphNodes.find(n => n.id === connectedNodeId);
                    return (
                      <div
                        key={edgeId}
                        onClick={() => {
                          if (connectedNode) setSelectedNode(connectedNode);
                        }}
                        className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#0d1117] hover:bg-[#21262d] cursor-pointer transition-colors"
                      >
                        <ArrowRight className="w-3 h-3 text-slate-500" />
                        <span className="text-xs text-slate-300 flex-1 truncate">{edge?.label}</span>
                        <span className="text-[10px] text-slate-500 truncate max-w-[80px]">{connectedNode?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Properties */}
              {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                <div>
                  <span className="text-[10px] text-slate-500 block mb-2">属性详情</span>
                  <div className="space-y-2">
                    {Object.entries(selectedNode.properties).map(([key, value]) => (
                      <div key={key} className="flex items-start justify-between py-1.5 px-2 rounded bg-[#0d1117]">
                        <span className="text-xs text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="text-xs font-medium text-white ml-2 text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="pt-3 border-t border-[#21262d] space-y-2">
                <button className="w-full py-2 rounded text-xs font-medium bg-[#8b956d] text-[#0d1117] hover:bg-[#9ba57d] transition-colors flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> 查看详情
                </button>
                <button className="w-full py-2 rounded text-xs font-medium bg-[#161b22] text-slate-300 border border-[#21262d] hover:border-[#30363d] transition-colors flex items-center justify-center gap-1.5">
                  <Network className="w-3.5 h-3.5" /> 展开子图
                </button>
                <button
                  onClick={() => {
                    alert(`已将"${selectedNode.label}"添加到查询构建器`);
                  }}
                  className="w-full py-2 rounded text-xs font-medium bg-[#161b22] text-slate-300 border border-[#21262d] hover:border-[#30363d] transition-colors flex items-center justify-center gap-1.5"
                >
                  <Database className="w-3.5 h-3.5" /> 构建查询
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}