/**
 * house-value 房产估值计算器
 * 核心估值引擎 + 杭州城市知识库 + UI逻辑
 */

// ============ 杭州城市知识库 ============

// 杭州房地产政策风险与预期数据
const HANGZHOU_POLICY_RISK_DATA = {
  currentPolicy: {
    purchaseLimit: {
      name: '限购政策',
      status: 'active',
      desc: '杭州户籍家庭限购2套，非杭州户籍家庭限购1套（需连续缴纳2年社保）',
      impact: '中',
      impactDesc: '限制购房资格，对热点板块成交有抑制作用',
    },
    loanLimit: {
      name: '限贷政策',
      status: 'active',
      desc: '首套房首付比例不低于30%，二套房首付比例不低于60%（无房有贷）或70%（有房有贷）',
      impact: '高',
      impactDesc: '直接影响购房杠杆，对改善型需求影响较大',
    },
    saleLimit: {
      name: '限售政策',
      status: 'active',
      desc: '新房网签之日起5年内不得转让，二手房交易不受限',
      impact: '中',
      impactDesc: '锁定流动性，影响短期炒房行为',
    },
    guidePrice: {
      name: '二手房指导价',
      status: 'active',
      desc: '2021年出台，对热点学区房挂牌价有参考限制作用',
      impact: '中高',
      impactDesc: '抑制学区房炒作，对挂牌价有压制作用',
    },
    taxPolicy: {
      name: '税收政策',
      status: 'active',
      desc: '满五唯一免征个税和增值税，不满2年全额征收5.3%增值税',
      impact: '高',
      impactDesc: '直接影响交易成本，满五唯一房源更受欢迎',
    },
  },
  schoolPolicyChanges: {
    '多校划片': {
      name: '多校划片',
      status: 'planning',
      desc: '教育部鼓励多校划片，杭州部分区已试点',
      impact: '高',
      impactDesc: '可能导致学区房价值重估，传统学区房溢价可能下降',
      affectedAreas: ['西湖区', '拱墅区', '上城区'],
    },
    '公民同招': {
      name: '公民同招',
      status: 'active',
      desc: '公办和民办学校同时招生，取消民办提前录取',
      impact: '中',
      impactDesc: '公办学校地位提升，学区房价值相对稳定',
    },
    '对口初中调整': {
      name: '对口初中调整',
      status: 'possible',
      desc: '每年可能有部分小学对口初中调整',
      impact: '高',
      impactDesc: '对口初中变化直接影响学区价值，需关注每年学区划分',
      affectedAreas: ['滨江区', '余杭区'],
    },
  },
  futurePolicyExpectations: {
    '限购放松': {
      name: '限购放松预期',
      probability: '中',
      desc: '杭州近期已多次调整限购政策，后续可能进一步放松',
      impact: '高',
      impactDesc: '若放松限购，刚需和改善需求可能释放，推动房价上涨',
    },
    '房贷利率调整': {
      name: '房贷利率调整',
      probability: '高',
      desc: '全国房贷利率持续下行，杭州可能跟进',
      impact: '高',
      impactDesc: '利率下降降低购房成本，刺激需求',
    },
    '学区政策改革': {
      name: '学区政策改革',
      probability: '中',
      desc: '教育部推动教育公平，多校划片可能扩大试点',
      impact: '高',
      impactDesc: '传统学区房溢价可能收窄',
    },
  },
};

// 杭州市场流动性指标（按板块）
const HANGZHOU_LIQUIDITY_DATA = {
  '钱江新城': {
    monthlyTurnover: 25,
    avgListingDays: 35,
    currentListings: 85,
    marketStatus: 'hot',
    desc: '高端改善需求旺盛，成交活跃',
  },
  '钱江世纪城': {
    monthlyTurnover: 30,
    avgListingDays: 30,
    currentListings: 120,
    marketStatus: 'hot',
    desc: '亚运效应持续，刚需和投资需求并存',
  },
  '未来科技城': {
    monthlyTurnover: 45,
    avgListingDays: 28,
    currentListings: 180,
    marketStatus: 'hot',
    desc: '产业人口导入，刚需和改善需求旺盛',
  },
  '申花': {
    monthlyTurnover: 20,
    avgListingDays: 40,
    currentListings: 65,
    marketStatus: 'warm',
    desc: '改善型需求为主，价格稳定',
  },
  '蒋村': {
    monthlyTurnover: 18,
    avgListingDays: 45,
    currentListings: 55,
    marketStatus: 'warm',
    desc: '学区房为主，流动性一般',
  },
  '滨江区政府': {
    monthlyTurnover: 35,
    avgListingDays: 32,
    currentListings: 100,
    marketStatus: 'hot',
    desc: '产业人口密集，租赁和刚需需求旺盛',
  },
  '物联网小镇': {
    monthlyTurnover: 25,
    avgListingDays: 38,
    currentListings: 75,
    marketStatus: 'warm',
    desc: '刚需为主，价格相对稳定',
  },
  '武林': {
    monthlyTurnover: 12,
    avgListingDays: 55,
    currentListings: 40,
    marketStatus: 'cool',
    desc: '老小区为主，改善需求不足',
  },
  '湖滨': {
    monthlyTurnover: 8,
    avgListingDays: 60,
    currentListings: 25,
    marketStatus: 'cool',
    desc: '旅游区，居住属性弱，成交较少',
  },
  '城东新城': {
    monthlyTurnover: 22,
    avgListingDays: 42,
    currentListings: 90,
    marketStatus: 'warm',
    desc: '刚需板块，价格亲民，成交稳定',
  },
  '艮北新城': {
    monthlyTurnover: 18,
    avgListingDays: 48,
    currentListings: 60,
    marketStatus: 'warm',
    desc: '次新板块，刚需和改善需求并存',
  },
  '运河新城': {
    monthlyTurnover: 10,
    avgListingDays: 55,
    currentListings: 45,
    marketStatus: 'cool',
    desc: '规划中板块，配套尚未成熟，成交较少',
  },
  '三墩': {
    monthlyTurnover: 28,
    avgListingDays: 40,
    currentListings: 110,
    marketStatus: 'warm',
    desc: '刚需板块，价格亲民，成交活跃',
  },
  '良渚': {
    monthlyTurnover: 35,
    avgListingDays: 35,
    currentListings: 140,
    marketStatus: 'warm',
    desc: '刚需为主，价格稳定，成交活跃',
  },
  '闲林': {
    monthlyTurnover: 15,
    avgListingDays: 52,
    currentListings: 80,
    marketStatus: 'cool',
    desc: '刚需板块，交通不便，流动性一般',
  },
  '老余杭': {
    monthlyTurnover: 20,
    avgListingDays: 45,
    currentListings: 70,
    marketStatus: 'warm',
    desc: '刚需板块，价格亲民，成交稳定',
  },
  '临平新城': {
    monthlyTurnover: 22,
    avgListingDays: 42,
    currentListings: 85,
    marketStatus: 'warm',
    desc: '刚需板块，价格亲民，成交稳定',
  },
  '大江东': {
    monthlyTurnover: 8,
    avgListingDays: 60,
    currentListings: 50,
    marketStatus: 'cool',
    desc: '产业板块，居住需求有限，流动性弱',
  },
  '丁桥': {
    monthlyTurnover: 20,
    avgListingDays: 48,
    currentListings: 75,
    marketStatus: 'warm',
    desc: '刚需板块，价格亲民，成交稳定',
  },
  '崇贤': {
    monthlyTurnover: 12,
    avgListingDays: 55,
    currentListings: 55,
    marketStatus: 'cool',
    desc: '刚需板块，交通不便，流动性一般',
  },
};

// 杭州物业品质评分数据
const HANGZHOU_PROPERTY_MANAGEMENT_DATA = {
  '绿城服务': {
    score: 95,
    level: 'S',
    avgFee: 3.5,
    strengths: ['绿化维护', '安保严格', '设施维护', '社区活动'],
    desc: '杭州物业标杆，业主满意度极高，二手房溢价明显',
  },
  '滨江物业': {
    score: 92,
    level: 'S',
    avgFee: 3.2,
    strengths: ['安保严格', '设施维护', '客服响应'],
    desc: '杭州顶级物业，与绿城并称"双雄"',
  },
  '万科物业': {
    score: 88,
    level: 'A',
    avgFee: 2.8,
    strengths: ['标准化管理', '线上服务', '设施维护'],
    desc: '全国龙头，管理规范，服务标准化',
  },
  '龙湖智慧服务': {
    score: 86,
    level: 'A',
    avgFee: 3.0,
    strengths: ['园林维护', '客服响应', '智能化管理'],
    desc: '龙湖"钻石级"物业，园林景观维护出色',
  },
  '华润物业': {
    score: 84,
    level: 'A',
    avgFee: 2.8,
    strengths: ['商业配套', '设施维护'],
    desc: '央企背景，综合体项目管理经验丰富',
  },
  '保利物业': {
    score: 82,
    level: 'A',
    avgFee: 2.5,
    strengths: ['安保', '设施维护'],
    desc: '央企背景，管理稳健',
  },
  '中海物业': {
    score: 80,
    level: 'A',
    avgFee: 2.6,
    strengths: ['工程维护', '安保'],
    desc: '央企背景，工程品质过硬',
  },
  '招商物业': {
    score: 78,
    level: 'B',
    avgFee: 2.4,
    strengths: ['安保', '客服'],
    desc: '央企背景，近年口碑提升',
  },
  '大家物业': {
    score: 76,
    level: 'B',
    avgFee: 2.2,
    strengths: ['本地经验', '社区维护'],
    desc: '杭州本土老牌物业，口碑尚可',
  },
  '杭房物业': {
    score: 74,
    level: 'B',
    avgFee: 2.0,
    strengths: ['本地经验'],
    desc: '杭州本土国企物业，中规中矩',
  },
  '融创服务': {
    score: 70,
    level: 'B',
    avgFee: 2.5,
    strengths: ['前期服务'],
    desc: '近年财务压力大，部分项目服务质量下降',
  },
  '碧桂园服务': {
    score: 65,
    level: 'C',
    avgFee: 1.8,
    strengths: ['性价比'],
    desc: '高周转模式，服务质量一般',
  },
  '绿城物业（非绿城开发项目）': {
    score: 85,
    level: 'A',
    avgFee: 2.8,
    strengths: ['品牌背书', '管理规范'],
    desc: '绿城代管项目，服务质量略低于绿城自有项目',
  },
  '本地小物业': {
    score: 60,
    level: 'C',
    avgFee: 1.5,
    strengths: ['价格低'],
    desc: '本地小型物业公司，服务质量参差不齐',
  },
};

// 杭州户型与得房率数据
const HANGZHOU_HOUSE_TYPE_DATA = {
  '方正通透': {
    modifier: 1.08,
    desc: '户型方正，南北通透，无浪费面积',
  },
  '方正': {
    modifier: 1.05,
    desc: '户型方正，但可能不通透',
  },
  '南北通透': {
    modifier: 1.06,
    desc: '南北通透，但户型可能不方正',
  },
  '一般': {
    modifier: 1.00,
    desc: '户型一般，存在一定浪费面积',
  },
  '较差': {
    modifier: 0.95,
    desc: '户型较差，存在明显浪费面积或朝向问题',
  },
};

// 建筑结构类型数据
const HANGZHOU_BUILDING_STRUCTURE_DATA = {
  '钢混结构': {
    modifier: 1.00,
    desc: '钢筋混凝土结构，抗震性能好，耐久性强',
  },
  '框架结构': {
    modifier: 1.00,
    desc: '框架结构，空间灵活，抗震性能较好',
  },
  '砖混结构': {
    modifier: 0.90,
    desc: '砖混结构，抗震性能较差，多见于90年代及以前老小区',
  },
  '剪力墙结构': {
    modifier: 1.02,
    desc: '剪力墙结构，抗震性能好，多用于高层住宅',
  },
};

// 外墙材质数据
const HANGZHOU_EXTERIOR_MATERIAL_DATA = {
  '石材干挂': {
    modifier: 1.08,
    desc: '高档石材干挂，外观大气，维护成本低',
  },
  '真石漆': {
    modifier: 1.02,
    desc: '真石漆，仿石材效果，耐久性较好',
  },
  '涂料': {
    modifier: 0.98,
    desc: '普通涂料，易老化，需定期翻新',
  },
  '瓷砖': {
    modifier: 0.98,
    desc: '瓷砖贴面，可能存在脱落风险',
  },
};

// 小区规模与密度数据
const HANGZHOU_COMMUNITY_SCALE_DATA = {
  '小型社区': {
    range: '100户以下',
    modifier: 1.02,
    desc: '户数少，居住安静，邻里关系紧密',
  },
  '中型社区': {
    range: '100-500户',
    modifier: 1.00,
    desc: '规模适中，配套完善，管理方便',
  },
  '大型社区': {
    range: '500-1500户',
    modifier: 0.98,
    desc: '规模较大，配套齐全，但可能嘈杂',
  },
  '超大型社区': {
    range: '1500户以上',
    modifier: 0.95,
    desc: '户数过多，物业管理难度大，可能存在停车难等问题',
  },
};

// 容积率数据
const HANGZHOU_FAR_DATA = {
  '低密度': {
    range: '<1.5',
    modifier: 1.10,
    desc: '容积率低，居住舒适度高，多见于别墅、洋房小区',
  },
  '中低密度': {
    range: '1.5-2.0',
    modifier: 1.05,
    desc: '容积率适中，居住舒适度较好',
  },
  '中等密度': {
    range: '2.0-2.5',
    modifier: 1.00,
    desc: '容积率中等，常见于普通高层小区',
  },
  '高密度': {
    range: '2.5-3.5',
    modifier: 0.95,
    desc: '容积率较高，楼间距较近，居住舒适度一般',
  },
  '超高层密集': {
    range: '>3.5',
    modifier: 0.90,
    desc: '容积率过高，楼间距小，采光通风可能受影响',
  },
};

// 产权与交易成本数据
const HANGZHOU_PROPERTY_RIGHT_DATA = {
  '满五唯一': {
    costDesc: '免征个税和增值税',
    modifier: 1.02,
    desc: '交易成本最低，最受欢迎',
  },
  '满五年非唯一': {
    costDesc: '免征增值税，需缴纳1%个税',
    modifier: 1.00,
    desc: '交易成本较低',
  },
  '满二年': {
    costDesc: '免征增值税，需缴纳1%个税',
    modifier: 1.00,
    desc: '交易成本较低',
  },
  '不满二年': {
    costDesc: '需缴纳5.3%增值税+1%个税',
    modifier: 0.95,
    desc: '交易成本最高，不受欢迎',
  },
};

// 自然灾害风险数据
const HANGZHOU_NATURAL_DISASTER_DATA = {
  '地震风险': {
    level: '低',
    desc: '杭州位于长江中下游平原，地震活动较少，抗震设防烈度为6度',
    impact: '极低',
  },
  '台风风险': {
    level: '中',
    desc: '每年台风季（7-9月）可能受影响，沿江沿海区域需关注',
    impact: '低',
    affectedAreas: ['上城区沿江', '滨江区沿江', '萧山区沿江', '钱塘区沿海'],
  },
  '洪涝风险': {
    level: '中高',
    desc: '低洼区域暴雨时可能积水，特别是运河沿线、钱塘江沿线',
    impact: '中',
    affectedAreas: ['拱墅区运河沿线', '上城区沿江', '余杭区闲林', '钱塘区下沙'],
  },
  '山体滑坡风险': {
    level: '低',
    desc: '山区及山脚区域需关注，特别是暴雨后',
    impact: '低',
    affectedAreas: ['西湖区龙井/九溪', '富阳区山区', '临安区山区'],
  },
};

const HANGZHOU_CITY = {
  name: '杭州',
  tier: '新一线城市（超大城市）',
  gdp2024: 2.18,
  population2025: 1270,
  populationTarget2035: 1500,
  talentNetInflow: 1.3,
  digitalEconomyRatio: 29.5,
  capitalizationRate: { core: 0.035, normal: 0.045, suburb: 0.055 },
};

