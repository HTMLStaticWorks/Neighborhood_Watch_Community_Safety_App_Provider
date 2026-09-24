document.addEventListener('DOMContentLoaded', () => {
  // Navigation Logic
  const sidebarLinks = document.querySelectorAll('.sidebar-link[data-target]');
  const dashboardSections = document.querySelectorAll('.dashboard-section');
  const topbarTitle = document.getElementById('topbarTitle');

  sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Ignore if it's a real link (like logout)
      if (!link.hasAttribute('data-target')) return;
      e.preventDefault();
      
      const targetId = link.getAttribute('data-target');
      
      // Update active link
      sidebarLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      // Update active section
      dashboardSections.forEach(sec => sec.classList.remove('active'));
      document.getElementById(targetId).classList.add('active');

      // Start each section from the top
      window.scrollTo({ top: 0, behavior: 'auto' });
      document.querySelectorAll('.content-area, .main-wrapper').forEach(el => { el.scrollTop = 0; });

      // Update Title
      topbarTitle.innerText = link.innerText.trim();

      // Close mobile sidebar if open
      closeSidebarFn();
    });
  });

  // Topbar Profile Avatar Click Navigation
  const topbarProfileBtn = document.getElementById('topbarProfileBtn');
  if (topbarProfileBtn) {
    topbarProfileBtn.addEventListener('click', () => {
      const profileLink = document.querySelector('.sidebar-link[data-target="profile"]');
      if (profileLink) {
        profileLink.click();
      }
    });
  }

  // Mobile Sidebar Toggle
  const openBtn = document.getElementById('openSidebar');
  const closeBtn = document.getElementById('closeSidebar');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  function openSidebar() {
    sidebar.classList.add('open');
    if (sidebarOverlay) { sidebarOverlay.style.display = 'block'; }
    document.body.style.overflow = 'hidden';
  }
  function closeSidebarFn() {
    sidebar.classList.remove('open');
    if (sidebarOverlay) { sidebarOverlay.style.display = 'none'; }
    document.body.style.overflow = '';
  }

  if (openBtn) { openBtn.addEventListener('click', openSidebar); }
  if (closeBtn) { closeBtn.addEventListener('click', closeSidebarFn); }
  if (sidebarOverlay) { sidebarOverlay.addEventListener('click', closeSidebarFn); }

  // Chart.js Mock Data
  const ctx = document.getElementById('volumeChart');
  if (ctx) {
    
    // Check theme to color chart appropriately
    const chartColors = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      return {
        textColor: isDark ? '#94a3b8' : '#475569',
        gridColor: isDark ? '#334155' : '#e2e8f0'
      };
    };
    const { textColor, gridColor } = chartColors();

    const volumeChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Oct 1', 'Oct 5', 'Oct 10', 'Oct 15', 'Oct 20', 'Oct 25', 'Oct 30'],
        datasets: [{
          label: 'Gross Volume ($)',
          data: [10200, 11500, 10800, 12100, 12450, 14000, 13200],
          borderColor: '#06b6d4', // Accent Color
          backgroundColor: 'rgba(6, 182, 212, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#06b6d4'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: function(context) {
                return '$' + context.parsed.y.toLocaleString();
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: gridColor, drawBorder: false },
            ticks: {
              color: textColor,
              callback: function(value) {
                return '$' + (value / 1000) + 'k';
              }
            }
          },
          x: {
            grid: { display: false },
            ticks: { color: textColor }
          }
        }
      }
    });

    // Recolor the chart in place when the theme changes (no page reload,
    // so the user stays on the section they were viewing)
    new MutationObserver(() => {
      const { textColor, gridColor } = chartColors();
      volumeChart.options.scales.y.grid.color = gridColor;
      volumeChart.options.scales.y.ticks.color = textColor;
      volumeChart.options.scales.x.ticks.color = textColor;
      volumeChart.update('none');
    }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }
});
