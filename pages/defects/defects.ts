import { DEFECT_TYPES, DEFECT_COMMUNITIES } from '../../utils/cityKnowledge';

interface DefectDisplayItem {
  key: string;
  name: string;
  severity: string;
  desc: string;
  coefficient: number;
  penaltyPercent: string;
  isSevere: boolean;
  category: string;
  communities: { name: string; district: string; source: string; level: string }[];
}

interface FilterTab {
  key: string;
  label: string;
}

Page({
  data: {
    defects: [] as DefectDisplayItem[],
    filteredDefects: [] as DefectDisplayItem[],
    activeCategory: 'all',
    tabs: [
      { key: 'all', label: '全部' },
      { key: 'noise', label: '噪音' },
      { key: 'environment', label: '环境' },
      { key: 'nuisance', label: '嫌恶' },
      { key: 'transport', label: '交通' },
    ] as FilterTab[],
  },

  onLoad() {
    const nameToKey: Record<string, string> = {
      '高架/高速噪音': 'highway_noise',
      '主干道噪音': 'main_road_noise',
      '公墓/殡仪馆': 'cemetery',
      '变电站/高压线': 'substation',
      '垃圾处理站': 'garbage_station',
      '污水处理厂': 'sewage_plant',
      '机场航线噪音': 'airport_noise',
      '地势低洼易涝': 'low_ground',
      '加油站/加气站': 'gas_station',
      '采光严重不足': 'poor_lighting',
      '工厂污染': 'factory_pollution',
      '治安差/红灯区': 'red_light',
    };

    const categoryMap: Record<string, string> = {
      highway_noise: 'noise',
      main_road_noise: 'noise',
      airport_noise: 'noise',
      cemetery: 'nuisance',
      garbage_station: 'nuisance',
      sewage_plant: 'nuisance',
      gas_station: 'nuisance',
      substation: 'nuisance',
      red_light: 'nuisance',
      low_ground: 'environment',
      poor_lighting: 'environment',
      factory_pollution: 'environment',
    };

    const communitiesByType: Record<string, { name: string; district: string; source: string; level: string }[]> = {};

    for (const [commName, info] of Object.entries(DEFECT_COMMUNITIES)) {
      for (const defect of info.defects) {
        const key = nameToKey[defect];
        if (!key) continue;
        if (!communitiesByType[key]) communitiesByType[key] = [];
        communitiesByType[key].push({
          name: commName,
          district: `${info.district} · ${info.businessDistrict}`,
          source: info.source,
          level: info.level,
        });
      }
    }

    const defects: DefectDisplayItem[] = DEFECT_TYPES.map((t: any) => ({
      key: t.key || '',
      name: t.name,
      severity: t.severity,
      desc: t.desc,
      coefficient: t.coefficient,
      penaltyPercent: `-${Math.round((1 - t.coefficient) * 100)}%`,
      isSevere: t.severity === '严重',
      category: categoryMap[t.key] || 'nuisance',
      communities: communitiesByType[t.key] || [],
    }));

    this.setData({
      defects,
      filteredDefects: defects,
    });
  },

  filterDefects(e: WechatMiniprogram.TouchEvent) {
    const key = e.currentTarget.dataset.key as string;
    const filtered = key === 'all'
      ? this.data.defects
      : this.data.defects.filter(d => d.category === key);
    this.setData({
      activeCategory: key,
      filteredDefects: filtered,
    });
  },
});
