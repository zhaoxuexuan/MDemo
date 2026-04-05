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
  Target,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Activity,
  BarChart3,
  Play,
  FileCode2,
  TreePine,
  Sparkles,
  Radio,
  Users,
  Globe
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

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
  progress: number;
  items: string[];
  details?: string;
}

interface DataSource {
  id: string;
  name: string;
  type: 'SIGINT' | 'IMINT' | 'HUMINT' | 'OSINT' | 'MASINT';
  status: 'active' | 'syncing' | 'error' | 'idle';
  recordCount: number;
  lastSync: string;
  quality: number;
  conflicts: number;
}

type LeftPanelTab = 'workflow' | 'datasources' | 'ontology';
type RightPanelView = 'details' | 'dashboard' | 'query';

const typeIcons: Record<string, React.ElementType> = {
  concept: Hexagon,
  entity: Box,
  relation: CircleDot,
  attribute: Target,
};

const typeColors: Record<string, string> = {
  concept: '#8b956d',
  entity: '#5a7a8a',
  relation: '#6366f1',
  attribute: '#06b6d4',
};

const dataSourceTypeConfig: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  SIGINT: { color: '#8b4444', icon: Radio, label: '信号情报' },
  IMINT: { color: '#5a7a8a', icon: Eye, label: '图像情报' },
  HUMINT: { color: '#4a7c59', icon: Users, label: '人力情报' },
  OSINT: { color: '#c9a050', icon: Globe, label: '开源情报' },
  MASINT: { color: '#6366f1', icon: Cpu, label: '测量情报' },
};

