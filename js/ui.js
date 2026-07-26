import { HANGZHOU_DISTRICTS, BUSINESS_DISTRICTS, DISTRICT_BD_MAP, matchCommunity } from './cityKnowledge.js';
import {
  calculateValuation,
  formatPrice,
  formatWan,
  getScoreColor,
  getConfidenceClass,
} from './valuationEngine.js';
import { saveHistory, getHistory, clearHistory, removeHistoryItem, getHistorySummary } from './history.js';

let lastResult = null;
let lastInput = null;

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
    clearFieldError('district');
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

  const communityInput = document.querySelector('input[name="communityName"]');
  if (communityInput) {
    communityInput.addEventListener('blur', function() {
      const match = matchCommunity(this.value);
      if (match) {
        const districtSelectEl = document.getElementById('district');
        const bdSelectEl = document.getElementById('businessDistrict');
        
        if (districtSelectEl.value !== match.district) {
          districtSelectEl.value = match.district;
          updateBusinessDistricts(match.district);
          updateSchools(match.district);
          updateDistrictInfo(match.district);
        }
        
        if (bdSelectEl.value !== match.businessDistrict) {
          const bdOptions = Array.from(bdSelectEl.options);
          const option = bdOptions.find(opt => opt.value === match.businessDistrict);
          if (option) {
            bdSelectEl.value = match.businessDistrict;
          }
        }
      }
    });
  }

  // Real-time validation
  document.getElementById('district').addEventListener('change', function() {
    if (this.value) clearFieldError('district');
  });
  document.querySelector('input[name="area"]').addEventListener('input', function() {
    if (this.value && parseFloat(this.value) > 0) clearFieldError('area');
  });

  // Load dark mode preference
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark');
  }
}

function showFieldError(fieldId, message) {
  const el = document.getElementById(fieldId + 'Error');
  if (el) {
    el.textContent = message;
    el.style.display = 'block';
  }
}

function clearFieldError(fieldId) {
  const el = document.getElementById(fieldId + 'Error');
  if (el) {
    el.textContent = '';
    el.style.display = 'none';
  }
}

