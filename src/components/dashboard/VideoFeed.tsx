import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Maximize2, Camera, Brain, Crosshair, TargetIcon } from 'lucide-react';
import type { Target } from '@/types';

interface Detection {
  id: string;
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: 'red' | 'blue';
}

interface VideoFeedProps {
  target?: Target | null;
  onTargetNominate?: (target: Target) => void;
}

export function VideoFeed({ onTargetNominate }: VideoFeedProps) {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  const detections: Detection[] = [
    { id: '1', label: 'T-72 主战坦克', confidence: 94.5, x: 120, y: 180, width: 140, height: 90, color: 'red' },
    { id: '2', label: 'BTR-80 装甲车', confidence: 87.3, x: 320, y: 220, width: 110, height: 70, color: 'red' },
    { id: '3', label: '乌拉尔军卡', confidence: 91.8, x: 500, y: 160, width: 130, height: 85, color: 'red' },
    { id: '4', label: '敌方人员', confidence: 78.4, x: 680, y: 280, width: 40, height: 60, color: 'blue' },
    { id: '5', label: 'SA-15 防空系统', confidence: 96.2, x: 200, y: 320, width: 160, height: 100, color: 'red' },
  ];

  const [selectedDetection, setSelectedDetection] = useState<Detection | null>(detections[0]);
  const [nominationLog, setNominationLog] = useState<{id: string, targetName: string, time: string}[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isPlaying) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frameCount = 0;

    const renderFrame = () => {
      ctx.fillStyle = '#0a0f14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const time = Date.now() / 1000;

      for (let i = 0; i < 50; i++) {
        const x = Math.sin(time * 0.7 + i * 1.3) * 100 + canvas.width / 2 + (i % 10) * 40 - 180;
        const y = Math.cos(time * 0.9 + i * 0.8) * 50 + canvas.height / 2 + ((i * 17) % 20) * 18 - 150;
        const size = Math.sin(time + i) * 1.5 + 2.5;
        const alpha = (Math.sin(time * 2 + i * 0.5) + 1) / 2 * 0.6 + 0.2;

        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(139, 149, 109, ${alpha})`;
        ctx.fill();
      }

      for (let i = 0; i < 30; i++) {
        const x = (i * 47 + frameCount * 0.5) % canvas.width;
        const y = (i * 37) % canvas.height;
        const alpha = Math.sin(time * 3 + i) * 0.25 + 0.35;

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 165, 116, ${alpha})`;
        ctx.fill();
      }

      ctx.strokeStyle = `rgba(139, 149, 109, ${Math.sin(time * 2) * 0.15 + 0.08})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      ctx.strokeStyle = `rgba(74, 124, 89, ${Math.sin(time * 1.5) * 0.12 + 0.06})`;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 0);
      ctx.lineTo(canvas.width / 2, canvas.height);
      ctx.moveTo(0, canvas.height / 2);
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();

      ctx.font = '11px monospace';
      ctx.fillStyle = '#4a5568';
      ctx.fillText(`全动态视频 | UAV-09 死神 | 录制 ${new Date().toISOString().split('T')[0]}`, 16, canvas.height - 14);
      ctx.fillText(`缩放: 4.2x | 高度: 8,450m | 航向: ${Math.floor(Math.sin(time * 0.3) * 45 + 270)}°`, 16, 26);

      frameCount++;
      animationRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  return (
    <div className="bg-[#0d1117] rounded-lg border border-[#21262d] overflow-hidden h-full flex flex-col">
      {/* Header with CV Status */}
      <div className="px-4 py-3 bg-[#161b22] border-b border-[#21262d] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-semibold text-white">实时视频流</span>
          </div>
          <div className="h-4 w-px bg-[#21262d]" />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20">
            <Brain className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-medium text-emerald-400">AI识别中</span>
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
          </div>
          <span className="text-xs text-slate-500 font-mono">{detections.length} 个目标</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 hover:bg-[#21262d] rounded transition-colors"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 text-slate-400" />
            ) : (
              <Play className="w-4 h-4 text-slate-400" />
            )}
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 hover:bg-[#21262d] rounded transition-colors"
          >
            <Maximize2 className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Video Area with Detections */}
      <div className="relative flex-1 bg-black overflow-hidden">
        {/* Canvas Background */}
        <canvas
          ref={canvasRef}
          width={850}
          height={480}
          className={`absolute inset-0 w-full h-full object-cover ${isPlaying ? '' : 'opacity-50'}`}
        />

        {/* CV Detection Boxes */}
        {isPlaying && detections.map((det) => (
          <div
            key={det.id}
            className="absolute cursor-pointer transition-all group"
            style={{
              left: `${(det.x / 850) * 100}%`,
              top: `${(det.y / 480) * 100}%`,
              width: `${(det.width / 850) * 100}%`,
              height: `${(det.height / 480) * 100}%`,
            }}
            onClick={() => {}}
          >
            {/* Detection Border */}
            <div
              className={`absolute inset-0 border-2 ${det.color === 'red' ? 'border-red-500' : 'border-blue-500'} ${
                det.id === selectedDetection?.id ? 'animate-pulse' : ''
              }`}
              style={{
                boxShadow: det.color === 'red'
                  ? '0 0 10px rgba(239, 68, 68, 0.5), inset 0 0 10px rgba(239, 68, 68, 0.1)'
                  : '0 0 10px rgba(59, 130, 246, 0.5), inset 0 0 10px rgba(59, 130, 246, 0.1)'
              }}
            />

            {/* Corner Brackets */}
            <div className={`absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 ${det.color === 'red' ? 'border-red-500' : 'border-blue-500'}`} />
            <div className={`absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 ${det.color === 'red' ? 'border-red-500' : 'border-blue-500'}`} />
            <div className={`absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 ${det.color === 'red' ? 'border-red-500' : 'border-blue-500'}`} />
            <div className={`absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 ${det.color === 'red' ? 'border-red-500' : 'border-blue-500'}`} />

            {/* Label */}
            <div
              className={`absolute -top-7 left-0 px-2 py-0.5 text-[10px] font-bold whitespace-nowrap ${
                det.color === 'red' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
              }`}
            >
              {det.label}
            </div>

            {/* Confidence Badge */}
            <div
              className={`absolute -bottom-6 left-0 px-1.5 py-0.5 text-[9px] font-mono font-bold ${
                det.color === 'red' ? 'bg-red-900/80 text-red-300' : 'bg-blue-900/80 text-blue-300'
              }`}
            >
              置信度: {det.confidence}%
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
              <button
                className={`px-2 py-1 text-[10px] font-bold rounded ${
                  det.color === 'red'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                } transition-colors shadow-lg`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDetection(det);
                  const newTarget: Target = {
                    id: `cv-${det.id}`,
                    name: det.label,
                    type: det.label.includes('坦克') || det.label.includes('装甲') || det.label.includes('军卡') || det.label.includes('防空') ? 'vehicle' : 'personnel',
                    coordinates: [32.4279 + (Math.random() - 0.5) * 0.1, 53.6880 + (Math.random() - 0.5) * 0.1],
                    threatLevel: det.color === 'red' ? 75 : 30,
                    priority: det.color === 'red' ? 'high' : 'low',
                    status: 'detected',
                    confidence: det.confidence,
                    description: `AI识别目标：${det.label}，置信度${det.confidence}%`,
                    detectedAt: new Date().toISOString()
                  };
                  if (onTargetNominate) {
                    onTargetNominate(newTarget);
                  }
                  setNominationLog(prev => [{id: Date.now().toString(), targetName: det.label, time: new Date().toLocaleTimeString('zh-CN')}, ...prev].slice(0, 3));
                }}
              >
                <Crosshair className="w-3 h-3 inline mr-1" /> 提名目标
              </button>
            </div>
          </div>
        ))}

        {/* Center Crosshair */}
        {isPlaying && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
            <div className="relative w-16 h-16">
              <div className="absolute top-1/2 left-0 right-0 h-px bg-red-500/50" />
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-red-500/50" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 border border-red-500 rounded-full" />
            </div>
          </div>
        )}

        {/* Selected Detection Info Panel */}
        {selectedDetection && isPlaying && (
          <div className="absolute bottom-4 left-4 right-4 z-10 bg-[#161b22]/95 backdrop-blur-xl border border-[#21262d] rounded-lg p-4 shadow-2xl">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <TargetIcon className="w-5 h-5 text-red-400" />
                <div>
                  <h4 className="font-bold text-white text-sm">{selectedDetection.label}</h4>
                  <p className="text-xs text-slate-500">计算机视觉识别</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 rounded text-xs font-mono font-bold bg-red-500/20 text-red-400">
                  置信度: {selectedDetection.confidence}%
                </span>
                <button
                  onClick={() => {
                    const newTarget: Target = {
                      id: `cv-panel-${selectedDetection.id}`,
                      name: selectedDetection.label,
                      type: selectedDetection.label.includes('坦克') || selectedDetection.label.includes('装甲') || selectedDetection.label.includes('军卡') || selectedDetection.label.includes('防空') ? 'vehicle' : 'personnel',
                      coordinates: [32.4279 + (Math.random() - 0.5) * 0.1, 53.6880 + (Math.random() - 0.5) * 0.1],
                      threatLevel: 75,
                      priority: 'high',
                      status: 'detected',
                      confidence: selectedDetection.confidence,
                      description: `AI识别目标：${selectedDetection.label}，置信度${selectedDetection.confidence}%`,
                      detectedAt: new Date().toISOString()
                    };
                    if (onTargetNominate) {
                      onTargetNominate(newTarget);
                    }
                    setNominationLog(prev => [{id: Date.now().toString(), targetName: selectedDetection.label, time: new Date().toLocaleTimeString('zh-CN')}, ...prev].slice(0, 3));
                  }}
                  className="px-3 py-1.5 rounded text-xs font-bold bg-[#8b956d] text-[#0d1117] hover:bg-[#9ba57d] transition-colors flex items-center gap-1.5"
                >
                  <Crosshair className="w-3.5 h-3.5" /> 提名至工作板
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 text-xs">
              <div className="bg-[#0d1117] rounded p-2">
                <span className="text-slate-500 block mb-1">纬度</span>
                <span className="font-mono text-white">32.427891°N</span>
              </div>
              <div className="bg-[#0d1117] rounded p-2">
                <span className="text-slate-500 block mb-1">经度</span>
                <span className="font-mono text-white">53.688001°E</span>
              </div>
              <div className="bg-[#0d1117] rounded p-2">
                <span className="text-slate-500 block mb-1">距离</span>
                <span className="font-mono text-amber-400">4.2 公里</span>
              </div>
              <div className="bg-[#0d1117] rounded p-2">
                <span className="text-slate-500 block mb-1">方位角</span>
                <span className="font-mono text-emerald-400">127° 东北</span>
              </div>
            </div>
          </div>
        )}

        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80">
            <button
              onClick={() => setIsPlaying(true)}
              className="p-4 bg-white/10 backdrop-blur-sm rounded-full hover:bg-white/20 transition-colors"
            >
              <Play className="w-8 h-8 text-white ml-1" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className="px-4 py-2 bg-[#0d1117] border-t border-[#21262d]">
        <div className="flex items-center justify-between text-[11px] font-mono mb-2">
          <div className="flex items-center gap-4 text-slate-500">
            <span>UAV-09 死神无人机</span>
            <span>|</span>
            <span>录制 2026-03-23</span>
            <span>|</span>
            <span className="text-emerald-400">● 实时</span>
          </div>
          <div className="flex items-center gap-4 text-slate-500">
            <span>缩放: 4.2x</span>
            <span>高度: 8,450m</span>
            <span>红外模式</span>
          </div>
        </div>

        {/* Nomination Log */}
        {nominationLog.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] pt-1 border-t border-[#21262d]">
            <Crosshair className="w-3 h-3 text-[#8b956d]" />
            <span className="text-slate-500">最近提名:</span>
            {nominationLog.map((log) => (
              <span key={log.id} className="px-1.5 py-0.5 rounded bg-[#8b956d]/10 text-[#8b956d]">
                {log.targetName} ({log.time})
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}