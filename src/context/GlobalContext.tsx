import React, { createContext, useContext, useReducer } from 'react';
import type { ReactNode } from 'react';
import type { Target, Weapon, MissionPlan } from '@/types';
import { mockTargets } from '@/data/mockData';

// ==================== 类型定义 ====================

export interface NominatedTarget {
  target: Target;
  nominatedAt: string;
  stage: 'detection' | 'nomination' | 'review' | 'prosecution' | 'executed';
  reviewedAt?: string;
  assignedWeapon?: Weapon;
  timeToTarget?: number;
  missionPlan?: MissionPlan;
  assessmentResult?: AssessmentResult;
}

export interface AssessmentResult {
  status: 'success' | 'partial' | 'failed';
  collateralDamage: 'none' | 'low' | 'medium' | 'high';
  civilianCasualties: number;
  targetDestroyed: boolean;
  timestamp: string;
  notes: string;
}

export interface GlobalState {
  // 目标提名工作流
  nominatedTargets: NominatedTarget[];
  
  // 当前选中的目标（用于武器匹配）
  selectedTargetForWeapon: Target | null;
  
  // 武器匹配结果
  weaponAssignments: Array<{
    target: Target;
    weapon: Weapon;
    assignedAt: string;
    metrics: {
      timeToTarget: number;
      distance: number;
      accuracy: number;
      fuelRemaining: number;
    };
  }>;
  
  // 作战方案
  activeMissions: Array<{
    id: string;
    name: string;
    targets: Target[];
    weapons: Weapon[];
    status: 'planning' | 'approved' | 'executing' | 'completed';
    createdAt: string;
    planDetails: MissionPlan;
  }>;
  
  // 战损评估
  assessments: AssessmentResult[];
  
  // 全局通知
  notifications: Array<{
    id: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    timestamp: string;
  }>;
  
  // 系统统计
  stats: {
    totalTargetsDetected: number;
    totalTargetsNominated: number;
    totalWeaponsAssigned: number;
    totalMissionsCreated: number;
    totalAssessmentsCompleted: number;
    killChainAvgTime: number;
  };
}

// ==================== Action类型 ====================

type Action =
  | { type: 'NOMINATE_TARGET'; payload: { target: Target } }
  | { type: 'ADVANCE_STAGE'; payload: { targetId: string } }
  | { type: 'SELECT_TARGET_FOR_WEAPON'; payload: { target: Target } }
  | { type: 'ASSIGN_WEAPON'; payload: { target: Target; weapon: Weapon; metrics: any } }
  | { type: 'CREATE_MISSION'; payload: { name: string; targets: Target[]; weapons: Weapon[]; planDetails: MissionPlan } }
  | { type: 'APPROVE_MISSION'; payload: { missionId: string } }
  | { type: 'EXECUTE_MISSION'; payload: { missionId: string } }
  | { type: 'COMPLETE_MISSION'; payload: { missionId: string; result: AssessmentResult } }
  | { type: 'ADD_NOTIFICATION'; payload: Omit<GlobalState['notifications'][0], 'id' | 'timestamp'> }
  | { type: 'REMOVE_NOTIFICATION'; payload: { notificationId: string } }
  | { type: 'CLEAR_NOTIFICATIONS' };

// ==================== 初始状态 ====================

const initialState: GlobalState = {
  nominatedTargets: mockTargets.slice(0, 6).map((target, index) => ({
    target,
    nominatedAt: new Date(Date.now() - index * 3600000).toISOString(),
    stage: index < 3 ? 'detection' as const : index < 5 ? 'nomination' as const : 'review' as const
  })),
  
  selectedTargetForWeapon: null,
  
  weaponAssignments: [],
  
  activeMissions: [],
  
  assessments: [],
  
  notifications: [
    {
      id: '1',
      message: '系统初始化完成，MAVEN智能指挥系统已就绪',
      type: 'success',
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      message: `当前有 ${mockTargets.filter(t => t.priority === 'critical').length} 个紧急优先级目标需要处理`,
      type: 'warning',
      timestamp: new Date().toISOString()
    }
  ],
  
  stats: {
    totalTargetsDetected: mockTargets.length,
    totalTargetsNominated: mockTargets.filter(t => t.status === 'nominated').length,
    totalWeaponsAssigned: 0,
    totalMissionsCreated: 0,
    totalAssessmentsCompleted: 0,
    killChainAvgTime: 4.2
  }
};

