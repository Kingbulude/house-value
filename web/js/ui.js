import { HANGZHOU_DISTRICTS, BUSINESS_DISTRICTS, DISTRICT_BD_MAP } from './cityKnowledge.js';
import {
  calculateValuation,
  formatPrice,
  formatWan,
  getScoreColor,
  getConfidenceClass,
} from './valuationEngine.js';
import { saveHistory, getHistory, clearHistory, removeHistoryItem, getHistorySummary } from './history.js';

export function initUI() {
  const districtSelect = document.getElementById('district');
  for (const name of Object.keys(HANGZHOU_DISTRICTS)) {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = `${name}（${HANGZHOU_DISTRICTS[name].levelName}）`;
    districtSelect.appendChild(opt);
  }

  districtSelect.addEventListener('change', function() {
    updateBusinessDistricts(this.value);
    updateSchools(this.value);
    updateDistrictInfo(this.value);
  });

  document.querySelectorAll('input[name="defects"]').forEach(cb => {
    cb.addEventListener('change', function() {
      this.closest('.form-checkbox-item').classList.toggle('checked', this.checked);
    });
  });

  document.getElementById('valuationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    handleSubmit();
  });
}

export function updateBusinessDistricts(districtName) {
  const select = document.getElementById('businessDistrict');
  select.innerHTML = '<option value="">请选择板块/商圈</option>';

  const bds = DISTRICT_BD_MAP[districtName] || [];
  for (const bd of bds) {
    if (BUSINESS_DISTRICTS[bd]) {
      const opt = document.createElement('option');
      opt.value = bd;
      opt.textContent = `${bd}（${BUSINESS_DISTRICTS[bd].level}级）`;
      select.appendChild(opt);
    }
  }
}

export function updateSchools(districtName) {
  const dataList = document.getElementById('schoolList');
  dataList.innerHTML = '';

  const district = HANGZHOU_DISTRICTS[districtName];
  if (district && district.education) {
    for (const school of district.education) {
      const opt = document.createElement('option');
      opt.value = school;
      dataList.appendChild(opt);
    }
  }
}

export function updateDistrictInfo(districtName) {
  const district = HANGZHOU_DISTRICTS[districtName];
  const infoDiv = document.getElementById('districtInfo');
  if (district) {
    infoDiv.innerHTML = `
      <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;margin-top:8px;font-size:13px;line-height:1.6;">
        <strong>${district.name}</strong> · ${district.levelName}<br>
        <span style="color:#64748b;">定位：</span>${district.positioning}<br>
        <span style="color:#64748b;">人口：</span>${district.population2025}万（增速${district.growthRate}%）<br>
        <span style="color:#64748b;">产业：</span>${district.coreIndustries.join('、')}<br>
        <span style="color:#64748b;">地铁：</span>${district.transport.join('、')}<br>
        <span style="color:#64748b;">房价等级：</span>${district.priceLevel} | 趋势：${district.priceTrend === 'up' ? '↑上行' : district.priceTrend === 'down' ? '↓下行' : '→平稳'}<br>
        <span style="color:#64748b;">简介：</span>${district.description}
      </div>
    `;
    infoDiv.style.display = 'block';
  } else {
    infoDiv.style.display = 'none';
  }
}

export function handleSubmit() {
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
    hasParkingSpace: formData.get('hasParkingSpace') === 'on',
    parkingPrice: parseFloat(formData.get('parkingPrice')) || 0,
    parkingType: formData.get('parkingType') || '',
    propertyFee: parseFloat(formData.get('propertyFee')) || 0,
    holdingYears: parseInt(formData.get('holdingYears')) || 5,
    riskFreeRate: parseFloat(formData.get('riskFreeRate')) || 3.5,
  };

  if (!input.district) { alert('请选择区域'); return; }
  if (!input.area || input.area <= 0) { alert('请输入房屋面积'); return; }
  if (!input.marketPrice && !input.monthlyRent) { alert('请至少填写市场均价或月租金（用于估值计算）'); return; }

  document.getElementById('resultSection').classList.add('visible');
  document.getElementById('resultContent').innerHTML = '<div class="loading"><div class="spinner"></div>正在分析中...</div>';

  setTimeout(() => {
    const result = calculateValuation(input);
    saveHistory(input, result);
    renderResult(input, result);
    renderHistory();
  }, 300);
}