function clearAllErrors() {
  document.querySelectorAll('.field-error').forEach(el => {
    el.textContent = '';
    el.style.display = 'none';
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
  const district = HANGZHOU_DISTRICTS[districtName];
  if (!district || !district.education) return;

  const schoolInputs = {
    kindergarten: document.getElementById('kindergarten'),
    primarySchool: document.getElementById('primarySchool'),
    middleSchool: document.getElementById('middleSchool'),
    highSchool: document.getElementById('highSchool'),
  };

  for (const [type, input] of Object.entries(schoolInputs)) {
    if (!input) continue;
    input.setAttribute('placeholder', `如：${district.education[0]}`);
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
  clearAllErrors();

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
    kindergarten: formData.get('kindergarten') || '',
    primarySchool: formData.get('primarySchool') || '',
    middleSchool: formData.get('middleSchool') || '',
    highSchool: formData.get('highSchool') || '',
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

  let hasError = false;
  if (!input.district) { showFieldError('district', '请选择区域'); hasError = true; }
  if (!input.area || input.area <= 0) { showFieldError('area', '请输入房屋面积'); hasError = true; }
  if (!input.marketPrice && !input.monthlyRent) { showFieldError('price', '请至少填写市场均价或月租金（用于测算）'); hasError = true; }
  if (hasError) return;

  showLoading();

  setTimeout(() => {
    const result = calculateValuation(input);
    saveHistory(input, result);
    lastInput = input;
    lastResult = result;
    renderResult(input, result);
    hideLoading();
    document.getElementById('resultActions').style.display = 'flex';
  }, 300);
}

export function renderResult(input, result) {
  const html = `
    <div class="valuation-card">
      <div class="label">综合参考价</div>
      <div class="value">${formatWan(result.finalValuation)}</div>
      <div class="unit">${result.unitPrice.toLocaleString()} 元/㎡</div>
      <div class="range">参考区间：${formatWan(result.lowerBound)} ~ ${formatWan(result.upperBound)}</div>
      <div style="margin-top:8px;">
        <span class="confidence-badge ${getConfidenceClass(result.confidence)}">参考度 ${result.confidence}%</span>
      </div>
    </div>

    <div class="tab-bar">
      <div class="tab-item active" onclick="switchTab('summary')">概要</div>
      <div class="tab-item" onclick="switchTab('methods')">三把尺子</div>
      <div class="tab-item" onclick="switchTab('amenities')">配套评分</div>
      <div class="tab-item" onclick="switchTab('defects')">硬伤检测</div>
      <div class="tab-item" onclick="switchTab('holdingcost')">成本估算</div>
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
        <div class="card-title"><span class="icon">💸</span>成本估算</div>
        ${renderHoldingCost(result)}
      </div>
    </div>

    <div class="disclaimer" style="margin-top:16px;">
      <strong>免责声明：</strong>以上结果基于用户输入数据和内置规则引擎测算，仅为个人参考使用，不构成任何投资建议、房产评估报告或交易依据。实际房价受市场供需、政策调控、宏观经济等多种因素影响，请以实际交易价格和专业机构评估为准。
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
      <div class="method-weight">权重 ${Math.round(result.weights.market * 100)}% · 锚定: ${result.marketAnchor || '-'}</div>
    </div>`;
  }
  if (result.methods.income) {
    html += `<div class="method-card">
      <div class="method-name">收益还原法</div>
      <div class="method-value">${formatWan(result.methods.income)}</div>
      <div class="method-weight">权重 ${Math.round(result.weights.income * 100)}% · CapRate ${result.factors.incomeApproach ? result.factors.incomeApproach.capRatePercent : '-'}</div>
    </div>`;
  }
  if (result.methods.cost) {
    html += `<div class="method-card">
      <div class="method-name">成本法</div>
      <div class="method-value">${formatWan(result.methods.cost)}</div>
      <div class="method-weight">权重 ${Math.round(result.weights.cost * 100)}%</div>
    </div>`;
  }

  html += '</div>';

  html += '<div style="margin-top:16px;font-size:13px;color:#64748b;line-height:1.6;">';
  if (result.marketAnchor === '同小区均价') {
    html += '<p><strong>市场比较法</strong>：以同小区均价为锚，仅做楼栋级修正（面积/朝向/楼层/装修/房龄/电梯/位置/硬伤），不重复叠加区位/配套/学区溢价。</p>';
  } else if (result.marketAnchor === '板块基准价') {
    html += '<p><strong>市场比较法</strong>：未提供小区均价，以板块基准价为锚，叠加区位/学区/市场情绪估算。</p>';
  }
  html += '<p><strong>收益还原法</strong>：年租金 ÷ 资本化率。资本化率根据区域等级取值（核心区3.5%，普通区4.5%，郊区5.5%）。</p>';
  html += '<p><strong>成本法</strong>：土地成本 + 建筑成本折旧。适用于新房和次新房。</p>';
  if (result.factors.liquidityDiscount > 0) {
    html += `<p><strong>流动性折价</strong>：大户型/高总价流动性较差，折价 ${result.factors.liquidityDiscount.toFixed(1) * 100}%。</p>`;
  }
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
    <div style="font-size:12px;color:#94a3b8;margin-top:4px;">配套评分仅作参考展示，不再直接影响价格（已包含在小区均价中）</div>
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

  // 锚定信息
  html += `<div class="factor-row"><span class="label">价格锚定</span><span class="value">${result.marketAnchor || '未知'}</span></div>`;
  if (f.marketComparison && f.marketComparison.anchorPrice) {
    html += `<div class="factor-row"><span class="label">锚定均价</span><span class="value">${f.marketComparison.anchorPrice.toLocaleString()} 元/㎡</span></div>`;
  }

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';

  // 楼栋级修正系数
  if (f.buildingModifiers) {
    const bm = f.buildingModifiers;
    html += '<div style="font-weight:600;margin-bottom:4px;">楼栋级修正系数</div>';
    html += `<div class="factor-row"><span class="label">面积修正</span><span class="value ${bm.areaMod > 1 ? 'positive' : bm.areaMod < 1 ? 'negative' : 'neutral'}">×${bm.areaMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">朝向修正</span><span class="value ${bm.oriMod > 1 ? 'positive' : bm.oriMod < 1 ? 'negative' : 'neutral'}">×${bm.oriMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">楼层修正</span><span class="value ${bm.floorMod > 1 ? 'positive' : bm.floorMod < 1 ? 'negative' : 'neutral'}">×${bm.floorMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">装修修正</span><span class="value ${bm.decMod > 1 ? 'positive' : bm.decMod < 1 ? 'negative' : 'neutral'}">×${bm.decMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">房龄修正</span><span class="value ${bm.ageMod < 1 ? 'negative' : 'neutral'}">×${bm.ageMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">电梯修正</span><span class="value ${bm.elevMod > 1 ? 'positive' : bm.elevMod < 1 ? 'negative' : 'neutral'}">×${bm.elevMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">楼栋位置</span><span class="value ${bm.buildingPosMod > 1 ? 'positive' : bm.buildingPosMod < 1 ? 'negative' : 'neutral'}">×${bm.buildingPosMod.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">硬伤系数</span><span class="value ${bm.defectsCoefficient < 1 ? 'negative' : 'neutral'}">×${bm.defectsCoefficient.toFixed(2)}</span></div>`;
    html += `<div class="factor-row" style="font-size:14px;">
      <span class="label" style="font-weight:600;">楼栋修正合计</span>
      <span class="value" style="font-size:16px;font-weight:600;">×${bm.total.toFixed(4)}</span>
    </div>`;
  }

  // 板块基准价模式下的额外系数
  if (f.marketComparison && f.marketComparison.locationCoefficient) {
    const m = f.marketComparison;
    html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';
    html += '<div style="font-weight:600;margin-bottom:4px;">板块估算系数（无小区均价时使用）</div>';
    html += `<div class="factor-row"><span class="label">区位系数</span><span class="value ${m.locationCoefficient > 1 ? 'positive' : 'negative'}">×${m.locationCoefficient.toFixed(2)}</span></div>`;
    html += `<div class="factor-row"><span class="label">学区溢价</span><span class="value positive">+${(m.schoolPrem * 100).toFixed(0)}%</span></div>`;
    if (m.marketSentiment) {
      html += `<div class="factor-row"><span class="label">市场情绪</span><span class="value ${m.marketSentiment > 1 ? 'positive' : m.marketSentiment < 1 ? 'negative' : 'neutral'}">×${m.marketSentiment.toFixed(2)}</span></div>`;
    }
  }

  if (f.incomeApproach) {
    const i = f.incomeApproach;
    html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';
    html += '<div style="font-weight:600;margin-bottom:4px;">收益还原法参数</div>';
    html += `<div class="factor-row"><span class="label">年租金（扣除3%空置）</span><span class="value">${Math.round(i.annualRent).toLocaleString()}元</span></div>`;
    html += `<div class="factor-row"><span class="label">资本化率</span><span class="value">${i.capRatePercent}</span></div>`;
  }

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:8px 0;">';
  html += `<div class="factor-row"><span class="label">流动性折价</span><span class="value ${f.liquidityDiscount > 0 ? 'negative' : 'neutral'}">-${(f.liquidityDiscount * 100).toFixed(1)}%</span></div>`;

  html += '</div>';
  return html;
}

function renderHoldingCost(result) {
  const hc = result.holdingCost;
  const b = hc.annualBreakdown;
  let html = '<div style="font-size:13px;line-height:1.8;">';

  html += `
    <div style="background:#f0f9ff;border:1px solid #bae6fd;border-radius:8px;padding:12px;margin-bottom:16px;">
      <div style="font-size:14px;font-weight:600;color:#0c4a6e;margin-bottom:4px;">💡 年持有费用估算</div>
      <div style="color:#075985;">
        约 <strong>${formatWan(hc.annualCost)}</strong> / 年（月均 ${hc.monthlyEquivalent.toLocaleString()} 元）<br>
        <span style="font-size:12px;">仅供参考，未考虑房产增值收益</span>
      </div>
    </div>
  `;

  html += `<div class="factor-row" style="font-size:14px;">
    <span class="label" style="font-weight:600;">年持有费用</span>
    <span class="value" style="font-weight:600;color:#dc2626;">${formatWan(hc.annualCost)}</span>
  </div>`;

  html += `<div class="factor-row">
    <span class="label">资金占用参考成本</span>
    <span class="value">${b.opportunityCost.toLocaleString()}元</span>
  </div>`;

  html += `<div class="factor-row">
    <span class="label">房屋折旧</span>
    <span class="value">${b.buildingDepreciation.toLocaleString()}元</span>
  </div>`;

  html += `<div class="factor-row">
    <span class="label">物业费</span>
    <span class="value">${b.propertyFee.toLocaleString()}元</span>
  </div>`;

  if (b.parkingCost > 0) {
    html += `<div class="factor-row">
      <span class="label">车位费用</span>
      <span class="value">${b.parkingCost.toLocaleString()}元</span>
    </div>`;
  }

  html += '<hr style="border:none;border-top:1px solid #e2e8f0;margin:12px 0;">';

  html += `<div class="factor-row" style="font-size:14px;">
    <span class="label" style="font-weight:600;">${hc.parameters.holdingYears}年总费用</span>
    <span class="value" style="font-weight:600;color:#dc2626;">${formatWan(hc.totalCost)}</span>
  </div>`;

  html += '<div style="margin-top:12px;font-size:12px;color:#64748b;line-height:1.6;">';
  html += '<p>· 资金占用参考成本：房产总价 × 无风险收益参考</p>';
  html += '<p>· 房屋折旧：按每年2%估算</p>';
  html += '<p>· 本估算仅供参考，不构成投资建议</p>';
  html += '</div>';

  html += '</div>';
  return html;
}

export function toggleCard(cardName) {
  const card = document.querySelector(`[data-card="${cardName}"]`);
  if (!card) return;
  card.classList.toggle('collapsed');
  const toggle = card.querySelector('.card-toggle');
  if (toggle) {
    toggle.classList.toggle('expanded');
  }
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
        <span><span class="icon">📜</span>历史测算记录</span>
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
    loadHistory();
  }
}

export function loadHistoryItem(id) {
  const history = getHistory();
  const item = history.find(h => h.id === id);
  if (item) {
    renderResult(item.input, item.result);
    lastInput = item.input;
    lastResult = item.result;
    document.getElementById('resultActions').style.display = 'flex';
    document.getElementById('resultSection').scrollIntoView({ behavior: 'smooth' });
    closeHistory();
  }
}

// ===== New functions =====

export function showHistory() {
  const modal = document.getElementById('historyModal');
  modal.style.display = 'flex';
  loadHistory();
}

export function closeHistory(e) {
  if (e && e.target !== e.currentTarget) return;
  document.getElementById('historyModal').style.display = 'none';
}

export function loadHistory() {
  const history = getHistory();
  const list = document.getElementById('historyList');
  if (!list) return;

  if (history.length === 0) {
    list.innerHTML = '<div style="text-align:center;padding:40px 16px;color:#94a3b8;font-size:14px;">暂无历史记录</div>';
    return;
  }

  let html = '';
  for (const item of history) {
    const summary = getHistorySummary(item);
    html += `
      <div class="history-list-item">
        <div class="history-list-item-main" onclick="loadHistoryItem('${item.id}')">
          <div style="font-weight:500;">${summary.district} · ${summary.community}</div>
          <div style="font-size:12px;color:#94a3b8;margin-top:2px;">${summary.area}㎡ · ${summary.date} ${summary.time}</div>
          <div style="font-weight:600;color:#2563eb;margin-top:4px;">${formatWan(summary.price)}（${summary.unitPrice.toLocaleString()}元/㎡）</div>
        </div>
        <button class="btn-delete-item" onclick="deleteHistoryItem('${item.id}')" title="删除">✕</button>
      </div>
    `;
  }
  list.innerHTML = html;
}

export function deleteHistoryItem(id) {
  removeHistoryItem(id);
  loadHistory();
}

export function quickFill() {
  const form = document.getElementById('valuationForm');
  const districtSelect = document.getElementById('district');
  districtSelect.value = '西湖区';
  districtSelect.dispatchEvent(new Event('change'));

  setTimeout(() => {
    const bdSelect = document.getElementById('businessDistrict');
    bdSelect.value = '蒋村';
  }, 50);

  const fields = {
    communityName: '万科西庐',
    area: 89,
    floor: 6,
    totalFloors: 18,
    orientation: '南北通透',
    decoration: '精装修',
    buildingAge: 5,
    marketPrice: 48000,
    monthlyRent: 5500,
    metroDistance: 800,
    metroLines: 2,
    busRoutes: 10,
    kindergarten: '省府机关幼儿园',
    primarySchool: '学军小学',
    middleSchool: '文澜中学',
    highSchool: '杭州第二中学',
    mallCount: 1,
    restaurantCount: 15,
    propertyFee: 3.0,
    holdingYears: 5,
    riskFreeRate: 3.5,
  };

  for (const [name, value] of Object.entries(fields)) {
    const el = form.querySelector(`[name="${name}"]`);
    if (el) {
      el.value = value;
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  // Check elevator
  const elevatorSelect = form.querySelector('[name="hasElevator"]');
  if (elevatorSelect) elevatorSelect.value = 'on';

  // Uncheck all defects
  form.querySelectorAll('[name="defects"]').forEach(cb => {
    cb.checked = false;
    cb.closest('.form-checkbox-item')?.classList.remove('checked');
  });

  clearAllErrors();
}

export function copyResult() {
  if (!lastInput || !lastResult) return;

  const r = lastResult;
  let text = `房估计算器 - 测算结果\n`;
  text += `${'='.repeat(30)}\n`;
  text += `综合参考价：${formatWan(r.finalValuation)}（${r.unitPrice.toLocaleString()} 元/㎡）\n`;
  text += `参考区间：${formatWan(r.lowerBound)} ~ ${formatWan(r.upperBound)}\n`;
  text += `参考度：${r.confidence}%\n\n`;

  text += `小区：${lastInput.communityName || '未填写'}\n`;
  text += `区域：${lastInput.district}${lastInput.businessDistrict ? ' · ' + lastInput.businessDistrict : ''}\n`;
  text += `房屋：${lastInput.area}㎡ / ${lastInput.floor || '?'}/${lastInput.totalFloors || '?'}层 / ${lastInput.orientation}\n`;
  text += `装修/房龄：${lastInput.decoration} / ${lastInput.buildingAge || '?'}年\n\n`;

  if (r.methods.market) text += `市场比较法：${formatWan(r.methods.market)}（权重${Math.round(r.weights.market * 100)}%）\n`;
  if (r.methods.income) text += `收益还原法：${formatWan(r.methods.income)}（权重${Math.round(r.weights.income * 100)}%）\n`;
  if (r.methods.cost) text += `成本法：${formatWan(r.methods.cost)}（权重${Math.round(r.weights.cost * 100)}%）\n`;

  if (r.factors.defects.defects.length > 0) {
    text += `\n硬伤检测：${r.factors.defects.defects.map(d => d.name).join('、')}\n`;
  }

  text += `\n免责声明：仅供参考，不构成投资建议。\n`;

  navigator.clipboard.writeText(text).then(() => {
    const btn = document.querySelector('.btn-action');
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✅ 已复制';
      setTimeout(() => { btn.textContent = orig; }, 1500);
    }
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    alert('已复制到剪贴板');
  });
}

export function toggleDarkMode() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem('darkMode', isDark);
  const btn = document.querySelector('.dark-toggle');
  if (btn) btn.textContent = isDark ? '☀️' : '🌙';
}

export function showLoading() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner" style="width:20px;height:20px;border-width:2px;display:inline-block;vertical-align:middle;margin-right:8px;"></span>分析中...';
}

export function hideLoading() {
  const btn = document.getElementById('submitBtn');
  btn.disabled = false;
  btn.innerHTML = '开始测算分析';
}

export function exportPDF() {
  alert('功能开发中，敬请期待！');
}
