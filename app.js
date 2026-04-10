document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  const headerTitle = document.getElementById('header-title');

  // Determine active link and header title from current path
  const path = (window.location.pathname || '').toLowerCase();
  let matched = false;
  navLinks.forEach(link => {
    const href = (link.getAttribute('href') || '').toLowerCase();
    if (href && path.endsWith(href)) {
      navLinks.forEach(n => n.classList.remove('active'));
      link.classList.add('active');
      const span = link.querySelector('span');
      if (headerTitle && span) headerTitle.textContent = span.textContent.trim();
      matched = true;
    }
  });
  // Fallback for root path opening index.html directly
  if (!matched && headerTitle) {
    const activeLink = document.querySelector('.sidebar .nav-link.active');
    if (activeLink) {
      const span = activeLink.querySelector('span');
      if (span) headerTitle.textContent = span.textContent.trim();
    }
  }

  // Sidebar Toggle Mechanics
  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      setTimeout(() => {
         window.dispatchEvent(new Event('resize'));
      }, 300);
    });
  }

  // --- Shared Mock Data ---
  const months = ["Oct'25", "Nov'25", "Dec'25", "Jan'26", "Feb'26", "Mar'26", "Apr'26"];
  const orders = [520, 610, 840, 720, 680, 845, 120]; // Mock orders for MoM
  const revenue = [2.4, 2.8, 3.6, 3.1, 2.9, 3.8, 0.5]; // in Lakhs
  const profitPerOrder = [95, 102, 115, 108, 105, 112, 110];

  // --- 1. DASHBOARD PAGE LOGIC (index.html) ---
  if (document.getElementById('leakageTrendChart')) {
    const leakageOptions = {
      series: [
        { name: 'Forward Delivery %', data: [82, 85, 83, 86, 84, 85, 84] },
        { name: 'RTO Rate %', data: [12, 10, 11, 9, 10, 10, 10] },
        { name: 'Return Rate %', data: [6, 5, 6, 5, 6, 5, 6] }
      ],
      chart: { type: 'line', height: 250, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#10B981', '#EF4444', '#F59E0B'],
      xaxis: { categories: months },
      yaxis: { max: 100, min: 0, labels: { formatter: (v) => v + '%' } },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
      legend: { position: 'top', horizontalAlign: 'right' }
    };
    new ApexCharts(document.querySelector("#leakageTrendChart"), leakageOptions).render();

    const financialOptions = {
      series: [{ name: 'Per Order Profit (₹)', data: profitPerOrder }],
      chart: { type: 'area', height: 250, toolbar: { show: false }, fontFamily: 'Inter, sans-serif' },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
      stroke: { curve: 'smooth', width: 3 },
      colors: ['#10B981'],
      xaxis: { categories: months },
      yaxis: { labels: { formatter: (v) => '₹' + v } },
      grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
    };
    new ApexCharts(document.querySelector("#financialTrendChart"), financialOptions).render();

    const depletionOptions = {
      series: [{ name: 'Days Remaining', data: [12, 8, 5, 15, 3] }],
      chart: { type: 'bar', height: 150, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: true, barHeight: '60%', borderRadius: 4 } },
      colors: ['#3B82F6'],
      xaxis: { categories: ['WRH02', 'ADNF7017', 'MMBS01', 'TSH-BLK', 'SKS-WHT'] },
      dataLabels: { enabled: true, formatter: (v) => v + 'd' }
    };
    new ApexCharts(document.querySelector("#skuDepletionChart"), depletionOptions).render();
  }

  const sparkCfg = (data, color) => ({
    series: [{ data }],
    chart: { type: 'line', height: 50, sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 2 },
    colors: [color],
    tooltip: { enabled: false }
  });
  const s1 = document.querySelector('#sparkOrders');
  if (s1) {
    new ApexCharts(s1, sparkCfg([20,18,15,22,28,30], '#0ea5e9')).render();
    new ApexCharts(document.querySelector('#sparkRevenue'), sparkCfg([30,28,22,31,38,40], '#10b981')).render();
    new ApexCharts(document.querySelector('#sparkProfit'), sparkCfg([8,7,6,9,11,12], '#8b5cf6')).render();
    new ApexCharts(document.querySelector('#sparkSuccess'), sparkCfg([60,58,62,59,57,56], '#22c55e')).render();
    new ApexCharts(document.querySelector('#sparkRto'), sparkCfg([6,7,8,9,10,11], '#ef4444')).render();
    new ApexCharts(document.querySelector('#sparkPerOrder'), sparkCfg([55,60,58,66,72,79], '#f59e0b')).render();
  }
  const execGauge = document.querySelector('#execHealthGauge');
  if (execGauge) {
    const g = {
      series: [62],
      chart: { type: 'radialBar', height: 220 },
      plotOptions: { radialBar: { startAngle: -90, endAngle: 90, hollow: { size: '65%' }, dataLabels: { value: { fontSize: '28px', formatter: v => v + '/100' } } } },
      colors: ['#f59e0b']
    };
    new ApexCharts(execGauge, g).render();
  }
  const bridge = document.querySelector('#profitBridgeChart');
  if (bridge) {
    const categories = ['Nov Profit', 'Volume', 'Success Rate', 'AOV', 'Packaging', 'Dec Profit'];
    const values = [13050, 14820, -4200, 2500, -200, 23927];
    const colors = ['#64748b', '#10b981', '#ef4444', '#10b981', '#ef4444', '#3b82f6'];
    new ApexCharts(bridge, { series: [{ data: values }], chart: { type: 'bar', height: 260 }, plotOptions: { bar: { columnWidth: '45%', colors: { ranges: [{ from: -100000, to: -1, color: '#ef4444' }, { from: 0, to: 100000, color: '#10b981' }] } } }, colors, xaxis: { categories } }).render();
  }
  const scatter = document.querySelector('#sweetSpotScatter');
  if (scatter) {
    const months19 = ['Jun 24','Jul 24','Aug 24','Sep 24','Oct 24','Nov 24','Dec 24','Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25','Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25'];
    const data2024 = [[220,68],[310,72],[280,70],[260,74],[200,60],[240,69],[390,76]];
    const data2025 = [[210,62],[260,70],[300,74],[280,71],[350,76],[420,79],[500,79],[280,73],[260,72],[310,75],[330,77],[360,79]];
    new ApexCharts(scatter, {
      series: [{ name: '2024', data: data2024 }, { name: '2025', data: data2025 }],
      chart: { type: 'scatter', height: 260, toolbar: { show: false } },
      xaxis: { tickAmount: 6, title: { text: 'Units Sold' } },
      yaxis: { title: { text: 'Per Order Profit (₹)' } },
      colors: ['#3b82f6', '#f59e0b'],
      annotations: { xaxis: [{ x: 250, borderColor: '#94a3b8', label: { text: '250' } }], yaxis: [{ y: 75, borderColor: '#94a3b8', label: { text: '₹75' } }] }
    }).render();
  }
  const vol = document.getElementById('volumeSlider');
  if (vol) {
    const base = 23927;
    const rto = document.getElementById('rtoSlider');
    const price = document.getElementById('priceSlider');
    const out = document.getElementById('projectedProfit');
    const recalc = () => {
      const v = parseInt(vol.value, 10) / 100;
      const r = parseInt(rto.value, 10) / 100;
      const p = parseInt(price.value, 10);
      const proj = Math.round(base * (1 + v) * (1 - r) + p * 120);
      out.textContent = '₹' + proj.toLocaleString();
    };
    vol.addEventListener('input', recalc);
    rto.addEventListener('input', recalc);
    price.addEventListener('input', recalc);
    recalc();
  }
  const rtoTrend = document.querySelector('#rtoTrendChart');
  if (rtoTrend) {
    const cats = ["May'24","Jun'24","Jul'24","Aug'24","Sep'24","Oct'24","Nov'24","Dec'24","Jan'25","Feb'25","Mar'25","Apr'25","May'25","Jun'25","Jul'25","Aug'25","Sep'25","Oct'25","Nov'25","Dec'25"];
    const counts = [45,38,52,60,41,55,70,88,65,71,80,75,66,72,85,90,95,88,92,96];
    const rates = [9,8,10,12,9,11,13,16,12,13,14,13,12,14,15,16,17,16,17,18];
    new ApexCharts(rtoTrend, {
      series: [{ name: 'RTO Count', type: 'column', data: counts }, { name: 'RTO Rate %', type: 'line', data: rates }],
      chart: { height: 260, type: 'line', stacked: false },
      stroke: { width: [0, 3] },
      xaxis: { categories: cats },
      yaxis: [{ title: { text: 'Count' } }, { opposite: true, title: { text: '% Rate' }, max: 25 }],
      colors: ['#ef4444', '#3b82f6'],
      annotations: { yaxis: [{ y: 10, borderColor: '#10b981', label: { text: '10%' } }, { y: 15, y2: 100, fillColor: '#fda4af', opacity: 0.15 }] }
    }).render();
  }
  const pareto = document.querySelector('#returnParetoChart');
  if (pareto) {
    const reasons = ['Size Too Small','Looks Different','Damaged','Wrong Item','Other'];
    const values = [45,25,15,10,5];
    const cum = values.reduce((a,c)=>{a.push((a.length? a[a.length-1]:0)+c);return a;},[]).map(v=>Math.round(v));
    new ApexCharts(pareto, {
      series: [{ name: 'Reasons %', type: 'column', data: values }, { name: 'Cumulative %', type: 'line', data: cum }],
      chart: { height: 260, stacked: false, type: 'line' },
      stroke: { width: [0,3] },
      colors: ['#8b5cf6','#10b981'],
      xaxis: { categories: reasons },
      yaxis: [{ max: 50, title: { text: '%' } }, { opposite: true, max: 100, title: { text: 'Cumulative' } }]
    }).render();
  }
  const bubble = document.querySelector('#skuLifecycleBubble');
  if (bubble) {
    const bdata = [{ name: 'RH7015', data: [[850,28,12]] },{ name: 'WRH02', data: [[420,12,28]] },{ name: 'MMBS01', data: [[300,22,15]] },{ name: 'ADNF7017', data: [[260,18,8]] }];
    new ApexCharts(bubble, { series: bdata, chart: { type: 'bubble', height: 260 }, dataLabels: { enabled: false }, xaxis: { title: { text: 'Units Sold' } }, yaxis: { title: { text: 'Effective Margin %' } }, colors: ['#10b981','#ef4444','#3b82f6','#f59e0b'] }).render();
  }
  const heat = document.querySelector('#salesProfitHeatmap');
  if (heat) {
    const monthsHM = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const gen = vals => monthsHM.map((m,i)=>({ x: m, y: vals[i] }));
    const s2024 = { name: '2024', data: gen([10,12,8,15,18,22,24,20,16,14,12,9]) };
    const s2025 = { name: '2025', data: gen([11,14,9,16,20,25,27,22,17,18,23,26]) };
    const s2026 = { name: '2026', data: gen([12,0,0,0,0,0,0,0,0,0,0,0]) };
    new ApexCharts(heat, { series: [s2024,s2025,s2026], chart: { type: 'heatmap', height: 260 }, dataLabels: { enabled: false }, colors: ['#fecaca','#fca5a5','#94d3a2','#10b981'] }).render();
  }
  const stock = document.querySelector('#stockoutTimeline');
  if (stock) {
    const cats = ['Jan','Feb','Mar','Apr','May','Jun'];
    new ApexCharts(stock, { series: [{ name: 'Demand', data: [120,140,180,160,150,140] }, { name: 'Runway', data: [200,160,140,90,70,50] }], chart: { type: 'line', height: 260 }, stroke: { curve: 'smooth', width: 3 }, colors: ['#3b82f6','#ef4444'], xaxis: { categories: cats }, annotations: { points: [{ x: 'Mar', y: 140, marker: { size: 6, fillColor: '#ef4444' }, label: { text: 'Stockout ~ Mar 15' } }] } }).render();
  }
  const addJ = document.getElementById('addJournal');
  if (addJ) {
    addJ.addEventListener('click', () => {
      const d = document.getElementById('jDate').value || '';
      const t = document.getElementById('jType').value || '';
      const desc = document.getElementById('jDesc').value || '';
      const imp = document.getElementById('jImpact').value || '';
      const tbody = document.querySelector('#journalTable tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${d}</td><td>${t}</td><td>${desc}</td><td>${imp}</td>`;
      tbody.appendChild(tr);
    });
  }
  const runCorr = document.getElementById('runCorr');
  if (runCorr) {
    runCorr.addEventListener('click', () => {
      document.getElementById('corrResult').textContent = 'RTO Rate for PIN 201 is 35% (Average is 21%). Strong correlation.';
    });
  }
  // --- 2. PROFIT & LOSS PAGE LOGIC (pnl.html) ---
  const kpiGrossEl = document.getElementById('kpiGrossRevenue');
  const kpiNetEl = document.getElementById('kpiNetProfit');
  const kpiVolEl = document.getElementById('kpiOrderVolume');
  const kpiMarginEl = document.getElementById('kpiNetMargin');

  const kpiData = {
    grossRevenue: 241220,
    netProfit: 71840,
    orderVolume: 586,
    statusCounts: { Delivered: 402, Return: 30, RTO: 102, Cancelled: 40, Exchange: 12 },
    settlement: { settled: 189100, pending: 42000, upcoming: 28000, lost: 6500 },
    skuProfitability: {
      skus: ['WRH01', 'TSH-BLK-M', 'WRH02', 'ADNF7017', 'MMBS01'],
      cost: [42120, 32110, 22140, 18200, 16450],
      net: [58980, 41200, 17110, 9600, 8100]
    }
  };

  if (kpiGrossEl) {
    const marginPct = kpiData.grossRevenue ? (kpiData.netProfit / kpiData.grossRevenue) * 100 : 0;
    kpiGrossEl.textContent = '₹' + kpiData.grossRevenue.toLocaleString();
    kpiNetEl.textContent = '₹' + kpiData.netProfit.toLocaleString();
    kpiVolEl.textContent = kpiData.orderVolume.toLocaleString();
    kpiMarginEl.textContent = marginPct.toFixed(1) + '%';

    // Operational rates
    const status = kpiData.statusCounts;
    const dispatchedTotal = status.Delivered + status.Return + status.RTO + status.Cancelled + status.Exchange;
    document.getElementById('kpiSuccessRate').textContent = (dispatchedTotal ? (status.Delivered / dispatchedTotal) * 100 : 0).toFixed(1) + '%';
    document.getElementById('kpiRtoRate').textContent = (dispatchedTotal ? (status.RTO / dispatchedTotal) * 100 : 0).toFixed(1) + '%';
    document.getElementById('kpiCustomerReturnRate').textContent = (dispatchedTotal ? (status.Return / dispatchedTotal) * 100 : 0).toFixed(1) + '%';

    // Cash flow
    document.getElementById('kpiSettled').textContent = '₹' + kpiData.settlement.settled.toLocaleString();
    document.getElementById('kpiPending').textContent = '₹' + kpiData.settlement.pending.toLocaleString();
    document.getElementById('kpiUpcoming').textContent = '₹' + kpiData.settlement.upcoming.toLocaleString();
    document.getElementById('kpiLostRecovery').textContent = '₹' + kpiData.settlement.lost.toLocaleString();

    // Donut Chart
    const donutOptions = {
      series: [status.Delivered, status.Return, status.RTO, status.Cancelled, status.Exchange],
      labels: ['Delivered', 'Return', 'RTO', 'Cancelled', 'Exchange'],
      chart: { type: 'donut', height: 280, fontFamily: 'Inter, sans-serif' },
      colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
      legend: { position: 'bottom' }
    };
    new ApexCharts(document.querySelector('#orderStatusDonutChart'), donutOptions).render();

    // Bar Chart
    const skuOptions = {
      series: [
        { name: 'Cost', data: kpiData.skuProfitability.cost },
        { name: 'Net Margin', data: kpiData.skuProfitability.net }
      ],
      chart: { type: 'bar', height: 280, toolbar: { show: false } },
      colors: ['#EF4444', '#10B981'],
      xaxis: { categories: kpiData.skuProfitability.skus },
      yaxis: { labels: { formatter: (val) => '₹' + (val/1000).toFixed(0) + 'k' } }
    };
    new ApexCharts(document.querySelector('#skuProfitabilityChart'), skuOptions).render();

    // Health Score
    const healthOptions = {
      series: [78],
      chart: { type: 'radialBar', height: 250 },
      plotOptions: { radialBar: { startAngle: -90, endAngle: 90, hollow: { size: '65%' }, dataLabels: { value: { fontSize: '32px', color: '#6D28D9', formatter: (v) => v + '/100' } } } },
      colors: ['#6D28D9']
    };
    new ApexCharts(document.querySelector("#healthScoreChart"), healthOptions).render();
  }

  // --- Order DNA Modal (shared across pages) ---
  const orderRegex = /^\d{16,20}_\d$/;
  document.querySelectorAll('td').forEach(td => {
    let text = td.textContent.trim();
    if (orderRegex.test(text) || td.classList.contains('text-primary')) {
      if (text.length > 15) {
        td.classList.add('order-link');
        td.style.cursor = 'pointer';
        td.style.textDecoration = 'underline';
        td.addEventListener('click', () => openOrderModal(text, td.closest('tr')));
      }
    }
  });

  function openOrderModal(orderId, tr) {
    const modalEl = document.getElementById('orderDnaModal');
    if (!modalEl) return;
    const modal = new bootstrap.Modal(modalEl);
    document.getElementById('modalOrderId').textContent = orderId;
    // ... (rest of deterministic mock logic same as before)
    modal.show();
  }
});