export function DataFusion() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const miniMapRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [leftPanelTab, setLeftPanelTab] = useState<LeftPanelTab>('workflow');
  const [rightPanelView, setRightPanelView] = useState<RightPanelView>('dashboard');
  const [filterType, setFilterType] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedWorkflowStage, setExpandedWorkflowStage] = useState<string | null>('data-processing');
  const toast = useToast();
  const [canvasSize, setCanvasSize] = useState({ width: 1200, height: 700 });

  const workflowStages: WorkflowStage[] = [
    {
      id: 'data-selection', name: '数据选择', description: '界定建模边界，识别业务对象和数据源',
      icon: Database, status: 'complete', progress: 100,
      items: ['目标系统识别', '数据源清单', '业务范围定义', '结构探查完成'],
      details: '已完成5个核心业务域的边界识别，确认12个关键实体类型和47个属性字段。'
    },
    {
      id: 'schema-mapping', name: '数据源表', description: '将表结构转换为可建模的语义输入',
      icon: GitBranch, status: 'complete', progress: 100,
      items: ['表结构解析', '字段语义识别', '主键候选选择', '增量策略配置'],
      details: '完成3个异构数据源的Schema映射，建立18张表的语义对应关系。'
    },
    {
      id: 'data-processing', name: '数据处理', description: '清洗、规范化、衍生处理，生成图谱原料',
      icon: Cpu, status: 'active', progress: 68,
      items: ['格式统一', '枚举值标准化', '实体标识归并', '关系映射完成'],
      details: '正在执行第3轮数据清洗，已处理28,456条记录，检测到3处数据冲突待解决。'
    },
    {
      id: 'subgraph-modeling', name: '子图建模', description: '定义实体、关系、属性和计算逻辑',
      icon: Network, status: 'pending', progress: 15,
      items: ['对象类型定义', '属性映射', '函数规则配置', 'Schema校验'],
      details: '等待数据处理阶段完成后启动。'
    },
    {
      id: 'ontology-library', name: '本体库', description: '沉淀统一语义资产，支持查询和推理',
      icon: Brain, status: 'pending', progress: 0,
      items: ['本体入库', '查询构建', 'API接口开放', 'MCP工具暴露'],
      details: '最终阶段：将融合后的知识图谱沉淀为可复用的本体资产。'
    }
  ];

  const dataSources: DataSource[] = [
    { id: 'ds1', name: 'SIGINT-Alpha链路', type: 'SIGINT', status: 'active', recordCount: 15420, lastSync: '刚刚', quality: 94, conflicts: 2 },
    { id: 'ds2', name: 'IMINT-卫星图像', type: 'IMINT', status: 'syncing', recordCount: 3890, lastSync: '2分钟前', quality: 89, conflicts: 5 },
    { id: 'ds3', name: 'HUMINT-线人报告', type: 'HUMINT', status: 'active', recordCount: 567, lastSync: '15分钟前', quality: 72, conflicts: 12 },
    { id: 'ds4', name: 'OSINT-社交媒体', type: 'OSINT', status: 'error', recordCount: 12450, lastSync: '1小时前', quality: 61, conflicts: 23 },
    { id: 'ds5', name: 'MASINT-雷达特征', type: 'MASINT', status: 'idle', recordCount: 8934, lastSync: '30分钟前', quality: 97, conflicts: 0 },
  ];

  const ontologyTree = [
    {
      name: '作战域本体', children: [
        { name: '武器装备', children: [
          { name: '防空系统', count: 3 }, { name: '装甲车辆', count: 5 }, { name: '导弹', count: 4 }
        ]},
        { name: '部队编制', children: [
          { name: '作战单元', count: 8 }, { name: '指挥层级', count: 4 }
        ]},
        { name: '地理区域', children: [
          { name: '目标区', count: 6 }, { name: '禁飞区', count: 3 }
        ]},
        { name: '情报资产', children: [
          { name: '侦察平台', count: 4 }, { name: '传感器', count: 7 }
        ]}
      ]
    }
  ];

  const graphNodes: GraphNode[] = [
    { id: 'c1', label: '作战域本体', type: 'concept', category: '核心概念', x: 600, y: 80, radius: 35, color: '#8b956d', connections: ['e1', 'e2', 'e3'], properties: { definition: '军事指挥领域的统一语义框架', version: 'v2.4' } },
    { id: 'n1', label: 'SA-15防空系统', type: 'entity', category: '武器装备', x: 300, y: 200, radius: 28, color: '#8b4444', connections: ['e1', 'e4', 'e5'], properties: { type: '防空导弹系统', range: '12km', threatLevel: 'HIGH', status: 'ACTIVE' } },
    { id: 'n2', label: 'T-72坦克营', type: 'entity', category: '部队编制', x: 500, y: 280, radius: 28, color: '#d4a574', connections: ['e2', 'e6', 'e7'], properties: { strength: 'Medium', vehicles: 31, location: 'Obj LION' } },
    { id: 'n3', label: 'MQ-9死神', type: 'entity', category: '情报资产', x: 750, y: 200, radius: 28, color: '#5a7a8a', connections: ['e3', 'e8', 'e9'], properties: { type: 'UAV', endurance: '24h', sensors: ['EO/IR', 'SAR', 'SIGINT'] } },
    { id: 'n4', label: '伊朗革命卫队', type: 'entity', category: '组织机构', x: 200, y: 350, radius: 30, color: '#4a7c59', connections: ['e4', 'e10'], properties: { type: 'MilitaryForce', level: 'Strategic' } },
    { id: 'n5', label: '狮子目标区', type: 'entity', category: '地理区域', x: 450, y: 420, radius: 26, color: '#c9a050', connections: ['e5', 'e6', 'e11'], properties: { coordinates: '32.4°N, 53.7°E', priority: 'CRITICAL' } },
    { id: 'n6', label: '渡鸦目标区', type: 'entity', category: '地理区域', x: 700, y: 380, radius: 26, color: '#c9a050', connections: ['e7', 'e8', 'e12'], properties: { coordinates: '32.1°N, 54.2°E', priority: 'HIGH' } },
    { id: 'n7', label: 'Tomahawk导弹', type: 'entity', category: '武器装备', x: 900, y: 280, radius: 25, color: '#8b4444', connections: ['e9', 'e13'], properties: { type: 'CruiseMissile', range: '2500km', accuracy: '95%' } },
    { id: 'r1', label: '部署于', type: 'relation', category: '空间关系', x: 380, y: 150, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r2', label: '隶属于', type: 'relation', category: '组织关系', x: 550, y: 180, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r3', label: '侦察', type: 'relation', category: '任务关系', x: 680, y: 140, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r4', label: '隶属', type: 'relation', category: '组织关系', x: 240, y: 270, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r5', label: '位于', type: 'relation', category: '空间关系', x: 380, y: 350, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r6', label: '包含', type: 'relation', category: '组成关系', x: 600, y: 350, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r7', label: '监视', type: 'relation', category: '任务关系', x: 720, y: 290, radius: 18, color: '#6366f1', connections: [] },
    { id: 'r8', label: '打击', type: 'relation', category: '任务关系', x: 820, y: 230, radius: 18, color: '#6366f1', connections: [] },
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

  // Responsive canvas sizing
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setCanvasSize({ width: Math.floor(width), height: Math.floor(height) });
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const drawGraph = useCallback((canvas: HTMLCanvasElement, isMiniMap = false) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scale = isMiniMap ? 0.12 : zoom;
    const offsetX = isMiniMap ? -100 : pan.x;
    const offsetY = isMiniMap ? -50 : pan.y;

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const getNodeById = (id: string) => graphNodes.find(n => n.id === id);

    if (!isMiniMap) {
      // Grid background
      ctx.strokeStyle = 'rgba(33, 38, 45, 0.3)';
      ctx.lineWidth = 0.5;
      const gridSize = 40 * zoom;
      for (let x = (-pan.x % gridSize); x < canvas.width; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
      }
      for (let y = (-pan.y % gridSize); y < canvas.height; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
      }
    }

    // Edges
    graphEdges.forEach(edge => {
      const sn = getNodeById(edge.source);
      const tn = getNodeById(edge.target);
      if (!sn || !tn) return;
      const hi = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id);

      ctx.beginPath();
      ctx.moveTo(sn.x, sn.y);
      const mx = (sn.x + tn.x) / 2; const my = (sn.y + tn.y) / 2 - 20;
      ctx.quadraticCurveTo(mx, my, tn.x, tn.y);
      ctx.strokeStyle = hi ? '#8b956d' : isMiniMap ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.4)';
      ctx.lineWidth = hi ? 2.5 : 1.5;
      ctx.stroke();

      if (!isMiniMap && hi) {
        ctx.fillStyle = '#8b956d'; ctx.font = '11px monospace'; ctx.textAlign = 'center';
        ctx.fillText(edge.label, mx, my - 8);
      }

      // Particles
      const t = Date.now() / 1000;
      const pp = (Math.sin(t + edge.source.charCodeAt(0)) + 1) / 2;
      ctx.beginPath();
      ctx.arc(sn.x + (tn.x - sn.x) * pp, sn.y + (tn.y - sn.y) * pp, isMiniMap ? 1 : 2.5, 0, Math.PI * 2);
      ctx.fillStyle = hi ? '#8b956d' : `rgba(139,149,109,${isMiniMap ? '0.4' : '0.6'})`;
      ctx.fill();
    });

    // Nodes
    graphNodes.forEach(node => {
      if (!isMiniMap && filterType !== 'all' && node.type !== filterType) return;
      if (!isMiniMap && searchTerm && !node.label.toLowerCase().includes(searchTerm.toLowerCase())) return;

      const sel = selectedNode?.id === node.id;
      const hov = hoveredNode?.id === node.id;
      let con = false;
      if (selectedNode && !isMiniMap) {
        con = selectedNode.connections.some(c => {
          const e1 = graphEdges.find(e => e.id === c);
          if (e1 && e1.source === node.id) return true;
          const e2 = graphEdges.find(e => e.id === c);
          if (e2 && e2.target === node.id) return true;
          return false;
        });
      }

      if ((sel || hov) && !isMiniMap) {
        const g = ctx.createRadialGradient(node.x, node.y, node.radius, node.x, node.y, node.radius * 2);
        g.addColorStop(0, `${node.color}40`); g.addColorStop(1, 'transparent');
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2); ctx.fill();
      }
      if (con && !sel && !isMiniMap) {
        ctx.strokeStyle = `${node.color}60`; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(node.x, node.y, node.radius + 4, 0, Math.PI * 2); ctx.stroke();
      }

      ctx.fillStyle = sel ? node.color : hov ? node.color : `${node.color}${isMiniMap ? 'cc' : 'cc'}`;
      ctx.strokeStyle = node.color; ctx.lineWidth = isMiniMap ? 1 : 2;
      ctx.beginPath();

      switch (node.type) {
        case 'concept':
          for (let i = 0; i < 6; i++) {
            const a = (Math.PI / 3) * i - Math.PI / 6;
            if (i === 0) ctx.moveTo(node.x + node.radius * Math.cos(a), node.y + node.radius * Math.sin(a));
            else ctx.lineTo(node.x + node.radius * Math.cos(a), node.y + node.radius * Math.sin(a));
          }
          ctx.closePath(); break;
        case 'entity': {
          const r = 6, w = node.radius * 1.8, h = node.radius * 1.2;
          ctx.roundRect(node.x - w / 2, node.y - h / 2, w, h, r); break;
        }
        case 'relation':
          ctx.moveTo(node.x, node.y - node.radius);
          ctx.lineTo(node.x + node.radius, node.y);
          ctx.lineTo(node.x, node.y + node.radius);
          ctx.lineTo(node.x - node.radius, node.y);
          ctx.closePath(); break;
        default:
          ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
      }
      ctx.fill();
      if (!sel) ctx.stroke();

      if (!isMiniMap) {
        ctx.fillStyle = sel ? '#ffffff' : '#e2e8f0';
        ctx.font = `${sel ? 'bold' : 'normal'} ${node.type === 'concept' ? '12px' : node.type === 'entity' ? '11px' : '10px'} sans-serif`;
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        const lines = node.label.split(' ');
        if (lines.length > 1) { ctx.fillText(lines[0], node.x, node.y - 6); ctx.fillText(lines[1], node.x, node.y + 6); }
        else { ctx.fillText(node.label, node.x, node.y); }

        if (sel || hov) {
          ctx.fillStyle = typeColors[node.type]; ctx.font = '9px monospace';
          ctx.fillText(`[${node.category}]`, node.x, node.y + node.radius + 14);
        }

        if (node.properties?.status === 'ACTIVE') {
          const pr = node.radius + 8 + Math.sin(Date.now() / 300) * 4;
          ctx.beginPath(); ctx.arc(node.x, node.y, pr, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(239,68,68,${0.3 - Math.sin(Date.now() / 300) * 0.15})`; ctx.lineWidth = 2; ctx.stroke();
        }
      }
    });
    ctx.restore();

    // Minimap viewport indicator
    if (isMiniMap) {
      ctx.strokeStyle = '#8b956d'; ctx.lineWidth = 1.5;
      ctx.strokeRect(-offsetX / scale, -offsetY / scale, canvas.width / scale, canvas.height / scale);
    }
  }, [selectedNode, hoveredNode, zoom, pan, filterType, searchTerm]);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    drawGraph(c, false);
    const anim = () => { drawGraph(c, false); requestAnimationFrame(anim); };
    const id = requestAnimationFrame(anim);
    return () => cancelAnimationFrame(id);
  }, [drawGraph, canvasSize]);

  // Mini-map render
  useEffect(() => {
    const m = miniMapRef.current;
    if (!m) return;
    const loop = () => { drawGraph(m, true); requestAnimationFrame(loop); };
    const id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [drawGraph]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    const rect = c.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    const clicked = graphNodes.find(n => { const dx = x - n.x; const dy = y - n.y; return Math.sqrt(dx*dx+dy*dy) < n.radius + 5; });
    if (clicked) { setSelectedNode(clicked); setRightPanelView('details'); } else { setSelectedNode(null); setRightPanelView('dashboard'); }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    if (isDragging) { const r = c.getBoundingClientRect(); setPan({ x: e.clientX - r.left - dragStart.x, y: e.clientY - r.top - dragStart.y }); return; }
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left - pan.x) / zoom; const y = (e.clientY - r.top - pan.y) / zoom;
    const hov = graphNodes.find(n => { const dx = x - n.x; const dy = y - n.y; return Math.sqrt(dx*dx+dy*dy) < n.radius + 5; });
    setHoveredNode(hov || null);
    c.style.cursor = hov ? 'pointer' : isDragging ? 'grabbing' : 'grab';
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current; if (!c) return;
    const r = c.getBoundingClientRect();
    setIsDragging(true); setDragStart({ x: e.clientX - r.left - pan.x, y: e.clientY - r.top - pan.y });
    c.style.cursor = 'grabbing';
  };
  const handleMouseUp = () => { setIsDragging(false); if (canvasRef.current) canvasRef.current.style.cursor = 'grab'; };

  const handleZoomIn = () => setZoom(z => Math.min(z * 1.2, 3));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.2, 0.3));
  const handleResetView = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  const stats = {
    totalNodes: graphNodes.length, totalEdges: graphEdges.length,
    concepts: graphNodes.filter(n => n.type === 'concept').length,
    entities: graphNodes.filter(n => n.type === 'entity').length,
    relations: graphNodes.filter(n => n.type === 'relation').length,
    attributes: graphNodes.filter(n => n.type === 'attribute').length,
  };

  const fusionQuality = Math.round(dataSources.reduce((s, d) => s + d.quality, 0) / dataSources.length);
  const totalConflicts = dataSources.reduce((s, d) => s + d.conflicts, 0);
  const totalRecords = dataSources.reduce((s, d) => s + d.recordCount, 0);

  // Render ontology tree item
  const renderOntologyItem = (item: any, depth = 0) => (
    <div key={item.name}>
      <div className={`flex items-center gap-1.5 py-1 px-${2 - depth} rounded hover:bg-[#21262d] cursor-pointer text-xs ${depth === 0 ? 'text-[#8b956d] font-semibold' : 'text-slate-300'}`}
           style={{ paddingLeft: depth * 14 }}>
        {item.children ? (
          <ChevronRight className="w-3 h-3 text-slate-500" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-[#5a7a8a]" />
        )}
        {item.children ? (
          <TreePine className="w-3.5 h-3.5" />
        ) : (
          <span>{item.name}</span>
        )}
        {item.count !== undefined && (
          <span className="ml-auto text-slate-500">{item.count}</span>
        )}
      </div>
      {item.children?.map((child: any) => renderOntologyItem(child, depth + 1))}
    </div>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col bg-[#0d1117]">
      {/* Header */}
      <div className="px-6 py-3 border-b border-[#21262d] bg-[#161b22]/50 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#8b956d]" />
              <h2 className="text-lg font-bold text-white">数据融合与本体建模</h2>
              <span className="text-xs text-slate-500 bg-[#21262d] px-2 py-1 rounded">ONTOFLOW ENGINE</span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono hidden xl:flex">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
                <Network className="w-3.5 h-3.5 text-[#8b956d]" /><span className="text-slate-400">节点:</span><span className="text-white font-bold">{stats.totalNodes}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
                <GitBranch className="w-3.5 h-3.5 text-[#6366f1]" /><span className="text-slate-400">边:</span><span className="text-white font-bold">{stats.totalEdges}</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-[#0d1117] border border-[#21262d]">
                <Brain className="w-3.5 h-3.5 text-amber-400" /><span className="text-slate-400">本体:</span><span className="text-emerald-400 font-bold">v2.4</span>
              </div>
              <div className="h-5 w-px bg-[#21262d]" />
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">质量: {fusionQuality}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Panel */}
        <div className={`border-r border-[#21262d] bg-[#161b22]/30 overflow-y-auto flex-shrink-0 ${leftPanelTab === 'datasources' ? 'w-80' : leftPanelTab === 'ontology' ? 'w-72' : 'w-72'}`}>
          {/* Left Panel Tabs */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#21262d] sticky top-0 bg-[#161b22] z-10 flex-shrink-0">
            <div className="flex items-center gap-1">
              {[
                { id: 'workflow' as const, icon: Layers, label: '工作流' },
                { id: 'datasources' as const, icon: Database, label: '数据源' },
                { id: 'ontology' as const, icon: TreePine, label: '本体树' },
              ].map(tab => (
                <button key={tab.id}
                  onClick={() => setLeftPanelTab(tab.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                    leftPanelTab === tab.id ? 'bg-[#8b956d]/15 text-[#8b956d]' : 'text-slate-400 hover:text-white hover:bg-[#21262d]'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />{tab.label}
                  {(tab.id === 'datasources') && totalConflicts > 0 && (
                    <span className="ml-1 w-4 h-4 rounded-full bg-red-500/20 text-red-400 text-[9px] font-bold flex items-center justify-center">{totalConflicts}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 space-y-3 flex-1">
            {/* Workflow Tab */}
            {leftPanelTab === 'workflow' && (
              <>
                {workflowStages.map((stage, index) => {
                  const isActive = stage.status === 'active';
                  const isComplete = stage.status === 'complete';
                  const expanded = expandedWorkflowStage === stage.id;
                  return (
                    <div key={stage.id}>
                      <div className={`rounded-lg border p-3 transition-all cursor-pointer ${
                        isActive ? 'border-[#8b956d] bg-[#8b956d]/10 shadow-lg shadow-[#8b956d]/20' :
                        isComplete ? 'border-[#4a7c59]/30 bg-[#4a7c59]/5' : 'border-[#21262d] bg-[#0d1117]'
                      }`}
                      onClick={() => setExpandedWorkflowStage(expanded ? null : stage.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${isActive ? 'bg-[#8b956d] animate-pulse' : isComplete ? 'bg-[#4a7c59]' : 'bg-[#21262d]'}`}>
                            {isComplete ? <CheckCircle2 className="w-4 h-4 text-white" /> : <span className="text-sm font-bold text-slate-400">{index + 1}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`font-semibold text-sm ${isActive ? 'text-[#8b956d]' : isComplete ? 'text-[#4a7c59]' : 'text-white'}`}>{stage.name}</span>
                              <div className="flex items-center gap-1.5">
                                {isActive && <div className="w-2 h-2 rounded-full bg-[#8b956d] animate-pulse" />}
                                <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                              </div>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">{stage.description}</p>
                            {/* Progress bar */}
                            {(isActive || !isComplete) && (
                              <div className="mt-2">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-[10px] text-slate-500">{stage.progress}%</span>
                                  <span className="text-[10px] text-slate-500">{stage.items.filter((_, i) => i < Math.floor(stage.progress / 25)).length}/{stage.items.length}</span>
                                </div>
                                <div className="h-1 bg-[#21262d] rounded-full overflow-hidden">
                                  <div className={`h-full transition-all duration-500 ${isComplete ? 'bg-[#4a7c59]' : isActive ? 'bg-[#8b956d]' : 'bg-[#30363d]'}`}
                                    style={{ width: `${stage.progress}%` }} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Expanded detail */}
                      {expanded && (
                        <div className="mt-2 ml-11 p-3 rounded bg-[#0d1117] border border-[#21262d]">
                          <p className="text-xs text-slate-400 leading-relaxed mb-3">{stage.details}</p>
                          <div className="space-y-1.5">
                            {stage.items.map((item, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <div className={`w-1.5 h-1.5 rounded-full ${i < Math.floor(stage.progress / 25) ? (isActive ? 'bg-[#8b956d]' : 'bg-[#4a7c59]') : 'bg-[#30363d]'}`} />
                                <span className={isActive ? 'text-[#8b956d]' : isComplete ? 'text-[#4a7c59]' : 'text-slate-500'}>{item}</span>
                              </div>
                            ))}
                          </div>
                          {isActive && (
                            <button
                              onClick={(e) => { e.stopPropagation(); toast.info(`正在重新执行"${stage.name}"...`); }}
                              className="mt-3 w-full py-1.5 rounded text-xs font-medium bg-[#8b956d]/20 text-[#8b956d] hover:bg-[#8b956d]/30 transition-colors flex items-center justify-center gap-1.5"
                            >
                              <Play className="w-3 h-3" /> 重新执行
                            </button>
                          )}
                        </div>
                      )}

                      {/* Connector */}
                      {index < workflowStages.length - 1 && (
                        <div className="ml-4 my-2 w-0.5 h-4 bg-[#21262d] relative">
                          <div className={`absolute top-0 left-0 h-full ${isComplete ? 'bg-[#4a7c59]' : 'bg-[#30363d]'}`} style={{ width: isComplete ? '100%' : '30%' }} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Data Sources Tab */}
            {leftPanelTab === 'datasources' && (
              <>
                <div className="mb-3 grid grid-cols-3 gap-2">
                  <div className="text-center p-2 rounded bg-[#0d1117] border border-[#21262d]">
                    <p className="text-[10px] text-slate-500">总记录数</p>
                    <p className="text-sm font-bold text-white">{totalRecords.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-2 rounded bg-[#0d1117] border border-[#21262d]">
                    <p className="text-[10px] text-slate-500">融合质量</p>
                    <p className={`text-sm font-bold ${fusionQuality >= 90 ? 'text-emerald-400' : fusionQuality >= 70 ? 'text-amber-400' : 'text-red-400'}`}>{fusionQuality}%</p>
                  </div>
                  <div className="text-center p-2 rounded bg-[#0d1117] border border-[#21262d]">
                    <p className="text-[10px] text-slate-500">冲突数</p>
                    <p className={`text-sm font-bold ${totalConflicts > 0 ? 'text-red-400' : 'text-emerald-400'}`}>{totalConflicts}</p>
                  </div>
                </div>

                {dataSources.map(ds => {
                  const cfg = dataSourceTypeConfig[ds.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={ds.id} className="rounded-lg border border-[#21262d] bg-[#0d1117] p-3 hover:border-[#30363d] transition-colors group">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: cfg.color + '20' }}>
                          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">{ds.name}</p>
                          <p className="text-[10px] text-slate-500">{cfg.label}</p>
                        </div>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${ds.status === 'active' ? 'bg-emerald-500 animate-pulse' : ds.status === 'syncing' ? 'bg-amber-500 animate-pulse' : ds.status === 'error' ? 'bg-red-500' : 'bg-slate-600'}`} />
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-2 text-[10px]">
                        <div>
                          <span className="text-slate-500 block">记录</span>
                          <span className="text-white font-medium">{ds.recordCount.toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">质量</span>
                          <span className={`${ds.quality >= 90 ? 'text-emerald-400' : ds.quality >= 70 ? 'text-amber-400' : 'text-red-400'} font-medium`}>{ds.quality}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">冲突</span>
                          <span className={`${ds.conflicts > 0 ? 'text-red-400' : 'text-emerald-400'} font-medium`}>{ds.conflicts}</span>
                        </div>
                      </div>
                      {ds.conflicts > 0 && (
                        <button
                          onClick={() => toast.warning(`检测到${ds.conflicts}条数据冲突，需要人工审核`)}
                          className="mt-2 w-full py-1 rounded text-[10px] font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-1"
                        >
                          <AlertTriangle className="w-3 h-3" /> 查看冲突详情
                        </button>
                      )}
                    </div>
                  );
                })}
              </>
            )}

            {/* Ontology Tab */}
            {leftPanelTab === 'ontology' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#21262d]">
                  <span className="text-xs font-bold text-white flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5 text-[#8b956d]" /> 本体结构</span>
                  <button onClick={() => toast.success('本体文件已导出为OWL格式')} className="text-[10px] text-[#8b956d] hover:text-[#9ba57d]">导出OWL</button>
                </div>
                {ontologyTree.map(item => renderOntologyItem(item))}
              </div>
            )}
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          {/* Toolbar */}
          <div className="px-4 py-2 border-b border-[#21262d] bg-[#0d1117] flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="h-5 w-px bg-[#21262d]" />
              {['all', 'entity', 'relation', 'attribute'].map(type => (
                <button key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${filterType === type ? (type === 'all' ? 'bg-[#8b956d] text-[#0d1117]' : `bg-${typeColors[type].replace('#','')} text-white`) : 'text-slate-400 hover:text-white hover:bg-[#21262d]'}`}
                >
                  {{ all: '全部', entity: '实体', relation: '关系', attribute: '属性' }[type]}
                </button>
              ))}
              <div className="h-5 w-px bg-[#21262d]" />
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="搜索节点..." className="pl-8 pr-3 py-1 bg-[#161b22] border border-[#21262d] rounded text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#8b956d] w-40" />
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleZoomOut} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="缩小"><ZoomOut className="w-4 h-4" /></button>
              <span className="text-xs text-slate-500 font-mono min-w-[45px] text-center">{Math.round(zoom * 100)}%</span>
              <button onClick={handleZoomIn} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="放大"><ZoomIn className="w-4 h-4" /></button>
              <button onClick={handleResetView} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="重置视图"><Maximize2 className="w-4 h-4" /></button>
              <div className="h-5 w-px bg-[#21262d]" />
              <button onClick={() => { toast.success('图谱已刷新'); }} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="刷新"><RefreshCw className="w-4 h-4" /></button>
              <button onClick={() => toast.info('图谱已导出为JSON-LD格式')} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="导出"><Download className="w-4 h-4" /></button>
              <button onClick={() => toast.success('图谱分享链接已复制到剪贴板')} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="分享"><Share2 className="w-4 h-4" /></button>
            </div>
          </div>

          {/* Canvas Container */}
          <div ref={containerRef} className="flex-1 relative bg-[#0a0f14] overflow-hidden">
            <canvas ref={canvasRef} width={canvasSize.width} height={canvasSize.height}
              onClick={handleCanvasClick} onMouseMove={handleCanvasMouseMove}
              onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}
              className="w-full h-full cursor-grab" />

            {/* Legend */}
            <div className="absolute bottom-4 left-4 z-10 bg-[#161b22]/90 backdrop-blur-sm border border-[#21262d] rounded-lg p-3">
              <h4 className="text-xs font-bold text-white mb-2">图例</h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
                {Object.entries(typeIcons).map(([type, Icon]) => (
                  <div key={type} className="flex items-center gap-2"><Icon className="w-3 h-3" style={{ color: typeColors[type] }} /><span className="text-slate-400">{{ concept: '核心概念', entity: '实体对象', relation: '关系连接', attribute: '属性值' }[type]}</span></div>
                ))}
              </div>
            </div>

            {/* Mini-map */}
            <div className="absolute bottom-4 right-4 z-10 bg-[#161b22]/90 backdrop-blur-sm border border-[#21262d] rounded-lg p-1.5">
              <div className="flex items-center justify-between mb-1 px-1">
                <span className="text-[9px] text-slate-500 font-medium">概览</span>
                <span className="text-[9px] text-slate-600 font-mono">{Math.round(zoom*100)}%</span>
              </div>
              <canvas ref={miniMapRef} width={180} height={120} className="rounded block" style={{ background: '#0a0f14' }} />
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-[#21262d] bg-[#161b22] overflow-y-auto flex-shrink-0">
          {selectedNode && rightPanelView === 'details' ? (
            <>
              <div className="p-4 border-b border-[#21262d] sticky top-0 bg-[#161b22] z-10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {(() => { const I = typeIcons[selectedNode.type]; return I ? <I className="w-5 h-5" style={{ color: typeColors[selectedNode.type] }} /> : null; })()}
                  <h3 className="font-bold text-white truncate">{selectedNode.label}</h3>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setRightPanelView('dashboard')} className="p-1 hover:bg-[#21262d] rounded text-slate-400" title="返回仪表盘"><BarChart3 className="w-4 h-4" /></button>
                  <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-[#21262d] rounded text-slate-400"><span className="text-xs">✕</span></button>
                </div>
              </div>
              <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><span className="text-[10px] text-slate-500 block mb-1">类型</span><span className="text-sm font-medium text-white capitalize">{selectedNode.type}</span></div>
                  <div><span className="text-[10px] text-slate-500 block mb-1">分类</span><span className="text-sm font-medium" style={{ color: selectedNode.color }}>{selectedNode.category}</span></div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block mb-2">关联关系 ({selectedNode.connections.length})</span>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {selectedNode.connections.map(eId => {
                      const eg = graphEdges.find(e => e.id === eId);
                      const cnId = eg?.source === selectedNode.id ? eg?.target : eg?.source;
                      const cn = graphNodes.find(n => n.id === cnId);
                      return (
                        <div key={eId} onClick={() => { if (cn) { setSelectedNode(cn); }}} className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#0d1117] hover:bg-[#21262d] cursor-pointer transition-colors">
                          <ArrowRight className="w-3 h-3 text-slate-500" /><span className="text-xs text-slate-300 flex-1 truncate">{eg?.label}</span><span className="text-[10px] text-slate-500 truncate max-w-[80px]">{cn?.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                {selectedNode.properties && Object.keys(selectedNode.properties).length > 0 && (
                  <div>
                    <span className="text-[10px] text-slate-500 block mb-2">属性详情</span>
                    <div className="space-y-2">
                      {Object.entries(selectedNode.properties).map(([k, v]) => (
                        <div key={k} className="flex items-start justify-between py-1.5 px-2 rounded bg-[#0d1117]">
                          <span className="text-xs text-slate-500 capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-xs font-medium text-white ml-2 text-right break-all">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="pt-3 border-t border-[#21262d] space-y-2">
                  <button className="w-full py-2 rounded text-xs font-medium bg-[#8b956d] text-[#0d1117] hover:bg-[#9ba57d] transition-colors flex items-center justify-center gap-1.5"><Eye className="w-3.5 h-3.5" /> 查看详情</button>
                  <button className="w-full py-2 rounded text-xs font-medium bg-[#161b22] text-slate-300 border border-[#21262d] hover:border-[#30363d] transition-colors flex items-center justify-center gap-1.5"><Network className="w-3.5 h-3.5" /> 展开子图</button>
                  <button onClick={() => toast.info(`已将"${selectedNode.label}"添加到查询构建器`)} className="w-full py-2 rounded text-xs font-medium bg-[#161b22] text-slate-300 border border-[#21262d] hover:border-[#30363d] transition-colors flex items-center justify-center gap-1.5"><Database className="w-3.5 h-3.5" /> 构建查询</button>
                </div>
              </div>
            </>
          ) : (
            /* Dashboard View */
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2"><BarChart3 className="w-4 h-4 text-[#8b956d]" /> 融合仪表盘</h3>
                <button onClick={() => setRightPanelView('query')} className="p-1.5 hover:bg-[#21262d] rounded text-slate-400 hover:text-white" title="查询构建器"><FileCode2 className="w-4 h-4" /></button>
              </div>

              {/* Quality Score Ring */}
              <div className="relative w-40 h-40 mx-auto my-4">
                <svg viewBox="0 0 160 160" className="w-full h-full -rotate-90">
                  <circle cx="80" cy="80" r="70" fill="none" stroke="#21262d" strokeWidth="8" />
                  <circle cx="80" cy="80" r="70" fill="none" stroke={fusionQuality >= 90 ? '#22c55e' : fusionQuality >= 70 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="8" strokeDasharray={`${fusionQuality * 4.4} 440`} strokeLinecap="round" className="transition-all duration-1000" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{fusionQuality}</span>
                  <span className="text-[10px] text-slate-400">综合评分</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '实体总数', value: stats.entities, color: 'text-[#5a7a8a]', sub: `${stats.concepts}概念` },
                  { label: '关系总数', value: stats.relations, color: 'text-[#6366f1]', sub: `${stats.attributes}属性` },
                  { label: '活跃数据源', value: dataSources.filter(d => d.status === 'active').length, color: 'text-emerald-400', sub: `${dataSources.length}总计` },
                  { label: '待处理冲突', value: totalConflicts, color: totalConflicts > 0 ? 'text-red-400' : 'text-emerald-400', sub: totalConflicts > 0 ? '需人工审核' : '无冲突' },
                ].map((s, i) => (
                  <div key={i} className="p-3 rounded bg-[#0d1117] border border-[#21262d]">
                    <span className="text-[10px] text-slate-500 block">{s.label}</span>
                    <span className={`text-lg font-bold ${s.color}`}>{s.value}</span>
                    <span className="text-[9px] text-slate-600">{s.sub}</span>
                  </div>
                ))}
              </div>

              {/* Data Source Status */}
              <div>
                <h4 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5"><Database className="w-3.5 h-3.5 text-[#8b956d]" /> 数据源状态</h4>
                <div className="space-y-1.5">
                  {dataSources.slice(0, 4).map(ds => {
                    const cfg = dataSourceTypeConfig[ds.type];
                    const Icon = cfg.icon;
                    return (
                      <div key={ds.id} className="flex items-center gap-2 px-2 py-1.5 rounded bg-[#0d1117]">
                        <Icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                        <span className="text-xs text-slate-300 flex-1 truncate">{ds.name}</span>
                        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${ds.status === 'active' ? 'bg-emerald-500' : ds.status === 'syncing' ? 'bg-amber-500' : ds.status === 'error' ? 'bg-red-500' : 'bg-slate-600'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-3 border-t border-[#21262d] space-y-2">
                <button onClick={() => setLeftPanelTab('datasources')} className="w-full py-2 rounded text-xs font-medium bg-[#161b22] text-slate-300 border border-[#21262d] hover:border-[#30363d] transition-colors flex items-center justify-center gap-1.5"><Database className="w-3.5 h-3.5" /> 管理数据源</button>
                <button onClick={() => setLeftPanelTab('workflow')} className="w-full py-2 rounded text-xs font-medium bg-[#161b22] text-slate-300 border border-[#21262d] hover:border-[#30363d] transition-colors flex items-center justify-center gap-1.5"><Layers className="w-3.5 h-3.5" /> 查看工作流</button>
                <button onClick={() => toast.info('正在生成SPARQL查询...')} className="w-full py-2 rounded text-xs font-medium bg-[#8b956d] text-[#0d1117] hover:bg-[#9ba57d] transition-colors flex items-center justify-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> 运行推理</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