const HANGZHOU_DISTRICTS = {
  '上城区': {
    population: 140, growthRate: 0.3, level: 'core', levelName: '核心主城区',
    positioning: '中央创新区(CID)，从CBD到CID转型',
    industries: ['具身智能', '金融', '数智时尚消费', '人文经济'],
    keyAreas: ['湖滨商圈', '钱江新城', '玉皇山南基金小镇', '钱塘智慧城'],
    metro: ['1号线', '4号线', '7号线', '9号线'],
    schools: ['胜利实验学校', '天长小学', '建兰中学'],
    priceLevel: 'S', priceTrend: 'stable',
    desc: '杭州传统核心城区，拥有湖滨商圈和钱江新城两大核心。正从CBD向CID转型，聚焦具身智能和金融产业。',
  },
  '拱墅区': {
    population: 120, growthRate: 0.4, level: 'core', levelName: '核心主城区',
    positioning: '大运河文化带核心，AI创新发展高地',
    industries: ['人工智能', '商贸金融', '生命健康', '文化旅游'],
    keyAreas: ['大运河国家文化公园', '智慧网谷小镇', 'LOFT49', '武林广场'],
    metro: ['1号线', '3号线', '4号线', '5号线'],
    schools: ['卖鱼桥小学', '文澜中学', '杭州第十四中学'],
    priceLevel: 'A', priceTrend: 'stable',
    desc: '京杭大运河穿境而过，DeepSeek诞生地。以大运河为主轴，智慧网谷小镇为核心，打造"中国算谷"。',
  },
  '西湖区': {
    population: 118, growthRate: 0.4, level: 'core', levelName: '核心主城区',
    positioning: '科教文创高地，品质活力城区',
    industries: ['人工智能', '生命健康', '空天信息(商业航天)', '人形机器人'],
    keyAreas: ['云栖小镇', '紫金港科技城', '环大学创新生态圈', '西溪湿地'],
    metro: ['2号线', '3号线', '5号线', '10号线', '19号线'],
    schools: ['学军小学', '保俶塔实验学校', '西湖大学', '浙江大学紫金港校区'],
    priceLevel: 'A', priceTrend: 'up',
    desc: '坐拥西湖和浙江大学，科教资源最密集的城区。云栖小镇是商业航天核心基地。',
  },
  '滨江区': {
    population: 56, growthRate: 1.3, level: 'core', levelName: '核心主城区',
    positioning: '数字经济核心区，天堂硅谷',
    industries: ['数字经济', '互联网', '物联网', '人工智能'],
    keyAreas: ['物联网小镇', '互联网小镇', '白马湖生态创意城'],
    metro: ['1号线', '5号线', '6号线'],
    schools: ['江南实验学校', '杭二中白马湖学校'],
    priceLevel: 'S', priceTrend: 'up',
    desc: '杭州数字经济最集中的区域，阿里、网易、海康威视等总部所在地。房价杭州第一梯队。',
  },
  '萧山区': {
    population: 218, growthRate: 0.9, level: 'subCore', levelName: '主城联动区',
    positioning: '城东智造大走廊，临空经济示范区',
    industries: ['先进制造业', '临空经济', '会展经济', '总部经济'],
    keyAreas: ['钱江世纪城', '萧山国际机场', '经济技术开发区', '湘湖'],
    metro: ['1号线', '2号线', '5号线', '6号线', '7号线', '19号线'],
    schools: ['萧山中学', '高桥初中', '崇文世纪城实验学校'],
    priceLevel: 'B', priceTrend: 'up',
    desc: '杭州人口第一大区，钱江世纪城是杭州城市新封面。亚运会主场馆所在地。',
  },
  '余杭区': {
    population: 144, growthRate: 1.1, level: 'subCore', levelName: '城市新中心',
    positioning: '杭州城市新中心，城西科创大走廊核心区',
    industries: ['人工智能', '数字经济', '云计算', '大数据'],
    keyAreas: ['未来科技城', '阿里巴巴总部', '杭州西站', '良渚新城', '云城'],
    metro: ['3号线', '5号线', '16号线', '19号线'],
    schools: ['余杭第一中学', '天元公学', '杭师大附属学校'],
    priceLevel: 'A', priceTrend: 'up',
    desc: '杭州最具发展潜力的区域，阿里巴巴总部所在地。未来科技城是杭州"第三中心"。',
  },
  '临平区': {
    population: 116, growthRate: 1.6, level: 'subCore', levelName: '主城联动区',
    positioning: '数智城，智能制造高地',
    industries: ['智能制造', '生物医药', '时尚产业'],
    keyAreas: ['临平新城', '东湖新城', '大运河科创城'],
    metro: ['3号线', '9号线'],
    schools: ['余杭高级中学', '临平第一中学'],
    priceLevel: 'B', priceTrend: 'stable',
    desc: '2021年从余杭区分设，人口增长势头强劲。地铁9号线直达钱江新城。',
  },
  '钱塘区': {
    population: 81, growthRate: 0.6, level: 'development', levelName: '重点发展区',
    positioning: '产业新城，东部湾新城',
    industries: ['生物医药', '智能制造', '新材料', '航空航天'],
    keyAreas: ['杭州医药港', '大创小镇', '东部湾新城', '下沙高教园区'],
    metro: ['1号线', '7号线', '8号线'],
    schools: ['杭州第四中学', '文海实验学校', '下沙高教园区14所高校'],
    priceLevel: 'C', priceTrend: 'stable',
    desc: '杭州最年轻的区，以产业立区。下沙高教园区聚集14所高校，人才储备丰富。',
  },
  '富阳区': {
    population: 86, growthRate: 0.3, level: 'suburb', levelName: '郊区新城',
    positioning: '滨富合作区，山水宜居新城',
    industries: ['先进制造业', '生态农业', '文旅产业'],
    keyAreas: ['富阳经济技术开发区', '东洲新城', '银湖科技城'],
    metro: ['6号线', '杭黄高铁富阳站'],
    schools: ['富阳中学', '江南中学'],
    priceLevel: 'C', priceTrend: 'stable',
    desc: '位于富春江畔，生态环境优越。地铁6号线已通达，适合改善型需求。',
  },
  '临安区': {
    population: 66, growthRate: 0.2, level: 'suburb', levelName: '郊区新城',
    positioning: '杭州都市新城区，创新策源集聚区',
    industries: ['集成电路', '农林产品加工', '生态旅游'],
    keyAreas: ['青山湖科技城', '滨湖新城', '玲珑街道'],
    metro: ['16号线'],
    schools: ['临安中学', '杭州医学院'],
    priceLevel: 'D', priceTrend: 'stable',
    desc: '杭州西部生态屏障，森林覆盖率极高。青山湖科技城是城西科创大走廊重要节点。',
  },
  '桐庐县': {
    population: 46, growthRate: 0.1, level: 'suburb', levelName: '县域',
    positioning: '中国最美县城，快递产业之乡',
    industries: ['快递物流', '智能制造', '文旅康养'],
    keyAreas: ['富春山健康城', '桐庐经济开发区'],
    metro: ['杭黄高铁桐庐站'],
    schools: ['桐庐中学'],
    priceLevel: 'D', priceTrend: 'stable',
    desc: '中国最美县城，"三通一达"等快递企业发源地。杭黄高铁已开通。',
  },
  '淳安县': {
    population: 32, growthRate: -0.9, level: 'suburb', levelName: '生态功能区',
    positioning: '特别生态功能区，千岛湖所在地',
    industries: ['生态旅游', '饮用水产业', '绿色农业'],
    keyAreas: ['千岛湖旅游度假区', '淳安经济开发区'],
    metro: ['杭黄高铁千岛湖站'],
    schools: ['淳安中学'],
    priceLevel: 'D', priceTrend: 'down',
    desc: '千岛湖所在地，全国首个特别生态功能区。人口呈下降趋势，不适合房产投资。',
  },
  '建德市': {
    population: 44, growthRate: -0.5, level: 'suburb', levelName: '县域',
    positioning: '杭州西部综合交通枢纽',
    industries: ['新材料', '通航产业', '生态农业'],
    keyAreas: ['航空小镇', '建德经济开发区'],
    metro: ['杭黄高铁建德站', '建德千岛湖通用机场'],
    schools: ['建德中学'],
    priceLevel: 'D', priceTrend: 'stable',
    desc: '杭州西部交通枢纽，航空小镇是特色小镇。人口小幅下降。',
  },
};

// 重点商圈/板块等级
const BUSINESS_DISTRICTS = {
  '钱江新城': { level: 'S', coefficient: 1.25 },
  '钱江世纪城': { level: 'S', coefficient: 1.25 },
  '湖滨': { level: 'S', coefficient: 1.25 },
  '武林': { level: 'S', coefficient: 1.22 },
  '未来科技城': { level: 'S', coefficient: 1.20 },
  '奥体': { level: 'S', coefficient: 1.20 },
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
  '富阳城区': { level: 'D', coefficient: 0.95 },
  '银湖': { level: 'D', coefficient: 0.95 },
  '东洲': { level: 'D', coefficient: 0.92 },
  '临安城区': { level: 'D', coefficient: 0.90 },
  '青山湖': { level: 'D', coefficient: 0.88 },
};

// 重点学校
const SCHOOLS = {
  '学军小学': { level: '顶级', premium: 0.45 },
  '胜利实验学校': { level: '顶级', premium: 0.40 },
  '天长小学': { level: '顶级', premium: 0.40 },
  '卖鱼桥小学': { level: '顶级', premium: 0.35 },
  '保俶塔实验学校': { level: '顶级', premium: 0.35 },
  '江南实验学校': { level: '优质', premium: 0.30 },
  '文澜中学': { level: '优质', premium: 0.30 },
  '杭二中白马湖学校': { level: '优质', premium: 0.25 },
  '崇文世纪城实验学校': { level: '优质', premium: 0.25 },
  '天元公学': { level: '优质', premium: 0.25 },
  '杭师大附属学校': { level: '优质', premium: 0.20 },
  '萧山中学': { level: '普通', premium: 0.15 },
  '余杭第一中学': { level: '普通', premium: 0.15 },
  '杭州第四中学': { level: '普通', premium: 0.15 },
  '临安中学': { level: '普通', premium: 0.10 },
  '富阳中学': { level: '普通', premium: 0.10 },
};

// 杭州硬伤位置数据库
// affectedBusinessDistricts: 该硬伤实际会影响的商圈列表（用于精确匹配）
// affectedCommunities: 该硬伤实际会影响的代表性小区列表（用于小区名称匹配）
const DEFECT_LOCATIONS = [
  // ========== 高架快速路 ==========
  { name: '中河高架路', type: 'highway', district: '上城区', address: '上城区-西湖区', description: '贯穿主城南北的核心高架', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['湖滨', '南星桥', '望江'],
    affectedCommunities: ['中北花园', '青春坊', '长庆新城', '吴山名苑', '定安名都', '金隆花园', '中河家园'] },
  { name: '秋石高架路', type: 'highway', district: '上城区', address: '上城区-江干区-临平区', description: '连接主城区与临平的主要通道', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['城东新城', '艮北新城', '丁桥', '星桥'],
    affectedCommunities: ['锦上万象府', '新湖武林国际', '艮园', '机神新村', '濮家新村', '闸弄口新村', '万家花园', '北景园'] },
  { name: '德胜快速路', type: 'highway', district: '拱墅区', address: '拱墅区-江干区', description: '城东重要东西向快速路', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['大关', '三塘', '东新', '笕桥', '城东新城', '艮北新城'],
    affectedCommunities: ['德胜新村', '东新园', '万家星城', '北景园', '三塘汶苑', '三塘樱园', '三塘桂苑'] },
  { name: '留石快速路', type: 'highway', district: '拱墅区', address: '拱墅区-西湖区-余杭区', description: '城北重要东西向快速路', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['申花', '三墩', '勾庄', '良渚'],
    affectedCommunities: ['杭州新天地丽笙酒店周边', '海外海国际酒店周边', '天阳棕榈湾', '万通时尚公馆', '万家名城'] },
  { name: '时代大道高架', type: 'highway', district: '滨江区', address: '滨江区-萧山区', description: '连接滨江与萧山的主要通道', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['物联网小镇', '市北', '义桥'],
    affectedCommunities: ['逸天广场', '贺田尚城', '江南文苑', '江锦国际'] },
  { name: '风情大道高架', type: 'highway', district: '萧山区', address: '萧山区', description: '萧山重要南北向快速路', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['市北', '萧山科技城'],
    affectedCommunities: ['顺发康悦泓园', '潮起潇江'] },
  { name: '东湖高架路', type: 'highway', district: '临平区', address: '临平区', description: '连接临平与主城区的快速路', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['临平新城', '东湖新城', '乔司'],
    affectedCommunities: ['华元欢乐城', '华元苏堤春晓'] },
  { name: '运溪高架路', type: 'highway', district: '余杭区', address: '余杭区', description: '城西科创大走廊重要通道', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['未来科技城', '闲林'],
    affectedCommunities: ['西溪华东园', '合景映月台', '大华海派风范'] },
  { name: '莫干山路高架', type: 'highway', district: '拱墅区', address: '拱墅区-余杭区', description: '城北重要南北向快速路', impactRadius: 150, severity: 'high',
    affectedBusinessDistricts: ['申花', '祥符', '勾庄', '良渚'],
    affectedCommunities: ['中旅印宸府', '万科中城汇', '天阳棕榈湾'] },
  { name: '西兴大桥（钱江三桥）', type: 'highway', district: '滨江区', address: '滨江区西兴-上城区', description: '日均车流量15万辆，超负荷运行', impactRadius: 200, severity: 'high',
    affectedBusinessDistricts: ['物联网小镇', '南星桥'],
    affectedCommunities: ['海威钱江之星', '东方郡', '春江郦城', '明月江南', '晓风印月'] },

  // ========== 殡仪馆 ==========
  { name: '杭州殡仪馆', type: 'funeral_home', district: '西湖区', address: '西湖区西溪路731号', description: '杭州市区主要殡仪馆，位于留下镇龙驹坞', impactRadius: 2000, severity: 'high',
    affectedBusinessDistricts: [],
    affectedCommunities: ['绿城西溪云庐', '西溪十九府', '小和山公寄件', '翰墨香林', '浪漫和山', '留和家苑', '玉屏居', '西溪玫瑰园'] },
  { name: '萧山区殡仪馆', type: 'funeral_home', district: '萧山区', address: '萧山区蜀山街道立新村', description: '萧山区殡仪馆', impactRadius: 2000, severity: 'high',
    affectedBusinessDistricts: [],
    affectedCommunities: ['湖山春晓', '向阳人家'] },
  { name: '临平区殡仪馆', type: 'funeral_home', district: '临平区', address: '临平区塘栖镇超山村', description: '临平区殡仪馆', impactRadius: 2000, severity: 'high',
    affectedBusinessDistricts: ['塘栖'],
    affectedCommunities: ['塘栖嘉园', '水岸名轩'] },
  { name: '余杭区殡仪馆', type: 'funeral_home', district: '余杭区', address: '余杭区径山镇香下桥村', description: '余杭区殡仪馆', impactRadius: 2000, severity: 'high',
    affectedBusinessDistricts: [],
    affectedCommunities: [] },

  // ========== 公墓/陵园 ==========
  { name: '南山陵园', type: 'cemetery', district: '上城区', address: '上城区玉皇山片区', description: '市区老牌公办陵园，位于玉皇山南麓', impactRadius: 1500, severity: 'high',
    affectedBusinessDistricts: ['南星桥', '湖滨'],
    affectedCommunities: ['复兴南苑', '复兴北苑', '玉皇山南村', '阔石板路小区'] },
  { name: '杭州第二公墓', type: 'cemetery', district: '西湖区', address: '西湖区留下镇', description: '城西大型公墓，位于留下街道', impactRadius: 1500, severity: 'high',
    affectedBusinessDistricts: [],
    affectedCommunities: ['留下新村', '杨家牌楼'] },
  { name: '半山公墓', type: 'cemetery', district: '拱墅区', address: '拱墅区半山路', description: '城北大型公墓，位于半山森林公园北侧', impactRadius: 1500, severity: 'high',
    affectedBusinessDistricts: ['桃源'],
    affectedCommunities: ['田园牧歌听泉苑', '田园牧歌麓云苑', '金隅田员外', '田园公寓', '首开望宸', '首开天青里', '中兴御田清庭', '华丰家苑', '田园春晓', '田园绿郡'] },
  { name: '半山生态公墓', type: 'cemetery', district: '拱墅区', address: '拱墅区广济路', description: '半山风景区内公墓', impactRadius: 1500, severity: 'high',
    affectedBusinessDistricts: ['桃源'],
    affectedCommunities: ['田园牧歌听泉苑', '田园牧歌麓云苑', '金隅田员外'] },
  { name: '浙江安贤陵园', type: 'cemetery', district: '临平区', address: '临平区崇贤街道', description: '城北大型人文纪念园，占地约1000亩，与半山隔河相望', impactRadius: 2000, severity: 'high',
    affectedBusinessDistricts: ['崇贤', '桃源'],
    affectedCommunities: ['崇贤上亿广场周边', '旭辉时代城', '西房拱辰', '祥生群贤府'] },
  { name: '华侨永久陵园', type: 'cemetery', district: '上城区', address: '上城区丁桥镇', description: '丁桥片区公墓', impactRadius: 1500, severity: 'medium',
    affectedBusinessDistricts: ['丁桥'],
    affectedCommunities: ['丁桥家苑', '蕙兰雅园', '紫丁香嘉苑'] },
  { name: '龙居寺陵园', type: 'cemetery', district: '上城区', address: '上城区丁桥镇', description: '丁桥片区公墓', impactRadius: 1500, severity: 'medium',
    affectedBusinessDistricts: ['丁桥'],
    affectedCommunities: ['丁桥家苑', '蕙兰雅园'] },

  // ========== 垃圾焚烧厂 ==========
  { name: '杭州九峰垃圾焚烧发电厂', type: 'garbage_incinerator', district: '余杭区', address: '余杭区中泰街道', description: '日处理3000吨，城西主要垃圾处理设施，2014年中泰事件中心', impactRadius: 3000, severity: 'high',
    affectedBusinessDistricts: [],
    affectedCommunities: ['恒厚阳光城', '新西湖小区', '中泰阳光城', '碧景园', '白云深处', '瑞亿家园', '桃源山庄', '荆山翠谷'] },
  { name: '杭州绿能环保发电厂', type: 'garbage_incinerator', district: '滨江区', address: '滨江区浦沿', description: '滨江垃圾焚烧厂', impactRadius: 2000, severity: 'high',
    affectedBusinessDistricts: ['物联网小镇'],
    affectedCommunities: ['钱江湾花园', '国信嘉园'] },
  { name: '杭州能达绿色能源有限公司', type: 'garbage_incinerator', district: '临平区', address: '临平区乔司街道', description: '乔司垃圾焚烧厂', impactRadius: 2000, severity: 'high',
    affectedBusinessDistricts: ['乔司'],
    affectedCommunities: ['乔司商贸苑', '乔司南街小区'] },
  { name: '杭州临江环境能源项目', type: 'garbage_incinerator', district: '钱塘区', address: '钱塘区临江循环经济产业园', description: '日处理5200吨，杭州最大垃圾焚烧项目', impactRadius: 3000, severity: 'high',
    affectedBusinessDistricts: [],
    affectedCommunities: [] },

  // ========== 垃圾填埋场 ==========
  { name: '天子岭垃圾填埋场', type: 'garbage_landfill', district: '拱墅区', address: '拱墅区半山街道', description: '已封场，生态治理中，曾运行30余年', impactRadius: 2000, severity: 'medium',
    affectedBusinessDistricts: ['桃源'],
    affectedCommunities: ['田园牧歌听泉苑', '田园牧歌麓云苑', '金隅田员外', '田园公寓', '首开望宸', '首开天青里'] },

  // ========== 污水处理厂 ==========
  { name: '城西（蒋村）污水处理厂', type: 'wastewater_treatment', district: '西湖区', address: '西湖区三墩镇', description: '日处理10万吨，服务蒋村、西溪、三墩', impactRadius: 1000, severity: 'medium',
    affectedBusinessDistricts: ['三墩', '勾庄'],
    affectedCommunities: ['西溪花园', '蒋村花园', '西溪蝶园'] },
  { name: '七格污水处理厂', type: 'wastewater_treatment', district: '上城区', address: '上城区下沙片区', description: '大型污水处理厂', impactRadius: 1000, severity: 'medium',
    affectedBusinessDistricts: [],
    affectedCommunities: [] },

  // ========== 大型变电站 ==========
  { name: '杭州500kV变电站（瓶窑）', type: 'substation', district: '余杭区', address: '余杭区瓶窑镇', description: '大型500kV变电站', impactRadius: 500, severity: 'high',
    affectedBusinessDistricts: ['瓶窑'],
    affectedCommunities: [] },
  { name: '杭州220kV变电站（三墩）', type: 'substation', district: '西湖区', address: '西湖区三墩镇', description: '220kV变电站', impactRadius: 300, severity: 'medium',
    affectedBusinessDistricts: ['三墩'],
    affectedCommunities: [] },
];