export function renderResult(input, result) {
  const html = `
    <div class="valuation-card">
      <div class="label">综合估值</div>
      <div class="value">${formatWan(result.finalValuation)}</div>
      <div class="unit">${result.unitPrice.toLocaleString()} 元/㎡</div>
      <div class="range">估值区间：${formatWan(result.lowerBound)} ~ ${formatWan(result.upperBound)}</div>
      <div style="margin-top:8px;">
        <span class="confidence-badge ${getConfidenceClass(result.confidence)}">置信度 ${result.confidence}%</span>
      </div>
    </div>

    <div class="tab-bar">
      <div class="tab-item active" onclick="switchTab('summary')">概要</div>
      <div class="tab-item" onclick="switchTab('methods')">三把尺子</div>
      <div class="tab-item" onclick="switchTab('amenities')">配套评分</div>
      <div class="tab-item" onclick="switchTab('defects')">硬伤检测</div>
      <div class="tab-item" onclick="switchTab('holdingcost')">持有成本</div>
      <div class="tab-item" onclick="switchTab('factors')">系数明细</div>
    </div>

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

    <div id="tab-holdingcost" class="tab-content">
      <div class="card">
        <div class="card-title"><span class="icon">📊</span>持有成本分析</div>
        ${renderHoldingCost(result)}
      </div>
    </div>

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

  html += `<div class="factor-row"><span class="label">区位等级</span><span class="value">${f.location.level}级</span></div>`;
  html += `<div class="factor-row"><span class="label">区位系数</span><span class="value ${f.location.coefficient > 1 ? 'positive' : f.location.coefficient < 1 ? 'negative' : 'neutral'}">×${f.location.coefficient.toFixed(2)}</span></div>`;
  html += `<div class="factor-row"><span class="label">区位说明</span><span class="value neutral" style="font-size:12px;font-weight:400;">${f.location.detail}</span></div>`;

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';

  html += `<div class="factor-row"><span class="label">配套总分</span><span class="value">${f.amenities.total}/80</span></div>`;
  html += `<div class="factor-row"><span class="label">配套系数</span><span class="value ${f.amenitiesCoefficient > 1 ? 'positive' : 'negative'}">×${f.amenitiesCoefficient.toFixed(4)}</span></div>`;

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';

  html += `<div class="factor-row"><span class="label">硬伤数量</span><span class="value">${f.defects.defects.length}项</span></div>`;
  html += `<div class="factor-row"><span class="label">硬伤系数</span><span class="value negative">×${f.defects.coefficient.toFixed(2)}</span></div>`;

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';

  html += `<div class="factor-row"><span class="label">楼栋位置</span><span class="value">${input.buildingPosition || '一般位置'}</span></div>`;
  html += `<div class="factor-row"><span class="label">楼栋系数</span><span class="value ${f.buildingPosition.coefficient > 1 ? 'positive' : f.buildingPosition.coefficient < 1 ? 'negative' : 'neutral'}">×${f.buildingPosition.coefficient.toFixed(2)}</span></div>`;

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

function renderHoldingCost(result) {
  const hc = result.holdingCost;
  const b = hc.annualBreakdown;
  let html = '<div style="font-size:13px;line-height:1.8;">';

  html += `
    <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:8px;padding:12px;margin-bottom:16px;">
      <div style="font-size:14px;font-weight:600;color:#92400e;margin-bottom:4px;">💡 买房划算吗？</div>
      <div style="color:#78350f;">
        持有这套房，每年相当于"花掉" <strong>${formatWan(hc.annualCost)}</strong>（月均 ${hc.monthlyEquivalent.toLocaleString()}元）。<br>
        如果这笔钱存银行/买理财，每年能赚 ${(hc.parameters.riskFreeRate * 100).toFixed(1)}% 的利息。
      </div>
    </div>
  `;

  html += '<div style="font-weight:600;font-size:14px;margin-bottom:8px;">年持有成本明细</div>';

  html += `<div class="factor-row">
    <span class="label">资金机会成本</span>
    <span class="value">${b.opportunityCost.toLocaleString()}元/年</span>
  </div>`;
  html += `<div style="font-size:12px;color:#64748b;margin-left:8px;">房产总价 × 无风险收益率（${(hc.parameters.riskFreeRate * 100).toFixed(1)}%）</div>`;

  html += `<div class="factor-row" style="margin-top:8px;">
    <span class="label">房屋折旧</span>
    <span class="value">${b.buildingDepreciation.toLocaleString()}元/年</span>
  </div>`;
  html += `<div style="font-size:12px;color:#64748b;margin-left:8px;">按每年2%折旧估算</div>`;

  html += `<div class="factor-row" style="margin-top:8px;">
    <span class="label">物业费</span>
    <span class="value">${b.propertyFee.toLocaleString()}元/年</span>
  </div>`;
  html += `<div style="font-size:12px;color:#64748b;margin-left:8px;">${hc.parameters.propertyFee}元/㎡/月 × 12个月</div>`;

  if (b.parkingCost > 0) {
    html += `<div class="factor-row" style="margin-top:8px;">
      <span class="label">车位费用</span>
      <span class="value">${b.parkingCost.toLocaleString()}元/年</span>
    </div>`;
    if (hc.parking.parkingDetail) {
      html += `<div style="font-size:12px;color:#64748b;margin-left:8px;">${hc.parking.parkingDetail}</div>`;
    }
  }

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;">';

  html += `<div class="factor-row" style="font-size:14px;">
    <span class="label" style="font-weight:600;">年持有总成本</span>
    <span class="value" style="font-weight:600;color:#dc2626;">${formatWan(hc.annualCost)}</span>
  </div>`;
  html += `<div class="factor-row" style="font-size:14px;">
    <span class="label" style="font-weight:600;">月均持有成本</span>
    <span class="value" style="font-weight:600;color:#dc2626;">${hc.monthlyEquivalent.toLocaleString()}元/月</span>
  </div>`;

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;">';

  html += `<div class="factor-row" style="font-size:14px;">
    <span class="label" style="font-weight:600;">${hc.parameters.holdingYears}年持有总成本</span>
    <span class="value" style="font-weight:600;color:#dc2626;">${formatWan(hc.totalCost)}</span>
  </div>`;

  html += '<div style="margin-top:16px;font-size:12px;color:#64748b;line-height:1.6;">';
  html += '<p><strong>什么是资金机会成本？</strong> 如果你把买房的钱存银行/买理财，每年能获得的固定收益。买房后这笔钱被"占用"了，所以这是隐性的持有成本。</p>';
  html += '<p><strong>房屋折旧</strong> 房屋本身会老化，价值逐年下降。这里按每年2%估算（考虑建筑折旧和功能折旧）。</p>';
  html += '<p><strong>注意</strong> 以上未考虑房产增值。如果房价上涨，增值收益可能覆盖持有成本。本计算器仅展示"纯持有成本"。</p>';
  html += '</div>';

  html += '</div>';
  return html;
}

export function switchTab(tabName) {
  document.querySelectorAll('.tab-item').forEach(item => item.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('visible'));

  event.target.classList.add('active');
  document.getElementById('tab-' + tabName).classList.add('visible');
}

export function renderHistory() {
  const history = getHistory();
  const container = document.getElementById('historySection');
  if (!container) {
    const section = document.createElement('div');
    section.id = 'historySection';
    section.className = 'history-section';
    document.getElementById('resultSection').insertAdjacentElement('afterend', section);
    container = section;
  }

  if (history.length === 0) {
    container.innerHTML = '';
    return;
  }

  let html = `
    <div class="card" style="margin-top:16px;">
      <div class="card-title" style="display:flex;justify-content:space-between;align-items:center;">
        <span><span class="icon">📜</span>历史估值记录</span>
        <button onclick="clearAllHistory()" style="font-size:12px;color:#64748b;background:none;border:none;cursor:pointer;">清空</button>
      </div>
      <div style="display:flex;flex-direction:column;gap:8px;">
  `;

  for (const item of history) {
    const summary = getHistorySummary(item);
    html += `
      <div class="history-item" onclick="loadHistoryItem('${item.id}')">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="font-weight:500;">${summary.district} · ${summary.community}</div>
            <div style="font-size:12px;color:#64748b;">${summary.area}㎡ · ${summary.date} ${summary.time}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:600;color:#2563eb;">${formatWan(summary.price)}</div>
            <div style="font-size:12px;color:#64748b;">${summary.unitPrice.toLocaleString()}元/㎡</div>
          </div>
        </div>
      </div>
    `;
  }

  html += '</div></div>';
  container.innerHTML = html;
}

export function clearAllHistory() {
  if (confirm('确定清空所有历史记录？')) {
    clearHistory();
    renderHistory();
  }
}

export function loadHistoryItem(id) {
  const history = getHistory();
  const item = history.find(h => h.id === id);
  if (item) {
    renderResult(item.input, item.result);
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
  }
}