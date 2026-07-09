/**
 * 杭州城市知识库
 * 数据来源：杭州市国土空间总体规划(2021-2035)、政府公开数据、统计公报
 * 更新日期：2026-07-09
 *
 * 用途：为房产估值系统提供城市基本面判断依据
 */

export interface DistrictInfo {
  name: string;
  population2025: number; // 万人
  growthRate: number; // 近年人口增速
  urbanizationRate: number; // 城镇化率
  level: 'core' | 'subCore' | 'development' | 'suburb';
  levelName: string;
  positioning: string;
  coreIndustries: string[];
  keyAreas: string[];
  transport: string[];
  education: string[];
  priceLevel: 'S' | 'A' | 'B' | 'C' | 'D';
  priceTrend: 'up' | 'stable' | 'down';
  description: string;
}

export interface CityInfo {
  name: string;
  tier: string;
  gdp2024: number; // 万亿
  population2025: number; // 万人
  populationTarget2035: number; // 万人
  servicePopulation: number; // 万人
  urbanizationRate: number;
  talentNetInflow: number; // 人才净流入占比 %
  coreIndustry: string;
  digitalEconomyRatio: number; // 数字经济占GDP比例 %
  masterPlan: string;
  spatialPattern: string;
  capitalizationRate: {
    core: number;
    normal: number;
    suburb: number;
  };
}

// 杭州市整体信息
export const hangzhouCity: CityInfo = {
  name: '杭州',
  tier: '新一线城市（超大城市）',
  gdp2024: 2.18,
  population2025: 1270,
  populationTarget2035: 1500,
  servicePopulation: 2000,
  urbanizationRate: 85.3,
  talentNetInflow: 1.3,
  coreIndustry: '数字经济、先进制造业、现代服务业',
  digitalEconomyRatio: 29.5,
  masterPlan: '杭州市国土空间总体规划(2021-2035年)',
  spatialPattern: '一主六辅三城、三江两脉八带',
  // 资本化率：收益还原法中使用
  capitalizationRate: {
    core: 0.035,    // 核心区 3.5%
    normal: 0.045,  // 普通区 4.5%
    suburb: 0.055,  // 郊区 5.5%
  },
};

