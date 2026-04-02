import type { Target, Weapon, MissionPlan, Sensor, IntelReport, User, SystemStatus, BDA } from '@/types';
import { excelTargets } from './parseExcel';

export const mockUser: User = {
  id: 'user-001',
  name: 'General John Smith',
  role: 'commander',
  clearance: '',
  unit: 'Joint Strike Command'
};

export const mockSystemStatus: SystemStatus = {
  online: true,
  lastSync: new Date().toISOString(),
  activeSensors: 12,
  pendingTargets: 8,
  activeMissions: 3,
  dataSources: 156
};

// 基础目标数据
const baseTargets: Target[] = [
  {
    id: 'tgt-001',
    name: '敌方指挥车',
    type: 'vehicle',
    coordinates: [32.4279, 53.6880], // 伊朗中心
    confidence: 94,
    status: 'detected',
    priority: 'critical',
    detectedAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    description: '疑似敌方移动指挥所，配备通信天线',
    threatLevel: 85
  },
  {
    id: 'tgt-002',
    name: '雷达站',
    type: 'infrastructure',
    coordinates: [32.4379, 53.6980], // 伊朗中心附近
    confidence: 89,
    status: 'nominated',
    priority: 'high',
    detectedAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    description: '防空雷达设施，频率覆盖S波段',
    threatLevel: 72
  },
  {
    id: 'tgt-003',
    name: '弹药库',
    type: 'infrastructure',
    coordinates: [32.4179, 53.6780], // 伊朗中心附近
    confidence: 91,
    status: 'approved',
    priority: 'high',
    detectedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    description: '地下弹药储存设施，估计容量500吨',
    threatLevel: 68
  },
  {
    id: 'tgt-004',
    name: '装甲车队',
    type: 'vehicle',
    coordinates: [32.4479, 53.7080], // 伊朗中心附近
    confidence: 87,
    status: 'engaged',
    priority: 'medium',
    detectedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    description: '3辆主战坦克伴随步兵战车编队移动',
    threatLevel: 55
  },
  {
    id: 'tgt-005',
    name: '通信塔',
    type: 'infrastructure',
    coordinates: [32.4079, 53.6680], // 伊朗中心附近
    confidence: 93,
    status: 'complete',
    priority: 'medium',
    detectedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    description: '区域通信中继站，高度45米',
    threatLevel: 42
  },
  {
    id: 'tgt-006',
    name: '无人机控制站',
    type: 'equipment',
    coordinates: [32.4579, 53.7180], // 伊朗中心附近
    confidence: 88,
    status: 'detected',
    priority: 'high',
    detectedAt: new Date(Date.now() - 1000 * 60 * 8).toISOString(),
    description: '敌方无人机地面控制站，控制半径50km',
    threatLevel: 78
  }
];

// 合并基础目标和Excel解析的目标
export const mockTargets: Target[] = [...baseTargets, ...excelTargets];

export const mockWeapons: Weapon[] = [
  {
    id: 'wpn-001',
    name: '战斧巡航导弹',
    type: 'missile',
    range: 2500,
    payload: '常规高爆',
    availability: 'available',
    location: [32.0000, 53.0000], // 伊朗附近
    eta: 12,
    cost: 1500000,
    accuracy: 95
  },
  {
    id: 'wpn-002',
    name: 'MQ-9 收割者无人机',
    type: 'drone',
    range: 3700,
    payload: '地狱火导弹',
    availability: 'available',
    location: [32.1000, 53.1000], // 伊朗附近
    eta: 25,
    cost: 1800000,
    accuracy: 90
  },
  {
    id: 'wpn-003',
    name: 'F-35 闪电II战斗机',
    type: 'aircraft',
    range: 2200,
    payload: '精确制导炸弹',
    availability: 'standby',
    location: [31.9000, 52.9000], // 伊朗附近
    eta: 15,
    cost: 8000000,
    accuracy: 96
  },
  {
    id: 'wpn-004',
    name: 'M142 HIMARS火箭炮',
    type: 'artillery',
    range: 300,
    payload: '制导火箭弹',
    availability: 'available',
    location: [32.1500, 53.1500], // 伊朗附近
    eta: 8,
    cost: 500000,
    accuracy: 88
  },
  {
    id: 'wpn-005',
    name: '爱国者导弹',
    type: 'missile',
    range: 160,
    payload: '防空弹头',
    availability: 'engaged',
    location: [31.9500, 52.9500], // 伊朗附近
    eta: 5,
    cost: 3000000,
    accuracy: 92
  },
  {
    id: 'wpn-006',
    name: 'B-52 同温层堡垒轰炸机',
    type: 'aircraft',
    range: 16000,
    payload: '巡航导弹',
    availability: 'standby',
    location: [31.8000, 52.8000], // 伊朗附近
    eta: 45,
    cost: 12000000,
    accuracy: 93
  }
];

