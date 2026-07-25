/**
 * 杭州城市知识库
 * 数据整理自公开信息：杭州市城市发展规划参考、公开统计数据、统计公报
 * 更新日期：2026-07-09
 *
 * 用途：为房产参考测算提供城市基本面信息参考
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
  masterPlan: '杭州市城市发展规划(2021-2035年参考)',
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
export const hangzhouBusinessDistricts: Record<string, { level: string; coefficient: number; basePrice: number }> = {
  // S级：城市顶级核心
  '钱江新城': { level: 'S', coefficient: 1.25, basePrice: 70000 },
  '钱江世纪城': { level: 'S', coefficient: 1.25, basePrice: 65000 },
  '湖滨': { level: 'S', coefficient: 1.25, basePrice: 68000 },
  '武林': { level: 'S', coefficient: 1.22, basePrice: 65000 },
  '未来科技城': { level: 'S', coefficient: 1.20, basePrice: 45000 },
  '奥体': { level: 'S', coefficient: 1.20, basePrice: 60000 },

  // A级：城市核心
  '申花': { level: 'A', coefficient: 1.18, basePrice: 55000 },
  '蒋村': { level: 'A', coefficient: 1.15, basePrice: 50000 },
  '望江': { level: 'A', coefficient: 1.15, basePrice: 58000 },
  '南星桥': { level: 'A', coefficient: 1.15, basePrice: 55000 },
  '城东新城': { level: 'A', coefficient: 1.12, basePrice: 48000 },
  '艮北新城': { level: 'A', coefficient: 1.12, basePrice: 42000 },
  '亚运村': { level: 'A', coefficient: 1.15, basePrice: 50000 },
  '云城': { level: 'A', coefficient: 1.15, basePrice: 35000 },
  '滨江区政府': { level: 'A', coefficient: 1.18, basePrice: 52000 },
  '物联网小镇': { level: 'A', coefficient: 1.15, basePrice: 48000 },

  // B级：成熟板块
  '三墩': { level: 'B', coefficient: 1.08, basePrice: 38000 },
  '运河新城': { level: 'B', coefficient: 1.08, basePrice: 36000 },
  '祥符': { level: 'B', coefficient: 1.05, basePrice: 35000 },
  '桃源': { level: 'B', coefficient: 1.05, basePrice: 32000 },
  '丁桥': { level: 'B', coefficient: 1.05, basePrice: 30000 },
  '笕桥': { level: 'B', coefficient: 1.05, basePrice: 33000 },
  '乔司': { level: 'B', coefficient: 1.05, basePrice: 28000 },
  '崇贤': { level: 'B', coefficient: 1.05, basePrice: 25000 },
  '勾庄': { level: 'B', coefficient: 1.05, basePrice: 26000 },
  '市北': { level: 'B', coefficient: 1.08, basePrice: 38000 },
  '萧山科技城': { level: 'B', coefficient: 1.05, basePrice: 32000 },
  '良渚': { level: 'B', coefficient: 1.05, basePrice: 22000 },
  '闲林': { level: 'B', coefficient: 1.03, basePrice: 20000 },
  '老余杭': { level: 'B', coefficient: 1.03, basePrice: 19000 },
  '临平新城': { level: 'B', coefficient: 1.05, basePrice: 28000 },
  '东湖新城': { level: 'B', coefficient: 1.03, basePrice: 25000 },

  // C级：发展板块
  '瓶窑': { level: 'C', coefficient: 1.00, basePrice: 18000 },
  '仁和': { level: 'C', coefficient: 1.00, basePrice: 17000 },
  '星桥': { level: 'C', coefficient: 1.00, basePrice: 22000 },
  '塘栖': { level: 'C', coefficient: 0.98, basePrice: 15000 },
  '义桥': { level: 'C', coefficient: 0.98, basePrice: 20000 },
  '临浦': { level: 'C', coefficient: 0.98, basePrice: 16000 },
  '瓜沥': { level: 'C', coefficient: 0.98, basePrice: 14000 },
  '新街': { level: 'C', coefficient: 1.00, basePrice: 22000 },
  '新塘': { level: 'C', coefficient: 1.00, basePrice: 20000 },
  '大江东': { level: 'C', coefficient: 1.00, basePrice: 16000 },
  '河庄': { level: 'C', coefficient: 1.00, basePrice: 15000 },
  '义蓬': { level: 'C', coefficient: 1.00, basePrice: 15000 },

  // D级：远郊
  '富阳城区': { level: 'D', coefficient: 0.95, basePrice: 18000 },
  '银湖': { level: 'D', coefficient: 0.95, basePrice: 16000 },
  '东洲': { level: 'D', coefficient: 0.92, basePrice: 14000 },
  '临安城区': { level: 'D', coefficient: 0.90, basePrice: 13000 },
  '青山湖': { level: 'D', coefficient: 0.88, basePrice: 12000 },
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

// 杭州硬伤位置数据库（长期固定的不利设施）
// 数据来源：杭州市政府公开数据、殡仪馆一览表、公墓名录、环保设施公示
export interface DefectLocation {
  name: string;
  type: 'highway' | 'cemetery' | 'funeral_home' | 'garbage_incinerator' | 'garbage_landfill' | 'wastewater_treatment' | 'substation' | 'gas_station';
  district: string;
  address: string;
  description: string;
  impactRadius: number; // 影响半径（米）
  severity: 'high' | 'medium' | 'low';
}

export const hangzhouDefectLocations: DefectLocation[] = [
  // ========== 高架快速路 ==========
  // 中河高架
  { name: '中河高架路', type: 'highway', district: '上城区', address: '上城区-西湖区', description: '贯穿主城南北的核心高架', impactRadius: 150, severity: 'high' },
  // 秋石高架
  { name: '秋石高架路', type: 'highway', district: '上城区', address: '上城区-江干区-临平区', description: '连接主城区与临平的主要通道', impactRadius: 150, severity: 'high' },
  // 德胜高架
  { name: '德胜快速路', type: 'highway', district: '拱墅区', address: '拱墅区-江干区', description: '城东重要东西向快速路', impactRadius: 150, severity: 'high' },
  // 留石高架
  { name: '留石快速路', type: 'highway', district: '拱墅区', address: '拱墅区-西湖区-余杭区', description: '城北重要东西向快速路', impactRadius: 150, severity: 'high' },
  // 时代高架
  { name: '时代大道高架', type: 'highway', district: '滨江区', address: '滨江区-萧山区', description: '连接滨江与萧山的主要通道', impactRadius: 150, severity: 'high' },
  // 风情大道高架
  { name: '风情大道高架', type: 'highway', district: '萧山区', address: '萧山区', description: '萧山重要南北向快速路', impactRadius: 150, severity: 'high' },
  // 通城高架
  { name: '通城高架路', type: 'highway', district: '萧山区', address: '萧山区', description: '贯穿萧山城区的东西向快速路', impactRadius: 150, severity: 'high' },
  // 东湖高架
  { name: '东湖高架路', type: 'highway', district: '临平区', address: '临平区', description: '连接临平与主城区的快速路', impactRadius: 150, severity: 'high' },
  // 运溪高架
  { name: '运溪高架路', type: 'highway', district: '余杭区', address: '余杭区', description: '城西科创大走廊重要通道', impactRadius: 150, severity: 'high' },
  // 彩虹高架
  { name: '彩虹快速路', type: 'highway', district: '滨江区', address: '滨江区-西湖区-富阳区', description: '连接滨江、之江与富阳', impactRadius: 150, severity: 'high' },
  // 文一西路高架
  { name: '文一西路快速路', type: 'highway', district: '西湖区', address: '西湖区-余杭区', description: '未来科技城核心主干道', impactRadius: 150, severity: 'high' },
  // 天目山路快速路
  { name: '天目山路快速路', type: 'highway', district: '西湖区', address: '西湖区', description: '城西重要东西向快速路', impactRadius: 150, severity: 'high' },
  // 莫干山路高架
  { name: '莫干山路高架', type: 'highway', district: '拱墅区', address: '拱墅区-余杭区', description: '城北重要南北向快速路', impactRadius: 150, severity: 'high' },
  // 钱塘快速路
  { name: '钱塘快速路', type: 'highway', district: '上城区', address: '上城区-江干区', description: '贯穿城东的东西向快速路', impactRadius: 150, severity: 'high' },
  // 望梅高架
  { name: '望梅高架路', type: 'highway', district: '临平区', address: '临平区', description: '临平重要南北向快速路', impactRadius: 150, severity: 'high' },

  // ========== 殡仪馆 ==========
  { name: '杭州殡仪馆', type: 'funeral_home', district: '西湖区', address: '西湖区西溪路731号', description: '杭州市区主要殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '萧山区殡仪馆', type: 'funeral_home', district: '萧山区', address: '萧山区蜀山街道立新村', description: '萧山区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '临平区殡仪馆', type: 'funeral_home', district: '临平区', address: '临平区塘栖镇超山村', description: '临平区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '余杭区殡仪馆', type: 'funeral_home', district: '余杭区', address: '余杭区径山镇香下桥村', description: '余杭区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '富阳区殡仪馆', type: 'funeral_home', district: '富阳区', address: '富阳区新桐乡程浦村长山弄', description: '富阳区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '临安区殡仪馆', type: 'funeral_home', district: '临安区', address: '临安区玲珑街道雅坞村78号', description: '临安区殡仪馆', impactRadius: 2000, severity: 'high' },

  // ========== 公墓/陵园 ==========
  { name: '南山陵园', type: 'cemetery', district: '上城区', address: '上城区玉皇山片区白云路66号', description: '市区老牌公办陵园，紧邻八卦田', impactRadius: 1500, severity: 'high' },
  { name: '杭州第二公墓', type: 'cemetery', district: '西湖区', address: '西湖区留下镇石马村午潮山麓', description: '城西大型公墓', impactRadius: 1500, severity: 'high' },
  { name: '半山公墓', type: 'cemetery', district: '拱墅区', address: '拱墅区半山路298号', description: '城北大型公墓', impactRadius: 1500, severity: 'high' },
  { name: '半山生态公墓', type: 'cemetery', district: '拱墅区', address: '拱墅区广济路186-5号', description: '半山风景区内公墓', impactRadius: 1500, severity: 'high' },
  { name: '浙江安贤陵园', type: 'cemetery', district: '临平区', address: '临平区崇贤街道水洪庙村', description: '城北大型人文纪念园，占地约1000亩', impactRadius: 2000, severity: 'high' },
  { name: '钱江陵园', type: 'cemetery', district: '西湖区', address: '西湖区双浦镇周富村', description: '城南大型山水型陵园', impactRadius: 1500, severity: 'high' },
  { name: '如意陵园', type: 'cemetery', district: '余杭区', address: '余杭区径山镇麻车头村', description: '余杭区大型陵园', impactRadius: 2000, severity: 'high' },
  { name: '慈福园陵园', type: 'cemetery', district: '萧山区', address: '萧山区蜀山街道章潘桥村', description: '萧山区大型陵园', impactRadius: 1500, severity: 'high' },
  { name: '山南陵园', type: 'cemetery', district: '萧山区', address: '萧山区衙前镇山南富村', description: '萧山区陵园', impactRadius: 1500, severity: 'medium' },
  { name: '临安天竹园公墓', type: 'cemetery', district: '临安区', address: '临安区玲珑街道前山村', description: '临安区公墓', impactRadius: 1500, severity: 'medium' },
  { name: '华侨永久陵园', type: 'cemetery', district: '上城区', address: '上城区丁桥镇高城村', description: '上城区公墓', impactRadius: 1500, severity: 'medium' },
  { name: '龙居寺陵园', type: 'cemetery', district: '上城区', address: '上城区丁桥镇皋城村', description: '丁桥片区公墓', impactRadius: 1500, severity: 'medium' },

  // ========== 垃圾焚烧厂 ==========
  { name: '杭州九峰垃圾焚烧发电厂', type: 'garbage_incinerator', district: '余杭区', address: '余杭区中泰街道九峰石矿内', description: '日处理3000吨，城西主要垃圾处理设施', impactRadius: 3000, severity: 'high' },
  { name: '杭州绿能环保发电厂', type: 'garbage_incinerator', district: '滨江区', address: '滨江区', description: '滨江垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '杭州能达绿色能源有限公司', type: 'garbage_incinerator', district: '临平区', address: '临平区乔司街道', description: '乔司垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '杭州萧山锦江绿色能源有限公司', type: 'garbage_incinerator', district: '萧山区', address: '萧山区', description: '萧山垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '杭州临江环境能源项目', type: 'garbage_incinerator', district: '钱塘区', address: '钱塘区临江循环经济产业园', description: '日处理5200吨，杭州最大垃圾焚烧项目', impactRadius: 3000, severity: 'high' },
  { name: '杭州临安绿能环保发电有限公司', type: 'garbage_incinerator', district: '临安区', address: '临安区锦南街道', description: '临安区垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '富阳区循环产业园生活垃圾焚烧项目', type: 'garbage_incinerator', district: '富阳区', address: '富阳区渌渚镇', description: '日处理1500吨', impactRadius: 2000, severity: 'high' },

  // ========== 垃圾填埋场 ==========
  { name: '天子岭垃圾填埋场', type: 'garbage_landfill', district: '拱墅区', address: '拱墅区半山街道', description: '已封场，生态治理中', impactRadius: 2000, severity: 'medium' },

  // ========== 污水处理厂 ==========
  { name: '城西（蒋村）污水处理厂', type: 'wastewater_treatment', district: '西湖区', address: '西湖区三墩镇塘河村竹牌头巷1号', description: '日处理10万吨，服务蒋村、西溪、三墩', impactRadius: 1000, severity: 'medium' },
  { name: '临平净水厂', type: 'wastewater_treatment', district: '临平区', address: '临平区东湖街道红梅路1号', description: '全地埋式，日处理20万吨', impactRadius: 800, severity: 'low' },
  { name: '七格污水处理厂', type: 'wastewater_treatment', district: '上城区', address: '上城区下沙片区', description: '大型污水处理厂', impactRadius: 1000, severity: 'medium' },
  { name: '城北净水厂', type: 'wastewater_treatment', district: '拱墅区', address: '拱墅区半山街道', description: '全地埋式，日处理10万吨', impactRadius: 800, severity: 'low' },
  { name: '之江净水厂', type: 'wastewater_treatment', district: '西湖区', address: '西湖区之江度假区', description: '全地埋式，上盖停车场', impactRadius: 800, severity: 'low' },
  { name: '临江高科园污水处理厂', type: 'wastewater_treatment', district: '钱塘区', address: '钱塘区临江高科园', description: '化工类工业污水处理厂', impactRadius: 2000, severity: 'high' },
  { name: '余杭污水处理厂', type: 'wastewater_treatment', district: '余杭区', address: '余杭区', description: '日处理13.5万吨', impactRadius: 1000, severity: 'medium' },

  // ========== 大型变电站 ==========
  { name: '杭州500kV变电站（瓶窑）', type: 'substation', district: '余杭区', address: '余杭区瓶窑镇', description: '大型500kV变电站', impactRadius: 500, severity: 'high' },
  { name: '杭州220kV变电站（三墩）', type: 'substation', district: '西湖区', address: '西湖区三墩镇', description: '220kV变电站', impactRadius: 300, severity: 'medium' },
  { name: '杭州220kV变电站（九堡）', type: 'substation', district: '上城区', address: '上城区九堡街道', description: '220kV变电站', impactRadius: 300, severity: 'medium' },
  { name: '杭州220kV变电站（临平）', type: 'substation', district: '临平区', address: '临平区', description: '220kV变电站', impactRadius: 300, severity: 'medium' },
];

// 根据区域查找附近硬伤
export function findNearbyDefects(districtName: string, businessDistrict?: string): DefectLocation[] {
  return hangzhouDefectLocations.filter(defect => {
    // 精确匹配区域
    if (defect.district === districtName) return true;
    
    // 商圈匹配（部分商圈跨区域）
    if (businessDistrict) {
      // 一些商圈跨区域的特殊情况
      const crossDistrictMap: Record<string, string[]> = {
        '申花': ['拱墅区', '西湖区'],
        '蒋村': ['西湖区'],
        '城东新城': ['上城区'],
        '艮北新城': ['上城区'],
        '运河新城': ['拱墅区'],
      };
      const districtsForBD = crossDistrictMap[businessDistrict];
      if (districtsForBD && districtsForBD.includes(defect.district)) return true;
    }
    
    return false;
  });
}

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

// 杭州重点学校详细数据（用于学区匹配）
export interface SchoolInfo {
  name: string;
  type: 'kindergarten' | 'primary' | 'middle' | 'high';
  level: '顶尖' | '优质' | '普通';
  premium: number;
}

export const SCHOOLS: Record<string, SchoolInfo> = {
  // 小学
  '学军小学-primary': { name: '学军小学', type: 'primary', level: '顶尖', premium: 0.35 },
  '文三街小学-primary': { name: '文三街小学', type: 'primary', level: '顶尖', premium: 0.35 },
  '天长小学-primary': { name: '天长小学', type: 'primary', level: '顶尖', premium: 0.35 },
  '胜利小学-primary': { name: '胜利小学', type: 'primary', level: '顶尖', premium: 0.35 },
  '保俶塔实验学校-primary': { name: '保俶塔实验学校', type: 'primary', level: '优质', premium: 0.25 },
  '采荷一小-primary': { name: '采荷一小', type: 'primary', level: '优质', premium: 0.25 },
  '江南实验学校-primary': { name: '江南实验学校', type: 'primary', level: '优质', premium: 0.25 },
  '崇文小学-primary': { name: '崇文小学', type: 'primary', level: '优质', premium: 0.25 },
  '育才外国语-primary': { name: '育才外国语', type: 'primary', level: '普通', premium: 0.15 },
  '濮家小学-primary': { name: '濮家小学', type: 'primary', level: '普通', premium: 0.10 },
  '丁兰小学-primary': { name: '丁兰小学', type: 'primary', level: '普通', premium: 0.10 },
  // 初中
  '文澜中学-middle': { name: '文澜中学', type: 'middle', level: '顶尖', premium: 0.35 },
  '建兰中学-middle': { name: '建兰中学', type: 'middle', level: '顶尖', premium: 0.35 },
  '公益中学-middle': { name: '公益中学', type: 'middle', level: '顶尖', premium: 0.35 },
  '采荷实验-middle': { name: '采荷实验', type: 'middle', level: '优质', premium: 0.25 },
  '江南实验学校-middle': { name: '江南实验学校', type: 'middle', level: '优质', premium: 0.25 },
  '杭二中白马湖学校-middle': { name: '杭二中白马湖学校', type: 'middle', level: '优质', premium: 0.25 },
  '崇文世纪城实验学校-middle': { name: '崇文世纪城实验学校', type: 'middle', level: '优质', premium: 0.25 },
  '天元公学-middle': { name: '天元公学', type: 'middle', level: '优质', premium: 0.25 },
  '杭师大附属学校-middle': { name: '杭师大附属学校', type: 'middle', level: '优质', premium: 0.20 },
  // 高中
  '杭州第二中学-high': { name: '杭州第二中学', type: 'high', level: '顶尖', premium: 0.20 },
  '杭州学军中学-high': { name: '杭州学军中学', type: 'high', level: '顶尖', premium: 0.20 },
  '杭州高级中学-high': { name: '杭州高级中学', type: 'high', level: '顶尖', premium: 0.20 },
  '杭州第四中学-high': { name: '杭州第四中学', type: 'high', level: '普通', premium: 0.10 },
  '萧山中学-high': { name: '萧山中学', type: 'high', level: '普通', premium: 0.10 },
  '余杭第一中学-high': { name: '余杭第一中学', type: 'high', level: '普通', premium: 0.10 },
  '临安中学-high': { name: '临安中学', type: 'high', level: '普通', premium: 0.05 },
  '富阳中学-high': { name: '富阳中学', type: 'high', level: '普通', premium: 0.05 },
  // 幼儿园
  '省府机关幼儿园-kindergarten': { name: '省府机关幼儿园', type: 'kindergarten', level: '优质', premium: 0.10 },
  '杭州市机关幼儿园-kindergarten': { name: '杭州市机关幼儿园', type: 'kindergarten', level: '优质', premium: 0.10 },
  '西湖区文三路幼儿园-kindergarten': { name: '西湖区文三路幼儿园', type: 'kindergarten', level: '优质', premium: 0.08 },
};

// 区域-商圈映射
export const DISTRICT_BD_MAP: Record<string, string[]> = {
  '上城区': ['钱江新城', '湖滨', '望江', '南星桥', '城东新城', '艮北新城'],
  '拱墅区': ['武林', '运河新城', '祥符', '桃源', '申花'],
  '西湖区': ['蒋村', '三墩'],
  '滨江区': ['滨江区政府', '物联网小镇'],
  '萧山区': ['钱江世纪城', '奥体', '亚运村', '市北', '萧山科技城', '义桥', '临浦', '瓜沥', '新街', '新塘'],
  '余杭区': ['未来科技城', '云城', '良渚', '闲林', '老余杭', '瓶窑', '仁和'],
  '临平区': ['临平新城', '东湖新城', '乔司', '崇贤', '勾庄', '星桥', '塘栖'],
  '钱塘区': ['大江东', '河庄', '义蓬'],
  '富阳区': ['富阳城区', '银湖', '东洲'],
  '临安区': ['临安城区', '青山湖'],
};

// 社区-商圈映射（区域-商圈-小区列表）
export const COMMUNITY_MAPPING: Record<string, Record<string, string[]>> = {
  '西湖区': {
    '文教区': ['学军小学本部', '文三街小学', '文一街小学', '文澜中学', '保俶塔实验', '十三中', '耀江文鼎苑', '西城年华', '文苑小区', '翠苑四区'],
    '蒋村': ['绿城西溪诚园', '万科西庐', '绿城西溪融庄', '融创河滨之城', '中海西溪华府', '金地自在城', '滨江紫金府', '西溪诚明苑', '西溪诚园正信苑'],
    '申花': ['绿城沁园', '融创宜和园', '九龙仓碧玺', '滨江锦绣之城', '建发养云静舍', '华润幸福里', '绿城晓风印月', '滨江和品', '金茂府', '绿城慧园', '欣盛东方福邸', '保利香槟国际', '滨江万家花城', '融信蓝孔雀', '龙湖天钜', '九龙仓珑玺', '星瓒颂锦府', '馥香园', '杭樾润府', '揽云锦绣里', '杭著瑧邸', '霞映锦绣里', '嘉映锦绣里', '滨杭传麒府', '绿城锦绣兰庭', '融信公馆ARC'],
    '三墩': ['万科融信西雅图', '龙湖水晶郦城', '越秀星汇城', '阳光城未来悦', '金地格林格林', '融创金成臻蓝府', '中海紫藤苑', '天阳美林湾', '都市水乡'],
    '之江': ['恒大水晶国际广场', '中海云宸', '宋城', '之江九里', '之江家园', '九溪新村', '民航小区', '中天九溪诚品', '融科瑷骊山', '之江一号'],
    '留下': ['和家园', '西溪里', '翡翠城', '绿城桃花源', '西溪山庄', '西溪谷', '龙门坎村'],
    '转塘': ['之江银泰城', '中天九溪诚品', '融科瑷骊山', '龙坞茶镇', '象山国际'],
  },
  '上城区': {
    '钱江新城': ['绿城蓝色钱江', '金色海岸', '阳光海岸', '万象城悦府', '绿城留香园', '融创涌清府', '信达滨江壹品', '绿城江河汇', '杭州壹号院', '绿城春江花月', '金基晓庐', '阳光国际', '信达外滩壹号', '望江府', '融创侯潮府', '滨江金茂府', '新希望滨江锦粼府', '望江新城'],
    '钱江新城二期': ['芝澜月华', '潮映万象轩', '栖江揽月轩', '江月望云', '潮观揽月轩', '天澜海岸', '观翠揽月', '潮语映月轩', '玉澜月华'],
    '湖滨': ['湖滨银泰', '龙翔桥', '涌金门', '东坡路小区'],
    '望江': ['望江府', '融创侯潮府', '滨江金茂府', '望江新城', '新希望滨江锦粼府', '绿城望江府'],
    '南星桥': ['绿城春江花月', '金基晓庐', '阳光国际', '绿城之江一号', '信达外滩壹号', '金色海岸', '阳光海岸', '蓝色钱江'],
    '城东新城': ['万科大家世纪之光', '融创玖樟台', '滨江金色黎明', '龙湖天曜', '招商武林郡', '越秀亲爱里', '滨江御虹府', '新中宇维萨', '德信东望', '金色黎明'],
    '艮北新城': ['绿城杨柳郡', '招商武林郡', '越秀亲爱里', '滨江御虹府', '翠揽云境', '万科潮起东方', '绿城潮听明月'],
    '丁兰': ['龙湖名景台', '远洋香奈', '万科城', '融信澜天', '郡枫绿园'],
  },
  '拱墅区': {
    '申花': ['绿城慧园', '欣盛东方福邸', '保利香槟国际', '滨江万家花城', '融信蓝孔雀', '龙湖天钜', '九龙仓珑玺', '绿城沁园', '融创宜和园', '九龙仓碧玺', '滨江锦绣之城', '建发养云静舍', '华润幸福里', '绿城晓风印月', '滨江和品', '星瓒颂锦府', '馥香园', '杭樾润府', '融信公馆ARC', '锦绣兰庭'],
    '运河新城': ['融创金成臻蓝府', '绿都东澜府', '远洋心里', '德信大家运河云庄', '万科杭行道', '越秀星汇尚城', '融创瑷颐湾', '大家漾山府', '吉如家园'],
    '祥符': ['万科杭行道', '越秀星汇尚城', '融创瑷颐湾', '大家漾山府', '滨江万家名城', '德信晓宸'],
    '武林': ['武林壹号', '绿城兰园', '深蓝广场', '坤和中心', '杭州大厦', '杭州中心'],
    '桃源': ['金辉贤林信步', '融创森与海', '绿都云和湖', '宋都香悦郡'],
    '丁桥': ['龙湖名景台', '远洋香奈', '万科城', '融信澜天', '郡枫绿园'],
    '东新': ['滨江万家星城', '世茂天宸', '东新园'],
  },
  '滨江区': {
    '滨江区政府': ['东方郡', '江南实验学校', '绿城明月江南', '龙湖春江彼岸', '滨江金茂府', '中海寰宇天下', '信达中心|杭州壹号院', '寰宇天下', '钱塘春晓花园', '中兴花园'],
    '奥体': ['杭州壹号院', '滨江金茂府', '寰宇天下', '时代奥城', '龙湖春江彼岸', '融创创世纪', '绿城桂语江南', '奥邸国际', '信达中心杭州壹号院'],
    '物联网小镇': ['滨江江南之星', '融创江南壹号院', '保利东湾', '世茂之西湖', '龙湖春江天玺'],
    '彩虹城': ['彩虹城', '水晶城', '绿城春江明月', '滨江宝龙城市广场', '银杏汇公寓', '银爵世纪', '江荣府'],
    '长河': ['龙湖春江天玺', '绿城桂语江南', '融信保利创世纪', '春江彼岸'],
    '浦沿': ['绿城晓风印月', '中海云宸', '绿城春来晴翠', '江荣府', '银爵世纪', '钱塘春晓花园', '中天官河锦庭'],
    '西兴': ['江南实验学校', '钱塘春晓花园', '中兴花园', '官河锦庭'],
  },
  '余杭区': {
    '未来科技城': [
      '绿城西溪云庐', '融创金成未来海', '中南樾府', '阳光城未来悦MAX',
      '新湖果岭', '绿城翡翠城', '万科溪望', '合景天峻',
      '融创河滨之城', '富力西溪悦居', '绿城桃李春风',
      '龙湖水晶郦城', '万科劝学里', '金成英特学府', '新城西溪逸境',
      '西溪蓝海', '华夏四季', '融信澜天',
      '中梁百悦城', '奥克斯缔逸城', '富力桃园', '和昌府',
      '德信海德公园', '越秀景瑞悦见山', '龙湖天钜',
      '阳光城翡丽海岸', '万科杭宸', '新城香悦公馆',
      '融创云潮府', '建发云湖之城', '葛洲坝紫郡府', '宝龙旭辉城',
      '中南未来里', '越秀维多利中心', '西溪永乐城', '西溪华东园',
      '宏旺西溪阳光', '天都城', '广厦天都城', '香榭里', '天星苑',
    ],
    '云城': ['杭与城', '绿城云谷小镇', '万科天空之城', '融创城', '金成英特尔湾', '富力云庭雅居'],
    '良渚': ['万科良渚文化村', '绿城桂语江南', '融信澜天', '和昌府', '德信海德公园', '越秀景瑞悦见山', '龙湖天钜', '杜甫新苑', '良渚新城', '越秀星汇城'],
    '闲林': ['绿城桃源小镇', '雅居乐国际花园', '竹海水韵', '闲林山水', '东海闲湖城', '华元美林公馆', '融创金成未来海', '绿城翡翠城', '万科溪望', '西溪蓝海'],
    '老余杭': ['中梁百悦城', '奥克斯缔逸城', '富力桃园', '佳源未来府', '瑞城花园', '通济小区'],
    '五常': ['绿城西溪诚园', '万科西庐', '绿城西溪融庄', '融创河滨之城', '中海西溪华府', '万科溪望', '华元爱丁郡'],
    '勾庄': ['绿城锦海棠', '万科杭宸', '新城香悦公馆', '德信海德公园', '越秀星汇城', '和萃揽悦园', '融信澜天', '万科未来城'],
    '仓前': ['杭与城', '绿城云谷小镇', '万科天空之城', '融创城', '富力西溪悦居', '合景天峻'],
  },
  '临平区': {
    '临平新城': ['绿城玉园', '万科未来城', '融创玖樟台', '龙湖天曜', '绿城春风十里', '华元欢乐城', '银泰城', '万宝城'],
    '东湖新城': ['滨杭滨纷城', '众安理想湾', '绿城蓝庭', '赞成首府', '万宝城', '嘉丰万悦城'],
    '星桥': ['龙湖春江天玺', '融信澜天', '绿城桂语江南', '广厦天都城', '香榭里', '天星苑'],
    '乔司': ['万科未来城', '融创玖樟台', '绿城春风十里', '华元欢乐城'],
    '崇贤': ['星合映', '光合映', '群贤府', '金航府', '祥生群贤府', '旭辉时代城'],
    '仁和': ['仁和板块', '万科未来城'],
  },
  '萧山区': {
    '奥体': ['融创创世纪', '绿城桂语江南', '滨江金茂府', '时代奥城', '龙湖春江彼岸', '寰宇天下', '杭州壹号院', '奥邸国际'],
    '亚运村': ['华润亚奥城', '绿城桂冠东方', '融创融望之城', '滨江翡翠江南', '奥邸国际'],
    '钱江世纪城': ['融创创世纪', '龙湖春江彼岸', '寰宇天下', '时代奥城', '世纪之光', '绿城桂语江南'],
    '市北': ['龙湖春江天玺', '绿城桂语江南', '融信保利创世纪', '滨江御虹府', '滨江翡翠江南'],
    '萧山科技城': ['融创江南壹号院', '保利东湾', '荣望轩'],
    '湘湖': ['旭辉滨江东方悦府', '都会艺境', '融创江南壹号院'],
    '新街': ['绿城桂语江南', '融信澜天', '融创玖樟台'],
    '新塘': ['龙湖春江天玺', '融创玖樟台'],
    '大江东': ['融创城', '绿城桂语江南'],
    '南部卧城': ['奥印鸣翠府', '绿城桂语江南'],
    '义桥': ['融创玖樟台'],
    '闻堰': ['融创玖樟台'],
    '瓜沥': ['融创城'],
    '临浦': ['融创城'],
  },
};

// 社区硬伤数据（社区级别的已知问题）
export interface DefectCommunityInfo {
  district: string;
  businessDistrict: string;
  defects: string[];
  source: string;
  level: 'high' | 'medium' | 'low';
}

export const DEFECT_COMMUNITIES: Record<string, DefectCommunityInfo> = {
  '绿城春来晴翠': {
    district: '滨江区',
    businessDistrict: '浦沿',
    defects: ['垃圾处理站', '公墓/殡仪馆'],
    source: '东侧约1公里垃圾焚烧厂，400米浦沿陵园',
    level: 'medium',
  },
  '中天官河锦庭': {
    district: '滨江区',
    businessDistrict: '滨江区政府',
    defects: ['污水处理厂'],
    source: '小区南面污水处理厂',
    level: 'medium',
  },
  '旭辉滨江东方悦府': {
    district: '萧山区',
    businessDistrict: '湘湖',
    defects: ['公墓/殡仪馆'],
    source: '南侧500米西郊生态公墓，萧山最大公墓',
    level: 'high',
  },
  '都会艺境': {
    district: '萧山区',
    businessDistrict: '湘湖',
    defects: ['公墓/殡仪馆'],
    source: '东侧临近公墓，东边套可见',
    level: 'medium',
  },
  '世茂茂悦府': {
    district: '上城区',
    businessDistrict: '艮北新城',
    defects: ['工厂污染'],
    source: '外立面大面积脱落，200多户漏水，开发商停修',
    level: 'high',
  },
  '宋都香悦郡': {
    district: '拱墅区',
    businessDistrict: '桃源',
    defects: ['工厂污染'],
    source: '真石漆外立面脱落严重，7号楼四面都有脱落，质检不合格',
    level: 'high',
  },
  '吉如家园': {
    district: '拱墅区',
    businessDistrict: '运河新城',
    defects: ['工厂污染'],
    source: '回迁房，保温层老化脱落，墙面霉变渗水，维修资金缺口600万',
    level: 'medium',
  },
  '九龙仓华发天荟': {
    district: '拱墅区',
    businessDistrict: '申花',
    defects: ['工厂污染'],
    source: '外立面问题投诉集中',
    level: 'low',
  },
  '畅想江澜湾': {
    district: '萧山区',
    businessDistrict: '萧山科技城',
    defects: ['垃圾处理站'],
    source: '开发商填埋建筑垃圾，刺激性气味，绿化死亡',
    level: 'high',
  },
  '荣望轩': {
    district: '萧山区',
    businessDistrict: '萧山科技城',
    defects: ['高架/高速噪音', '主干道噪音'],
    source: '临近地铁19号线知行路站，未做全封闭隔音，高层噪音严重',
    level: 'medium',
  },
  '华元爱丁郡': {
    district: '余杭区',
    businessDistrict: '闲林',
    defects: ['地势低洼易涝'],
    source: '排水系统不完善，下雨天积水严重',
    level: 'medium',
  },
  '九溪新村': {
    district: '西湖区',
    businessDistrict: '之江',
    defects: ['地势低洼易涝'],
    source: '九溪沿线，钱塘江水位7.0米以上易积水，2024年被淹',
    level: 'high',
  },
  '民航小区': {
    district: '西湖区',
    businessDistrict: '之江',
    defects: ['地势低洼易涝'],
    source: '九溪社区低洼地带，老年人占比70-80%，易受内涝影响',
    level: 'high',
  },
  '龙门坎村': {
    district: '西湖区',
    businessDistrict: '留下',
    defects: ['地势低洼易涝'],
    source: '三面环山Y形山坳，山洪和山体滑坡风险，1990年曾造成人员伤亡',
    level: 'high',
  },
  '绿城锦海棠': {
    district: '余杭区',
    businessDistrict: '勾庄',
    defects: ['主干道噪音'],
    source: '南侧第一排临好运街主干道，噪音灰尘较大',
    level: 'low',
  },
  '星合映': {
    district: '临平区',
    businessDistrict: '崇贤',
    defects: ['工厂污染'],
    source: '漏水和外立面脱落问题严峻，集体换物业后仍未解决',
    level: 'medium',
  },
  '光合映': {
    district: '临平区',
    businessDistrict: '崇贤',
    defects: ['工厂污染'],
    source: '漏水和外立面脱落问题严峻，集体换物业后仍未解决',
    level: 'medium',
  },
  '群贤府': {
    district: '临平区',
    businessDistrict: '崇贤',
    defects: ['工厂污染'],
    source: '漏水和外立面脱落问题严峻，集体换物业后仍未解决',
    level: 'medium',
  },
  '金航府': {
    district: '临平区',
    businessDistrict: '崇贤',
    defects: ['工厂污染'],
    source: '漏水和外立面脱落问题严峻，集体换物业后仍未解决',
    level: 'medium',
  },
  '郡枫绿园': {
    district: '拱墅区',
    businessDistrict: '丁桥',
    defects: ['工厂污染'],
    source: '外立面鼓包、漏水，室内发霉',
    level: 'medium',
  },
};

// 根据小区名匹配区域和商圈
export function matchCommunity(communityName: string): { district: string; businessDistrict: string } | null {
  if (!communityName) return null;
  const name = communityName.trim();
  for (const [district, districts] of Object.entries(COMMUNITY_MAPPING)) {
    for (const [businessDistrict, communities] of Object.entries(districts)) {
      if (communities.some(c => c.includes(name) || name.includes(c))) {
        return { district, businessDistrict };
      }
    }
  }
  return null;
}

// 根据小区名匹配社区硬伤信息
export function matchCommunityDefects(communityName: string): (DefectCommunityInfo & { name: string }) | null {
  if (!communityName) return null;
  const name = communityName.trim();
  for (const [commName, info] of Object.entries(DEFECT_COMMUNITIES)) {
    if (commName.includes(name) || name.includes(commName)) {
      return { name: commName, ...info };
    }
  }
  return null;
}

export interface DefectTypeInfo {
  key: string;
  name: string;
  severity: string;
  coefficient: number;
  desc: string;
}

export const DEFECT_TYPES: DefectTypeInfo[] = [
  { key: 'highway_noise', name: '高架/高速噪音', severity: '严重', coefficient: 0.80, desc: '距离高架/高速公路<50m，噪音污染严重' },
  { key: 'main_road_noise', name: '主干道噪音', severity: '中等', coefficient: 0.90, desc: '临城市主干道，距离<30m，有一定噪音' },
  { key: 'cemetery', name: '公墓/殡仪馆', severity: '严重', coefficient: 0.70, desc: '距离公墓/殡仪馆<1km，心理忌讳影响大' },
  { key: 'substation', name: '变电站/高压线', severity: '严重', coefficient: 0.85, desc: '距离大型变电站/高压线<300m' },
  { key: 'garbage_station', name: '垃圾处理站', severity: '严重', coefficient: 0.80, desc: '距离垃圾处理站<500m，异味污染' },
  { key: 'sewage_plant', name: '污水处理厂', severity: '严重', coefficient: 0.75, desc: '距离污水处理厂<1km，异味污染' },
  { key: 'airport_noise', name: '机场航线噪音', severity: '中等', coefficient: 0.88, desc: '飞机起降航线正下方' },
  { key: 'low_ground', name: '地势低洼易涝', severity: '严重', coefficient: 0.85, desc: '地势低于周边区域，大雨容易积水' },
  { key: 'gas_station', name: '加油站/加气站', severity: '中等', coefficient: 0.92, desc: '距离加油站/加气站较近' },
  { key: 'poor_lighting', name: '采光严重不足', severity: '严重', coefficient: 0.88, desc: '楼层低+楼间距小，日照<2小时' },
  { key: 'factory_pollution', name: '工厂污染', severity: '严重', coefficient: 0.82, desc: '附近有化工厂/制药厂等污染企业' },
  { key: 'red_light', name: '红灯区/治安差', severity: '中等', coefficient: 0.90, desc: '周边治安环境较差' },
];

// 导出所有数据
export default {
  city: hangzhouCity,
  districts: hangzhouDistricts,
  businessDistricts: hangzhouBusinessDistricts,
  schools: hangzhouSchools,
  defectLocations: hangzhouDefectLocations,
  SCHOOLS,
  DISTRICT_BD_MAP,
  COMMUNITY_MAPPING,
  DEFECT_COMMUNITIES,
  getDistrictInfo,
  getBusinessDistrictFactor,
  getSchoolPremium,
  getCityTrend,
  getCapRateByDistrict,
  findNearbyDefects,
  matchCommunity,
  matchCommunityDefects,
};