// 杭州各区信息
export const hangzhouDistricts: Record<string, DistrictInfo> = {
  '上城区': {
    name: '上城区',
    population2025: 140,
    growthRate: 0.3,
    urbanizationRate: 100,
    level: 'core',
    levelName: '核心主城区',
    positioning: '中央创新区(CID)，从CBD到CID转型',
    coreIndustries: ['具身智能', '金融', '数智时尚消费', '人文经济'],
    keyAreas: ['湖滨商圈', '钱江新城', '玉皇山南基金小镇', '钱塘智慧城'],
    transport: ['地铁1号线', '地铁4号线', '地铁7号线', '地铁9号线'],
    education: ['胜利实验学校', '天长小学', '建兰中学'],
    priceLevel: 'S',
    priceTrend: 'stable',
    description: '杭州传统核心城区，南宋皇城所在地，拥有湖滨商圈和钱江新城两大核心。正从中央商务区(CBD)向中央创新区(CID)转型，聚焦具身智能和金融产业。',
  },
  '拱墅区': {
    name: '拱墅区',
    population2025: 120,
    growthRate: 0.4,
    urbanizationRate: 100,
    level: 'core',
    levelName: '核心主城区',
    positioning: '大运河文化带核心，AI创新发展高地',
    coreIndustries: ['人工智能', '商贸金融', '生命健康', '文化旅游'],
    keyAreas: ['大运河国家文化公园', '智慧网谷小镇', 'LOFT49', '武林广场'],
    transport: ['地铁1号线', '地铁3号线', '地铁4号线', '地铁5号线'],
    education: ['卖鱼桥小学', '文澜中学', '杭州第十四中学'],
    priceLevel: 'A',
    priceTrend: 'stable',
    description: '京杭大运河穿境而过，DeepSeek诞生地。以大运河为主轴，智慧网谷小镇为核心，打造"中国算谷"。拥有深厚的工业遗存文化底蕴。',
  },
  '西湖区': {
    name: '西湖区',
    population2025: 118,
    growthRate: 0.4,
    urbanizationRate: 97.6,
    level: 'core',
    levelName: '核心主城区',
    positioning: '科教文创高地，品质活力城区',
    coreIndustries: ['人工智能', '生命健康', '空天信息(商业航天)', '人形机器人'],
    keyAreas: ['云栖小镇', '紫金港科技城', '环大学创新生态圈', '西溪湿地'],
    transport: ['地铁2号线', '地铁3号线', '地铁5号线', '地铁10号线', '地铁19号线'],
    education: ['学军小学', '保俶塔实验学校', '西湖大学', '浙江大学紫金港校区'],
    priceLevel: 'A',
    priceTrend: 'up',
    description: '坐拥西湖和浙江大学，科教资源最密集的城区。云栖小镇是商业航天核心基地，每年造1000颗卫星。环大学创新生态圈聚集大量高新技术企业。',
  },
  '滨江区': {
    name: '滨江区',
    population2025: 56,
    growthRate: 1.3,
    urbanizationRate: 100,
    level: 'core',
    levelName: '核心主城区',
    positioning: '数字经济核心区，天堂硅谷',
    coreIndustries: ['数字经济', '互联网', '物联网', '人工智能'],
    keyAreas: ['物联网小镇', '互联网小镇', '白马湖生态创意城'],
    transport: ['地铁1号线', '地铁5号线', '地铁6号线'],
    education: ['江南实验学校', '杭二中白马湖学校'],
    priceLevel: 'S',
    priceTrend: 'up',
    description: '杭州数字经济最集中的区域，阿里、网易、海康威视等总部所在地。人口虽少但密度极高，房价杭州第一梯队。产业含金量极高。',
  },
  '萧山区': {
    name: '萧山区',
    population2025: 218,
    growthRate: 0.9,
    urbanizationRate: 81.9,
    level: 'subCore',
    levelName: '主城联动区',
    positioning: '城东智造大走廊，临空经济示范区',
    coreIndustries: ['先进制造业', '临空经济', '会展经济', '总部经济'],
    keyAreas: ['钱江世纪城', '杭州萧山国际机场', '萧山经济技术开发区', '湘湖'],
    transport: ['地铁1号线', '地铁2号线', '地铁5号线', '地铁6号线', '地铁7号线', '地铁19号线'],
    education: ['萧山中学', '高桥初中', '崇文世纪城实验学校'],
    priceLevel: 'B',
    priceTrend: 'up',
    description: '杭州人口第一大区，钱江世纪城与钱江新城隔江相望，是杭州城市新封面。拥有萧山国际机场，临空经济发达。亚运会主场馆所在地。',
  },
  '余杭区': {
    name: '余杭区',
    population2025: 144,
    growthRate: 1.1,
    urbanizationRate: 75.5,
    level: 'subCore',
    levelName: '城市新中心',
    positioning: '杭州城市新中心，城西科创大走廊核心区',
    coreIndustries: ['人工智能', '数字经济', '云计算', '大数据'],
    keyAreas: ['未来科技城', '阿里巴巴总部', '杭州西站', '良渚新城', '云城'],
    transport: ['地铁3号线', '地铁5号线', '地铁16号线', '地铁19号线', '杭州西站'],
    education: ['余杭第一中学', '天元公学', '杭师大附属学校'],
    priceLevel: 'A',
    priceTrend: 'up',
    description: '杭州最具发展潜力的区域，阿里巴巴总部所在地。未来科技城是杭州"第三中心"，杭州西站是大型交通枢纽。中轴线建设打造未来城市样板。',
  },
  '临平区': {
    name: '临平区',
    population2025: 116,
    growthRate: 1.6,
    urbanizationRate: 89.5,
    level: 'subCore',
    levelName: '主城联动区',
    positioning: '数智城，智能制造高地',
    coreIndustries: ['智能制造', '生物医药', '时尚产业'],
    keyAreas: ['临平新城', '东湖新城', '大运河科创城'],
    transport: ['地铁3号线', '地铁9号线'],
    education: ['余杭高级中学', '临平第一中学'],
    priceLevel: 'B',
    priceTrend: 'stable',
    description: '2021年从余杭区分设，人口增长势头强劲。定位数智城，以智能制造为主导产业。地铁9号线直达钱江新城。',
  },
  '钱塘区': {
    name: '钱塘区',
    population2025: 81,
    growthRate: 0.6,
    urbanizationRate: 89.5,
    level: 'development',
    levelName: '重点发展区',
    positioning: '产业新城，东部湾新城',
    coreIndustries: ['生物医药', '智能制造', '新材料', '航空航天'],
    keyAreas: ['杭州医药港', '大创小镇', '东部湾新城', '下沙高教园区'],
    transport: ['地铁1号线', '地铁7号线', '地铁8号线'],
    education: ['杭州第四中学', '文海实验学校', '下沙高教园区14所高校'],
    priceLevel: 'C',
    priceTrend: 'stable',
    description: '杭州最年轻的区，以产业立区。杭州医药港是浙江省生物医药产业核心区。下沙高教园区聚集14所高校，人才储备丰富。',
  },
  '富阳区': {
    name: '富阳区',
    population2025: 86,
    growthRate: 0.3,
    urbanizationRate: 73.4,
    level: 'suburb',
    levelName: '郊区新城',
    positioning: '滨富合作区，山水宜居新城',
    coreIndustries: ['先进制造业', '生态农业', '文旅产业'],
    keyAreas: ['富阳经济技术开发区', '东洲新城', '银湖科技城'],
    transport: ['地铁6号线', '杭黄高铁富阳站'],
    education: ['富阳中学', '江南中学'],
    priceLevel: 'C',
    priceTrend: 'stable',
    description: '位于富春江畔，生态环境优越。地铁6号线已通达，与滨江区的合作加深。适合追求居住品质的改善型需求。',
  },
  '临安区': {
    name: '临安区',
    population2025: 66,
    growthRate: 0.2,
    urbanizationRate: 62.7,
    level: 'suburb',
    levelName: '郊区新城',
    positioning: '杭州都市新城区，创新策源集聚区',
    coreIndustries: ['集成电路', '农林产品加工', '生态旅游'],
    keyAreas: ['青山湖科技城', '滨湖新城', '玲珑街道'],
    transport: ['地铁16号线', '杭临绩高铁(规划)'],
    education: ['临安中学', '杭州医学院'],
    priceLevel: 'D',
    priceTrend: 'stable',
    description: '杭州西部生态屏障，森林覆盖率极高。青山湖科技城是城西科创大走廊的重要节点。适合养老和低密度居住。',
  },
  '桐庐县': {
    name: '桐庐县',
    population2025: 46,
    growthRate: 0.1,
    urbanizationRate: 72.0,
    level: 'suburb',
    levelName: '县域',
    positioning: '中国最美县城，快递产业之乡',
    coreIndustries: ['快递物流', '智能制造', '文旅康养'],
    keyAreas: ['富春山健康城', '桐庐经济开发区'],
    transport: ['杭黄高铁桐庐站', '桐庐东站'],
    education: ['桐庐中学'],
    priceLevel: 'D',
    priceTrend: 'stable',
    description: '中国最美县城，"三通一达"等快递企业发源地。杭黄高铁已开通，融入杭州1小时交通圈。',
  },
  '淳安县': {
    name: '淳安县',
    population2025: 32,
    growthRate: -0.9,
    urbanizationRate: 54.3,
    level: 'suburb',
    levelName: '生态功能区',
    positioning: '特别生态功能区，千岛湖所在地',
    coreIndustries: ['生态旅游', '饮用水产业', '绿色农业'],
    keyAreas: ['千岛湖旅游度假区', '淳安经济开发区'],
    transport: ['杭黄高铁千岛湖站'],
    education: ['淳安中学'],
    priceLevel: 'D',
    priceTrend: 'down',
    description: '千岛湖所在地，全国首个特别生态功能区。人口呈下降趋势，以生态保护和旅游为主。不适合房产投资。',
  },
  '建德市': {
    name: '建德市',
    population2025: 44,
    growthRate: -0.5,
    urbanizationRate: 55.0,
    level: 'suburb',
    levelName: '县域',
    positioning: '杭州西部综合交通枢纽',
    coreIndustries: ['新材料', '通航产业', '生态农业'],
    keyAreas: ['航空小镇', '建德经济开发区'],
    transport: ['杭黄高铁建德站', '建德千岛湖通用机场'],
    education: ['建德中学'],
    priceLevel: 'D',
    priceTrend: 'stable',
    description: '杭州西部交通枢纽，航空小镇是特色小镇。人口小幅下降，房产市场有限。',
  },
};