export const mockMissionPlans: MissionPlan[] = [
  {
    id: 'plan-001',
    targetId: 'tgt-002',
    weaponId: 'wpn-001',
    weaponName: '战斧巡航导弹',
    estimatedCasualties: 0,
    collateralDamage: 'minimal',
    successProbability: 94,
    timeToImpact: 12,
    cost: 1500000,
    status: 'approved'
  },
  {
    id: 'plan-002',
    targetId: 'tgt-002',
    weaponId: 'wpn-002',
    weaponName: 'MQ-9 收割者无人机',
    estimatedCasualties: 2,
    collateralDamage: 'low',
    successProbability: 82,
    timeToImpact: 25,
    cost: 1800000,
    status: 'proposed'
  },
  {
    id: 'plan-003',
    targetId: 'tgt-003',
    weaponId: 'wpn-004',
    weaponName: 'M142 HIMARS火箭炮',
    estimatedCasualties: 5,
    collateralDamage: 'moderate',
    successProbability: 78,
    timeToImpact: 8,
    cost: 500000,
    status: 'proposed'
  }
];

export const mockSensors: Sensor[] = [
  {
    id: 'sns-001',
    name: '侦察卫星-01',
    type: 'satellite',
    status: 'active',
    location: [32.4279, 53.6880], // 伊朗中心
    coverage: 500,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'sns-002',
    name: 'MQ-9 UAV-01',
    type: 'uav',
    status: 'active',
    location: [32.4379, 53.6980], // 伊朗中心附近
    coverage: 50,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'sns-003',
    name: '地面雷达-01',
    type: 'radar',
    status: 'active',
    location: [32.4179, 53.6780], // 伊朗中心附近
    coverage: 200,
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'sns-004',
    name: '信号侦察-01',
    type: 'signal',
    status: 'standby',
    location: [32.4479, 53.7080], // 伊朗中心附近
    coverage: 100,
    lastUpdate: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  }
];

export const mockIntelReports: IntelReport[] = [
  {
    id: 'intel-001',
    title: '敌方防空系统部署情报',
    source: '卫星侦察',
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    classification: 'secret',
    summary: '在目标区域发现新增S-400防空系统一部，坐标32.43°N, 53.69°E',
    coordinates: [32.4379, 53.6980] // 伊朗中心附近
  },
  {
    id: 'intel-002',
    title: '敌方通信频率分析',
    source: '信号情报',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    classification: 'confidential',
    summary: '截获敌方指挥通信，频率450MHz，加密等级中等'
  },
  {
    id: 'intel-003',
    title: '敌方装甲部队调动',
    source: '无人机侦察',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    classification: 'secret',
    summary: '发现敌方装甲车队向西北方向移动，预计2小时到达前线',
    coordinates: [32.4479, 53.7080] // 伊朗中心附近
  }
];

export const mockBDAs: BDA[] = [
  {
    targetId: 'tgt-005',
    targetDestroyed: true,
    damageLevel: 'destroyed',
    collateralDamage: '无附带损伤',
    followUpRequired: false,
    assessmentTime: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    images: []
  }
];

// Helper functions
export const getTargetById = (id: string): Target | undefined => {
  return mockTargets.find(t => t.id === id);
};

export const getWeaponById = (id: string): Weapon | undefined => {
  return mockWeapons.find(w => w.id === id);
};

export const getMissionPlanById = (id: string): MissionPlan | undefined => {
  return mockMissionPlans.find(p => p.id === id);
};

export const getTargetsByStatus = (status: Target['status']): Target[] => {
  return mockTargets.filter(t => t.status === status);
};

export const getAvailableWeapons = (): Weapon[] => {
  return mockWeapons.filter(w => w.availability === 'available');
};
