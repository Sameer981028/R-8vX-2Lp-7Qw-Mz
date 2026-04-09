document.addEventListener('DOMContentLoaded', () => {
  const navLinks = document.querySelectorAll('.sidebar .nav-link');
  const panels = document.querySelectorAll('.panel');
  const headerTitle = document.getElementById('header-title');

  // Listen to clicks on navigation links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      
      const targetId = link.getAttribute('data-target');
      if (!targetId) return;

      // Clean active class on all nav links, add to clicked
      navLinks.forEach(nav => nav.classList.remove('active'));
      link.classList.add('active');

      // Hide all panels, reveal the targeted one
      panels.forEach(panel => {
        if (panel.id === targetId) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Update the main header title based on active tab
      let titleText = link.textContent;
      const spanElement = link.querySelector('span');
      if (spanElement) {
        titleText = spanElement.textContent;
      }
      headerTitle.textContent = titleText.trim();
    });
  });

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

  // --- ApexCharts 16-Month Executive Initialization ---
  
  const months = ["May'24", "Jun'24", "Jul'24", "Aug'24", "Sep'24", "Oct'24", "Nov'24", "Dec'24", "Jan'25", "Feb'25", "Mar'25", "Apr'25", "May'25", "Jun'25", "Jul'25", "Aug'25"];
  const orders = [124, 91, 793, 594, 114, 934, 575, 603, 0, 533, 664, 25, 1345, 727, 92, 845];
  const sales = [45342, 46678, 8069, 17994, 119950, 92462, 0, 92311, 99278, 239156, 192170, 71832, 125826, 201123, 28811, 39347];
  const profit = [1015, 971, 1076, 11072, 30690, 22006, 42310, 41696, 47349, 22663, 28060, 43784, 37305, 29217, 19175, 8638];

  // 1. Performance Trend (Area + Line)
  const perfOptions = {
    series: [
      {
        name: 'Sales (₹)',
        type: 'area',
        data: sales
      },
      {
        name: 'Net Profit (₹)',
        type: 'line',
        data: profit
      }
    ],
    chart: {
      height: 280,
      type: 'line',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    stroke: {
      curve: 'smooth',
      width: [0, 3]
    },
    fill: {
      type: ['solid', 'solid'],
      opacity: [0.15, 1]
    },
    colors: ['#6D28D9', '#6D28D9'], 
    markers: {
      size: [0, 4],
      colors: ['#fff'],
      strokeColors: '#6D28D9',
      strokeWidth: 2
    },
    xaxis: {
      categories: months,
      labels: {
        style: { fontSize: '11px', colors: '#64748B' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: {
        formatter: (val) => "₹" + (val / 1000).toFixed(0) + "k",
        style: { fontSize: '11px', colors: '#64748B' }
      }
    },
    grid: {
      borderColor: '#f1f5f9',
      strokeDashArray: 4
    },
    dataLabels: { enabled: false },
    legend: { position: 'top', horizontalAlign: 'right' },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => "₹" + val.toLocaleString() }
    }
  };

  const perfChartDiv = document.querySelector("#performanceTrendChart");
  if (perfChartDiv && typeof ApexCharts !== 'undefined') {
    const perfChart = new ApexCharts(perfChartDiv, perfOptions);
    perfChart.render();
  }

  // 2. Fulfillment Stacked Funnel
  const delivered = orders.map(o => o === 0 ? 0 : Math.round(o * 0.55));
  const cancelled = orders.map(o => o === 0 ? 0 : Math.round(o * 0.24));
  const rto = orders.map(o => o === 0 ? 0 : Math.round(o * 0.11));
  const returned = orders.map((o, i) => o === 0 ? 0 : Math.max(0, o - (delivered[i] + cancelled[i] + rto[i])));

  const funnelOptions = {
    series: [
      { name: 'Delivered', data: delivered },
      { name: 'Cancelled', data: cancelled },
      { name: 'RTO', data: rto },
      { name: 'Returned', data: returned }
    ],
    chart: {
      type: 'bar',
      height: 250,
      stacked: true,
      stackType: '100%',
      fontFamily: 'Inter, sans-serif',
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%',
        borderRadius: 2
      },
    },
    colors: ['#10B981', '#EF4444', '#F59E0B', '#8B5CF6'],
    xaxis: {
      categories: months,
      labels: {
        style: { fontSize: '10px', colors: '#64748B' }
      },
      axisBorder: { show: false },
      axisTicks: { show: false }
    },
    yaxis: {
      labels: { show: false }
    },
    grid: { show: false },
    dataLabels: { enabled: false },
    legend: { position: 'top', horizontalAlign: 'center', fontSize: '12px' },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val) => val + " Orders" }
    }
  };

  const funnelChartDiv = document.querySelector("#fulfillmentFunnelChart");
  if (funnelChartDiv && typeof ApexCharts !== 'undefined') {
    const funnelChart = new ApexCharts(funnelChartDiv, funnelOptions);
    funnelChart.render();
  }

  // --- Phase 2.1: Business Health Score Gauge ---
  const healthOptions = {
    series: [78], // 78/100 business health score
    chart: {
      type: 'radialBar',
      height: 250,
      sparkline: { enabled: true }
    },
    plotOptions: {
      radialBar: {
        startAngle: -90,
        endAngle: 90,
        hollow: { size: '65%' },
        track: {
          background: '#f1f5f9',
          strokeWidth: '100%',
        },
        dataLabels: {
          name: { show: false },
          value: {
            offsetY: 0,
            fontSize: '32px',
            fontWeight: 700,
            color: '#6D28D9',
            formatter: function (val) {
              return val + "/100";
            }
          }
        }
      }
    },
    colors: ['#6D28D9'],
    stroke: { lineCap: 'round' }
  };
  
  const healthChartDiv = document.querySelector("#healthScoreChart");
  if (healthChartDiv && typeof ApexCharts !== 'undefined') {
    const healthChart = new ApexCharts(healthChartDiv, healthOptions);
    healthChart.render();
  }

  // --- Phase 1.1: Order DNA Modal Global Listener ---
  
  // Find all TDs with text matching our typical order structure (e.g. 269034364824862272_1 or similar long IDs)
  // We'll also just check for exact classes if they're highlighted. 
  // For safety, let's catch any long numeric string with an underscore.
  const orderRegex = /^\d{16,20}_\d$/;
  
  const allTds = document.querySelectorAll('td');
  allTds.forEach(td => {
    let text = td.textContent.trim();
    if (orderRegex.test(text) || td.classList.contains('text-primary')) {
       // Check strictly for length just in case
       if (text.length > 15) {
          td.classList.add('order-link');
          td.style.cursor = 'pointer';
          td.style.textDecoration = 'underline';
          td.title = "Click to view Order DNA Lifecycle";
          
          td.addEventListener('click', () => {
             openOrderModal(text, td.closest('tr'));
          });
       }
    }
  });

  function openOrderModal(orderId, tr) {
     const modalEl = document.getElementById('orderDnaModal');
     if(!modalEl) return;
     const modal = new bootstrap.Modal(modalEl);
     
     document.getElementById('modalOrderId').textContent = orderId;
     
     // 1. Establish deterministic mock data from Order ID hash
     let hash = 0;
     for (let i = 0; i < orderId.length; i++) {
        hash = orderId.charCodeAt(i) + ((hash << 5) - hash);
     }
     
     const couriers = ['Delhivery', 'Valmo', 'Shadowfax', 'Ecom Express'];
     const statuses = ['Dispatched', 'Delivered', 'RTO', 'In Transit'];
     const names = ['Javed Akram', 'Gurpreet Kaur', 'Fatema', 'Faiz', 'Md Himamul', 'Bilal', 'Kiran', 'Wasim'];
     const states = ['Uttar Pradesh', 'Maharashtra', 'Karnataka', 'Delhi', 'Haryana', 'Bihar'];
     
     const idx = Math.abs(hash);
     
     let courier = couriers[idx % couriers.length];
     let status = statuses[idx % statuses.length];
     let name = names[idx % names.length];
     let state = states[idx % states.length];
     let awb = "AWB: " + Math.abs(hash * 12345).toString().substring(0, 12);
     let sku = "WRH01";
     let variant = "Free Size | White | Qty: 1";
     
     let gross = 450 + (idx % 300);
     let shipping = 60 + (idx % 50);
     let cost = 180;
     
     // 2. Override with real data if available in the row context!
     if (tr) {
        let cells = tr.querySelectorAll('td');
        if (cells.length === 14) {
           // Order Management Table format (including S.No)
           name = cells[1].textContent.trim();
           courier = cells[2].textContent.trim();
           state = cells[3].textContent.trim();
           awb = "AWB: " + cells[5].textContent.trim();
           sku = cells[6].textContent.trim();
           variant = `${cells[7].textContent.trim()} | ${cells[9].textContent.trim()} | Qty: ${cells[8].textContent.trim()}`;
           let amtStr = cells[11].textContent.trim().replace(/[^0-9.]/g, '');
           if(amtStr) gross = parseFloat(amtStr);
           status = cells[13].textContent.trim(); 
        } else if (cells.length === 13) {
           // Legacy Order Management Table format (without S.No)
           name = cells[0].textContent.trim();
           courier = cells[1].textContent.trim();
           state = cells[2].textContent.trim();
           awb = "AWB: " + cells[4].textContent.trim();
           sku = cells[5].textContent.trim();
           variant = `${cells[6].textContent.trim()} | ${cells[8].textContent.trim()} | Qty: ${cells[7].textContent.trim()}`;
           let amtStr = cells[10].textContent.trim().replace(/[^0-9.]/g, '');
           if(amtStr) gross = parseFloat(amtStr);
           status = cells[12].textContent.trim(); 
        } else if (cells.length === 11) {
           // Returns Table format (including S.No)
           status = cells[10].textContent.trim();
           if(cells[2].textContent.includes('RTO')) status = 'RTO';
           courier = cells[8].textContent.trim();
        } else if (cells.length === 10) {
           // Legacy Returns Table format (without S.No)
           status = cells[9].textContent.trim();
           if(cells[1].textContent.includes('RTO')) status = 'RTO';
           courier = cells[7].textContent.trim();
        } else if (cells.length === 18) {
           // Payments Table format (including S.No)
           status = cells[5].textContent.trim();
           sku = cells[4].textContent.trim();
           let amtStr = cells[9].textContent.trim().replace(/[^0-9.-]/g, '');
           if(amtStr) gross = parseFloat(amtStr);
           let shipStr = cells[12].textContent.trim().replace(/[^0-9.-]/g, '');
           if(shipStr) shipping = Math.abs(parseFloat(shipStr));
        } else if (cells.length === 17) {
           // Legacy Payments Table format (without S.No)
           status = cells[4].textContent.trim();
           sku = cells[3].textContent.trim();
           let amtStr = cells[8].textContent.trim().replace(/[^0-9.-]/g, '');
           if(amtStr) gross = parseFloat(amtStr);
           let shipStr = cells[11].textContent.trim().replace(/[^0-9.-]/g, '');
           if(shipStr) shipping = Math.abs(parseFloat(shipStr));
        }
     }
     
     let net = gross - shipping - cost;
     
     // 3. Populate Modal DOM
     document.getElementById('modalCustomerName').textContent = name;
     document.getElementById('modalLocation').textContent = state;
     document.getElementById('modalCourier').textContent = courier;
     document.getElementById('modalAwb').textContent = awb;
     document.getElementById('modalSku').textContent = sku;
     document.getElementById('modalVariant').textContent = variant;
     
     document.getElementById('modalGross').textContent = '₹' + gross.toFixed(2);
     document.getElementById('modalFees').textContent = '-₹' + shipping.toFixed(2);
     document.getElementById('modalCost').textContent = '-₹' + cost.toFixed(2);
     
     let netEl = document.getElementById('modalNet');
     let netCard = document.getElementById('modalNetCard');
     let netLabel = document.getElementById('modalNetLabel');
     
     // Progress logic
     let progress = 25;
     let stepDisp = document.getElementById('stepDispatched');
     let stepDel = document.getElementById('stepDelivered');
     let stepSet = document.getElementById('stepSettled');
     let labelDel = document.getElementById('labelDelivered');
     let labelSet = document.getElementById('labelSettled');
     let labelDisp = document.getElementById('labelDispatched');
     
     // Reset
     stepDisp.className = "rounded-circle bg-light border text-muted d-flex align-items-center justify-content-center mx-auto mb-1";
     stepDel.className = "rounded-circle bg-light border text-muted d-flex align-items-center justify-content-center mx-auto mb-1";
     stepSet.className = "rounded-circle bg-light border text-muted d-flex align-items-center justify-content-center mx-auto mb-1";
     labelDel.textContent = "Delivered";
     labelSet.textContent = "Settled";
     labelDisp.textContent = "Dispatched";
     labelDisp.parentElement.style.opacity = "1";
     stepDisp.innerHTML = '<i class="bi bi-truck"></i>';
     stepDel.innerHTML = '<i class="bi bi-box-seam"></i>';
     
     let isRTO = (status.toUpperCase().includes('RTO') || status.toUpperCase().includes('RETURN') || status.toUpperCase().includes('CANCEL'));

     if (status === 'Dispatched' || status === 'In Transit') {
        progress = 50;
        stepDisp.className = "rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-1";
     } else if (status === 'Delivered') {
        progress = 100;
        stepDisp.className = "rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-1";
        stepDel.className = "rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-1";
        stepSet.className = "rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-1";
     } else if (isRTO) {
        progress = 75;
        stepDisp.className = "rounded-circle bg-primary text-white d-flex align-items-center justify-content-center mx-auto mb-1";
        stepDel.className = "rounded-circle bg-danger text-white d-flex align-items-center justify-content-center mx-auto mb-1";
        stepDel.innerHTML = '<i class="bi bi-x-lg"></i>';
        labelDel.textContent = "RTO / Failed";
        labelDel.classList.replace('text-muted', 'text-danger');
        
        net = 0 - shipping; // Huge loss logic on RTO
     }

     document.getElementById('modalProgress').style.width = progress + "%";
     if(isRTO) document.getElementById('modalProgress').classList.replace('bg-primary','bg-danger');
     else document.getElementById('modalProgress').classList.replace('bg-danger','bg-primary');
     
     if (net >= 0) {
        netEl.textContent = '₹' + net.toFixed(2);
        netEl.className = "fw-bold fs-5 text-success";
        netCard.className = "card h-100 border-0 bg-success bg-opacity-10";
        netLabel.className = "small fw-semibold mb-1 text-success";
     } else {
        netEl.textContent = '-₹' + Math.abs(net).toFixed(2);
        netEl.className = "fw-bold fs-5 text-danger";
        netCard.className = "card h-100 border-0 bg-danger bg-opacity-10";
        netLabel.className = "small fw-semibold mb-1 text-danger";
     }
     
     modal.show();
  }
});