// 根据小区名称精确匹配硬伤
function findDefectsByCommunityName(communityName) {
  if (!communityName || communityName.trim().length < 2) return [];
  
  const name = communityName.trim();
  
  return DEFECT_LOCATIONS.filter(defect => {
    if (!defect.affectedCommunities || defect.affectedCommunities.length === 0) return false;
    
    // 精确匹配或包含匹配
    return defect.affectedCommunities.some(c => {
      // 精确匹配
      if (c === name) return true;
      // 包含匹配（如输入"田园牧歌"匹配"田园牧歌听泉苑"）
      if (c.includes(name) || name.includes(c)) return true;
      // 模糊匹配（去掉后缀）
      const cBase = c.replace(/苑|园|府|庭|轩|阁|居|邸|楼|厦|寓|公寓|花园|新城|名苑|雅苑|嘉园|家苑/g, '');
      const nameBase = name.replace(/苑|园|府|庭|轩|阁|居|邸|楼|厦|寓|公寓|花园|新城|名苑|雅苑|嘉园|家苑/g, '');
      return cBase === nameBase || cBase.includes(nameBase) || nameBase.includes(cBase);
    });
  });
}

// 根据小区名称精确匹配学区
function findSchoolByCommunityName(communityName) {
  if (!communityName || communityName.trim().length < 2) return [];
  
  const name = communityName.trim();
  
  const matchedSchools = [];
  
  Object.entries(HANGZHOU_SCHOOL_DISTRICT_DATA).forEach(([schoolName, data]) => {
    if (!data.districtCommunities || data.districtCommunities.length === 0) return;
    
    const isMatch = data.districtCommunities.some(c => {
      // 精确匹配
      if (c === name) return true;
      // 包含匹配
      if (c.includes(name) || name.includes(c)) return true;
      // 模糊匹配
      const cBase = c.replace(/苑|园|府|庭|轩|阁|居|邸|楼|厦|寓|公寓|花园|新城|名苑|雅苑|嘉园|家苑|一区|二区|三区|四区|五区|东区/g, '');
      const nameBase = name.replace(/苑|园|府|庭|轩|阁|居|邸|楼|厦|寓|公寓|花园|新城|名苑|雅苑|嘉园|家苑|一区|二区|三区|四区|五区|东区/g, '');
      return cBase === nameBase || cBase.includes(nameBase) || nameBase.includes(cBase);
    });
    
    if (isMatch) {
      matchedSchools.push({ name: schoolName, ...data });
    }
  });
  
  return matchedSchools;
}

// 根据区域和商圈查找附近硬伤
// 逻辑：
// 1. 如果选择了具体商圈，优先匹配 affectedBusinessDistricts 包含该商圈的硬伤（精确匹配）
// 2. 同时匹配同区域内 affectedBusinessDistricts 为空的硬伤（影响未在商圈列表中街道的设施）
// 3. 如果未选择商圈或选择"其他"，显示该区域内所有硬伤作为参考
function findNearbyDefects(districtName, businessDistrict) {
  const hasSpecificBD = businessDistrict && businessDistrict !== '其他';

  return DEFECT_LOCATIONS.filter(defect => {
    // 必须属于该区域
    if (defect.district !== districtName) return false;

    if (hasSpecificBD) {
      // 精确匹配：该硬伤明确影响此商圈
      if (defect.affectedBusinessDistricts && defect.affectedBusinessDistricts.includes(businessDistrict)) {
        return true;
      }
      // 同时显示 affectedBusinessDistricts 为空的硬伤（影响未列出街道的设施，需用户自行判断）
      if (!defect.affectedBusinessDistricts || defect.affectedBusinessDistricts.length === 0) {
        return true;
      }
      // 其他不影响此商圈的硬伤不显示
      return false;
    }

    // 未选择商圈：显示该区域内所有硬伤
    return true;
  });
}

// 判断硬伤是否与所选商圈精确匹配
function isDefectMatchBusinessDistrict(defect, businessDistrict) {
  if (!businessDistrict || businessDistrict === '其他') return false;
  return defect.affectedBusinessDistricts && defect.affectedBusinessDistricts.includes(businessDistrict);
}

// 硬伤类型映射
const DEFECT_TYPE_MAP = {
  highway: '高架/主干道',
  cemetery: '公墓/陵园',
  funeral_home: '殡仪馆',
  garbage_incinerator: '垃圾焚烧厂',
  garbage_landfill: '垃圾填埋场',
  wastewater_treatment: '污水处理厂',
  substation: '变电站/高压线',
  gas_station: '加油站',
};

const DEFECT_SEVERITY_MAP = {
  high: '严重',
  medium: '中等',
  low: '轻微',
};

function getDefectTypeName(type) {
  return DEFECT_TYPE_MAP[type] || type;
}

function getDefectSeverityName(severity) {
  return DEFECT_SEVERITY_MAP[severity] || severity;
}

// 杭州各区地势与易涝风险数据
const HANGZHOU_TERRAIN_DATA = {
  '上城区': {
    elevation: '5-8m',
    terrain: '西南和北部高、中部和东部低',
    highestPoint: '皋亭山361.1m',
    floodRisk: '中高风险',
    lowLyingAreas: ['钱塘江北岸沿江板块', '婺江路雷霆路口周边', '九堡沿江片区', '丁桥低洼地带'],
    desc: '老城核心区，地下水位埋深0.5-3m，汛期地下水位可抬升1.8m，钱塘江潮汐倒灌风险',
  },
  '拱墅区': {
    elevation: '4.5-6.4m',
    terrain: '东北高西南低',
    highestPoint: '半山主峰283.9m',
    floodRisk: '中高风险',
    lowLyingAreas: ['运河沿线老旧片区', '石祥路郭家厍公交站周边', '半山路沿线', '湖墅北路', '和睦街道南门区域'],
    desc: '京杭大运河纵贯，平原区海拔4.5-6.4m，老城区管网老化严重，软土沉降导致排水不畅',
  },
  '西湖区': {
    elevation: '5-8m（平原区）',
    terrain: '西高东低，西部为山地丘陵',
    highestPoint: '西部天目山余脉',
    floodRisk: '中等风险',
    lowLyingAreas: ['蒋村/西溪湿地周边', '三墩部分低洼区', '虎跑路九溪/进龙河片区', '河坊街/南宋御街周边'],
    desc: '东部平原海拔5-8m，西部丘陵山地，古河道粉砂层隐蔽窜水，梅雨季地下室返渗高发',
  },
  '滨江区': {
    elevation: '5-8m',
    terrain: '钱塘江口滨海围垦平原',
    highestPoint: '无显著山地',
    floodRisk: '中高风险',
    lowLyingAreas: ['长河街道沿江片区', '西兴大桥/复兴大桥沿线', '浦沿沿江板块'],
    desc: '钱塘江冲积平原，20-60m厚淤泥质软土层，地基持续不均匀沉降，沿江低层建筑潮汐式间歇返渗',
  },
  '萧山区': {
    elevation: '平均23m（平原区7-49m）',
    terrain: '西北高、东南低',
    highestPoint: '大岩山104m',
    floodRisk: '中高风险',
    lowLyingAreas: ['益农镇（平均海拔7m）', '瓜沥镇（平均海拔14m）', '城河公园周边（海拔13m）', '萧山科技城围垦区'],
    desc: '东部益农、瓜沥等地海拔仅7-14m，围垦区地势低洼，钱塘江潮汐影响显著',
  },
  '余杭区': {
    elevation: '东部平原5-8m，西部山地1000m+',
    terrain: '由西向东倾斜',
    highestPoint: '窑头山1095m',
    floodRisk: '高风险',
    lowLyingAreas: ['闲林街道乐山弄（板块最低点，比省道低2m）', '五常街道湿地周边', '仓前街道部分低洼区', '未来科技城部分区域'],
    desc: '地势类似漏斗，城西一带最低洼。闲林乐山弄是整个闲林板块最低点，雨季污水倒灌严重',
  },
  '临平区': {
    elevation: '5-8m',
    terrain: '杭嘉湖平原，地势平坦',
    highestPoint: '无显著山地',
    floodRisk: '中等风险',
    lowLyingAreas: ['东湖街道部分区域', '乔司街道低洼地带', '临平新城局部'],
    desc: '平原水网地带，地下水位较高，部分老旧小区存在雨水倒灌问题',
  },
  '钱塘区': {
    elevation: '5-8m',
    terrain: '钱塘江冲海积平原',
    highestPoint: '无显著山地',
    floodRisk: '高风险',
    lowLyingAreas: ['下沙沿江板块', '大江东围垦区', '河庄街道低洼地带', '临江高科园周边'],
    desc: '钱塘江冲积平原，20-60m厚淤泥质软土，沿江区域地势最低，受潮汐和暴雨双重影响',
  },
  '富阳区': {
    elevation: '5-20m',
    terrain: '东低西高',
    highestPoint: '西部山区',
    floodRisk: '中等风险',
    lowLyingAreas: ['东洲街道（海拔低）', '横凉亭路金秋大道路口', '富阳城区部分低洼区'],
    desc: '东洲地势较低，受富春江水位影响，部分路段积水问题突出',
  },
  '临安区': {
    elevation: '平原区20-50m，西部山区1000m+',
    terrain: '西高东低',
    highestPoint: '清凉峰1787m',
    floodRisk: '中等风险',
    lowLyingAreas: ['石镜街513号周边', '万马路与吴越街交叉口', '玲珑街117号', '流霞街'],
    desc: '城区位于东部河谷平原，西部山区汇水速度快，城区局部低洼点易积水',
  },
};

// 杭州下水管道老化风险数据
const HANGZHOU_SEWER_RISK_DATA = {
  '上城区': {
    riskLevel: '高',
    agingAreas: ['河坊街/南宋御街周边（清末民国砖木结构）', '清波街道老民居', '紫阳街道老小区', '近江家园', '望江家园', '采荷街道老小区'],
    desc: '老城核心区大量七八十年代工矿预制板家属楼，管网老化、管径不足，预制板多孔楼板空腔连通导致漏水横向游走',
  },
  '拱墅区': {
    riskLevel: '高',
    agingAreas: ['朝晖片区', '浙工新村', '杭二棉家属楼', '和睦街道老旧小区', '大关街道老小区', '天水街道老小区'],
    desc: '运河沿线老旧片区管网破损率高，钢渣/粉煤灰回填层尖锐骨料刺穿管道，古河道粉砂层横向窜水',
  },
  '西湖区': {
    riskLevel: '中',
    agingAreas: ['蒋村/西溪片区', '三墩镇老小区', '留下镇老小区', '古荡老小区'],
    desc: '部分区域为湖积淤软土，新建楼盘沉降裂缝多，老城区管网年代久远',
  },
  '滨江区': {
    riskLevel: '中',
    agingAreas: ['长河街道早期楼盘', '西兴街道老小区', '浦沿早期小区'],
    desc: '沿江软土地基持续沉降，导致管道错位断裂，部分小区外围污水井反复堵塞返水',
  },
  '萧山区': {
    riskLevel: '中',
    agingAreas: ['城厢街道老小区', '北干街道早期小区', '萧山老城区'],
    desc: '老城区部分管网建设年代较早，围垦区软土地基对管网稳定性有影响',
  },
  '余杭区': {
    riskLevel: '高',
    agingAreas: ['闲林街道乐山弄片区', '五常街道老小区', '老余杭镇', '仁和街道'],
    desc: '闲林乐山弄承接闲林1/3污水流量，管网容量不足，人口剧增导致排污量猛增，山水汇入污水管网致雨天倒灌',
  },
  '临平区': {
    riskLevel: '中',
    agingAreas: ['临平街道庙前社区天都花园（1990年代）', '东湖街道老小区', '塘栖镇老小区'],
    desc: '部分1990年代小区雨污管网老化，存在雨水倒灌地下室问题',
  },
  '钱塘区': {
    riskLevel: '中',
    agingAreas: ['下沙早期开发区小区', '大江东新建区管网待观察'],
    desc: '下沙为围垦新城，早期建设标准相对较低，部分管网存在老化',
  },
  '富阳区': {
    riskLevel: '中',
    agingAreas: ['富阳城区老小区', '横凉亭路沿线'],
    desc: '部分老城区管网老化，强排泵站正在建设中',
  },
  '临安区': {
    riskLevel: '中',
    agingAreas: ['临安城区老小区', '玲珑街道部分区域'],
    desc: '局部低洼区域管网排水能力不足，正在分批改造',
  },
};

