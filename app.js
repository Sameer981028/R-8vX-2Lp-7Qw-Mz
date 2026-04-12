document.addEventListener('DOMContentLoaded', () => {
  // Sidebar Toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  if (sidebarToggle) {
    sidebarToggle.addEventListener('click', () => {
      document.body.classList.toggle('sidebar-collapsed');
      setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    });
  }

  // --- EXTENDED TIME-SERIES MOCK DATA (24 Months) ---
  const months = ["May'24", "Jun'24", "Jul'24", "Aug'24", "Sep'24", "Oct'24", "Nov'24", "Dec'24", "Jan'25", "Feb'25", "Mar'25", "Apr'25", "May'25", "Jun'25", "Jul'25", "Aug'25", "Sep'25", "Oct'25", "Nov'25", "Dec'25", "Jan'26", "Feb'26", "Mar'26", "Apr'26"];
  
  const timeSeriesData = months.map((m, i) => {
    const baseRev = 300000 + (i * 15000) + (Math.random() * 50000);
    const profitMargin = 0.2 + (Math.random() * 0.1);
    const orders = Math.floor(baseRev / 600);
    const successRate = 60 + (Math.random() * 15);
    const rtoRate = 10 + (Math.random() * 10);
    const returnRate = 5 + (Math.random() * 5);
    const adsCost = baseRev * (0.05 + Math.random() * 0.05);
    const cogs = baseRev * (0.5 + Math.random() * 0.1);
    
    return {
      month: m,
      date: new Date(2024, 4 + i, 1),
      revenue: Math.round(baseRev),
      profit: Math.round(baseRev * profitMargin),
      orders: orders,
      unitsSold: Math.floor(orders * 1.2),
      successRate: parseFloat(successRate.toFixed(1)),
      rtoRate: parseFloat(rtoRate.toFixed(1)),
      returnRate: parseFloat(returnRate.toFixed(1)),
      cancelledRate: parseFloat((Math.random() * 5).toFixed(1)),
      exchangeRate: parseFloat((Math.random() * 3).toFixed(1)),
      health: Math.floor(60 + (Math.random() * 35)),
      adsCost: Math.round(adsCost),
      cogs: Math.round(cogs)
    };
  });

  // Global Chart Instances
  let charts = {};

  // --- HELPER: Filter data by date range ---
  const getFilteredData = (start, end) => {
    return timeSeriesData.filter(d => d.date >= start && d.date <= end);
  };

  // --- RENDER: Executive Summary for Range ---
  const updateSummary = (filtered) => {
    const totalOrders = filtered.reduce((sum, d) => sum + d.orders, 0);
    const totalRev = filtered.reduce((sum, d) => sum + d.revenue, 0);
    const totalProfit = filtered.reduce((sum, d) => sum + d.profit, 0);
    const avgSuccess = filtered.reduce((sum, d) => sum + d.successRate, 0) / filtered.length;

    const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    setEl('totalOrders', totalOrders.toLocaleString());
    setEl('netRevenue', '₹' + totalRev.toLocaleString());
    setEl('grossProfit', '₹' + totalProfit.toLocaleString());
    setEl('successRateSummary', avgSuccess.toFixed(1) + '%');

    // Simple Up/Down indicator compared to first half of selected range
    const mid = Math.floor(filtered.length / 2);
    const firstHalf = filtered.slice(0, mid);
    const secondHalf = filtered.slice(mid);
    
    const compare = (id, s1, s2) => {
      const el = document.getElementById(id);
      if(!el) return;
      if (s1 === 0) { el.innerHTML = '--'; return; }
      const diff = ((s2 - s1) / s1) * 100;
      const isUp = diff >= 0;
      el.className = `metric-trend trend-${isUp ? 'up' : 'down'}`;
      el.innerHTML = `<i class="bi bi-caret-${isUp ? 'up' : 'down'}-fill"></i> ${Math.abs(diff).toFixed(1)}% <span class="text-muted small ms-1">vs prev half</span>`;
    };

    if(filtered.length >= 2) {
      compare('totalOrdersTrend', firstHalf.reduce((s, d) => s + d.orders, 0), secondHalf.reduce((s, d) => s + d.orders, 0));
      compare('netRevenueTrend', firstHalf.reduce((s, d) => s + d.revenue, 0), secondHalf.reduce((s, d) => s + d.revenue, 0));
      compare('grossProfitTrend', firstHalf.reduce((s, d) => s + d.profit, 0), secondHalf.reduce((s, d) => s + d.profit, 0));
      compare('successRateTrend', firstHalf.reduce((s, d) => s + d.successRate, 0) / mid, secondHalf.reduce((s, d) => s + d.successRate, 0) / (filtered.length - mid));
    }
  };

  // --- RENDER: Charts ---
  const initCharts = (filtered) => {
    const categories = filtered.map(d => d.month);
    
    // 1. Main Trend Chart
    const mainOptions = {
      series: [
        { name: 'Revenue', type: 'column', data: filtered.map(d => d.revenue) },
        { name: 'Profit', type: 'line', data: filtered.map(d => d.profit) }
      ],
      chart: { height: 350, type: 'line', toolbar: { show: false } },
      stroke: { width: [0, 4], curve: 'smooth' },
      colors: ['#6D28D9', '#10B981'],
      xaxis: { categories },
      yaxis: [
        { title: { text: 'Revenue (₹)' }, labels: { formatter: (v) => '₹' + (v/1000).toFixed(0) + 'k' } },
        { opposite: true, title: { text: 'Profit (₹)' }, labels: { formatter: (v) => '₹' + (v/1000).toFixed(0) + 'k' } }
      ],
      legend: { position: 'top' }
    };
    if(charts.main) charts.main.destroy();
    charts.main = new ApexCharts(document.querySelector("#mainTrendChart"), mainOptions);
    charts.main.render();

    // 2. Health Trend Chart
    const healthOptions = {
      series: [{ name: 'Health Index', data: filtered.map(d => d.health) }],
      chart: { height: 350, type: 'area', toolbar: { show: false } },
      fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.1 } },
      colors: ['#8B5CF6'],
      xaxis: { categories },
      yaxis: { max: 100, min: 0 },
      stroke: { curve: 'smooth', width: 3 }
    };
    if(charts.health) charts.health.destroy();
    charts.health = new ApexCharts(document.querySelector("#healthTrendChart"), healthOptions);
    charts.health.render();

    // 3. Status Distribution Trend
    const statusOptions = {
      series: [
        { name: 'Success %', data: filtered.map(d => d.successRate) },
        { name: 'Cancellation %', data: filtered.map(d => d.cancelledRate) }
      ],
      chart: { height: 300, type: 'bar', stacked: true, toolbar: { show: false } },
      colors: ['#10B981', '#94A3B8'],
      xaxis: { categories },
      yaxis: { max: 100 }
    };
    if(charts.status) charts.status.destroy();
    charts.status = new ApexCharts(document.querySelector("#statusTrendChart"), statusOptions);
    charts.status.render();

    // 4. Reverse Logistics Trend
    const reverseOptions = {
      series: [
        { name: 'RTO Rate %', data: filtered.map(d => d.rtoRate) },
        { name: 'Return Rate %', data: filtered.map(d => d.returnRate) }
      ],
      chart: { height: 300, type: 'line', toolbar: { show: false } },
      stroke: { width: 3, curve: 'smooth' },
      colors: ['#EF4444', '#F59E0B'],
      xaxis: { categories }
    };
    if(charts.reverse) charts.reverse.destroy();
    charts.reverse = new ApexCharts(document.querySelector("#reverseTrendChart"), reverseOptions);
    charts.reverse.render();
  };

  // --- RENDER: Growth & Trends (Tab 2) ---
  const updateGrowth = (filtered) => {
    const momGrid = document.getElementById('momGrid');
    if (!momGrid) return;
    momGrid.innerHTML = '';
    
    // Calculate last month vs month before that in the filtered range
    if (filtered.length >= 2) {
      const curr = filtered[filtered.length - 1];
      const prev = filtered[filtered.length - 2];
      
      const metrics = [
        { label: 'Revenue Growth', val: ((curr.revenue - prev.revenue) / prev.revenue * 100).toFixed(1) + '%' },
        { label: 'Profit Growth', val: ((curr.profit - prev.profit) / prev.profit * 100).toFixed(1) + '%' },
        { label: 'Order Volume', val: ((curr.orders - prev.orders) / prev.orders * 100).toFixed(1) + '%' },
        { label: 'Success Rate', val: (curr.successRate - prev.successRate).toFixed(1) + 'pp' }
      ];
      
      metrics.forEach(m => {
        const div = document.createElement('div');
        div.className = 'col-6 mb-2';
        const isUp = parseFloat(m.val) >= 0;
        div.innerHTML = `
          <div class="p-2 border rounded bg-light">
            <div class="small text-muted">${m.label}</div>
            <div class="fw-bold text-${isUp ? 'success' : 'danger'}">${isUp ? '+' : ''}${m.val}</div>
          </div>
        `;
        momGrid.appendChild(div);
      });
    }

    const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    const cumRev = filtered.reduce((s, d) => s + d.revenue, 0);
    const cumProf = filtered.reduce((s, d) => s + d.profit, 0);
    setEl('cumRevenue', '₹' + (cumRev / 100000).toFixed(1) + 'L');
    setEl('cumProfit', '₹' + (cumProf / 100000).toFixed(1) + 'L');

    const movingAvgEl = document.querySelector("#movingAvgChart");
    if (movingAvgEl) {
      new ApexCharts(movingAvgEl, {
        series: [
          { name: 'Revenue (₹)', data: filtered.map(d => d.revenue) },
          { name: 'Profit (₹)', data: filtered.map(d => d.profit) }
        ],
        chart: { type: 'line', height: 250, toolbar: { show: false } },
        stroke: { curve: 'smooth', width: 2 },
        colors: ['#6D28D9', '#10B981'],
        xaxis: { categories: filtered.map(d => d.month) }
      }).render();
    }
  };

  // --- RENDER: Efficiency & P&L (Tab 3) ---
  const updateEfficiency = (filtered) => {
    const ratiosGrid = document.getElementById('ratiosGrid');
    if (!ratiosGrid) return;
    ratiosGrid.innerHTML = '';
    
    const last = filtered[filtered.length - 1];
    const ratios = [
      { label: 'Success Rate', val: last.successRate + '%', color: 'success' },
      { label: 'RTO Rate', val: last.rtoRate + '%', color: 'danger' },
      { label: 'Return Rate', val: last.returnRate + '%', color: 'warning' },
      { label: 'Failure Rate', val: (last.rtoRate + last.returnRate + last.cancelledRate).toFixed(1) + '%', color: 'danger' },
      { label: 'Gross Margin', val: ((last.profit / last.revenue) * 100).toFixed(1) + '%', color: 'primary' },
      { label: 'ROAS', val: (last.revenue / last.adsCost).toFixed(1) + 'x', color: 'info' }
    ];
    
    ratios.forEach(r => {
      const div = document.createElement('div');
      div.className = 'col-md-2 col-6 mb-3';
      div.innerHTML = `
        <div class="metric-card border-top border-3 border-${r.color}">
          <span class="metric-label">${r.label}</span>
          <span class="metric-value text-${r.color}">${r.val}</span>
        </div>
      `;
      ratiosGrid.appendChild(div);
    });

    const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    setEl('aovValue', '₹' + Math.round(last.revenue / last.orders));
    setEl('aspValue', '₹' + Math.round(last.revenue / last.unitsSold));
    setEl('acuValue', '₹' + Math.round(last.cogs / last.unitsSold));
    setEl('pkgLossValue', '₹' + ((last.rtoRate + last.returnRate) * 0.05).toFixed(1));

    // Loss Table
    const lossBody = document.getElementById('lossTableBody');
    if (lossBody) {
      lossBody.innerHTML = `
        <tr><td>RTO Financial Loss</td><td class="fw-bold text-end">₹${Math.round(last.revenue * (last.rtoRate/100) * 0.1).toLocaleString()}</td></tr>
        <tr><td>Return Financial Loss</td><td class="fw-bold text-end">₹${Math.round(last.revenue * (last.returnRate/100) * 0.15).toLocaleString()}</td></tr>
        <tr><td>Packaging Cost</td><td class="fw-bold text-end">₹${(last.orders * 5).toLocaleString()}</td></tr>
      `;
    }
  };

  // --- RENDER: Forecasting & Seasonal (Tab 4) ---
  const updateForecasting = (filtered) => {
    const categories = filtered.map(d => d.month);
    const seasonalEl = document.querySelector("#seasonalityChart");
    if (seasonalEl) {
      new ApexCharts(seasonalEl, {
        series: [{ name: 'Revenue', data: filtered.map(d => d.revenue) }],
        chart: { type: 'area', height: 300, toolbar: { show: false } },
        colors: ['#6D28D9'],
        xaxis: { categories }
      }).render();
    }

    const last = filtered[filtered.length - 1];
    const setEl = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    setEl('forecastRevenue', '₹' + Math.round(last.revenue * 1.05).toLocaleString());
    setEl('forecastProfit', '₹' + Math.round(last.profit * 1.05).toLocaleString());
    setEl('forecastVolume', Math.round(last.orders * 1.05));
    setEl('nextSettlement', '₹' + Math.round(last.revenue * 0.8).toLocaleString());
  };

  // --- RENDER: SKU Portfolio (Tab 5) ---
  const updateSKU = (filtered) => {
    const last = filtered[filtered.length - 1];
    document.getElementById('activeSkusCount').textContent = Math.floor(last.orders / 5);
    
    const skuChartCfg = (id, data, color) => {
      const el = document.querySelector(id);
      if (!el) return;
      new ApexCharts(el, {
        series: [{ data }],
        chart: { type: 'bar', height: 160, toolbar: { show: false } },
        plotOptions: { bar: { horizontal: true, barHeight: '60%' } },
        colors: [color],
        xaxis: { categories: ['SKU-A', 'SKU-B', 'SKU-C'] }
      }).render();
    };
    
    skuChartCfg('#topSkuProfitChart', [50000, 35000, 20000], '#10b981');
    skuChartCfg('#topSkuRevenueChart', [150000, 120000, 90000], '#6D28D9');
    skuChartCfg('#worstSkuRtoChart', [25, 20, 18], '#ef4444');
    skuChartCfg('#worstSkuReturnChart', [12, 10, 8], '#f59e0b');
  };

  // --- RENDER: Anomalies ---
  const updateAnomalies = (filtered) => {
    const list = document.getElementById('anomalyRangeList');
    if(!list) return;
    list.innerHTML = '';
    
    filtered.filter(d => d.rtoRate > 15 || d.successRate < 65).forEach(d => {
      const tr = document.createElement('tr');
      const isRto = d.rtoRate > 15;
      tr.innerHTML = `
        <td><span class="text-muted small">${d.month}</span></td>
        <td><span class="fw-semibold">${isRto ? 'RTO Rate' : 'Success Rate'}</span></td>
        <td><span class="badge bg-danger bg-opacity-10 text-danger">${isRto ? 'CRITICAL' : 'WARNING'}</span></td>
        <td class="small">${isRto ? 'RTO crossed 15% threshold.' : 'Success rate dropped below 65%.'}</td>
        <td class="text-danger fw-bold small">₹${(d.revenue * 0.05).toFixed(0)}</td>
      `;
      list.appendChild(tr);
    });
  };

  // --- EVENT HANDLERS: Range Selection ---
  const applyRange = () => {
    const startInput = document.getElementById('startDate').value;
    const endInput = document.getElementById('endDate').value;
    if (!startInput || !endInput) return;
    
    const start = new Date(startInput);
    const end = new Date(endInput);
    const filtered = getFilteredData(start, end);
    
    if(filtered.length > 0) {
      updateSummary(filtered);
      initCharts(filtered);
      updateAnomalies(filtered);
      updateGrowth(filtered);
      updateEfficiency(filtered);
      updateForecasting(filtered);
      updateSKU(filtered);
    }
  };

  document.getElementById('applyRange')?.addEventListener('click', applyRange);

  document.querySelectorAll('#periodFilters button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#periodFilters button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const range = btn.dataset.range;
      const end = new Date(2026, 3, 12);
      let start = new Date(end);
      
      if(range === '2M') start.setMonth(end.getMonth() - 2);
      else if(range === '6M') start.setMonth(end.getMonth() - 6);
      else if(range === '9M') start.setMonth(end.getMonth() - 9);
      else if(range === '12M') start.setMonth(end.getMonth() - 12);
      else if(range === 'all') start = new Date(2024, 4, 1);
      
      document.getElementById('startDate').value = start.toISOString().split('T')[0];
      document.getElementById('endDate').value = end.toISOString().split('T')[0];
      applyRange();
    });
  });

  // Initial Load (Default 2M)
  document.querySelector('#periodFilters button[data-range="2M"]')?.click();

  // --- 2. PROFIT & LOSS PAGE LOGIC (pnl.html) ---
  const kpiGrossEl = document.getElementById('kpiGrossRevenue');
  if (kpiGrossEl) {
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

    const marginPct = (kpiData.netProfit / kpiData.grossRevenue) * 100;
    kpiGrossEl.textContent = '₹' + kpiData.grossRevenue.toLocaleString();
    document.getElementById('kpiNetProfit').textContent = '₹' + kpiData.netProfit.toLocaleString();
    document.getElementById('kpiOrderVolume').textContent = kpiData.orderVolume.toLocaleString();
    document.getElementById('kpiNetMargin').textContent = marginPct.toFixed(1) + '%';

    const status = kpiData.statusCounts;
    const total = status.Delivered + status.Return + status.RTO + status.Cancelled + status.Exchange;
    const setElSafe = (id, val) => { const el = document.getElementById(id); if(el) el.textContent = val; };
    setElSafe('kpiSuccessRate', (status.Delivered / total * 100).toFixed(1) + '%');
    setElSafe('kpiRtoRate', (status.RTO / total * 100).toFixed(1) + '%');
    setElSafe('kpiCustomerReturnRate', (status.Return / total * 100).toFixed(1) + '%');

    setElSafe('kpiSettled', '₹' + kpiData.settlement.settled.toLocaleString());
    setElSafe('kpiPending', '₹' + kpiData.settlement.pending.toLocaleString());
    setElSafe('kpiUpcoming', '₹' + kpiData.settlement.upcoming.toLocaleString());
    setElSafe('kpiLostRecovery', '₹' + kpiData.settlement.lost.toLocaleString());

    if (document.querySelector('#orderStatusDonutChart')) {
      new ApexCharts(document.querySelector('#orderStatusDonutChart'), {
        series: [status.Delivered, status.Return, status.RTO, status.Cancelled, status.Exchange],
        labels: ['Delivered', 'Return', 'RTO', 'Cancelled', 'Exchange'],
        chart: { type: 'donut', height: 280 },
        colors: ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'],
        legend: { position: 'bottom' }
      }).render();
    }

    if (document.querySelector('#skuProfitabilityChart')) {
      new ApexCharts(document.querySelector('#skuProfitabilityChart'), {
        series: [
          { name: 'Cost', data: kpiData.skuProfitability.cost },
          { name: 'Net Margin', data: kpiData.skuProfitability.net }
        ],
        chart: { type: 'bar', height: 280 },
        colors: ['#EF4444', '#10B981'],
        xaxis: { categories: kpiData.skuProfitability.skus }
      }).render();
    }
  }

  // --- Order DNA Modal ---
  const orderRegex = /^\d{16,20}_\d$/;
  document.querySelectorAll('td').forEach(td => {
    let text = td.textContent.trim();
    if (orderRegex.test(text) || td.classList.contains('text-primary')) {
      if (text.length > 15) {
        td.classList.add('order-link');
        td.style.cursor = 'pointer';
        td.style.textDecoration = 'underline';
        td.addEventListener('click', () => {
          const modalEl = document.getElementById('orderDnaModal');
          if (modalEl) {
            const modal = new bootstrap.Modal(modalEl);
            document.getElementById('modalOrderId').textContent = text;
            modal.show();
          }
        });
      }
    }
  });

  // --- 3. GST CALCULATION LOGIC (gst.html) ---
  const fileSales = document.getElementById('fileSales');
  const fileReturns = document.getElementById('fileReturns');
  const btnCalculate = document.getElementById('calculateGst');
  const dropZoneSales = document.getElementById('dropZoneSales');
  const dropZoneReturns = document.getElementById('dropZoneReturns');

  if (fileSales && fileReturns) {
    let salesData = null;
    let returnsData = null;

    const handleFile = (file, type) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);
        
        if (type === 'sales') {
          salesData = json;
          document.getElementById('statusSales').className = 'status-badge bg-success text-white';
          document.getElementById('statusSales').textContent = file.name + ' loaded';
        } else {
          returnsData = json;
          document.getElementById('statusReturns').className = 'status-badge bg-success text-white';
          document.getElementById('statusReturns').textContent = file.name + ' loaded';
        }
      };
      reader.readAsArrayBuffer(file);
    };

    // Click to upload
    dropZoneSales.addEventListener('click', () => fileSales.click());
    dropZoneReturns.addEventListener('click', () => fileReturns.click());

    fileSales.addEventListener('change', (e) => handleFile(e.target.files[0], 'sales'));
    fileReturns.addEventListener('change', (e) => handleFile(e.target.files[0], 'returns'));

    // Drag and Drop
    [dropZoneSales, dropZoneReturns].forEach(zone => {
      zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.style.borderColor = '#6D28D9'; });
      zone.addEventListener('dragleave', () => { zone.style.borderColor = '#e2e8f0'; });
      zone.addEventListener('drop', (e) => {
        e.preventDefault();
        zone.style.borderColor = '#e2e8f0';
        const file = e.dataTransfer.files[0];
        handleFile(file, zone.id === 'dropZoneSales' ? 'sales' : 'returns');
      });
    });

    btnCalculate.addEventListener('click', () => {
      // For demonstration, if no files are uploaded, we use sample data provided in requirements
      if (!salesData || !returnsData) {
        alert("Please upload both TCS Sales and TCS Sales Return files. Using sample calculation data for now.");
        renderSampleGstData();
        return;
      }
      
      // Real calculation logic would go here:
      // 1. Combine salesData and returnsData (subtracting returns)
      // 2. Group by state for Sec 7
      // 3. Group by platform for Table 14
      // 4. Extract ranges for Table 13
      // 5. Group by HSN for HSN Summary
      
      renderSampleGstData(); // Replace with real calc logic once data structures are known
    });

    function renderSampleGstData() {
      document.getElementById('gstResults').style.display = 'block';
      
      // 1. Sec 7 - B2C
      const sec7Data = [
        { state: 'ANDHRA PRADESH', val: 1127.18, igst: 33.82, cgst: 0, sgst: 0 },
        { state: 'ASSAM', val: 596.12, igst: 17.88, cgst: 0, sgst: 0 },
        { state: 'BIHAR', val: 587.38, igst: 17.62, cgst: 0, sgst: 0 },
        { state: 'CHHATTISGARH', val: 1157.28, igst: 34.72, cgst: 0, sgst: 0 },
        { state: 'DELHI', val: 1126.21, igst: 0, cgst: 16.89, sgst: 16.89 },
        { state: 'GUJARAT', val: -541.75, igst: -16.25, cgst: 0, sgst: 0 },
        { state: 'HARYANA', val: 564.08, igst: 16.92, cgst: 0, sgst: 0 },
        { state: 'JHARKHAND', val: 563.11, igst: 16.89, cgst: 0, sgst: 0 },
        { state: 'KARNATAKA', val: 2300.00, igst: 69.00, cgst: 0, sgst: 0 },
        { state: 'MADHYA PRADESH', val: 4556.31, igst: 136.69, cgst: 0, sgst: 0 },
        { state: 'MAHARASHTRA', val: 2292.23, igst: 68.77, cgst: 0, sgst: 0 },
        { state: 'ORISSA', val: 562.14, igst: 16.86, cgst: 0, sgst: 0 },
        { state: 'PUNJAB', val: 525.24, igst: 15.76, cgst: 0, sgst: 0 },
        { state: 'RAJASTHAN', val: 3406.80, igst: 102.20, cgst: 0, sgst: 0 },
        { state: 'UTTAR PRADESH', val: 9468.93, igst: 284.07, cgst: 0, sgst: 0 },
        { state: 'WEST BENGAL', val: 3399.03, igst: 101.97, cgst: 0, sgst: 0 }
      ];
      
      const sec7Body = document.getElementById('sec7Body');
      sec7Body.innerHTML = '';
      let totalVal = 0, totalIgst = 0, totalCgst = 0, totalSgst = 0;
      
      sec7Data.forEach(d => {
        totalVal += d.val; totalIgst += d.igst; totalCgst += d.cgst; totalSgst += d.sgst;
        const tr = document.createElement('tr');
        tr.innerHTML = `<td class="ps-4">${d.state}</td><td class="text-end">${d.val.toFixed(2)}</td><td class="text-end">${d.igst.toFixed(2)}</td><td class="text-end">${d.cgst.toFixed(2)}</td><td class="text-end pe-4">${d.sgst.toFixed(2)}</td>`;
        sec7Body.appendChild(tr);
      });
      document.getElementById('sec7Foot').innerHTML = `<tr><td class="ps-4">Grand Total</td><td class="text-end">${totalVal.toFixed(2)}</td><td class="text-end">${totalIgst.toFixed(2)}</td><td class="text-end">${totalCgst.toFixed(2)}</td><td class="text-end pe-4">${totalSgst.toFixed(2)}</td></tr>`;

      // 2. Table 14 - Platform
      const t14Data = [
        { platform: 'Meesho', gstin: '07AACCF6368D1CZ', val: 31690.29, igst: 916.92, cgst: 16.89, sgst: 16.89 },
        { platform: 'Flipkart', gstin: '07AACCF0683K1CU', val: -230.1, igst: -6.9, cgst: 0, sgst: 0 }
      ];
      const t14Body = document.getElementById('table14Body');
      t14Body.innerHTML = '';
      let t14Val = 0, t14Igst = 0, t14Cgst = 0, t14Sgst = 0;
      t14Data.forEach(d => {
        t14Val += d.val; t14Igst += d.igst; t14Cgst += d.cgst; t14Sgst += d.sgst;
        t14Body.innerHTML += `<tr><td class="ps-3">${d.platform}</td><td>${d.gstin}</td><td class="text-end">${d.val.toFixed(2)}</td><td class="text-end">${d.igst.toFixed(2)}</td><td class="text-end">${d.cgst.toFixed(2)}</td><td class="text-end pe-3">${d.sgst.toFixed(2)}</td></tr>`;
      });
      document.getElementById('table14Foot').innerHTML = `<tr><td colspan="2" class="ps-3">Total</td><td class="text-end">${t14Val.toFixed(2)}</td><td class="text-end">${t14Igst.toFixed(2)}</td><td class="text-end">${t14Cgst.toFixed(2)}</td><td class="text-end pe-3">${t14Sgst.toFixed(2)}</td></tr>`;

      // 3. Table 13 - Ranges
      document.getElementById('invFrom').textContent = 'IVNMAY04449';
      document.getElementById('invTo').textContent = 'IVNMAY04558';
      document.getElementById('invTotal').textContent = '110';
      document.getElementById('invNet').textContent = '110';
      
      document.getElementById('cnFrom').textContent = 'CRNMAY01787';
      document.getElementById('cnTo').textContent = 'CRNMAY01839';
      document.getElementById('cnTotal').textContent = '53';
      document.getElementById('cnNet').textContent = '53';
      
      document.getElementById('fkFrom').textContent = 'FARWXC2600001288';
      document.getElementById('fkTo').textContent = 'FARWXC2600001288';
      document.getElementById('fkTotal').textContent = '1';

      // 4. HSN Summary
      const hsnData = [
        { code: '7117', qty: 0, val: 0, igst: 0, cgst: 0, sgst: 0 },
        { code: '711719', qty: 162, val: 31690.29, igst: 916.92, cgst: 16.89, sgst: 16.89 },
        { code: '711790', qty: -1, val: -230.10, igst: -6.90, cgst: 0, sgst: 0 }
      ];
      const hsnBody = document.getElementById('hsnBody');
      hsnBody.innerHTML = '';
      let hsnQty = 0, hsnVal = 0, hsnIgst = 0, hsnCgst = 0, hsnSgst = 0;
      hsnData.forEach(d => {
        hsnQty += d.qty; hsnVal += d.val; hsnIgst += d.igst; hsnCgst += d.cgst; hsnSgst += d.sgst;
        hsnBody.innerHTML += `<tr><td class="ps-4">${d.code}</td><td class="text-end">${d.qty}</td><td class="text-end">${d.val.toFixed(2)}</td><td class="text-end">${d.igst.toFixed(2)}</td><td class="text-end">${d.cgst.toFixed(2)}</td><td class="text-end pe-4">${d.sgst.toFixed(2)}</td></tr>`;
      });
      document.getElementById('hsnFoot').innerHTML = `<tr><td class="ps-4">Total</td><td class="text-end">${hsnQty}</td><td class="text-end">${hsnVal.toFixed(2)}</td><td class="text-end">${hsnIgst.toFixed(2)}</td><td class="text-end">${hsnCgst.toFixed(2)}</td><td class="text-end pe-4">${hsnSgst.toFixed(2)}</td></tr>`;
    }
  }

  // --- INVENTORY MANAGEMENT LOGIC (inventory.html) ---
  const inventoryMasterBody = document.getElementById('inventoryMasterBody');
  if (inventoryMasterBody) {
    const inventoryData = [
      { id: 1, sku: 'TSH-BLK-M', name: 'Basic Black T-Shirt', variant: 'M', cost: 250, stock: 450, category: 'Apparel' },
      { id: 2, sku: 'TSH-BLK-L', name: 'Basic Black T-Shirt', variant: 'L', cost: 260, stock: 320, category: 'Apparel' },
      { id: 3, sku: 'HDY-GRY-L', name: 'Essential Hoodie Grey', variant: 'L', cost: 850, stock: 12, category: 'Apparel' },
      { id: 4, sku: 'MUG-WHT-01', name: 'Ceramic White Mug', variant: 'Standard', cost: 120, stock: 120, category: 'Accessories' },
      { id: 5, sku: 'SKS-WHT-S', name: 'Ankle Socks White', variant: 'S', cost: 45, stock: 0, category: 'Accessories' }
    ];

    const usageData = [
      { date: '2026-04-10', product: 'Basic Black T-Shirt', sku: 'TSH-BLK-M', type: 'Stock In', change: 100, remaining: 450 },
      { date: '2026-04-11', product: 'Essential Hoodie Grey', sku: 'HDY-GRY-L', type: 'Dispatch', change: -5, remaining: 12 },
      { date: '2026-04-12', product: 'Ceramic White Mug', sku: 'MUG-WHT-01', type: 'Dispatch', change: -2, remaining: 120 }
    ];

    const renderInventory = () => {
      inventoryMasterBody.innerHTML = '';
      let totalValue = 0;
      let lowStockCount = 0;
      
      const uniqueProducts = new Set();
      
      inventoryData.forEach((item, index) => {
        totalValue += (item.stock * item.cost);
        if (item.stock < 20) lowStockCount++;
        uniqueProducts.add(item.name);

        const tr = document.createElement('tr');
        const statusClass = item.stock === 0 ? 'secondary' : (item.stock < 20 ? 'danger' : 'success');
        const statusText = item.stock === 0 ? 'Out of Stock' : (item.stock < 20 ? 'Low Stock' : 'In Stock');
        
        tr.innerHTML = `
          <td class="ps-4 text-muted">${index + 1}</td>
          <td class="fw-medium text-primary">${item.sku}</td>
          <td>${item.name} ${item.variant ? `(${item.variant})` : ''}</td>
          <td>₹${item.cost}</td>
          <td class="fw-bold ${item.stock < 20 ? 'text-danger' : ''}">${item.stock}</td>
          <td>${item.category}</td>
          <td class="pe-4"><span class="badge bg-${statusClass} bg-opacity-10 text-${statusClass}">${statusText}</span></td>
        `;
        inventoryMasterBody.appendChild(tr);
      });

      // Update Dashboard Cards
      const totalProductsEl = document.getElementById('totalProductsCount');
      if (totalProductsEl) totalProductsEl.textContent = uniqueProducts.size;
      
      const lowStockEl = document.getElementById('lowStockProductsCount');
      if (lowStockEl) lowStockEl.textContent = lowStockCount;
      
      const healthyStockEl = document.getElementById('healthyStockCount');
      if (healthyStockEl) healthyStockEl.textContent = uniqueProducts.size - lowStockCount;
      
      const totalValueEl = document.getElementById('totalInventoryValue');
      if (totalValueEl) totalValueEl.textContent = '₹' + totalValue.toLocaleString();

      // Update All Product Dropdowns
      const productDropdowns = ['productDropdown', 'existingProductDropdown'];
      productDropdowns.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        const currentVal = el.value;
        el.innerHTML = `<option value="" selected disabled>Choose a product...</option>`;
        Array.from(uniqueProducts).sort().forEach(p => {
          const opt = document.createElement('option');
          opt.value = p;
          opt.textContent = p;
          el.appendChild(opt);
        });
        if (Array.from(uniqueProducts).includes(currentVal)) el.value = currentVal;
      });
    };

    const renderUsageReport = (start, end) => {
      const usageReportBody = document.getElementById('usageReportBody');
      if (!usageReportBody) return;
      usageReportBody.innerHTML = '';
      
      const filtered = usageData.filter(u => {
        if (!start || !end) return true;
        const d = new Date(u.date);
        return d >= new Date(start) && d <= new Date(end);
      });

      filtered.forEach(u => {
        const tr = document.createElement('tr');
        const isPositive = u.change > 0;
        tr.innerHTML = `
          <td class="ps-4">${u.date}</td>
          <td>${u.product}</td>
          <td>${u.sku}</td>
          <td class="text-center"><span class="badge ${isPositive ? 'bg-success' : 'bg-warning'} bg-opacity-10 ${isPositive ? 'text-success' : 'text-warning'}">${u.type}</span></td>
          <td class="text-end fw-bold ${isPositive ? 'text-success' : 'text-danger'}">${isPositive ? '+' : ''}${u.change}</td>
          <td class="text-end pe-4 fw-bold">${u.remaining}</td>
        `;
        usageReportBody.appendChild(tr);
      });
    };

    // Product Mode Toggle Logic
    const existingModeRadio = document.getElementById('existingProductMode');
    const newModeRadio = document.getElementById('newProductMode');
    const existingCol = document.getElementById('existingProductCol');
    const newCol = document.getElementById('newProductCol');

    if (existingModeRadio && newModeRadio) {
      const toggleMode = () => {
        if (existingModeRadio.checked) {
          existingCol.classList.remove('d-none');
          newCol.classList.add('d-none');
          document.getElementById('newProductName').required = false;
          document.getElementById('existingProductDropdown').required = true;
        } else {
          existingCol.classList.add('d-none');
          newCol.classList.remove('d-none');
          document.getElementById('newProductName').required = true;
          document.getElementById('existingProductDropdown').required = false;
        }
      };
      existingModeRadio.addEventListener('change', toggleMode);
      newModeRadio.addEventListener('change', toggleMode);
    }

    // Add Product/SKU Logic
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
      addProductForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const isNewMode = document.getElementById('newProductMode').checked;
        const productName = isNewMode ? document.getElementById('newProductName').value : document.getElementById('existingProductDropdown').value;
        const sku = document.getElementById('newSkuId').value;
        const variant = document.getElementById('newSkuVariant').value;
        const cost = parseInt(document.getElementById('newSkuCost').value);
        const category = document.getElementById('newSkuCategory').value;

        // Check if SKU already exists
        if (inventoryData.some(i => i.sku === sku)) {
          alert('Error: SKU ID already exists!');
          return;
        }

        inventoryData.push({
          id: inventoryData.length + 1,
          sku: sku,
          name: productName,
          variant: variant,
          cost: cost,
          stock: 0,
          category: category
        });

        renderInventory();
        addProductForm.reset();
        if (existingModeRadio) existingModeRadio.click(); // Reset UI to existing mode
        alert(`Successfully registered SKU: ${sku} under Product: ${productName}`);
      });
    }

    // Product Dropdown Logic (for Add Inventory)
    const productDropdown = document.getElementById('productDropdown');
    const skuDropdown = document.getElementById('skuDropdown');
    
    if (productDropdown && skuDropdown) {
      productDropdown.addEventListener('change', () => {
        const selectedProduct = productDropdown.value;
        skuDropdown.innerHTML = '<option value="" selected disabled>Select SKU...</option>';
        
        inventoryData.filter(item => item.name === selectedProduct).forEach(item => {
          const opt = document.createElement('option');
          opt.value = item.sku;
          opt.textContent = `${item.sku} (${item.variant})`;
          skuDropdown.appendChild(opt);
        });
      });
    }

    // Add Inventory Logic
    const addInventoryForm = document.getElementById('addInventoryForm');
    if (addInventoryForm) {
      addInventoryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const sku = document.getElementById('skuDropdown').value;
        const qty = parseInt(document.getElementById('addQuantity').value);
        const product = document.getElementById('productDropdown').value;
        
        const item = inventoryData.find(i => i.sku === sku);
        if (item) {
          item.stock += qty;
          usageData.unshift({
            date: new Date().toISOString().split('T')[0],
            product: product,
            sku: sku,
            type: 'Stock In',
            change: qty,
            remaining: item.stock
          });
          
          renderInventory();
          renderUsageReport();
          addInventoryForm.reset();
          skuDropdown.innerHTML = '<option value="" selected disabled>Select SKU...</option>';
          alert(`Successfully added ${qty} units to ${sku}`);
        }
      });
    }

    // Filter Usage Report
    document.getElementById('applyUsageFilter')?.addEventListener('click', () => {
      const start = document.getElementById('usageStartDate').value;
      const end = document.getElementById('usageEndDate').value;
      renderUsageReport(start, end);
    });

    // Initial Render
    renderInventory();
    renderUsageReport();
  }
});