// 杭州重点商圈/板块等级
export const hangzhouBusinessDistricts: Record<string, { level: string; coefficient: number }> = {
  // S级：城市顶级核心
  '钱江新城': { level: 'S', coefficient: 1.25 },
  '钱江世纪城': { level: 'S', coefficient: 1.25 },
  '湖滨': { level: 'S', coefficient: 1.25 },
  '武林': { level: 'S', coefficient: 1.22 },
  '未来科技城': { level: 'S', coefficient: 1.20 },
  '奥体': { level: 'S', coefficient: 1.20 },

  // A级：城市核心
  '申花': { level: 'A', coefficient: 1.18 },
  '蒋村': { level: 'A', coefficient: 1.15 },
  '望江': { level: 'A', coefficient: 1.15 },
  '南星桥': { level: 'A', coefficient: 1.15 },
  '城东新城': { level: 'A', coefficient: 1.12 },
  '艮北新城': { level: 'A', coefficient: 1.12 },
  '亚运村': { level: 'A', coefficient: 1.15 },
  '云城': { level: 'A', coefficient: 1.15 },
  '滨江区政府': { level: 'A', coefficient: 1.18 },
  '物联网小镇': { level: 'A', coefficient: 1.15 },

  // B级：成熟板块
  '三墩': { level: 'B', coefficient: 1.08 },
  '运河新城': { level: 'B', coefficient: 1.08 },
  '祥符': { level: 'B', coefficient: 1.05 },
  '桃源': { level: 'B', coefficient: 1.05 },
  '丁桥': { level: 'B', coefficient: 1.05 },
  '笕桥': { level: 'B', coefficient: 1.05 },
  '乔司': { level: 'B', coefficient: 1.05 },
  '崇贤': { level: 'B', coefficient: 1.05 },
  '勾庄': { level: 'B', coefficient: 1.05 },
  '市北': { level: 'B', coefficient: 1.08 },
  '萧山科技城': { level: 'B', coefficient: 1.05 },
  '良渚': { level: 'B', coefficient: 1.05 },
  '闲林': { level: 'B', coefficient: 1.03 },
  '老余杭': { level: 'B', coefficient: 1.03 },
  '临平新城': { level: 'B', coefficient: 1.05 },
  '东湖新城': { level: 'B', coefficient: 1.03 },

  // C级：发展板块
  '瓶窑': { level: 'C', coefficient: 1.00 },
  '仁和': { level: 'C', coefficient: 1.00 },
  '星桥': { level: 'C', coefficient: 1.00 },
  '塘栖': { level: 'C', coefficient: 0.98 },
  '义桥': { level: 'C', coefficient: 0.98 },
  '临浦': { level: 'C', coefficient: 0.98 },
  '瓜沥': { level: 'C', coefficient: 0.98 },
  '新街': { level: 'C', coefficient: 1.00 },
  '新塘': { level: 'C', coefficient: 1.00 },
  '大江东': { level: 'C', coefficient: 1.00 },
  '河庄': { level: 'C', coefficient: 1.00 },
  '义蓬': { level: 'C', coefficient: 1.00 },

  // D级：远郊
  '富阳城区': { level: 'D', coefficient: 0.95 },
  '银湖': { level: 'D', coefficient: 0.95 },
  '东洲': { level: 'D', coefficient: 0.92 },
  '临安城区': { level: 'D', coefficient: 0.90 },
  '青山湖': { level: 'D', coefficient: 0.88 },
};