// 杭州学区对口及预警数据
// districtCommunities: 该学校学区范围内的小区列表（用于精确匹配）
const HANGZHOU_SCHOOL_DISTRICT_DATA = {
  '学军小学求智校区': {
    district: '西湖区',
    level: '顶级',
    middleSchool: '十三中',
    middleSchoolLevel: '优质',
    scope: ['东至马塍路，南至文三路，西至保俶北路，北至文二路'],
    districtCommunities: ['下马塍居民区', '马塍路24号', '马塍路26号', '马塍路28号', '马塍路29号', '马塍路30号', '马塍路31号', '马塍路32号', '马塍路33号', '马塍路34号', '马塍路35号', '西溪河下小区', '文二路206号院', '求智巷小区', '文二路240号院', '崇文公寓'],
    premium: 0.50,
    warning2026: '绿色',
    warning2027: '绿色',
    minResidencyYears: 0,
    desc: '西湖区公办天花板，2026年一表生全收无调剂，直升十三中（西湖区第一梯队初中）',
  },
  '学军小学紫金港校区': {
    district: '西湖区',
    level: '顶级',
    middleSchool: '紫金港中学',
    middleSchoolLevel: '优质',
    scope: ['浙大紫金港校区周边'],
    districtCommunities: ['文鼎苑', '冠苑', '圣苑小区', '浙大紫金港教职工宿舍'],
    premium: 0.45,
    warning2026: '绿色',
    warning2027: '绿色',
    minResidencyYears: 0,
    desc: '学军首个分校，成绩与本部旗鼓相当，对口紫金港中学（西湖区第一梯队）',
  },
  '文一街小学文一校区': {
    district: '西湖区',
    level: '顶级',
    middleSchool: '十三中',
    middleSchoolLevel: '优质',
    scope: ['东至莫干山路，南至文二路，西至教工路，北至余杭塘河'],
    districtCommunities: ['白荡海人家', '湖墅新村', '大塘新村', '贾家弄小区', '莫干新村', '邮电新村', '沈塘新村', '石灰桥新村', '打索桥新村', '建工新村', '日晖新村', '塘河新村', '余杭塘河新村', '董家新村', '翠苑新村一区', '花园北村', '文一路家属区'],
    premium: 0.40,
    warning2026: '红色',
    warning2027: '红色',
    minResidencyYears: 2.7,
    desc: '2026年落户需满2年7个月，不足调剂至师苑校区，师资共享、直升十三中不变',
  },
  '文三街小学': {
    district: '西湖区',
    level: '顶级',
    middleSchool: '十三中',
    middleSchoolLevel: '优质',
    scope: ['东至莫干山路，南至武林巷，西至保俶北路，北至文三路'],
    districtCommunities: ['邮电新村', '沈塘新村', '武林巷小区', '马塍路小区', '文三新村', '上宁新村', '武林门新村', '世贸丽晶城', '世贸丽晶城宝石苑', '世贸丽晶城初阳苑', '世贸丽晶城栖霞苑', '世贸丽晶城望湖苑', '世贸丽晶城玉泉苑', '文三路103号院'],
    premium: 0.40,
    warning2026: '绿色',
    warning2027: '黄色',
    minResidencyYears: 0,
    desc: '2026年一表生全收无调剂，2025年需落户2年5个月，2026年门槛大幅降低',
  },
  '行知小学': {
    district: '西湖区',
    level: '顶级',
    middleSchool: '十三中',
    middleSchoolLevel: '优质',
    scope: ['东至教工路，南至文一路，西至学院路'],
    districtCommunities: ['花园南村', '花园西村', '保亭村安置房', '金都城市芯宇', '今日嘉园', '学院路304号', '学院路312号'],
    premium: 0.38,
    warning2026: '绿色',
    warning2027: '绿色',
    minResidencyYears: 0,
    desc: '一表生全部兜底不调剂，次新商品房多，适合改善家庭',
  },
  '翠苑一小文华校区': {
    district: '西湖区',
    level: '优质',
    middleSchool: '翠苑中学',
    middleSchoolLevel: '普通',
    scope: ['东至学院路，南至文二路，西至古荡农灌河'],
    districtCommunities: ['翠苑一区', '翠苑二区1-27幢', '翠苑三区', '翠苑四区', '翠苑五区', '古荡湾新村'],
    premium: 0.25,
    warning2026: '红色',
    warning2027: 'red',
    minResidencyYears: 0.9,
    desc: '2026年落户需约11个月，部分一表生调剂至翠苑一小本部',
  },
  '卖鱼桥小学湖墅校区': {
    district: '拱墅区',
    level: '顶级',
    middleSchool: '大关中学',
    middleSchoolLevel: '普通',
    scope: ['湖墅路沿线、上塘路以西'],
    districtCommunities: ['湖墅新村', '叶青苑', '信义坊', '仓基新村', '大兜路小区', '贾家弄', '珠儿潭小区'],
    premium: 0.35,
    warning2026: '红色',
    warning2027: '红色',
    minResidencyYears: 0.8,
    desc: '2026年落户需约10个月，拱墅区老牌名校',
  },
  '文澜实验学校': {
    district: '拱墅区',
    level: '顶级',
    middleSchool: '文澜中学',
    middleSchoolLevel: '优质',
    scope: ['桥西板块、运河新城核心区'],
    districtCommunities: ['大河宸章', '大家运河之星', '德信晓宸', '大家上洋', '吉祥里', '如意朗诗', '运河上宸', '碧玺华庭', '名城博园', '尚堂府', '江南里'],
    premium: 0.40,
    warning2026: '红色',
    warning2027: '红色',
    minResidencyYears: 0.2,
    desc: '2026年落户仅需约2个月，对口文澜中学（原民办转公，拱墅区顶级初中）',
  },
  '采荷一小': {
    district: '上城区',
    level: '优质',
    middleSchool: '采荷中学',
    middleSchoolLevel: '普通',
    scope: ['采荷街道、凯旋路沿线'],
    districtCommunities: ['采荷一区', '采荷二区', '采荷三区', '采荷东区', '采荷嘉业', '静怡花苑', '怡和苑', '凯旋路家属区'],
    premium: 0.30,
    warning2026: '红色',
    warning2027: '红色',
    minResidencyYears: 5,
    desc: '2026-2028连续三年红色预警，2025年落户截止2021.1.19，需约5年',
  },
  '胜利实验学校': {
    district: '上城区',
    level: '顶级',
    middleSchool: '开元中学',
    middleSchoolLevel: '普通',
    scope: ['南星桥板块、钱江新城南翼'],
    districtCommunities: ['复地连城国际', '钱江水晶城', '候潮府', '金色海岸', '春江花月', '水印城', '赞成林风', '金色家园'],
    premium: 0.40,
    warning2026: '黄色',
    warning2027: 'green',
    minResidencyYears: 0,
    desc: '上城区顶级公办，钱塘江沿岸豪宅配套学区',
  },
  '江南实验学校月明校区': {
    district: '滨江区',
    level: '顶级',
    middleSchool: '江南实验初中',
    middleSchoolLevel: '优质',
    scope: ['江南大道以南、风情大道以西、北塘河以北'],
    districtCommunities: ['东方郡', '春江郦城', '明月江南', '晓风印月', '铂金时代', '中央花城', '温馨人家', '风雅钱塘', '钱塘春晓', '江南豪园', '倾城之恋', '江南咏蝶苑', '江南望庄', '江锦国际', '海威钱江之星'],
    premium: 0.45,
    warning2026: '红色',
    warning2027: 'red',
    minResidencyYears: 6,
    desc: '滨江公办天花板，重高录取率14.66%全区第一，2026年落户需约6年',
  },
  '滨和小学': {
    district: '滨江区',
    level: '优质',
    middleSchool: '滨和中学',
    middleSchoolLevel: '优质',
    scope: ['与月明共用大江南学区'],
    districtCommunities: ['东方郡', '春江郦城', '明月江南', '晓风印月', '铂金时代', '中央花城', '温馨人家', '风雅钱塘'],
    premium: 0.30,
    warning2026: '红色',
    warning2027: 'red',
    minResidencyYears: 3,
    desc: '江南集团性价比分校，2026年落户需约3年，重高率25.3%，小班化办学',
  },
  '闻涛小学': {
    district: '滨江区',
    level: '优质',
    middleSchool: '闻涛中学',
    middleSchoolLevel: '普通',
    scope: ['时代大道以东、钱塘江以南、江陵路以西'],
    districtCommunities: ['彩虹城', '国信嘉园', '太阳国际', '盛元慧谷', '信诚嘉园', '江南华苑', '银色港湾', '钱江湾花园'],
    premium: 0.28,
    warning2026: '红色',
    warning2027: 'yellow',
    minResidencyYears: 2.5,
    desc: '2026年新增江畔小学分流，2027转黄色，综合性价比之王',
  },
  '文清小学': {
    district: '钱塘区',
    level: '优质',
    middleSchool: '学正中学',
    middleSchoolLevel: '普通',
    scope: ['下沙核心区'],
    districtCommunities: ['保利湾天地', '和达城', '金沙湖壹号', '湖景居', '金沙阳光', '保利城市果岭'],
    premium: 0.20,
    warning2026: '红色',
    warning2027: 'red',
    minResidencyYears: 2.5,
    desc: '2025年落户截止2023.9.11，钱塘区热门公办',
  },
};

// 杭州地铁线路数据（运营+在建+规划）
const HANGZHOU_METRO_DATA = [
  // 运营线路
  { line: '1号线', status: '运营', openYear: 2012, type: '普通', stations: ['湘湖','滨康路','西兴','滨和路','江陵路','近江','婺江路','城站','定安路','龙翔桥','凤起路','武林广场','西湖文化广场','打铁关','闸弄口','火车东站','彭埠','七堡','九和路','九堡','客运中心','下沙西','金沙湖','高沙路','文泽路','文海南路','云水','下沙江滨','杭州大会展中心','港城大道','南阳','向阳路','萧山国际机场'], coverage: '主城-下沙-萧山机场', impactLevel: '高' },
  { line: '2号线', status: '运营', openYear: 2014, type: '普通', stations: ['朝阳','曹家桥','潘水','人民路','杭发厂','人民广场','建设一路','建设三路','振宁路','飞虹路','盈丰路','钱江世纪城','钱江路','庆春广场','庆菱路','建国北路','中河北路','凤起路','武林门','沈塘桥','下宁桥','学院路','古翠路','文新','三坝','虾龙圩','三墩','墩祥街','金家渡','白洋','杜甫村','良渚'], coverage: '主城-萧山-良渚', impactLevel: '高' },
  { line: '3号线', status: '运营', openYear: 2022, type: '普通', stations: ['吴山前村','汤家村','火车西站','龙舟北路','文一西路','绿汀路','创明路','全丰','高教路','联胜路','洪园','西溪湿地南','花坞','东岳','古墩路','古荡新村','古荡','黄龙体育中心','黄龙洞','武林门','武林广场','西湖文化广场','潮王路','香积寺','大关','善贤','新天地街','汽轮广场','华丰路','同协路','桃花湖公园','丁桥','华鹤街','黄鹤山','星桥'], coverage: '城西-主城-丁桥', impactLevel: '高' },
  { line: '4号线', status: '运营', openYear: 2015, type: '普通', stations: ['池华街','金家渡','好运街','储运路','平安桥','吴家角港','独城生态公园','桃源街','皋亭坝','新天地街','华中南路','笕桥老街','黎明','明石路','彭埠','火车东站','新风','新塘','景芳','钱江路','江锦路','市民中心','城星路','近江','甬江路','南星桥','水澄桥','复兴路','八卦田','地铁大厦','浦沿','杨家墩','中医药大学','联庄','水澄桥'], coverage: '浦沿-主城-桃源', impactLevel: '高' },
  { line: '5号线', status: '运营', openYear: 2020, type: '普通', stations: ['姑娘桥','双桥','萧山国际机场','港城大道','大会展中心','坎山','衙前','火车南站','通惠中路','育才北路','人民广场','金鸡路','博奥路','江晖路','聚才路','长河','南星桥','候潮门','江城路','城站','万安桥','建国北路','宝善桥','打铁关','杭氧','东新园','西文街','善贤','拱宸桥东','大运河','萍水街','三坝','浙大紫金港','蒋村','五常','永福','杭师大仓前','良睦路','创景路','葛巷','绿汀路','金星'], coverage: '姑娘桥-主城-未来科技城', impactLevel: '高' },
  { line: '6号线', status: '运营', openYear: 2020, type: '普通', stations: ['枸桔弄','火车东站','元宝塘','昙花庵路','三堡','亚运村','丰北','钱江世纪城','博览中心','奥体中心','星民','江陵路','江汉路','长河','建业路','诚业路','伟业路','中医药大学','西浦路','之浦路','枫桦西路','美院象山','音乐学院','中村','野生动物园东','银湖','虎啸杏','受降','富阳客运中心','高桥','新桥','公望街','桂花西路','双浦'], coverage: '富阳-之江-滨江-亚运村', impactLevel: '高' },
  { line: '7号线', status: '运营', openYear: 2020, type: '普通', stations: ['吴山广场','江城路','莫邪塘','观音塘','市民中心','兴议','明星路','建设三路','新兴路','新汉路','新街','合欢路','盈中','坎山','新港','萧山国际机场','永盛路','新镇路','义蓬','塘新线','青六中路','启成路','江东二路'], coverage: '吴山广场-萧山机场-大江东', impactLevel: '高' },
  { line: '8号线', status: '运营', openYear: 2021, type: '普通', stations: ['文海南路','工商大学云滨','桥头堡','河庄路','青西三路','青六中路','仓北村','冯娄村','新湾路'], coverage: '下沙-大江东', impactLevel: '中' },
  { line: '9号线', status: '运营', openYear: 2021, type: '普通', stations: ['观音塘','新业路','钱江路','江河汇','三堡','御道','五堡','六堡','红普南路','九睦路','九堡','客运中心','乔司南','乔司','翁梅','临平南高铁站','南苑','临平','邱山大街','荷禹路','五洲路','龙安'], coverage: '钱江新城-九堡-临平', impactLevel: '高' },
  { line: '10号线', status: '运营', openYear: 2022, type: '普通', stations: ['黄龙体育中心','文三路','学院路','翠柏路','北大桥','和睦','花园岗','渡驾桥','祥园路','杭行路','金德路','逸盛路'], coverage: '黄龙-城北-仁和方向', impactLevel: '中' },
  { line: '16号线', status: '运营', openYear: 2020, type: '普通', stations: ['九州街','临安广场','农林大学','青山湖','八百里','青山湖科技城','南峰','南湖','中泰','禹航路','凤新路','绿汀路'], coverage: '临安-未来科技城', impactLevel: '中' },
  { line: '19号线', status: '运营', openYear: 2022, type: '快线', stations: ['苕溪','火车西站','创景路','海创园','荆长路','西溪湿地北','五联','文三路','沈塘桥','西湖文化广场','驿城路','火车东站','御道','平澜路','耕文路','知行路','萧山国际机场','永盛路'], coverage: '火车西站-萧山机场快线', impactLevel: '极高' },

  // 在建线路（地铁四期）
  { line: '3号线二期', status: '在建', openYear: 2027, type: '普通', stations: ['星桥','世纪大道'], coverage: '临平延伸', impactLevel: '中' },
  { line: '4号线三期西延', status: '在建', openYear: 2027, type: '普通', stations: ['池华街','莲池路','西湖大学东','西湖大学','云谷'], coverage: '云谷-西湖大学', impactLevel: '高' },
  { line: '4号线三期南延', status: '在建', openYear: 2027, type: '普通', stations: ['浦沿','闻堰'], coverage: '浦沿-闻堰', impactLevel: '中' },
  { line: '9号线二期', status: '在建', openYear: 2026, type: '普通', stations: ['龙安','康信路','兴元路','康泰路','星河北路','兴盛路','兴超路','塘栖'], coverage: '临平-塘栖', impactLevel: '中' },
  { line: '10号线二期', status: '在建', openYear: 2026, type: '普通', stations: ['逸盛路','双陈','云会','仁和南'], coverage: '仁和方向', impactLevel: '中' },
  { line: '10号线三期', status: '在建', openYear: 2026, type: '普通', stations: ['仁和南','仁和','仁和北'], coverage: '仁和延伸', impactLevel: '中' },
  { line: '12号线一期', status: '在建', openYear: 2027, type: '普通', stations: ['火车西站','站北路','杭师大仓前','海创园','黄泥坞','高教路','小和山','慈母桥','龙坞','叶埠桥','庙山','美院象山','丽景路','科海路','双浦'], coverage: '火车西站-闲林-双浦', impactLevel: '高' },
  { line: '15号线一期', status: '在建', openYear: 2027, type: '快线', stations: ['亚太路','蜀山','向旭路','南秀路','西山公园','萧棉路','金鸡路','建设一路','建设三路','丰二路','合丰','盈丰路','丰北','江河汇','景芳','华家池','松艮路','打铁关','和平广场','城北体育公园','七古登','蔡马','瓜山','谢村','平安桥','蒋家浜','龙腾街','崇贤'], coverage: '萧山-钱江世纪城-钱江新城-运河新城-崇贤', impactLevel: '极高' },
  { line: '18号线一期', status: '在建', openYear: 2027, type: '快线', stations: ['义桥','时代大道','闻堰','湘滨路','白马湖','江晖路','江汉路','大小莲花','平澜路','耕文路','知行路','亚运村','九堡','丰收湖','永玄路','文正街','世纪大道'], coverage: '义桥-闻堰-滨江-九堡-临平', impactLevel: '极高' },
];