// ==================== Reducer ====================

function globalReducer(state: GlobalState, action: Action): GlobalState {
  switch (action.type) {
    
    case 'NOMINATE_TARGET': {
      const existing = state.nominatedTargets.find(n => n.target.id === action.payload.target.id);
      if (existing) return state;
      
      const newNomination: NominatedTarget = {
        target: action.payload.target,
        nominatedAt: new Date().toISOString(),
        stage: 'nomination'
      };
      
      return {
        ...state,
        nominatedTargets: [...state.nominatedTargets, newNomination],
        stats: {
          ...state.stats,
          totalTargetsNominated: state.stats.totalTargetsNominated + 1
        },
        notifications: [
          {
            id: Date.now().toString(),
            message: `✓ 目标"${action.payload.target.name}"已提交至提名工作流`,
            type: 'success',
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ]
      };
    }

    case 'ADVANCE_STAGE': {
      const stageOrder: NominatedTarget['stage'][] = ['detection', 'nomination', 'review', 'prosecution', 'executed'];
      
      const updatedTargets = state.nominatedTargets.map(item => {
        if (item.target.id === action.payload.targetId) {
          const currentIndex = stageOrder.indexOf(item.stage);
          if (currentIndex < stageOrder.length - 1) {
            const nextStage = stageOrder[currentIndex + 1];
            return {
              ...item,
              stage: nextStage,
              ...(nextStage === 'nomination' ? { nominatedAt: new Date().toISOString() } : {}),
              ...(nextStage === 'review' ? { reviewedAt: new Date().toISOString() } : {})
            };
          }
        }
        return item;
      });
      
      const target = updatedTargets.find(t => t.target.id === action.payload.targetId);
      
      return {
        ...state,
        nominatedTargets: updatedTargets,
        ...(target?.stage === 'executed' ? {
          stats: {
            ...state.stats,
            totalAssessmentsCompleted: state.stats.totalAssessmentsCompleted + 1
          }
        } : {}),
        notifications: target ? [
          {
            id: Date.now().toString(),
            message: `✓ 目标"${target.target.name}"已推进至【${target.stage === 'nomination' ? '目标提名' : target.stage === 'review' ? '待审评估' : target.stage === 'prosecution' ? '打击规划' : '任务完成'}】阶段`,
            type: 'success',
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ] : state.notifications
      };
    }

    case 'SELECT_TARGET_FOR_WEAPON':
      return {
        ...state,
        selectedTargetForWeapon: action.payload.target
      };

    case 'ASSIGN_WEAPON': {
      const existingAssignment = state.weaponAssignments.find(
        w => w.target.id === action.payload.target.id
      );
      if (existingAssignment) return state;
      
      const newAssignment = {
        target: action.payload.target,
        weapon: action.payload.weapon,
        assignedAt: new Date().toISOString(),
        metrics: action.payload.metrics
      };
      
      return {
        ...state,
        weaponAssignments: [...state.weaponAssignments, newAssignment],
        selectedTargetForWeapon: null,
        stats: {
          ...state.stats,
          totalWeaponsAssigned: state.stats.totalWeaponsAssigned + 1
        },
        notifications: [
          {
            id: Date.now().toString(),
            message: `🎯 武器分配：${action.payload.weapon.name} → ${action.payload.target.name}`,
            type: 'info',
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ]
      };
    }

    case 'CREATE_MISSION': {
      const newMission = {
        id: `mission-${Date.now()}`,
        name: action.payload.name,
        targets: action.payload.targets,
        weapons: action.payload.weapons,
        status: 'planning' as const,
        createdAt: new Date().toISOString(),
        planDetails: action.payload.planDetails
      };
      
      return {
        ...state,
        activeMissions: [...state.activeMissions, newMission],
        stats: {
          ...state.stats,
          totalMissionsCreated: state.stats.totalMissionsCreated + 1
        },
        notifications: [
          {
            id: Date.now().toString(),
            message: `📋 作战方案"${action.payload.name}"已创建，包含${action.payload.targets.length}个目标`,
            type: 'info',
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ]
      };
    }

    case 'APPROVE_MISSION': {
      const updatedMissions = state.activeMissions.map(m =>
        m.id === action.payload.missionId ? { ...m, status: 'approved' as const } : m
      );
      const mission = updatedMissions.find(m => m.id === action.payload.missionId);
      
      return {
        ...state,
        activeMissions: updatedMissions,
        notifications: mission ? [
          {
            id: Date.now().toString(),
            message: `✅ 方案"${mission.name}"已获批准，可执行`,
            type: 'success',
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ] : state.notifications
      };
    }

    case 'EXECUTE_MISSION': {
      const updatedMissions = state.activeMissions.map(m =>
        m.id === action.payload.missionId ? { ...m, status: 'executing' as const } : m
      );
      const mission = updatedMissions.find(m => m.id === action.payload.missionId);
      
      return {
        ...state,
        activeMissions: updatedMissions,
        notifications: mission ? [
          {
            id: Date.now().toString(),
            message: `🚀 方案"${mission.name}"正在执行中...`,
            type: 'warning',
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ] : state.notifications
      };
    }

    case 'COMPLETE_MISSION': {
      const updatedMissions = state.activeMissions.map(m =>
        m.id === action.payload.missionId ? { ...m, status: 'completed' as const } : m
      );
      const mission = updatedMissions.find(m => m.id === action.payload.missionId);
      
      return {
        ...state,
        activeMissions: updatedMissions,
        assessments: [...state.assessments, action.payload.result],
        notifications: mission ? [
          {
            id: Date.now().toString(),
            message: action.payload.result.status === 'success'
              ? `🎉 任务成功！目标已被摧毁`
              : action.payload.result.status === 'partial'
                ? `⚠️ 任务部分完成，附带损伤：${action.payload.result.collateralDamage}`
                : `❌ 任务失败，目标未被摧毁`,
            type: action.payload.result.status === 'success' ? 'success' : 'warning',
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ] : state.notifications
      };
    }

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [
          {
            ...action.payload,
            id: Date.now().toString(),
            timestamp: new Date().toISOString()
          },
          ...state.notifications
        ].slice(0, 10)
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload.notificationId)
      };

    case 'CLEAR_NOTIFICATIONS':
      return {
        ...state,
        notifications: []
      };

    default:
      return state;
  }
}

// ==================== Context ====================

interface GlobalContextType {
  state: GlobalState;
  dispatch: React.Dispatch<Action>;
  // 便捷方法
  nominateTarget: (target: Target) => void;
  advanceStage: (targetId: string) => void;
  selectForWeapon: (target: Target) => void;
  assignWeapon: (target: Target, weapon: Weapon, metrics: any) => void;
  createMission: (name: string, targets: Target[], weapons: Weapon[], plan: MissionPlan) => void;
  approveMission: (missionId: string) => void;
  executeMission: (missionId: string) => void;
  completeMission: (missionId: string, result: AssessmentResult) => void;
  addNotification: (message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(globalReducer, initialState);

  const value: GlobalContextType = {
    state,
    dispatch,
    
    nominateTarget: (target) => {
      dispatch({ type: 'NOMINATE_TARGET', payload: { target } });
    },

    advanceStage: (targetId) => {
      dispatch({ type: 'ADVANCE_STAGE', payload: { targetId } });
    },

    selectForWeapon: (target) => {
      dispatch({ type: 'SELECT_TARGET_FOR_WEAPON', payload: { target } });
    },

    assignWeapon: (target, weapon, metrics) => {
      dispatch({ type: 'ASSIGN_WEAPON', payload: { target, weapon, metrics } });
    },

    createMission: (name, targets, weapons, plan) => {
      dispatch({ type: 'CREATE_MISSION', payload: { name, targets, weapons, planDetails: plan } });
    },

    approveMission: (missionId) => {
      dispatch({ type: 'APPROVE_MISSION', payload: { missionId } });
    },

    executeMission: (missionId) => {
      dispatch({ type: 'EXECUTE_MISSION', payload: { missionId } });
    },

    completeMission: (missionId, result) => {
      dispatch({ type: 'COMPLETE_MISSION', payload: { missionId, result } });
    },

    addNotification: (message, type = 'info') => {
      dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } });
    }
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
    </GlobalContext.Provider>
  );
}

export function useGlobalState() {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalState must be used within a GlobalProvider');
  }
  return context;
}