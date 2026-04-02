// Target Types
export interface Target {
  id: string;
  name: string;
  type: 'vehicle' | 'personnel' | 'infrastructure' | 'equipment';
  coordinates: [number, number];
  confidence: number;
  status: 'detected' | 'nominated' | 'approved' | 'engaged' | 'assessed' | 'complete';
  priority: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: string;
  imageUrl?: string;
  description?: string;
  threatLevel: number;
}

// Weapon Types
export interface Weapon {
  id: string;
  name: string;
  type: 'missile' | 'drone' | 'artillery' | 'aircraft' | 'naval';
  range: number;
  payload: string;
  availability: 'available' | 'standby' | 'engaged' | 'maintenance';
  location: [number, number];
  eta?: number;
  cost: number;
  accuracy: number;
}

// Mission Plan Types
export interface MissionPlan {
  id: string;
  targetId: string;
  weaponId: string;
  weaponName: string;
  estimatedCasualties: number;
  collateralDamage: 'minimal' | 'low' | 'moderate' | 'high';
  successProbability: number;
  timeToImpact: number;
  cost: number;
  status: 'proposed' | 'approved' | 'executing' | 'completed';
}

// Sensor Types
export interface Sensor {
  id: string;
  name: string;
  type: 'uav' | 'satellite' | 'radar' | 'signal';
  status: 'active' | 'standby' | 'offline';
  location: [number, number];
  coverage: number;
  lastUpdate: string;
}

// Battle Damage Assessment
export interface BDA {
  targetId: string;
  targetDestroyed: boolean;
  damageLevel: 'none' | 'light' | 'moderate' | 'severe' | 'destroyed';
  collateralDamage: string;
  followUpRequired: boolean;
  assessmentTime: string;
  images: string[];
}

// Intelligence Report
export interface IntelReport {
  id: string;
  title: string;
  source: string;
  timestamp: string;
  classification: 'unclassified' | 'confidential' | 'secret' | 'topsecret';
  summary: string;
  coordinates?: [number, number];
}

// User Types
export interface User {
  id: string;
  name: string;
  role: 'operator' | 'analyst' | 'commander' | 'admin';
  clearance: string;
  unit: string;
}

// System Status
export interface SystemStatus {
  online: boolean;
  lastSync: string;
  activeSensors: number;
  pendingTargets: number;
  activeMissions: number;
  dataSources: number;
}