// 杭州重大城市规划板块
const HANGZHOU_URBAN_PLAN_DATA = {
  '云城': {
    level: '市级核心',
    positioning: '杭州第三中心',
    coverage: ['余杭区仓前、五常、良渚部分区域'],
    keyProjects: ['杭州西站','浙大校友总部经济园','超重力实验室','天元公学西站校区','龙湖云城天街'],
    metro: ['3号线','19号线','12号线（在建）'],
    premium: 0.15,
    desc: '城西科创大走廊核心，规划58平方公里，科创CBD+高铁枢纽，定位为"时代中脊、未来之芯"',
  },
  '未来科技城': {
    level: '市级核心',
    positioning: '城西科创大走廊引擎',
    coverage: ['余杭区仓前、五常、闲林部分区域'],
    keyProjects: ['阿里巴巴西溪总部','海创园','之江实验室','人工智能小镇'],
    metro: ['5号线','16号线','19号线'],
    premium: 0.12,
    desc: '全国四大未来科技城之一，数字经济核心产业营收超6365亿元',
  },
  '钱江世纪城': {
    level: '市级核心',
    positioning: '杭州第二中心',
    coverage: ['萧山区盈丰、宁围街道'],
    keyProjects: ['杭州奥体中心','杭州国际博览中心','钱江世纪公园','亚运村'],
    metro: ['2号线','6号线','15号线（在建）'],
    premium: 0.15,
    desc: '与钱江新城隔江相望，G20和亚运主场馆所在地，杭州新封面',
  },
  '运河新城': {
    level: '市级重点',
    positioning: '大城北核心',
    coverage: ['拱墅区康桥、上塘、半山街道'],
    keyProjects: ['中国京杭大运河博物院','大运河未来艺术科技中心','大运汇','杭钢云谷'],
    metro: ['4号线','15号线（在建）'],
    premium: 0.08,
    desc: '23公里滨水绿廊+文化地标集群，从工业遗存转型为文创电竞高地',
  },
  '三江汇': {
    level: '市级重点',
    positioning: '未来城市实践区',
    coverage: ['西湖区之江、双浦','滨江区浦沿','萧山区闻堰'],
    keyProjects: ['之江实验室','中国美院象山校区','湘湖旅游度假区'],
    metro: ['6号线','4号线三期南延（在建）','18号线（在建）'],
    premium: 0.06,
    desc: '钱塘江、富春江、浦阳江三江交汇处，生态+科创融合示范区',
  },
  '临平数智城': {
    level: '市级重点',
    positioning: '杭州城东新中心',
    coverage: ['临平区南苑、东湖、乔司街道'],
    keyProjects: ['算力小镇','临平银泰城','艺尚小镇'],
    metro: ['9号线','3号线二期（在建）'],
    premium: 0.05,
    desc: '杭州东部数字经济新高地，融入主城区的重要节点',
  },
  '大江东/江海之城': {
    level: '区级重点',
    positioning: '钱塘区核心',
    coverage: ['钱塘区河庄、义蓬、新湾街道'],
    keyProjects: ['江东大道快速路','钱塘高铁站（规划）','临江高科园'],
    metro: ['7号线','8号线'],
    premium: 0.03,
    desc: '高端制造+临空经济，杭州先进制造业基地',
  },
  '奥体-亚运村': {
    level: '市级核心',
    positioning: '国际赛事中心',
    coverage: ['萧山区盈丰街道','上城区彭埠部分'],
    keyProjects: ['奥体中心','亚运村','杭州国际博览中心'],
    metro: ['6号线','7号线','15号线（在建）'],
    premium: 0.12,
    desc: '亚运会主场馆区，杭州新地标集群',
  },
};

// 热门物业品牌溢价系数
const PROPERTY_BRAND_PREMIUM = {
  '绿城': { premium: 0.08, level: 'S', desc: '杭州本土顶级品牌，二手房溢价明显，物业口碑极佳' },
  '滨江': { premium: 0.08, level: 'S', desc: '杭州本土顶级品牌，豪宅代名词，石材干挂+蓝宝石泳池标配' },
  '万科': { premium: 0.05, level: 'A', desc: '全国龙头，杭州口碑稳健，物业标准化程度高' },
  '龙湖': { premium: 0.05, level: 'A', desc: '天街商业+住宅联动，园林景观和物业口碑好' },
  '华润': { premium: 0.05, level: 'A', desc: '万象系商业加持，综合体开发能力强' },
  '保利': { premium: 0.04, level: 'A', desc: '央企背景，产品稳健，部分高端项目溢价高' },
  '中海': { premium: 0.04, level: 'A', desc: '央企背景，工程品质过硬' },
  '招商蛇口': { premium: 0.04, level: 'A', desc: '央企背景，近年杭州项目口碑提升' },
  '建发': { premium: 0.05, level: 'A', desc: '新中式风格独特，杭州多个红盘，产品力强' },
  '大家': { premium: 0.03, level: 'B', desc: '杭州本土老牌房企，品质可靠' },
  '杭房': { premium: 0.02, level: 'B', desc: '杭州本土国企，稳健但创新力一般' },
  '融创': { premium: 0.02, level: 'B', desc: '近年财务压力大，杭州项目交付质量参差不齐' },
  '碧桂园': { premium: -0.02, level: 'C', desc: '高周转模式，品质一般，杭州项目溢价为负' },
};

// 杭州三甲医院及专科强项
const HANGZHOU_HOSPITAL_DATA = {
  '浙一医院': {
    district: '上城区/余杭区',
    level: '三甲',
    branches: ['庆春院区','总部一期（余杭）','之江院区'],
    specialties: ['传染病','肝胆胰外科','器官移植','全科医学'],
    desc: '全国TOP10综合医院，总部在余杭未来科技城',
  },
  '浙二医院': {
    district: '上城区/滨江区',
    level: '三甲',
    branches: ['解放路院区','滨江院区','城东院区'],
    specialties: ['心血管','神经外科','眼科','骨科'],
    desc: '全国TOP15综合医院，滨江院区设施最新',
  },
  '邵逸夫医院': {
    district: '上城区/钱塘区',
    level: '三甲',
    branches: ['庆春院区','下沙院区'],
    specialties: ['微创外科','消化内科','妇产科'],
    desc: '浙江省最早通过JCI认证的医院，管理和服务口碑好',
  },
  '省儿保（浙江大学医学院附属儿童医院）': {
    district: '上城区/滨江区',
    level: '三甲专科',
    branches: ['湖滨院区','滨江院区'],
    specialties: ['小儿内科','小儿外科','新生儿科'],
    desc: '华东地区最大儿科医院，全国儿科TOP3',
  },
  '省中医院': {
    district: '上城区',
    level: '三甲',
    branches: ['湖滨院区'],
    specialties: ['中医内科','肿瘤科','针灸推拿'],
    desc: '浙江省最好的中医院',
  },
  '市一医院': {
    district: '上城区',
    level: '三甲',
    branches: ['湖滨院区','城北院区'],
    specialties: ['消化内科','眼科','耳鼻喉科'],
    desc: '杭州市老牌综合医院',
  },
  '市二医院': {
    district: '拱墅区',
    level: '三甲',
    branches: ['拱宸桥院区'],
    specialties: ['肿瘤科','老年病科'],
    desc: '拱墅区主要综合医院',
  },
  '浙江医院': {
    district: '西湖区',
    level: '三甲',
    branches: ['灵隐院区','三墩院区'],
    specialties: ['老年医学','康复医学'],
    desc: '以老年医学为特色',
  },
  '省肿瘤医院': {
    district: '拱墅区',
    level: '三甲专科',
    branches: ['半山院区'],
    specialties: ['肿瘤内科','肿瘤外科','放疗科'],
    desc: '浙江省肿瘤治疗中心',
  },
  '省妇产科医院': {
    district: '上城区',
    level: '三甲专科',
    branches: ['湖滨院区','钱江院区'],
    specialties: ['妇科','产科','生殖医学'],
    desc: '浙江省最好的妇产科医院',
  },
};

// 杭州产业园区/就业中心
const HANGZHOU_INDUSTRIAL_PARK_DATA = {
  '阿里巴巴西溪园区': {
    district: '余杭区',
    type: '互联网总部',
    employees: '数万人',
    coverage: ['未来科技城核心区'],
    rentImpact: 0.15,
    desc: '阿里总部，杭州数字经济第一引擎，周边租金和房价溢价显著',
  },
  '阿里云谷园区': {
    district: '西湖区',
    type: '云计算总部',
    employees: '数千人',
    coverage: ['云谷板块'],
    rentImpact: 0.10,
    desc: '阿里云全球总部，西湖大学南侧',
  },
  '网易杭州': {
    district: '滨江区/西湖区',
    type: '互联网',
    employees: '数千人',
    coverage: ['滨江长河街道','云谷'],
    rentImpact: 0.08,
    desc: '网易总部在滨江，云谷设第二总部',
  },
  '海康威视': {
    district: '滨江区',
    type: '数字安防',
    employees: '数万人',
    coverage: ['滨江物联网小镇'],
    rentImpact: 0.10,
    desc: '全球安防龙头，滨江核心就业引擎',
  },
  '华为杭州研究所': {
    district: '滨江区',
    type: '通信/IT',
    employees: '数千人',
    coverage: ['滨江区'],
    rentImpact: 0.08,
    desc: '华为在杭州最大的研发中心',
  },
  '新华三': {
    district: '滨江区',
    type: '网络设备',
    employees: '数千人',
    coverage: ['滨江区'],
    rentImpact: 0.06,
    desc: '紫光旗下网络设备龙头',
  },
  '字节跳动华东中心': {
    district: '余杭区',
    type: '互联网',
    employees: '数千人',
    coverage: ['未来科技城'],
    rentImpact: 0.08,
    desc: '字节跳动在杭州的华东总部',
  },
  'vivo全球AI研发中心': {
    district: '余杭区',
    type: '智能终端',
    employees: '数千人',
    coverage: ['未来科技城'],
    rentImpact: 0.06,
    desc: 'vivo在杭州的AI研发中心',
  },
  'OPPO': {
    district: '余杭区',
    type: '智能终端',
    employees: '数千人',
    coverage: ['未来科技城'],
    rentImpact: 0.06,
    desc: 'OPPO在杭州的研发中心',
  },
  '杭州医药港': {
    district: '钱塘区',
    type: '生物医药',
    employees: '数千人',
    coverage: ['钱塘区下沙片区'],
    rentImpact: 0.05,
    desc: '浙江省生物医药产业核心区',
  },
  '萧山经开区': {
    district: '萧山区',
    type: '综合制造',
    employees: '数万人',
    coverage: ['萧山区市北、萧山科技城'],
    rentImpact: 0.04,
    desc: '国家级经开区，制造业集聚',
  },
  '临平算力小镇': {
    district: '临平区',
    type: '数字经济',
    employees: '数千人',
    coverage: ['临平区乔司、南苑街道'],
    rentImpact: 0.04,
    desc: '杭州东部算力产业新高地',
  },
};

// ============ 估值引擎 ============

/**
 * 修正系数计算
 */
function calcAreaModifier(area) {
  if (area < 50) return 1.05;
  if (area < 90) return 1.02;
  if (area < 120) return 1.00;
  if (area < 144) return 0.98;
  return 0.95;
}

function calcOrientationModifier(orientation) {
  const map = {
    '南北通透': 1.08,
    '朝南': 1.05,
    '东南': 1.03,
    '南北': 1.02,
    '东西': 0.97,
    '朝北': 0.95,
    '西北': 0.96,
    '东北': 0.98,
  };
  return map[orientation] || 1.00;
}

function calcFloorModifier(floor, totalFloors, hasElevator) {
  if (!totalFloors || totalFloors <= 0) return 1.00;

  // 一层
  if (floor === 1) return 0.90;

  // 顶层
  if (floor === totalFloors) return 0.92;

  // 无电梯的多层（总楼层6层及以下）
  if (!hasElevator && totalFloors <= 6) {
    if (floor <= 3) return 1.03;
    if (floor === totalFloors - 1) return 0.98;
    return 1.00;
  }

  // 有电梯的高层
  const middleStart = Math.ceil(totalFloors / 3);
  const middleEnd = Math.floor((totalFloors * 2) / 3);

  if (floor >= middleStart && floor <= middleEnd) return 1.05;
  if (floor === totalFloors - 1) return 1.03; // 次顶层
  if (floor <= 3) return 0.95;

  return 1.00;
}

function calcDecorationModifier(decoration, buildingAge) {
  const map = {
    '精装修': 1.10,
    '简装修': 1.03,
    '毛坯': 0.95,
    '豪华装修': 1.15,
  };
  return map[decoration] || 1.00;
}

function calcAgeModifier(buildingAge) {
  if (!buildingAge || buildingAge <= 0) return 1.00;
  // 每年折旧0.5%，最多扣30%
  const depreciation = Math.min(buildingAge * 0.005, 0.30);
  return 1 - depreciation;
}

function calcElevatorModifier(hasElevator, totalFloors) {
  if (totalFloors && totalFloors <= 6) {
    return hasElevator ? 1.02 : 0.98;
  }
  // 7层以上必须有电梯
  return hasElevator ? 1.00 : 0.90;
}

function calcSchoolPremium(schoolName) {
  if (!schoolName) return 0;
  const school = SCHOOLS[schoolName];
  if (school) return school.premium;
  // 关键词匹配
  if (schoolName.includes('实验') || schoolName.includes('师范') || schoolName.includes('附属')) {
    return 0.15;
  }
  return 0.05;
}

function calcPropertyManagementModifier(propertyName) {
  if (!propertyName) return 1.00;
  const pm = HANGZHOU_PROPERTY_MANAGEMENT_DATA[propertyName];
  if (pm) {
    const baseScore = pm.score;
    // 分数越高溢价越大，70分基准，每高1分+0.5%
    const modifier = 1 + ((baseScore - 70) / 100) * 0.005;
    return Math.max(0.90, Math.min(1.15, modifier));
  }
  return 1.00;
}

function calcHouseTypeModifier(houseType) {
  if (!houseType) return 1.00;
  const ht = HANGZHOU_HOUSE_TYPE_DATA[houseType];
  if (ht) return ht.modifier;
  return 1.00;
}

function calcBuildingStructureModifier(structure) {
  if (!structure) return 1.00;
  const bs = HANGZHOU_BUILDING_STRUCTURE_DATA[structure];
  if (bs) return bs.modifier;
  return 1.00;
}

function calcExteriorMaterialModifier(material) {
  if (!material) return 1.00;
  const em = HANGZHOU_EXTERIOR_MATERIAL_DATA[material];
  if (em) return em.modifier;
  return 1.00;
}

function calcCommunityScaleModifier(scale) {
  if (!scale) return 1.00;
  const cs = HANGZHOU_COMMUNITY_SCALE_DATA[scale];
  if (cs) return cs.modifier;
  return 1.00;
}

function calcFarModifier(far) {
  if (!far) return 1.00;
  const fd = HANGZHOU_FAR_DATA[far];
  if (fd) return fd.modifier;
  return 1.00;
}

function calcPropertyRightModifier(propertyRight) {
  if (!propertyRight) return 1.00;
  const pr = HANGZHOU_PROPERTY_RIGHT_DATA[propertyRight];
  if (pr) return pr.modifier;
  return 1.00;
}

function calcPolicyRiskModifier(district) {
  if (!district) return { coefficient: 1.00, description: '政策信息不足' };
  
  const policy = HANGZHOU_POLICY_RISK_DATA.currentPolicy;
  let coefficient = 1.00;
  let descriptions = [];
  
  if (policy.purchaseLimit.status === 'active') {
    coefficient *= 0.98;
    descriptions.push('限购政策影响购房资格');
  }
  if (policy.loanLimit.status === 'active') {
    coefficient *= 0.98;
    descriptions.push('限贷政策影响购房杠杆');
  }
  if (policy.saleLimit.status === 'active') {
    coefficient *= 0.99;
    descriptions.push('限售政策锁定流动性');
  }
  if (policy.guidePrice.status === 'active') {
    coefficient *= 0.98;
    descriptions.push('二手房指导价压制挂牌价');
  }
  
  return {
    coefficient: Math.max(0.90, coefficient),
    description: descriptions.length > 0 ? descriptions.join('；') : '政策影响较小',
  };
}

function calcLiquidityModifier(businessDistrict) {
  if (!businessDistrict) return { coefficient: 1.00, description: '流动性信息不足' };
  
  const liquidity = HANGZHOU_LIQUIDITY_DATA[businessDistrict];
  if (!liquidity) return { coefficient: 1.00, description: '板块流动性数据缺失' };
  
  let coefficient = 1.00;
  
  switch (liquidity.marketStatus) {
    case 'hot':
      coefficient = 1.05;
      break;
    case 'warm':
      coefficient = 1.00;
      break;
    case 'cool':
      coefficient = 0.95;
      break;
  }
  
  return {
    coefficient,
    description: `${liquidity.desc}，月均成交${liquidity.monthlyTurnover}套，平均挂牌${liquidity.avgListingDays}天`,
  };
}


/**
 * 区位系数计算
 */
