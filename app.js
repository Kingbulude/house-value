/**
 * house-value 房产估值计算器
 * 核心估值引擎 + 杭州城市知识库 + UI逻辑
 */

// ============ 杭州城市知识库 ============

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
const DEFECT_LOCATIONS = [
  // 高架快速路
  { name: '中河高架路', type: 'highway', district: '上城区', address: '上城区-西湖区', description: '贯穿主城南北的核心高架', impactRadius: 150, severity: 'high' },
  { name: '秋石高架路', type: 'highway', district: '上城区', address: '上城区-江干区-临平区', description: '连接主城区与临平的主要通道', impactRadius: 150, severity: 'high' },
  { name: '德胜快速路', type: 'highway', district: '拱墅区', address: '拱墅区-江干区', description: '城东重要东西向快速路', impactRadius: 150, severity: 'high' },
  { name: '留石快速路', type: 'highway', district: '拱墅区', address: '拱墅区-西湖区-余杭区', description: '城北重要东西向快速路', impactRadius: 150, severity: 'high' },
  { name: '时代大道高架', type: 'highway', district: '滨江区', address: '滨江区-萧山区', description: '连接滨江与萧山的主要通道', impactRadius: 150, severity: 'high' },
  { name: '风情大道高架', type: 'highway', district: '萧山区', address: '萧山区', description: '萧山重要南北向快速路', impactRadius: 150, severity: 'high' },
  { name: '通城高架路', type: 'highway', district: '萧山区', address: '萧山区', description: '贯穿萧山城区的东西向快速路', impactRadius: 150, severity: 'high' },
  { name: '东湖高架路', type: 'highway', district: '临平区', address: '临平区', description: '连接临平与主城区的快速路', impactRadius: 150, severity: 'high' },
  { name: '运溪高架路', type: 'highway', district: '余杭区', address: '余杭区', description: '城西科创大走廊重要通道', impactRadius: 150, severity: 'high' },
  { name: '彩虹快速路', type: 'highway', district: '滨江区', address: '滨江区-西湖区-富阳区', description: '连接滨江、之江与富阳', impactRadius: 150, severity: 'high' },
  { name: '文一西路快速路', type: 'highway', district: '西湖区', address: '西湖区-余杭区', description: '未来科技城核心主干道', impactRadius: 150, severity: 'high' },
  { name: '天目山路快速路', type: 'highway', district: '西湖区', address: '西湖区', description: '城西重要东西向快速路', impactRadius: 150, severity: 'high' },
  { name: '莫干山路高架', type: 'highway', district: '拱墅区', address: '拱墅区-余杭区', description: '城北重要南北向快速路', impactRadius: 150, severity: 'high' },
  { name: '钱塘快速路', type: 'highway', district: '上城区', address: '上城区-江干区', description: '贯穿城东的东西向快速路', impactRadius: 150, severity: 'high' },
  { name: '望梅高架路', type: 'highway', district: '临平区', address: '临平区', description: '临平重要南北向快速路', impactRadius: 150, severity: 'high' },

  // 殡仪馆
  { name: '杭州殡仪馆', type: 'funeral_home', district: '西湖区', address: '西湖区西溪路731号', description: '杭州市区主要殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '萧山区殡仪馆', type: 'funeral_home', district: '萧山区', address: '萧山区蜀山街道立新村', description: '萧山区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '临平区殡仪馆', type: 'funeral_home', district: '临平区', address: '临平区塘栖镇超山村', description: '临平区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '余杭区殡仪馆', type: 'funeral_home', district: '余杭区', address: '余杭区径山镇香下桥村', description: '余杭区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '富阳区殡仪馆', type: 'funeral_home', district: '富阳区', address: '富阳区新桐乡程浦村长山弄', description: '富阳区殡仪馆', impactRadius: 2000, severity: 'high' },
  { name: '临安区殡仪馆', type: 'funeral_home', district: '临安区', address: '临安区玲珑街道雅坞村78号', description: '临安区殡仪馆', impactRadius: 2000, severity: 'high' },

  // 公墓/陵园
  { name: '南山陵园', type: 'cemetery', district: '上城区', address: '上城区玉皇山片区', description: '市区老牌公办陵园', impactRadius: 1500, severity: 'high' },
  { name: '杭州第二公墓', type: 'cemetery', district: '西湖区', address: '西湖区留下镇', description: '城西大型公墓', impactRadius: 1500, severity: 'high' },
  { name: '半山公墓', type: 'cemetery', district: '拱墅区', address: '拱墅区半山路', description: '城北大型公墓', impactRadius: 1500, severity: 'high' },
  { name: '半山生态公墓', type: 'cemetery', district: '拱墅区', address: '拱墅区广济路', description: '半山风景区内公墓', impactRadius: 1500, severity: 'high' },
  { name: '浙江安贤陵园', type: 'cemetery', district: '临平区', address: '临平区崇贤街道', description: '城北大型人文纪念园，占地约1000亩', impactRadius: 2000, severity: 'high' },
  { name: '钱江陵园', type: 'cemetery', district: '西湖区', address: '西湖区双浦镇', description: '城南大型山水型陵园', impactRadius: 1500, severity: 'high' },
  { name: '如意陵园', type: 'cemetery', district: '余杭区', address: '余杭区径山镇', description: '余杭区大型陵园', impactRadius: 2000, severity: 'high' },
  { name: '慈福园陵园', type: 'cemetery', district: '萧山区', address: '萧山区蜀山街道', description: '萧山区大型陵园', impactRadius: 1500, severity: 'high' },
  { name: '山南陵园', type: 'cemetery', district: '萧山区', address: '萧山区衙前镇', description: '萧山区陵园', impactRadius: 1500, severity: 'medium' },
  { name: '华侨永久陵园', type: 'cemetery', district: '上城区', address: '上城区丁桥镇', description: '上城区公墓', impactRadius: 1500, severity: 'medium' },
  { name: '龙居寺陵园', type: 'cemetery', district: '上城区', address: '上城区丁桥镇', description: '丁桥片区公墓', impactRadius: 1500, severity: 'medium' },

  // 垃圾焚烧厂
  { name: '杭州九峰垃圾焚烧发电厂', type: 'garbage_incinerator', district: '余杭区', address: '余杭区中泰街道', description: '日处理3000吨，城西主要垃圾处理设施', impactRadius: 3000, severity: 'high' },
  { name: '杭州绿能环保发电厂', type: 'garbage_incinerator', district: '滨江区', address: '滨江区', description: '滨江垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '杭州能达绿色能源有限公司', type: 'garbage_incinerator', district: '临平区', address: '临平区乔司街道', description: '乔司垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '杭州萧山锦江绿色能源有限公司', type: 'garbage_incinerator', district: '萧山区', address: '萧山区', description: '萧山垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '杭州临江环境能源项目', type: 'garbage_incinerator', district: '钱塘区', address: '钱塘区临江循环经济产业园', description: '日处理5200吨，杭州最大垃圾焚烧项目', impactRadius: 3000, severity: 'high' },
  { name: '杭州临安绿能环保发电有限公司', type: 'garbage_incinerator', district: '临安区', address: '临安区锦南街道', description: '临安区垃圾焚烧厂', impactRadius: 2000, severity: 'high' },
  { name: '富阳区循环产业园生活垃圾焚烧项目', type: 'garbage_incinerator', district: '富阳区', address: '富阳区渌渚镇', description: '日处理1500吨', impactRadius: 2000, severity: 'high' },

  // 垃圾填埋场
  { name: '天子岭垃圾填埋场', type: 'garbage_landfill', district: '拱墅区', address: '拱墅区半山街道', description: '已封场，生态治理中', impactRadius: 2000, severity: 'medium' },

  // 污水处理厂
  { name: '城西（蒋村）污水处理厂', type: 'wastewater_treatment', district: '西湖区', address: '西湖区三墩镇', description: '日处理10万吨，服务蒋村、西溪、三墩', impactRadius: 1000, severity: 'medium' },
  { name: '临平净水厂', type: 'wastewater_treatment', district: '临平区', address: '临平区东湖街道', description: '全地埋式，日处理20万吨', impactRadius: 800, severity: 'low' },
  { name: '七格污水处理厂', type: 'wastewater_treatment', district: '上城区', address: '上城区下沙片区', description: '大型污水处理厂', impactRadius: 1000, severity: 'medium' },
  { name: '城北净水厂', type: 'wastewater_treatment', district: '拱墅区', address: '拱墅区半山街道', description: '全地埋式，日处理10万吨', impactRadius: 800, severity: 'low' },
  { name: '临江高科园污水处理厂', type: 'wastewater_treatment', district: '钱塘区', address: '钱塘区临江高科园', description: '化工类工业污水处理厂', impactRadius: 2000, severity: 'high' },
  { name: '余杭污水处理厂', type: 'wastewater_treatment', district: '余杭区', address: '余杭区', description: '日处理13.5万吨', impactRadius: 1000, severity: 'medium' },

  // 大型变电站
  { name: '杭州500kV变电站（瓶窑）', type: 'substation', district: '余杭区', address: '余杭区瓶窑镇', description: '大型500kV变电站', impactRadius: 500, severity: 'high' },
  { name: '杭州220kV变电站（三墩）', type: 'substation', district: '西湖区', address: '西湖区三墩镇', description: '220kV变电站', impactRadius: 300, severity: 'medium' },
  { name: '杭州220kV变电站（九堡）', type: 'substation', district: '上城区', address: '上城区九堡街道', description: '220kV变电站', impactRadius: 300, severity: 'medium' },

  // 补充：钱塘区高架快速路（之前遗漏）
  { name: '江东大道快速路', type: 'highway', district: '钱塘区', address: '钱塘区江东片区', description: '江东片区三横三纵快速系统重要一横，地下+地面+高架立体架构', impactRadius: 150, severity: 'high' },
  { name: '钱塘快速路（下沙段）', type: 'highway', district: '钱塘区', address: '钱塘区下沙路与12号大街', description: '贯穿下沙片区的东西向快速路', impactRadius: 150, severity: 'high' },
  { name: '头蓬快速路', type: 'highway', district: '钱塘区', address: '钱塘区头蓬片区', description: '大江东南北向重要快速路', impactRadius: 150, severity: 'high' },

  // 补充：重要高速公路/跨江大桥（噪音影响）
  { name: '沪杭甬高速杭州市区段', type: 'highway', district: '上城区', address: '上城区-萧山区', description: '贯穿城东的重要高速公路', impactRadius: 200, severity: 'high' },
  { name: '杭州绕城高速（下沙大桥/钱江六桥）', type: 'highway', district: '钱塘区', address: '钱塘区下沙-萧山区', description: '日均车流量超11万辆，货车占比近四成，噪音严重', impactRadius: 250, severity: 'high' },
  { name: '机场高速（S4）', type: 'highway', district: '萧山区', address: '萧山区-滨江区', description: '连接萧山机场的高速公路', impactRadius: 200, severity: 'high' },

  // 补充：钱塘区公墓
  { name: '新湾公墓', type: 'cemetery', district: '钱塘区', address: '钱塘区新湾街道', description: '钱塘区乡村公益性公墓', impactRadius: 1500, severity: 'medium' },
  { name: '河庄公墓', type: 'cemetery', district: '钱塘区', address: '钱塘区河庄街道', description: '钱塘区乡村公益性公墓', impactRadius: 1500, severity: 'medium' },
  { name: '河庄生态墓', type: 'cemetery', district: '钱塘区', address: '钱塘区河庄街道', description: '钱塘区生态公墓', impactRadius: 1500, severity: 'medium' },

  // 补充：其他遗漏硬伤
  { name: '西兴大桥（钱江三桥）', type: 'highway', district: '滨江区', address: '滨江区西兴-上城区', description: '日均车流量15万辆，超负荷运行，严重噪音', impactRadius: 200, severity: 'high' },
  { name: '复兴大桥（钱江四桥）', type: 'highway', district: '滨江区', address: '滨江区长河-上城区', description: '日均车流量约14万辆，双层桥梁噪音大', impactRadius: 200, severity: 'high' },
  { name: '杭州南站铁路', type: 'highway', district: '萧山区', address: '萧山区城厢街道', description: '铁路噪音及震动影响', impactRadius: 200, severity: 'medium' },
];

// 根据区域查找附近硬伤
function findNearbyDefects(districtName, businessDistrict) {
  return DEFECT_LOCATIONS.filter(defect => {
    if (defect.district === districtName) return true;
    if (businessDistrict) {
      const crossDistrictMap = {
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

    const marketSentiment = calcMarketSentiment(district);

    unitPrice = unitPrice * areaMod * oriMod * floorMod * decMod * ageMod * elevMod * (1 + schoolPrem) * marketSentiment.coefficient;

    factors.marketComparison = {
      areaMod, oriMod, floorMod, decMod, ageMod, elevMod,
      schoolPrem, marketSentiment: marketSentiment.coefficient,
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
    // 假设土地成本占60%，建筑成本占40%
    const landCost = marketPrice * 0.60;
    const buildCost = marketPrice * 0.40 * 3000 / Math.max(marketPrice * 0.40, 1); // 建筑成本约3000元/㎡
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

  // 归一化
  let baseValuation = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // === 专家调整项 ===

  // 区位系数
  const location = calcLocationCoefficient(district, businessDistrict);

  // 配套系数
  const amenities = calcAmenitiesScore(input);
  const amenitiesCoefficient = 1 + ((amenities.total - 60) / 100) * 0.3;

  // 硬伤系数
  const defects = calcDefects(selectedDefects || []);

  // 楼栋位置系数
  const buildingPosMod = calcBuildingPositionModifier(buildingPosition);

  // 综合调整
  const expertFactor = location.coefficient * amenitiesCoefficient * defects.coefficient * buildingPosMod;

  const finalValuation = baseValuation * expertFactor;

  // 估值区间（±10%）
  const lowerBound = finalValuation * 0.90;
  const upperBound = finalValuation * 1.10;

  // 置信度
  let confidence = 50;
  if (marketPrice) confidence += 20;
  if (monthlyRent) confidence += 15;
  if (metroDistance != null) confidence += 5;
  if (schoolName) confidence += 5;
  if (selectedDefects && selectedDefects.length > 0) confidence += 5;
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

function updateDefectsAutoDetect() {
  const district = document.getElementById('district').value;
  const businessDistrict = document.getElementById('businessDistrict').value;
  const autoDetectDiv = document.getElementById('defectsAutoDetect');
  const autoListDiv = document.getElementById('defectsAutoList');
  const terrainDiv = document.getElementById('terrainAutoDetect');
  const terrainListDiv = document.getElementById('terrainAutoList');
  const sewerDiv = document.getElementById('sewerAutoDetect');
  const sewerListDiv = document.getElementById('sewerAutoList');

  if (!district) {
    autoDetectDiv.style.display = 'none';
    terrainDiv.style.display = 'none';
    sewerDiv.style.display = 'none';
    return;
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

  let html = '';
  const defectTypeSet = new Set();

  defects.forEach(d => {
    defectTypeSet.add(d.type);
    html += `
      <div style="display:flex;align-items:center;margin-bottom:6px;font-size:13px;">
        <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${typeColorMap[d.type]};margin-right:8px;"></span>
        <span style="flex:1;">${d.name}</span>
        <span style="color:${severityColorMap[d.severity]};font-weight:600;font-size:12px;">${getDefectSeverityName(d.severity)}</span>
      </div>
    `;
  });

  autoListDiv.innerHTML = html;
  autoDetectDiv.style.display = 'block';

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

  document.querySelectorAll('input[name="defects"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.form-checkbox-item').classList.remove('checked');
  });

  defectTypeSet.forEach(type => {
    const value = defectValueMap[type];
    if (value) {
      const cb = document.querySelector(`input[name="defects"][value="${value}"]`);
      if (cb) {
        cb.checked = true;
        cb.closest('.form-checkbox-item').classList.add('checked');
      }
    }
  });
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
  };

  // 基本验证
  if (!input.district) { alert('请选择区域'); return; }
  if (!input.area || input.area <= 0) { alert('请输入房屋面积'); return; }
  if (!input.marketPrice && !input.monthlyRent) { alert('请至少填写市场均价或月租金（用于估值计算）'); return; }

  // 显示loading
  document.getElementById('resultSection').classList.add('visible');
  document.getElementById('resultContent').innerHTML = '<div class="loading"><div class="spinner"></div>正在分析中...</div>';

  // 模拟异步计算
  setTimeout(() => {
    const result = calculateValuation(input);
    renderResult(input, result);
  }, 300);
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