// 杭州重点学校等级（用于学区溢价计算）
export const hangzhouSchools: Record<string, { level: string; premium: number }> = {
  // 顶级学区
  '学军小学': { level: '顶级', premium: 0.45 },
  '胜利实验学校': { level: '顶级', premium: 0.40 },
  '天长小学': { level: '顶级', premium: 0.40 },
  '卖鱼桥小学': { level: '顶级', premium: 0.35 },
  '保俶塔实验学校': { level: '顶级', premium: 0.35 },

  // 优质学区
  '江南实验学校': { level: '优质', premium: 0.30 },
  '文澜中学': { level: '优质', premium: 0.30 },
  '杭二中白马湖学校': { level: '优质', premium: 0.25 },
  '崇文世纪城实验学校': { level: '优质', premium: 0.25 },
  '天元公学': { level: '优质', premium: 0.25 },
  '杭师大附属学校': { level: '优质', premium: 0.20 },

  // 普通学区
  '萧山中学': { level: '普通', premium: 0.15 },
  '余杭第一中学': { level: '普通', premium: 0.15 },
  '杭州第四中学': { level: '普通', premium: 0.15 },
  '临安中学': { level: '普通', premium: 0.10 },
  '富阳中学': { level: '普通', premium: 0.10 },
};

// 获取区域信息
export function getDistrictInfo(districtName: string): DistrictInfo | null {
  return hangzhouDistricts[districtName] || null;
}