function calcLocationCoefficient(districtName, businessDistrict) {
  const district = HANGZHOU_DISTRICTS[districtName];
  let coefficient = 1.00;
  let level = 'B';
  let detail = '';

  if (district) {
    switch (district.level) {
      case 'core': coefficient = 1.10; level = 'A'; break;
      case 'subCore': coefficient = 1.05; level = 'B'; break;
      case 'development': coefficient = 1.00; level = 'C'; break;
      case 'suburb': coefficient = 0.90; level = 'D'; break;
    }
    detail = `${district.levelName}，${district.positioning}`;
  }

  // 商圈系数（覆盖区域基础系数）
  if (businessDistrict && BUSINESS_DISTRICTS[businessDistrict]) {
    const bd = BUSINESS_DISTRICTS[businessDistrict];
    coefficient = bd.coefficient;
    level = bd.level;
    detail = `${businessDistrict}（${level}级板块）`;
  }

  return { coefficient, level, detail };
}


/**
 * 配套评分计算
 */
function calcAmenitiesScore(input) {
  const { metroDistance, metroLines, busRoutes, schoolName,
    mallCount, hasMarket, restaurantCount,
    hasTier3Hospital, hospitalDistance, hasCommunityHospital,
    hasPark, parkDistance, hasWater } = input;

  // 交通（满分25）
  let trafficScore = 0;
  let trafficDetail = [];
  if (metroDistance != null) {
    if (metroDistance <= 300) { trafficScore += 15; trafficDetail.push(`地铁${metroDistance}m（地铁上盖+15）`); }
    else if (metroDistance <= 500) { trafficScore += 12; trafficDetail.push(`地铁${metroDistance}m（步行5分钟+12）`); }
    else if (metroDistance <= 800) { trafficScore += 8; trafficDetail.push(`地铁${metroDistance}m（步行10分钟+8）`); }
    else if (metroDistance <= 1000) { trafficScore += 4; trafficDetail.push(`地铁${metroDistance}m（步行15分钟+4）`); }
    else { trafficDetail.push(`地铁${metroDistance}m（较远）`); }
  }
  if (metroLines >= 3) { trafficScore += 10; trafficDetail.push(`${metroLines}条地铁线（换乘站+10）`); }
  else if (metroLines === 2) { trafficScore += 7; trafficDetail.push(`2条地铁线（+7）`); }
  else if (metroLines === 1) { trafficScore += 4; trafficDetail.push(`1条地铁线（+4）`); }

  if (busRoutes >= 10) { trafficScore += 5; trafficDetail.push(`${busRoutes}条公交线（+5）`); }
  else if (busRoutes >= 5) { trafficScore += 3; trafficDetail.push(`${busRoutes}条公交线（+3）`); }
  else if (busRoutes > 0) { trafficScore += 1; }

  trafficScore = Math.min(trafficScore, 25);

  // 教育（满分20）
  let educationScore = 0;
  let educationDetail = [];
  if (schoolName) {
    const premium = calcSchoolPremium(schoolName);
    const school = SCHOOLS[schoolName];
    if (school) {
      educationScore = school.level === '顶级' ? 20 : school.level === '优质' ? 15 : 10;
      educationDetail.push(`${schoolName}（${school.level}，+${educationScore}）`);
    } else {
      educationScore = 8;
      educationDetail.push(`${schoolName}（普通学区+8）`);
    }
  }

  // 商业（满分15）
  let commercialScore = 0;
  let commercialDetail = [];
  if (mallCount >= 2) { commercialScore += 12; commercialDetail.push(`${mallCount}个商场（+12）`); }
  else if (mallCount === 1) { commercialScore += 8; commercialDetail.push(`1个商场（+8）`); }
  if (hasMarket) { commercialScore += 3; commercialDetail.push('有菜市场（+3）'); }
  if (restaurantCount >= 20) { commercialScore += 3; commercialDetail.push(`${restaurantCount}家餐饮（+3）`); }
  else if (restaurantCount >= 10) { commercialScore += 1; }

  commercialScore = Math.min(commercialScore, 15);

  // 医疗（满分10）
  let medicalScore = 0;
  let medicalDetail = [];
  if (hasTier3Hospital) {
    if (hospitalDistance && hospitalDistance <= 3000) { medicalScore += 10; medicalDetail.push(`三甲医院${hospitalDistance}m（+10）`); }
    else { medicalScore += 6; medicalDetail.push('三甲医院5km内（+6）'); }
  }
  if (hasCommunityHospital) { medicalScore += 5; medicalDetail.push('社区医院（+5）'); }
  // 没有任何医院信息时给基础分
  if (medicalScore === 0) { medicalScore = 3; medicalDetail.push('医疗配套信息不足'); }

  medicalScore = Math.min(medicalScore, 10);

  // 自然环境（满分10）
  let natureScore = 0;
  let natureDetail = [];
  if (hasPark) {
    if (parkDistance && parkDistance <= 500) { natureScore += 10; natureDetail.push(`公园${parkDistance}m（+10）`); }
    else { natureScore += 6; natureDetail.push('有公园（+6）'); }
  }
  if (hasWater) { natureScore += 8; natureDetail.push('有水域景观（+8）'); }
  if (natureScore === 0) { natureScore = 2; natureDetail.push('自然环境一般'); }

  natureScore = Math.min(natureScore, 10);

  const totalScore = trafficScore + educationScore + commercialScore + medicalScore + natureScore;

  return {
    total: totalScore,
    traffic: { score: trafficScore, max: 25, detail: trafficDetail },
    education: { score: educationScore, max: 20, detail: educationDetail },
    commercial: { score: commercialScore, max: 15, detail: commercialDetail },
    medical: { score: medicalScore, max: 10, detail: medicalDetail },
    nature: { score: natureScore, max: 10, detail: natureDetail },
  };
}


/**
 * 硬伤扣分计算
 */
function calcDefects(selectedDefects) {
  const defectRules = {
    'highway_noise': {
      name: '高架/高速噪音',
      coefficient: 0.80,
      severity: '严重',
      desc: '距离高架/高速公路<50m，噪音污染严重',
    },
    'main_road_noise': {
      name: '主干道噪音',
      coefficient: 0.90,
      severity: '中等',
      desc: '临城市主干道，距离<30m，有一定噪音',
    },
    'cemetery': {
      name: '公墓/殡仪馆',
      coefficient: 0.70,
      severity: '严重',
      desc: '距离公墓/殡仪馆<1km，心理忌讳影响大',
    },
    'substation': {
      name: '变电站/高压线',
      coefficient: 0.85,
      severity: '严重',
      desc: '距离大型变电站/高压线<300m',
    },
    'garbage_station': {
      name: '垃圾处理站',
      coefficient: 0.80,
      severity: '严重',
      desc: '距离垃圾处理站<500m，异味污染',
    },
    'sewage_plant': {
      name: '污水处理厂',
      coefficient: 0.75,
      severity: '严重',
      desc: '距离污水处理厂<1km，异味污染',
    },
    'airport_noise': {
      name: '机场航线噪音',
      coefficient: 0.88,
      severity: '中等',
      desc: '飞机起降航线正下方',
    },
    'low_ground': {
      name: '地势低洼易涝',
      coefficient: 0.85,
      severity: '严重',
      desc: '地势低于周边区域，大雨容易积水',
    },
    'gas_station': {
      name: '加油站/加气站',
      coefficient: 0.92,
      severity: '中等',
      desc: '距离加油站/加气站较近',
    },
    'poor_lighting': {
      name: '采光严重不足',
      coefficient: 0.88,
      severity: '严重',
      desc: '楼层低+楼间距小，日照<2小时',
    },
    'factory_pollution': {
      name: '工厂污染',
      coefficient: 0.82,
      severity: '严重',
      desc: '附近有化工厂/制药厂等污染企业',
    },
    'red_light': {
      name: '红灯区/治安差',
      coefficient: 0.90,
      severity: '中等',
      desc: '周边治安环境较差',
    },
  };

  let combinedCoefficient = 1.0;
  const defects = [];

  for (const key of selectedDefects) {
    const rule = defectRules[key];
    if (rule) {
      combinedCoefficient *= rule.coefficient;
      defects.push(rule);
    }
  }

  // 最多扣到50%
  combinedCoefficient = Math.max(combinedCoefficient, 0.50);

  return { coefficient: combinedCoefficient, defects };
}


/**
 * 楼栋位置系数
 */
function calcBuildingPositionModifier(position) {
  const map = {
    '楼王': 1.10,
    '好位置': 1.04,
    '一般位置': 1.00,
    '临小区路': 0.96,
    '临市政路': 0.88,
    '临底商': 0.92,
    '临垃圾站': 0.82,
  };
  return map[position] || 1.00;
}


/**
 * 市场情绪系数
 */
function calcMarketSentiment(districtName) {
  const district = HANGZHOU_DISTRICTS[districtName];
  if (!district) return { coefficient: 1.00, description: '市场信息不足，按平稳估算' };

  // 基于区域趋势
  if (district.priceTrend === 'up' && district.growthRate > 1.0) {
    return { coefficient: 1.05, description: `${district.name}人口持续流入，市场温和上行` };
  }
  if (district.priceTrend === 'up') {
    return { coefficient: 1.02, description: `${district.name}市场平稳偏热` };
  }
  if (district.priceTrend === 'down') {
    return { coefficient: 0.92, description: `${district.name}人口流出，市场偏冷` };
  }
  return { coefficient: 1.00, description: `${district.name}市场平稳` };
}


/**
 * 资本化率获取
 */
function getCapRate(districtName) {
  const district = HANGZHOU_DISTRICTS[districtName];
  if (!district) return HANGZHOU_CITY.capitalizationRate.normal;

  switch (district.level) {
    case 'core': return HANGZHOU_CITY.capitalizationRate.core;
    case 'subCore': return (HANGZHOU_CITY.capitalizationRate.core + HANGZHOU_CITY.capitalizationRate.normal) / 2;
    case 'development': return HANGZHOU_CITY.capitalizationRate.normal;
    case 'suburb': return HANGZHOU_CITY.capitalizationRate.suburb;
    default: return HANGZHOU_CITY.capitalizationRate.normal;
  }
}


/**
 * 主估值函数
 */
function calculateValuation(input) {
  const {
    district, businessDistrict, communityName,
    area, floor, totalFloors, orientation, decoration, buildingAge, hasElevator,
    marketPrice, monthlyRent,
    metroDistance, metroLines, busRoutes, schoolName,
    mallCount, hasMarket, restaurantCount,
    hasTier3Hospital, hospitalDistance, hasCommunityHospital,
    hasPark, parkDistance, hasWater,
    buildingPosition, selectedDefects,
    propertyName, houseType, buildingStructure, exteriorMaterial,
    communityScale, far, propertyRight,
  } = input;

  const results = {};
  const factors = {};

  // === 1. 市场比较法 ===
  let marketTotal = null;
  if (marketPrice && area) {
    let unitPrice = marketPrice;
    const areaMod = calcAreaModifier(area);
    const oriMod = calcOrientationModifier(orientation);
    const floorMod = calcFloorModifier(floor, totalFloors, hasElevator);
    const decMod = calcDecorationModifier(decoration, buildingAge);
    const ageMod = calcAgeModifier(buildingAge);
    const elevMod = calcElevatorModifier(hasElevator, totalFloors);
    const schoolPrem = calcSchoolPremium(schoolName);
    const pmMod = calcPropertyManagementModifier(propertyName);
    const htMod = calcHouseTypeModifier(houseType);
    const bsMod = calcBuildingStructureModifier(buildingStructure);
    const emMod = calcExteriorMaterialModifier(exteriorMaterial);
    const csMod = calcCommunityScaleModifier(communityScale);
    const farMod = calcFarModifier(far);
    const prMod = calcPropertyRightModifier(propertyRight);

    const marketSentiment = calcMarketSentiment(district);

    unitPrice = unitPrice * areaMod * oriMod * floorMod * decMod * ageMod * elevMod * (1 + schoolPrem) * pmMod * htMod * bsMod * emMod * csMod * farMod * prMod * marketSentiment.coefficient;

    factors.marketComparison = {
      areaMod, oriMod, floorMod, decMod, ageMod, elevMod,
      schoolPrem, pmMod, htMod, bsMod, emMod, csMod, farMod, prMod,
      marketSentiment: marketSentiment.coefficient,
    };

    marketTotal = unitPrice * area;
  }

  // === 2. 收益还原法 ===
  let incomeTotal = null;
  if (monthlyRent && area) {
    const annualRent = monthlyRent * 12 * (1 - 0.03); // 空置率3%
    const capRate = getCapRate(district);
    incomeTotal = annualRent / capRate;

    factors.incomeApproach = {
      annualRent, capRate,
      capRatePercent: (capRate * 100).toFixed(1) + '%',
    };
  }

  // === 3. 成本法（简化版）===
  let costTotal = null;
  if (marketPrice && area) {
    const landCost = marketPrice * 0.60;
    const buildCost = marketPrice * 0.40 * 3000 / Math.max(marketPrice * 0.40, 1);
    const depreciation = buildingAge ? Math.min(buildingAge * 0.01, 0.30) : 0;
    const depreciatedBuild = buildCost * (1 - depreciation);
    const costUnitPrice = landCost + depreciatedBuild;
    costTotal = costUnitPrice * area;

    factors.costApproach = { landCost, buildCost, depreciation };
  }

  // === 综合估值 ===
  let weights = { market: 0.50, income: 0.25, cost: 0.10, expert: 0.15 };
  let weightedSum = 0;
  let totalWeight = 0;

  if (marketTotal !== null) { weightedSum += marketTotal * weights.market; totalWeight += weights.market; }
  if (incomeTotal !== null) { weightedSum += incomeTotal * weights.income; totalWeight += weights.income; }
  if (costTotal !== null) { weightedSum += costTotal * weights.cost; totalWeight += weights.cost; }

  let baseValuation = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // === 专家调整项 ===

  const location = calcLocationCoefficient(district, businessDistrict);

  const amenities = calcAmenitiesScore(input);
  const amenitiesCoefficient = 1 + ((amenities.total - 60) / 100) * 0.3;

  const defects = calcDefects(selectedDefects || []);

  const buildingPosMod = calcBuildingPositionModifier(buildingPosition);

  const policyRisk = calcPolicyRiskModifier(district);
  
  const liquidity = calcLiquidityModifier(businessDistrict);

  const expertFactor = location.coefficient * amenitiesCoefficient * defects.coefficient * buildingPosMod * policyRisk.coefficient * liquidity.coefficient;

  const finalValuation = baseValuation * expertFactor;

  const lowerBound = finalValuation * 0.90;
  const upperBound = finalValuation * 1.10;

  let confidence = 50;
  if (marketPrice) confidence += 20;
  if (monthlyRent) confidence += 15;
  if (metroDistance != null) confidence += 5;
  if (schoolName) confidence += 5;
  if (selectedDefects && selectedDefects.length > 0) confidence += 5;
  if (propertyName) confidence += 3;
  if (houseType) confidence += 3;
  if (buildingStructure) confidence += 3;
  if (propertyRight) confidence += 3;
  confidence = Math.min(confidence, 95);

  return {
    finalValuation: Math.round(finalValuation),
    unitPrice: Math.round(finalValuation / area),
    lowerBound: Math.round(lowerBound),
    upperBound: Math.round(upperBound),
    confidence,
    methods: {
      market: marketTotal ? Math.round(marketTotal) : null,
      income: incomeTotal ? Math.round(incomeTotal) : null,
      cost: costTotal ? Math.round(costTotal) : null,
    },
    factors: {
      location,
      amenities,
      amenitiesCoefficient,
      defects,
      buildingPosition: { coefficient: buildingPosMod, position: buildingPosition },
      policyRisk,
      liquidity,
      marketComparison: factors.marketComparison || null,
      incomeApproach: factors.incomeApproach || null,
    },
  };
}


// ============ UI 逻辑 ============

function initUI() {
  // 填充区域下拉框
  const districtSelect = document.getElementById('district');
  for (const name of Object.keys(HANGZHOU_DISTRICTS)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `${name}（${HANGZHOU_DISTRICTS[name].levelName}）`;
    districtSelect.appendChild(opt);
  }

  // 区域变化时更新商圈、学校和硬伤检测
  districtSelect.addEventListener('change', function() {
    updateBusinessDistricts(this.value);
    updateSchools(this.value);
    updateDistrictInfo(this.value);
    updateDefectsAutoDetect();
  });

  // 商圈变化时更新硬伤检测
  document.getElementById('businessDistrict').addEventListener('change', function() {
    updateDefectsAutoDetect();
  });

  // 小区名称输入监听
  const communityNameInput = document.getElementById('communityName');
  let communityNameTimer = null;
  communityNameInput.addEventListener('input', function() {
    clearTimeout(communityNameTimer);
    const value = this.value;
    communityNameTimer = setTimeout(() => {
      updateCommunityDefectDetect(value);
    }, 500); // 延迟500ms，避免频繁触发
  });

  // 硬伤复选框样式
  document.querySelectorAll('input[name="defects"]').forEach(cb => {
    cb.addEventListener('change', function() {
      this.closest('.form-checkbox-item').classList.toggle('checked', this.checked);
    });
  });

  // 表单提交
  document.getElementById('valuationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    handleSubmit();
  });
}

