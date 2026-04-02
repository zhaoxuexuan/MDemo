// 战场空间管理页面的图层模拟数据

import type { Sensor, Weapon } from '@/types';

// 传感器数据
export const mockSensorsData: Sensor[] = [
  {
    id: 'sensor-1',
    name: 'GEOINT-01',
    type: 'satellite',
    status: 'active',
    location: [32.5, 54.0],
    coverage: 150000, // 150km
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'sensor-2',
    name: 'SAR-03',
    type: 'radar',
    status: 'active',
    location: [32.0, 53.5],
    coverage: 80000, // 80km
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'sensor-3',
    name: 'UAV-09',
    type: 'uav',
    status: 'active',
    location: [32.2, 53.8],
    coverage: 50000, // 50km
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'sensor-4',
    name: 'SIGINT-07',
    type: 'signal',
    status: 'active',
    location: [31.8, 54.2],
    coverage: 200000, // 200km
    lastUpdate: new Date().toISOString()
  },
  {
    id: 'sensor-5',
    name: 'GMTI-12',
    type: 'radar',
    status: 'active',
    location: [32.6, 53.2],
    coverage: 100000, // 100km
    lastUpdate: new Date().toISOString()
  }
];

// 武器部署数据
export const mockWeaponsData: Weapon[] = [
  {
    id: 'weapon-1',
    name: 'MQ-9 死神',
    type: 'drone',
    location: [32.3, 53.7],
    range: 500000, // 500km
    payload: 'Hellfire missiles',
    availability: 'available',
    cost: 1000000,
    accuracy: 95
  },
  {
    id: 'weapon-2',
    name: 'Tomahawk 巡航导弹',
    type: 'missile',
    location: [32.0, 53.0],
    range: 2500000, // 2500km
    payload: 'HE warhead',
    availability: 'available',
    cost: 1500000,
    accuracy: 90
  },
  {
    id: 'weapon-3',
    name: 'F-35 闪电 II',
    type: 'aircraft',
    location: [32.5, 54.0],
    range: 2200000, // 2200km
    payload: 'JDAM bombs',
    availability: 'available',
    cost: 80000000,
    accuracy: 98
  },
  {
    id: 'weapon-4',
    name: 'HIMARS',
    type: 'artillery',
    location: [31.9, 53.3],
    range: 300000, // 300km
    payload: 'GMLRS rockets',
    availability: 'available',
    cost: 5000000,
    accuracy: 85
  }
];

// 飞行路线数据
export const mockFlightRoutes = [
  {
    id: 'route-1',
    name: 'Strike Route Alpha',
    coordinates: [
      [32.3, 53.7] as [number, number],  // MQ-9 位置
      [32.4, 53.8] as [number, number],  // 航点1
      [32.5, 53.9] as [number, number],  // 航点2
      [32.6, 54.0] as [number, number]   // 目标区
    ],
    type: 'strike',
    status: 'active'
  },
  {
    id: 'route-2',
    name: 'Recon Route Bravo',
    coordinates: [
      [32.0, 53.5] as [number, number],  // 基地
      [32.1, 53.6] as [number, number],  // 航点1
      [32.2, 53.7] as [number, number],  // 航点2
      [32.3, 53.8] as [number, number]   // 侦察区
    ],
    type: 'reconnaissance',
    status: 'active'
  }
];

// 友军位置数据
export const mockFriendlyForces = [
  {
    id: 'friendly-1',
    name: 'Blue Force 1',
    type: 'ground',
    coordinates: [31.8, 53.0] as [number, number],
    strength: 'Company size',
    equipment: 'Infantry',
    affiliation: 'US Army'
  },
  {
    id: 'friendly-2',
    name: 'Blue Force 2',
    type: 'ground',
    coordinates: [31.9, 53.1] as [number, number],
    strength: 'Battalion size',
    equipment: 'Armor',
    affiliation: 'US Army'
  },
  {
    id: 'friendly-3',
    name: 'Blue Force 3',
    type: 'naval',
    coordinates: [30.0, 50.0] as [number, number],
    strength: 'Carrier strike group',
    equipment: 'Aircraft carrier',
    affiliation: 'US Navy'
  },
  {
    id: 'friendly-4',
    name: 'Blue Force 4',
    type: 'air',
    coordinates: [32.5, 54.0] as [number, number],
    strength: 'Squadron',
    equipment: 'F-35s',
    affiliation: 'US Air Force'
  }
];

// 关注区域数据
export const mockAreasOfInterest = [
  {
    id: 'aoi-1',
    name: '狮子目标区',
    type: 'military',
    priority: 'critical' as const,
    centerCoordinates: [32.4, 53.7] as [number, number],
    radius: 10000, // 10km
    description: '敌方防空系统部署区',
    lastIntelligence: 'High value target detected'
  },
  {
    id: 'aoi-2',
    name: '渡鸦目标区',
    type: 'military',
    priority: 'high' as const,
    centerCoordinates: [32.1, 54.2] as [number, number],
    radius: 8000, // 8km
    description: '敌方装甲部队集结区',
    lastIntelligence: 'T-72 tanks detected'
  },
  {
    id: 'aoi-3',
    name: '鹰目标区',
    type: 'military',
    priority: 'medium' as const,
    centerCoordinates: [32.6, 53.3] as [number, number],
    radius: 12000, // 12km
    description: '敌方通信枢纽',
    lastIntelligence: 'Radio emissions detected'
  }
];

// 合并所有图层数据
export const layerData = {
  sensors: mockSensorsData,
  weapons: mockWeaponsData,
  routes: mockFlightRoutes,
  friendly: mockFriendlyForces,
  aoi: mockAreasOfInterest
};