// 获取商圈等级系数
export function getBusinessDistrictFactor(districtName: string): number {
  return hangzhouBusinessDistricts[districtName]?.coefficient || 1.0;
}

// 获取学区溢价
export function getSchoolPremium(schoolName: string): number {
  return hangzhouSchools[schoolName]?.premium || 0;
}

// 判断城市发展趋势（用于市场情绪系数）
export function getCityTrend(): {
  trend: 'hot' | 'stable' | 'cold' | 'frozen';
  description: string;
  priceAdjustment: number;
} {
  // 基于杭州当前基本面判断
  const populationGrowth = hangzhouCity.population2025 - 1262; // 近年增量
  const talentFlow = hangzhouCity.talentNetInflow;

  if (populationGrowth > 15 && talentFlow > 1.5) {
    return {
      trend: 'hot',
      description: '人口和人才持续大量流入，市场热度高',
      priceAdjustment: 0.08,
    };
  }
  if (populationGrowth > 5 && talentFlow > 1.0) {
    return {
      trend: 'stable',
      description: '人口和人才稳步流入，市场平稳',
      priceAdjustment: 0.02,
    };
  }
  if (populationGrowth > 0) {
    return {
      trend: 'cold',
      description: '人口流入放缓，市场偏冷',
      priceAdjustment: -0.05,
    };
  }
  return {
    trend: 'frozen',
    description: '人口流出，市场低迷',
    priceAdjustment: -0.15,
  };
}

// 获取区域资本化率
export function getCapRateByDistrict(districtName: string): number {
  const district = hangzhouDistricts[districtName];
  if (!district) return hangzhouCity.capitalizationRate.normal;

  switch (district.level) {
    case 'core':
      return hangzhouCity.capitalizationRate.core;
    case 'subCore':
      return (hangzhouCity.capitalizationRate.core + hangzhouCity.capitalizationRate.normal) / 2;
    case 'development':
      return hangzhouCity.capitalizationRate.normal;
    case 'suburb':
      return hangzhouCity.capitalizationRate.suburb;
    default:
      return hangzhouCity.capitalizationRate.normal;
  }
}

// 导出所有数据
export default {
  city: hangzhouCity,
  districts: hangzhouDistricts,
  businessDistricts: hangzhouBusinessDistricts,
  schools: hangzhouSchools,
  getDistrictInfo,
  getBusinessDistrictFactor,
  getSchoolPremium,
  getCityTrend,
  getCapRateByDistrict,
};
