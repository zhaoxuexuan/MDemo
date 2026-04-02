import * as XLSX from 'xlsx';
import type { Target } from '@/types';

// 解析Excel文件并生成目标数据
export const parseExcelData = (): Target[] => {
  try {
    // 检查是否在浏览器环境中
    if (typeof window !== 'undefined') {
      // 在浏览器环境中，返回模拟的Excel数据
      // 这里根据文件名"2026美以伊冲突军事设施损毁情况.xlsx"创建一些模拟数据
      return generateMockExcelTargets();
    }
    
    // 在Node.js环境中，尝试读取Excel文件
    const workbook = XLSX.readFile('src/data/2026美以伊冲突军事设施损毁情况.xlsx');
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // 转换为JSON
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    // 转换为Target类型
    const targets: Target[] = jsonData.map((row: any, index: number) => {
      // 提取坐标（假设Excel中有经纬度列）
      let coordinates: [number, number] = [32.4279, 53.6880]; // 默认伊朗中心坐标
      
      // 尝试从不同可能的列名中提取坐标
      if (row['纬度'] && row['经度']) {
        coordinates = [Number(row['纬度']), Number(row['经度'])];
      } else if (row['Latitude'] && row['Longitude']) {
        coordinates = [Number(row['Latitude']), Number(row['Longitude'])];
      } else if (row['lat'] && row['lng']) {
        coordinates = [Number(row['lat']), Number(row['lng'])];
      }
      
      // 确定目标类型
      let type: 'vehicle' | 'personnel' | 'infrastructure' | 'equipment' = 'infrastructure';
      const facilityType = row['设施类型'] || row['类型'] || row['Facility Type'] || '';
      
      if (facilityType.includes('车辆') || facilityType.includes('vehicle') || facilityType.includes('坦克') || facilityType.includes('armor')) {
        type = 'vehicle';
      } else if (facilityType.includes('人员') || facilityType.includes('personnel') || facilityType.includes('士兵') || facilityType.includes('troop')) {
        type = 'personnel';
      } else if (facilityType.includes('设备') || facilityType.includes('equipment') || facilityType.includes('雷达') || facilityType.includes('radar')) {
        type = 'equipment';
      }
      
      // 确定威胁级别和优先级
      let threatLevel = 50;
      let priority: 'low' | 'medium' | 'high' | 'critical' = 'medium';
      
      const damageLevel = row['损毁程度'] || row['损坏程度'] || row['Damage Level'] || '';
      if (damageLevel.includes('严重') || damageLevel.includes('destroyed') || damageLevel.includes('完全')) {
        threatLevel = 80;
        priority = 'critical';
      } else if (damageLevel.includes('中度') || damageLevel.includes('moderate') || damageLevel.includes('部分')) {
        threatLevel = 60;
        priority = 'high';
      } else if (damageLevel.includes('轻微') || damageLevel.includes('light') || damageLevel.includes('轻度')) {
        threatLevel = 40;
        priority = 'medium';
      } else {
        threatLevel = 20;
        priority = 'low';
      }
      
      return {
        id: `tgt-${String(index + 1).padStart(3, '0')}`,
        name: row['设施名称'] || row['名称'] || row['Facility Name'] || `目标 ${index + 1}`,
        type,
        coordinates,
        confidence: 90, // 默认置信度
        status: 'detected', // 默认状态
        priority,
        detectedAt: new Date().toISOString(),
        description: row['描述'] || row['Description'] || `军事设施 - ${facilityType}`,
        threatLevel
      };
    });
    
    return targets;
  } catch (error) {
    console.error('解析Excel文件失败:', error);
    // 返回模拟数据
    return generateMockExcelTargets();
  }
};

// 生成模拟的Excel目标数据
const generateMockExcelTargets = (): Target[] => {
  // 基于"2026美以伊冲突军事设施损毁情况"生成模拟数据
  const mockIranTargets: Target[] = [
    {
      id: 'tgt-007',
      name: '伊朗核设施',
      type: 'infrastructure',
      coordinates: [32.6572, 51.6677], // 伊朗纳坦兹核设施附近
      confidence: 95,
      status: 'detected',
      priority: 'critical',
      detectedAt: new Date().toISOString(),
      description: '伊朗核浓缩设施，高价值目标',
      threatLevel: 90
    },
    {
      id: 'tgt-008',
      name: '伊朗导弹基地',
      type: 'infrastructure',
      coordinates: [35.6762, 51.4231], // 德黑兰附近
      confidence: 92,
      status: 'detected',
      priority: 'critical',
      detectedAt: new Date().toISOString(),
      description: '弹道导弹存储和发射基地',
      threatLevel: 85
    },
    {
      id: 'tgt-009',
      name: '伊朗防空系统',
      type: 'equipment',
      coordinates: [32.4279, 53.6880], // 伊朗中心
      confidence: 88,
      status: 'detected',
      priority: 'high',
      detectedAt: new Date().toISOString(),
      description: 'S-300防空系统部署点',
      threatLevel: 75
    },
    {
      id: 'tgt-010',
      name: '伊朗 Revolutionary Guard基地',
      type: 'infrastructure',
      coordinates: [30.0444, 51.7225], // 设拉子附近
      confidence: 90,
      status: 'detected',
      priority: 'high',
      detectedAt: new Date().toISOString(),
      description: '革命卫队军事基地',
      threatLevel: 80
    },
    {
      id: 'tgt-011',
      name: '伊朗海军基地',
      type: 'infrastructure',
      coordinates: [29.5325, 52.5833], // 阿巴斯港
      confidence: 93,
      status: 'detected',
      priority: 'medium',
      detectedAt: new Date().toISOString(),
      description: '伊朗海军主要基地',
      threatLevel: 65
    },
    {
      id: 'tgt-012',
      name: '伊朗无人机基地',
      type: 'infrastructure',
      coordinates: [34.6399, 48.3362], // 哈马丹附近
      confidence: 85,
      status: 'detected',
      priority: 'high',
      detectedAt: new Date().toISOString(),
      description: '无人机研发和部署基地',
      threatLevel: 70
    }
  ];
  
  return mockIranTargets;
};

// 导出解析后的数据
export const excelTargets = parseExcelData();