function updateBusinessDistricts(districtName) {
  const select = document.getElementById('businessDistrict');
  select.innerHTML = '<option value="">请选择板块/商圈</option>';

  // 根据区域过滤板块
  const districtBDMap = {
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

  const bds = districtBDMap[districtName] || [];
  for (const bd of bds) {
    if (BUSINESS_DISTRICTS[bd]) {
      const opt = document.createElement('option');
      opt.value = bd;
      opt.textContent = `${bd}（${BUSINESS_DISTRICTS[bd].level}级）`;
      select.appendChild(opt);
    }
  }
}

function updateSchools(districtName) {
  const dataList = document.getElementById('schoolList');
  dataList.innerHTML = '';

  const district = HANGZHOU_DISTRICTS[districtName];
  if (district && district.schools) {
    for (const school of district.schools) {
      const opt = document.createElement('option');
      opt.value = school;
      const schoolInfo = SCHOOLS[school];
      opt.textContent = schoolInfo ? `${school}（${schoolInfo.level}）` : school;
      dataList.appendChild(opt);
    }
  }
}

function updateDistrictInfo(districtName) {
  const district = HANGZHOU_DISTRICTS[districtName];
  const infoDiv = document.getElementById('districtInfo');
  if (district) {
    infoDiv.innerHTML = `
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;margin-top:8px;font-size:13px;line-height:1.6;">
        <strong>${district.name}</strong> · ${district.levelName}<br>
        <span style="color:#64748b;">定位：</span>${district.positioning}<br>
        <span style="color:#64748b;">人口：</span>${district.population}万（增速${district.growthRate}%）<br>
        <span style="color:#64748b;">产业：</span>${district.industries.join('、')}<br>
        <span style="color:#64748b;">地铁：</span>${district.metro.join('、')}<br>
        <span style="color:#64748b;">房价等级：</span>${district.priceLevel} | 趋势：${district.priceTrend === 'up' ? '↑上行' : district.priceTrend === 'down' ? '↓下行' : '→平稳'}<br>
        <span style="color:#64748b;">简介：</span>${district.desc}
      </div>
    `;
    infoDiv.style.display = 'block';
  } else {
    infoDiv.style.display = 'none';
  }
}

// 小区名称匹配硬伤和学区显示
function updateCommunityDefectDetect(communityName) {
  const detectDiv = document.getElementById('communityDefectDetect');
  
  if (!communityName || communityName.trim().length < 2) {
    detectDiv.style.display = 'none';
    return;
  }
  
  const matchedDefects = findDefectsByCommunityName(communityName);
  const matchedSchools = findSchoolByCommunityName(communityName);
  
  if (matchedDefects.length === 0 && matchedSchools.length === 0) {
    detectDiv.style.display = 'none';
    return;
  }
  
  const typeColorMap = {
    highway: '#ea580c',
    cemetery: '#dc2626',
    funeral_home: '#dc2626',
    garbage_incinerator: '#dc2626',
    garbage_landfill: '#ea580c',
    wastewater_treatment: '#d97706',
    substation: '#ea580c',
    gas_station: '#d97706',
  };
  
  const severityColorMap = {
    high: '#dc2626',
    medium: '#d97706',
    low: '#059669',
  };
  
  const defectValueMap = {
    highway: 'highway_noise',
    cemetery: 'cemetery',
    funeral_home: 'cemetery',
    garbage_incinerator: 'garbage_station',
    garbage_landfill: 'garbage_station',
    wastewater_treatment: 'sewage_plant',
    substation: 'substation',
    gas_station: 'gas_station',
  };
  
  let html = '';
  
  // 学区匹配结果
  if (matchedSchools.length > 0) {
    html += `
      <div style="margin-bottom:16px;padding:12px;background:#ecfdf5;border-radius:8px;border-left:4px solid #059669;">
        <div style="font-weight:700;color:#065f46;margin-bottom:10px;font-size:15px;">
          🎓 检测到"${communityName}"对应学区：
        </div>
    `;
    
    matchedSchools.forEach(s => {
      const warningColor = s.warning2026 === '红色' || s.warning2026 === 'red' ? '#dc2626' : s.warning2026 === '黄色' || s.warning2026 === 'yellow' ? '#d97706' : '#059669';
      html += `
        <div style="margin-bottom:10px;padding:10px;background:#fff;border-radius:6px;">
          <div style="font-weight:600;font-size:14px;color:#065f46;">${s.name} <span style="font-size:12px;color:#64748b;">(${s.level})</span></div>
          <div style="font-size:12px;color:#64748b;margin-top:4px;">📍 对口初中：${s.middleSchool}（${s.middleSchoolLevel}）</div>
          <div style="display:flex;gap:16px;margin-top:6px;font-size:12px;">
            <span>2026预警：<span style="color:${warningColor};font-weight:600;">${s.warning2026 === 'red' ? '红色' : s.warning2026 === 'yellow' ? '黄色' : s.warning2026}</span></span>
            <span>落户要求：${s.minResidencyYears > 0 ? '≥' + s.minResidencyYears + '年' : '无限制'}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:6px;">${s.desc}</div>
        </div>
      `;
    });
    
    html += `</div>`;
  }
  
  // 硬伤匹配结果
  if (matchedDefects.length > 0) {
    html += `
      <div style="font-weight:700;color:#991b1b;margin-bottom:10px;font-size:15px;">
        ⚠️ 检测到"${communityName}"附近存在以下硬伤：
      </div>
    `;
    
    matchedDefects.forEach(d => {
      html += `
        <div style="display:flex;align-items:center;margin-bottom:8px;padding:8px;background:#fff;border-radius:6px;">
          <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${typeColorMap[d.type]};margin-right:10px;"></span>
          <span style="flex:1;font-size:13px;">
            <strong>${d.name}</strong>
            <span style="color:#64748b;font-size:12px;margin-left:6px;">${d.description}，影响半径${d.impactRadius}m</span>
          </span>
          <span style="color:${severityColorMap[d.severity]};font-weight:600;font-size:12px;">${getDefectSeverityName(d.severity)}</span>
        </div>
      `;
      
      // 自动勾选对应硬伤
      const value = defectValueMap[d.type];
      if (value) {
        const cb = document.querySelector(`input[name="defects"][value="${value}"]`);
        if (cb && !cb.checked) {
          cb.checked = true;
          cb.closest('.form-checkbox-item').classList.add('checked');
        }
      }
    });
    
    html += `
      <div style="margin-top:10px;font-size:12px;color:#7f1d1d;">
        💡 已自动勾选对应的硬伤选项，您可以在下方"硬伤因素"区域调整。建议结合实际楼栋位置和朝向判断是否真正受影响。
      </div>
    `;
  }
  
  detectDiv.innerHTML = html;
  detectDiv.style.display = 'block';
}

function updateDefectsAutoDetect() {
  const district = document.getElementById('district').value;
  const businessDistrict = document.getElementById('businessDistrict').value;
  const autoDetectDiv = document.getElementById('defectsAutoDetect');
  const autoListDiv = document.getElementById('defectsAutoList');
  const terrainDiv = document.getElementById('terrainAutoDetect');
  const terrainListDiv = document.getElementById('terrainAutoList');
  const sewerDiv = document.getElementById('sewerAutoDetect');
  const sewerListDiv = document.getElementById('sewerAutoList');
  const schoolDiv = document.getElementById('schoolAutoDetect');
  const schoolListDiv = document.getElementById('schoolAutoList');
  const metroDiv = document.getElementById('metroAutoDetect');
  const metroListDiv = document.getElementById('metroAutoList');
  const planDiv = document.getElementById('planAutoDetect');
  const planListDiv = document.getElementById('planAutoList');

  if (!district) {
    autoDetectDiv.style.display = 'none';
    terrainDiv.style.display = 'none';
    sewerDiv.style.display = 'none';
    schoolDiv.style.display = 'none';
    metroDiv.style.display = 'none';
    planDiv.style.display = 'none';
    return;
  }

  // === 学区信息 ===
  const schools = Object.entries(HANGZHOU_SCHOOL_DISTRICT_DATA).filter(([name, data]) => data.district === district);
  if (schools.length > 0) {
    let schoolHtml = '';
    schools.forEach(([name, data]) => {
      const warningColor = data.warning2026 === '红色' ? '#dc2626' : data.warning2026 === '黄色' ? '#d97706' : '#059669';
      schoolHtml += `
        <div style="margin-bottom:10px;padding:8px;background:#fff;border-radius:6px;">
          <div style="font-weight:600;font-size:14px;">${name} <span style="font-size:12px;color:#64748b;">(${data.level})</span></div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">对口初中：${data.middleSchool}（${data.middleSchoolLevel}）</div>
          <div style="display:flex;gap:12px;margin-top:4px;font-size:12px;">
            <span>2026预警：<span style="color:${warningColor};font-weight:600;">${data.warning2026}</span></span>
            <span>落户年限：${data.minResidencyYears > 0 ? '≥' + data.minResidencyYears + '年' : '无限制'}</span>
          </div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${data.desc}</div>
        </div>
      `;
    });
    schoolListDiv.innerHTML = schoolHtml;
    schoolDiv.style.display = 'block';
  } else {
    schoolDiv.style.display = 'none';
  }

  // === 地铁线路 ===
  const metroLines = HANGZHOU_METRO_DATA.filter(m => m.coverage.includes(district.replace('区', '')));
  if (metroLines.length > 0) {
    let metroHtml = '';
    metroLines.forEach(m => {
      const statusColor = m.status === '运营' ? '#059669' : '#d97706';
      metroHtml += `
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:13px;">
          <span style="font-weight:600;">${m.line}</span>
          <span style="display:flex;gap:8px;">
            <span style="color:${statusColor};font-size:12px;">${m.status}${m.status === '在建' ? '(' + m.openYear + '通车)' : ''}</span>
            <span style="color:#64748b;font-size:12px;">${m.type}</span>
          </span>
        </div>
      `;
    });
    metroListDiv.innerHTML = metroHtml;
    metroDiv.style.display = 'block';
  } else {
    metroDiv.style.display = 'none';
  }

  // === 城市规划板块 ===
  const plans = Object.entries(HANGZHOU_URBAN_PLAN_DATA).filter(([name, data]) => {
    return data.coverage.some(c => c.includes(district.replace('区', '')));
  });
  if (plans.length > 0) {
    let planHtml = '';
    plans.forEach(([name, data]) => {
      planHtml += `
        <div style="margin-bottom:10px;padding:8px;background:#fff;border-radius:6px;">
          <div style="font-weight:600;font-size:14px;">${name} <span style="font-size:12px;color:#92400e;">(${data.level})</span></div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">定位：${data.positioning}</div>
          <div style="font-size:12px;color:#64748b;margin-top:2px;">重点项目：${data.keyProjects.join('、')}</div>
          <div style="font-size:11px;color:#64748b;margin-top:4px;">${data.desc}</div>
        </div>
      `;
    });
    planListDiv.innerHTML = planHtml;
    planDiv.style.display = 'block';
  } else {
    planDiv.style.display = 'none';
  }

  // === 地势与排水风险 ===
  const terrain = HANGZHOU_TERRAIN_DATA[district];
  if (terrain) {
    const riskColor = terrain.floodRisk.includes('高') ? '#dc2626' : terrain.floodRisk.includes('中') ? '#d97706' : '#059669';
    let terrainHtml = `
      <div style="font-size:13px;line-height:1.7;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#64748b;">平均海拔</span><span>${terrain.elevation}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#64748b;">地势特征</span><span>${terrain.terrain}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#64748b;">内涝风险</span><span style="color:${riskColor};font-weight:600;">${terrain.floodRisk}</span>
        </div>
        <div style="margin-top:6px;padding:8px;background:#fff;border-radius:6px;">
          <div style="font-weight:600;margin-bottom:4px;">⚠️ 已知低洼易涝点：</div>
          ${terrain.lowLyingAreas.map(a => `<div style="color:#dc2626;font-size:12px;">• ${a}</div>`).join('')}
        </div>
        <div style="margin-top:6px;font-size:12px;color:#64748b;">${terrain.desc}</div>
      </div>
    `;
    terrainListDiv.innerHTML = terrainHtml;
    terrainDiv.style.display = 'block';
  } else {
    terrainDiv.style.display = 'none';
  }

  // === 下水管道老化风险 ===
  const sewer = HANGZHOU_SEWER_RISK_DATA[district];
  if (sewer) {
    const riskColor = sewer.riskLevel === '高' ? '#dc2626' : sewer.riskLevel === '中' ? '#d97706' : '#059669';
    let sewerHtml = `
      <div style="font-size:13px;line-height:1.7;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#64748b;">管网老化风险等级</span><span style="color:${riskColor};font-weight:600;">${sewer.riskLevel}</span>
        </div>
        <div style="margin-top:6px;padding:8px;background:#fff;border-radius:6px;">
          <div style="font-weight:600;margin-bottom:4px;">📍 高风险片区/小区：</div>
          ${sewer.agingAreas.map(a => `<div style="font-size:12px;">• ${a}</div>`).join('')}
        </div>
        <div style="margin-top:6px;font-size:12px;color:#64748b;">${sewer.desc}</div>
      </div>
    `;
    sewerListDiv.innerHTML = sewerHtml;
    sewerDiv.style.display = 'block';
  } else {
    sewerDiv.style.display = 'none';
  }

  // === 硬伤检测 ===
  const defects = findNearbyDefects(district, businessDistrict);

  if (defects.length === 0) {
    autoDetectDiv.style.display = 'none';
    return;
  }

  const typeColorMap = {
    highway: '#ea580c',
    cemetery: '#dc2626',
    funeral_home: '#dc2626',
    garbage_incinerator: '#dc2626',
    garbage_landfill: '#ea580c',
    wastewater_treatment: '#d97706',
    substation: '#ea580c',
    gas_station: '#d97706',
  };

  const severityColorMap = {
    high: '#dc2626',
    medium: '#d97706',
    low: '#059669',
  };

  // 区分精确匹配和区域级参考
  const matchedDefects = defects.filter(d => isDefectMatchBusinessDistrict(d, businessDistrict));
  const referenceDefects = defects.filter(d => !isDefectMatchBusinessDistrict(d, businessDistrict));

  let html = '';

  // 精确匹配的硬伤
  if (matchedDefects.length > 0) {
    html += `<div style="margin-bottom:10px;"><div style="font-weight:600;font-size:12px;color:#92400e;margin-bottom:6px;">🔴 该商圈附近可能受影响的硬伤（建议关注）：</div>`;
    matchedDefects.forEach(d => {
      html += `
        <div style="display:flex;align-items:center;margin-bottom:6px;font-size:13px;padding:6px;background:#fff;border-radius:6px;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${typeColorMap[d.type]};margin-right:8px;"></span>
          <span style="flex:1;">${d.name}</span>
          <span style="color:#64748b;font-size:11px;margin-right:8px;">影响半径${d.impactRadius}m</span>
          <span style="color:${severityColorMap[d.severity]};font-weight:600;font-size:12px;">${getDefectSeverityName(d.severity)}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  // 区域级参考的硬伤
  if (referenceDefects.length > 0) {
    html += `<div style="margin-bottom:10px;"><div style="font-weight:600;font-size:12px;color:#64748b;margin-bottom:6px;">⚪ ${district}内其他硬伤（请根据您小区的具体位置判断是否受影响）：</div>`;
    referenceDefects.forEach(d => {
      const note = (d.affectedBusinessDistricts && d.affectedBusinessDistricts.length > 0)
        ? `主要影响：${d.affectedBusinessDistricts.join('、')}`
        : `位于：${d.address}`;
      html += `
        <div style="display:flex;align-items:center;margin-bottom:6px;font-size:13px;padding:6px;background:#fff;border-radius:6px;opacity:0.8;">
          <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${typeColorMap[d.type]};margin-right:8px;"></span>
          <span style="flex:1;">${d.name}</span>
          <span style="color:#64748b;font-size:11px;margin-right:8px;">${note}</span>
          <span style="color:${severityColorMap[d.severity]};font-weight:600;font-size:12px;">${getDefectSeverityName(d.severity)}</span>
        </div>
      `;
    });
    html += `</div>`;
  }

  // 提示信息
  if (businessDistrict && businessDistrict !== '其他') {
    html += `<div style="font-size:12px;color:#b45309;margin-top:8px;">
      💡 以上硬伤基于商圈位置进行匹配，请结合您小区的<strong>实际位置</strong>和<strong>楼栋朝向</strong>判断是否真的受影响。高架噪音通常在${matchedDefects.length > 0 ? '150' : '150-250'}米范围内最明显，公墓/殡仪馆影响半径约1500-2000米。
    </div>`;
  } else {
    html += `<div style="font-size:12px;color:#b45309;margin-top:8px;">
      💡 以上为${district}范围内的硬伤设施汇总。建议选择具体商圈后系统会自动筛选出更精确的结果。请根据您小区的<strong>实际位置</strong>判断是否受影响。
    </div>`;
  }

  autoListDiv.innerHTML = html;
  autoDetectDiv.style.display = 'block';
}

function handleSubmit() {
  const form = document.getElementById('valuationForm');
  const formData = new FormData(form);

  const input = {
    district: formData.get('district') || '',
    businessDistrict: formData.get('businessDistrict') || '',
    communityName: formData.get('communityName') || '',
    area: parseFloat(formData.get('area')) || 0,
    floor: parseInt(formData.get('floor')) || 0,
    totalFloors: parseInt(formData.get('totalFloors')) || 0,
    orientation: formData.get('orientation') || '南北通透',
    decoration: formData.get('decoration') || '简装修',
    buildingAge: parseInt(formData.get('buildingAge')) || 0,
    hasElevator: formData.get('hasElevator') === 'on',
    marketPrice: parseFloat(formData.get('marketPrice')) || 0,
    monthlyRent: parseFloat(formData.get('monthlyRent')) || 0,
    metroDistance: formData.get('metroDistance') ? parseInt(formData.get('metroDistance')) : null,
    metroLines: parseInt(formData.get('metroLines')) || 0,
    busRoutes: parseInt(formData.get('busRoutes')) || 0,
    schoolName: formData.get('schoolName') || '',
    mallCount: parseInt(formData.get('mallCount')) || 0,
    hasMarket: formData.get('hasMarket') === 'on',
    restaurantCount: parseInt(formData.get('restaurantCount')) || 0,
    hasTier3Hospital: formData.get('hasTier3Hospital') === 'on',
    hospitalDistance: formData.get('hospitalDistance') ? parseInt(formData.get('hospitalDistance')) : null,
    hasCommunityHospital: formData.get('hasCommunityHospital') === 'on',
    hasPark: formData.get('hasPark') === 'on',
    parkDistance: formData.get('parkDistance') ? parseInt(formData.get('parkDistance')) : null,
    hasWater: formData.get('hasWater') === 'on',
    buildingPosition: formData.get('buildingPosition') || '一般位置',
    selectedDefects: formData.getAll('defects'),
    propertyName: formData.get('propertyName') || '',
    houseType: formData.get('houseType') || '',
    buildingStructure: formData.get('buildingStructure') || '',
    exteriorMaterial: formData.get('exteriorMaterial') || '',
    communityScale: formData.get('communityScale') || '',
    far: formData.get('far') || '',
    propertyRight: formData.get('propertyRight') || '',
  };

  // 基本验证
  if (!input.district) { alert('请选择区域'); return; }
  if (!input.area || input.area <= 0) { alert('请输入房屋面积'); return; }
  if (!input.marketPrice && !input.monthlyRent) { alert('请至少填写市场均价或月租金（用于估值计算）'); return; }

  // 显示loading
  document.getElementById('resultSection').classList.add('visible');
  document.getElementById('resultContent').innerHTML = '<div class="loading"><div class="spinner"></div>正在分析中...</div>';
  
  // 平滑滚动到结果区域
  setTimeout(() => {
    const resultSection = document.getElementById('resultSection');
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);

  // 模拟异步计算
  setTimeout(() => {
    const result = calculateValuation(input);
    renderResult(input, result);
  }, 500);
}

function formatPrice(price) {
  if (price >= 10000) {
    return (price / 10000).toFixed(1) + '万';
  }
  return Math.round(price).toString();
}

function formatWan(price) {
  return (price / 10000).toFixed(1) + '万';
}

function getScoreColor(score, max) {
  const ratio = score / max;
  if (ratio >= 0.8) return '#059669';
  if (ratio >= 0.6) return '#d97706';
  if (ratio >= 0.4) return '#ea580c';
  return '#dc2626';
}

function getConfidenceClass(confidence) {
  if (confidence >= 80) return 'confidence-high';
  if (confidence >= 60) return 'confidence-medium';
  return 'confidence-low';
}

function renderResult(input, result) {
  const html = `
    <!-- 估值结果卡片 -->
    <div class="valuation-card">
      <div class="label">综合估值</div>
      <div class="value">${formatWan(result.finalValuation)}</div>
      <div class="unit">${result.unitPrice.toLocaleString()} 元/㎡</div>
      <div class="range">估值区间：${formatWan(result.lowerBound)} ~ ${formatWan(result.upperBound)}</div>
      <div style="margin-top:8px;">
        <span class="confidence-badge ${getConfidenceClass(result.confidence)}">置信度 ${result.confidence}%</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div style="display:flex;gap:12px;margin:16px 0;">
      <button class="btn-secondary" onclick="scrollToForm()" style="flex:1;">📝 修改参数重新计算</button>
      <button class="btn-secondary" onclick="window.scrollTo({top:0,behavior:'smooth'})" style="flex:1;">⬆️ 回到顶部</button>
    </div>

    <!-- Tab栏 -->
    <div class="tab-bar">
      <div class="tab-item active" onclick="switchTab('summary')">概要</div>
      <div class="tab-item" onclick="switchTab('methods')">三把尺子</div>
      <div class="tab-item" onclick="switchTab('amenities')">配套评分</div>
      <div class="tab-item" onclick="switchTab('defects')">硬伤检测</div>
      <div class="tab-item" onclick="switchTab('factors')">系数明细</div>
    </div>

    <!-- Tab内容 -->
    <div id="tab-summary" class="tab-content visible">
      <div class="card">
        <div class="card-title"><span class="icon">📋</span>分析概要</div>
        ${renderSummary(input, result)}
      </div>
    </div>

    <div id="tab-methods" class="tab-content">
      <div class="card">
        <div class="card-title"><span class="icon">📏</span>三把尺子交叉验证</div>
        ${renderMethods(result)}
      </div>
    </div>

    <div id="tab-amenities" class="tab-content">
      <div class="card">
        <div class="card-title"><span class="icon">🏥</span>配套评分</div>
        ${renderAmenities(result)}
      </div>
    </div>

    <div id="tab-defects" class="tab-content">
      <div class="card">
        <div class="card-title"><span class="icon">⚠️</span>硬伤检测</div>
        ${renderDefects(result)}
      </div>
    </div>

    <div id="tab-factors" class="tab-content">
      <div class="card">
        <div class="card-title"><span class="icon">🔢</span>系数明细</div>
        ${renderFactors(input, result)}
      </div>
    </div>

    <!-- 免责声明 -->
    <div class="disclaimer" style="margin-top:16px;">
      <strong>免责声明：</strong>以上分析基于用户输入的数据和内置规则引擎计算，仅供参考，不构成投资建议。实际房价受多种因素影响，请以实际市场情况为准。
    </div>
  `;

  document.getElementById('resultContent').innerHTML = html;
}

function scrollToForm() {
  const form = document.getElementById('valuationForm');
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSummary(input, result) {
  const district = HANGZHOU_DISTRICTS[input.district];
  const location = result.factors.location;
  let html = '';

  html += `<div class="score-item"><span class="score-item-label">小区名称</span><span class="score-item-value">${input.communityName || '未填写'}</span></div>`;
  html += `<div class="score-item"><span class="score-item-label">所在区域</span><span class="score-item-value">${input.district}${input.businessDistrict ? ' · ' + input.businessDistrict : ''}</span></div>`;
  html += `<div class="score-item"><span class="score-item-label">区位等级</span><span class="score-item-value">${location.level}级 — ${location.detail}</span></div>`;
  html += `<div class="score-item"><span class="score-item-label">房屋信息</span><span class="score-item-value">${input.area}㎡ / ${input.floor || '?'}/${input.totalFloors || '?'}层 / ${input.orientation}</span></div>`;
  html += `<div class="score-item"><span class="score-item-label">装修/房龄</span><span class="score-item-value">${input.decoration} / ${input.buildingAge || '?'}年${input.hasElevator ? ' / 有电梯' : ' / 无电梯'}</span></div>`;

  if (district) {
    html += `<div class="score-item"><span class="score-item-label">区域趋势</span><span class="score-item-value">${district.priceTrend === 'up' ? '↑ 上行' : district.priceTrend === 'down' ? '↓ 下行' : '→ 平稳'}</span></div>`;
  }

  html += `<div class="score-item"><span class="score-item-label">配套总分</span><span class="score-item-value">${result.factors.amenities.total}/80</span></div>`;
  html += `<div class="score-item"><span class="score-item-label">硬伤扣分</span><span class="score-item-value">${result.factors.defects.defects.length > 0 ? result.factors.defects.defects.length + '项' : '无'}</span></div>`;

  return html;
}

function renderMethods(result) {
  let html = '<div class="method-comparison">';

  if (result.methods.market) {
    html += `<div class="method-card">
      <div class="method-name">市场比较法</div>
      <div class="method-value">${formatWan(result.methods.market)}</div>
      <div class="method-weight">权重 50%</div>
    </div>`;
  }
  if (result.methods.income) {
    html += `<div class="method-card">
      <div class="method-name">收益还原法</div>
      <div class="method-value">${formatWan(result.methods.income)}</div>
      <div class="method-weight">权重 25% · CapRate ${result.factors.incomeApproach ? result.factors.incomeApproach.capRatePercent : '-'}</div>
    </div>`;
  }
  if (result.methods.cost) {
    html += `<div class="method-card">
      <div class="method-name">成本法</div>
      <div class="method-value">${formatWan(result.methods.cost)}</div>
      <div class="method-weight">权重 10%</div>
    </div>`;
  }

  html += '</div>';

  html += '<div style="margin-top:16px;font-size:13px;color:#64748b;line-height:1.6;">';
  html += '<p><strong>市场比较法</strong>：以同小区/同板块成交价为基准，根据面积、朝向、楼层、装修、房龄等因素修正。</p>';
  html += '<p><strong>收益还原法</strong>：年租金 ÷ 资本化率。资本化率根据区域等级取值（核心区3.5%，普通区4.5%，郊区5.5%）。</p>';
  html += '<p><strong>成本法</strong>：土地成本 + 建筑成本折旧。适用于新房和次新房。</p>';
  html += '</div>';

  return html;
}

function renderAmenities(result) {
  const a = result.factors.amenities;
  let html = '';

  const dims = [
    { name: '交通配套', data: a.traffic, icon: '🚇' },
    { name: '教育配套', data: a.education, icon: '🎓' },
    { name: '商业配套', data: a.commercial, icon: '🛒' },
    { name: '医疗配套', data: a.medical, icon: '🏥' },
    { name: '自然环境', data: a.nature, icon: '🌳' },
  ];

  for (const dim of dims) {
    const color = getScoreColor(dim.data.score, dim.data.max);
    html += `<div style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:14px;font-weight:500;">${dim.icon} ${dim.name}</span>
        <span style="font-size:14px;font-weight:600;color:${color};">${dim.data.score}/${dim.data.max}</span>
      </div>
      <div class="score-bar">
        <div class="score-bar-fill" style="width:${(dim.data.score/dim.data.max*100)}%;background:${color};"></div>
      </div>`;

    if (dim.data.detail && dim.data.detail.length > 0) {
      html += '<div style="font-size:12px;color:#64748b;margin-top:4px;">' + dim.data.detail.join('；') + '</div>';
    }

    html += '</div>';
  }

  html += `<div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:8px;">
    <div class="factor-row">
      <span class="label">配套总分</span>
      <span class="value">${a.total}/80</span>
    </div>
    <div class="factor-row">
      <span class="label">配套系数</span>
      <span class="value ${result.factors.amenitiesCoefficient > 1 ? 'positive' : 'negative'}">
        ×${result.factors.amenitiesCoefficient.toFixed(4)}
      </span>
    </div>
  </div>`;

  return html;
}

function renderDefects(result) {
  const defects = result.factors.defects.defects;

  if (defects.length === 0) {
    return '<div style="text-align:center;padding:24px;color:#059669;font-size:16px;">✅ 未检测到明显硬伤</div>';
  }

  let html = '';
  for (const d of defects) {
    const severityClass = d.severity === '严重' ? 'danger' : 'warning';
    html += `<div class="defect-item">
      <div class="defect-icon ${severityClass}">${d.severity === '严重' ? '!' : '⚠'}</div>
      <div class="defect-content">
        <div class="defect-title">${d.name} <span style="color:#dc2626;font-size:12px;">-${Math.round((1-d.coefficient)*100)}%</span></div>
        <div class="defect-desc">${d.desc}</div>
      </div>
    </div>`;
  }

  html += `<div style="border-top:1px solid #e2e8f0;padding-top:12px;margin-top:8px;">
    <div class="factor-row">
      <span class="label">综合硬伤系数</span>
      <span class="value negative">×${result.factors.defects.coefficient.toFixed(2)}</span>
    </div>
  </div>`;

  return html;
}

function renderFactors(input, result) {
  const f = result.factors;
  let html = '<div style="font-size:13px;line-height:1.8;">';

  // 区位系数
  html += `<div class="factor-row"><span class="label">区位等级</span><span class="value">${f.location.level}级</span></div>`;
  html += `<div class="factor-row"><span class="label">区位系数</span><span class="value ${f.location.coefficient > 1 ? 'positive' : f.location.coefficient < 1 ? 'negative' : 'neutral'}">×${f.location.coefficient.toFixed(2)}</span></div>`;
  html += `<div class="factor-row"><span class="label">区位说明</span><span class="value neutral" style="font-size:12px;font-weight:400;">${f.location.detail}</span></div>`;

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';

  // 配套系数
  html += `<div class="factor-row"><span class="label">配套总分</span><span class="value">${f.amenities.total}/80</span></div>`;
  html += `<div class="factor-row"><span class="label">配套系数</span><span class="value ${f.amenitiesCoefficient > 1 ? 'positive' : 'negative'}">×${f.amenitiesCoefficient.toFixed(4)}</span></div>`;

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';

  // 硬伤系数
  html += `<div class="factor-row"><span class="label">硬伤数量</span><span class="value">${f.defects.defects.length}项</span></div>`;
  html += `<div class="factor-row"><span class="label">硬伤系数</span><span class="value negative">×${f.defects.coefficient.toFixed(2)}</span></div>`;

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';

  // 楼栋系数
  html += `<div class="factor-row"><span class="label">楼栋位置</span><span class="value">${input.buildingPosition || '一般位置'}</span></div>`;
  html += `<div class="factor-row"><span class="label">楼栋系数</span><span class="value ${f.buildingPosition.coefficient > 1 ? 'positive' : f.buildingPosition.coefficient < 1 ? 'negative' : 'neutral'}">×${f.buildingPosition.coefficient.toFixed(2)}</span></div>`;

  // 市场比较法明细
  if (f.marketComparison) {
    const m = f.marketComparison;
    html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';
    html += '<div style="font-weight:600;margin-bottom:4px;">市场比较法修正系数</div>';
    html += `<div class="factor-row"><span class="label">面积修正</span><span class="value ${m.areaMod > 1 ? 'positive' : 'negative'}">×${m.areaMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">朝向修正</span><span class="value ${m.oriMod > 1 ? 'positive' : 'negative'}">×${m.oriMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">楼层修正</span><span class="value ${m.floorMod > 1 ? 'positive' : 'negative'}">×${m.floorMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">装修修正</span><span class="value ${m.decMod > 1 ? 'positive' : 'negative'}">×${m.decMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">房龄修正</span><span class="value negative">×${m.ageMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">电梯修正</span><span class="value ${m.elevMod > 1 ? 'positive' : 'negative'}">×${m.elevMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">学区溢价</span><span class="value positive">+${(m.schoolPrem * 100).toFixed(0)}%</span></div>`;
    html += `<div class="factor-row"><span class="label">市场情绪</span><span class="value ${m.marketSentiment > 1 ? 'positive' : m.marketSentiment < 1 ? 'negative' : 'neutral'}">×${m.marketSentiment.toFixed(2)}</span></div>`;
  }

  // 收益还原法明细
  if (f.incomeApproach) {
    const i = f.incomeApproach;
    html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';
    html += '<div style="font-weight:600;margin-bottom:4px;">收益还原法参数</div>';
    html += `<div class="factor-row"><span class="label">年租金（扣除3%空置）</span><span class="value">${Math.round(i.annualRent).toLocaleString()}元</span></div>`;
    html += `<div class="factor-row"><span class="label">资本化率</span><span class="value">${i.capRatePercent}</span></div>`;
  }

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';
  html += `<div class="factor-row" style="font-size:14px;">
    <span class="label" style="font-weight:600;">综合专家系数</span>
    <span class="value" style="font-size:16px;">×${(f.location.coefficient * f.amenitiesCoefficient * f.defects.coefficient * f.buildingPosition.coefficient).toFixed(4)}</span>
  </div>`;

  html += '</div>';
  return html;
}

function switchTab(tabName) {
  document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('visible'));

  event.target.classList.add('active');
  document.getElementById('tab-' + tabName).classList.add('visible');
}

// 初始化
document.addEventListener('DOMContentLoaded', initUI);
