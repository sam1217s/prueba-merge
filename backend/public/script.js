const API_URL = 'http://localhost:4000/api';

/**
 * Verificar autenticación
 */
function checkAuthentication() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión para acceder al dashboard');
    window.location.href = 'index.html';
    return false;
  }
  return token;
}

/**
 * Mostrar/ocultar loading
 */
function toggleLoading(show = true) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    if (show) {
      overlay.classList.add('show');
    } else {
      overlay.classList.remove('show');
    }
  }
}

/**
 * Formatear números con separadores de miles
 */
function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Obtener saludo según la hora
 */
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

/**
 * Actualizar saludo en header
 */
function updateGreeting() {
  const greetingElement = document.querySelector('.greeting-text');
  if (greetingElement) {
    greetingElement.textContent = getGreeting();
  }
}

/**
 * Cargar datos del dashboard desde la API
 */
async function loadDashboardData() {
  try {
    toggleLoading(true);

    const token = checkAuthentication();
    if (!token) return;

    const response = await fetch(`${API_URL}/auth/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        alert('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        window.location.href = 'index.html';
        return;
      }
      throw new Error('Error al cargar datos del dashboard');
    }

    const data = await response.json();
    populateDashboard(data);

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showErrorState();
  } finally {
    toggleLoading(false);
  }
}

/**
 * Mostrar estado de error
 */
function showErrorState() {
  const content = document.querySelector('.dashboard-content');
  if (content) {
    content.innerHTML = `
      <div style="text-align: center; padding: 4rem; color: #64748b;">
        <i class="fas fa-exclamation-triangle" style="font-size: 3rem; margin-bottom: 1rem; color: #f59e0b;"></i>
        <h3>Error al cargar el dashboard</h3>
        <p>No se pudieron cargar los datos. Verifica tu conexión e inténtalo de nuevo.</p>
        <button onclick="loadDashboardData()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #6366f1; color: white; border: none; border-radius: 8px; cursor: pointer;">
          Reintentar
        </button>
      </div>
    `;
  }
}

/**
 * Poblar dashboard con datos
 */
function populateDashboard(data) {
  updateUserInfo(data.user);
  updateStats(data);
  updateInvoices(data.recentInvoices);
  updateProjects(data.yourProjects);
  updateRecommendedProject(data.recommendedProject);
}

/**
 * Actualizar información del usuario
 */
function updateUserInfo(user) {
  const userAvatar = document.getElementById('userAvatar');
  const userName = document.getElementById('userName');
  const headerUserName = document.getElementById('headerUserName');

  if (userAvatar) {
    userAvatar.src = user.avatar;
    userAvatar.alt = `Avatar de ${user.name}`;
  }

  if (userName) {
    userName.textContent = user.name;
  }

  if (headerUserName) {
    headerUserName.textContent = user.name;
  }
}

/**
 * Actualizar estadísticas
 */
function updateStats(data) {
  const earningsAmount = document.getElementById('earningsAmount');
  const earningsChange = document.getElementById('earningsChange');

  if (earningsAmount) {
    animateNumber(earningsAmount, data.earnings.amount, 2000);
  }

  if (earningsChange) {
    earningsChange.textContent = data.earnings.change;
    earningsChange.className = `card-change ${data.earnings.trend === 'up' ? 'positive' : 'negative'}`;
  }

  const rankNumber = document.getElementById('rankNumber');
  const rankDescription = document.getElementById('rankDescription');

  if (rankNumber) {
    animateNumber(rankNumber, data.rank.position, 1500);
  }

  if (rankDescription) {
    rankDescription.textContent = data.rank.description;
  }

  const projectsNumber = document.getElementById('projectsNumber');
  const projectsPending = document.getElementById('projectsPending');
  const projectsCompleted = document.getElementById('projectsCompleted');

  if (projectsNumber) {
    animateNumber(projectsNumber, data.projects.total, 1000);
  }

  if (projectsPending) {
    projectsPending.textContent = data.projects.pending;
  }

  if (projectsCompleted) {
    projectsCompleted.textContent = data.projects.completed;
  }
}

/**
 * Animar números
 */
function animateNumber(element, targetValue, duration) {
  const startValue = 0;
  const startTime = performance.now();

  function animate(currentTime) {
    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const currentValue = Math.floor(startValue + (targetValue - startValue) * progress);
    element.textContent = formatNumber(currentValue);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

/**
 * Actualizar facturas recientes
 */
function updateInvoices(invoices) {
  const container = document.getElementById('invoicesList');
  if (!container) return;

  container.innerHTML = invoices.map(invoice => `
    <div class="invoice-item">
      <img src="${invoice.avatar}" alt="${invoice.client}" class="invoice-avatar">
      <div class="invoice-info">
        <div class="invoice-client">${invoice.client}</div>
        <div class="invoice-company">${invoice.company}</div>
      </div>
      <div>
        <div class="invoice-amount">€ ${formatNumber(invoice.amount)}</div>
        <span class="invoice-status ${invoice.status.toLowerCase()}">${invoice.status}</span>
      </div>
    </div>
  `).join('');
}

/**
 * Actualizar proyectos
 */
function updateProjects(projects) {
  const container = document.getElementById('projectsList');
  if (!container) return;

  container.innerHTML = projects.map(project => `
    <div class="project-item">
      <img src="${project.avatar}" alt="${project.title}" class="project-avatar">
      <div class="project-info">
        <div class="project-title">${project.title}</div>
        <div class="project-days">${project.daysRemaining} días restantes</div>
      </div>
    </div>
  `).join('');
}

/**
 * Actualizar proyecto recomendado
 */
function updateRecommendedProject(project) {
  const container = document.getElementById('recommendedProject');
  if (!container) return;

  container.innerHTML = `
    <img src="${project.avatar}" alt="${project.client}" class="recommended-avatar">
    <div class="recommended-content">
      <div class="recommended-header">
        <div>
          <div class="recommended-client">${project.client}</div>
          <div class="recommended-company">${project.company}</div>
        </div>
        <span class="recommended-status">${project.status}</span>
      </div>
      <h4 class="recommended-title">${project.title}</h4>
      <p class="recommended-description">${project.description}</p>
      <div class="recommended-footer">
        <div class="recommended-budget">${formatNumber(project.budget)}</div>
        <span class="full-time-tag">Full time</span>
      </div>
    </div>
  `;
}

/**
 * Función de logout
 */
function logout() {
  if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
    localStorage.removeItem('token');
    alert('Sesión cerrada correctamente');
    window.location.href = 'index.html';
  }
}

/**
 * Simular datos cuando la API no está disponible
 */
function loadMockData() {
  const mockData = {
    user: {
      name: 'Filip Martin Jose',
      avatar: 'https://ui-avatars.com/api/?name=Filip+Martin+Jose&background=6366f1&color=fff&size=128'
    },
    earnings: {
      amount: 8350,
      change: '+10% desde el mes pasado',
      trend: 'up'
    },
    rank: {
      position: 98,
      description: 'en top 100'
    },
    projects: {
      total: 32,
      pending: 'mobile app',
      completed: 'branding'
    },
    recentInvoices: [
      {
        id: 1,
        client: 'Alexander Williams',
        company: 'AX creations',
        amount: 1200.87,
        status: 'Paid',
        avatar: 'https://ui-avatars.com/api/?name=Alexander+Williams&background=10b981&color=fff'
      },
      {
        id: 2,
        client: 'John Phillips',
        company: 'design studio',
        amount: 12989.88,
        status: 'Late',
        avatar: 'https://ui-avatars.com/api/?name=John+Phillips&background=ef4444&color=fff'
      }
    ],
    yourProjects: [
      {
        id: 1,
        title: 'Logo design for Bakery',
        daysRemaining: 3,
        avatar: 'https://ui-avatars.com/api/?name=Bakery&background=f59e0b&color=fff'
      },
      {
        id: 2,
        title: 'Personal branding project',
        daysRemaining: 5,
        avatar: 'https://ui-avatars.com/api/?name=Branding&background=8b5cf6&color=fff'
      }
    ],
    recommendedProject: {
      client: 'Thomas Martin',
      company: 'Upside Designs',
      title: 'Need a designer to form branding essentials for my business.',
      description: 'Looking for a talented brand designer to create all the branding materials for my new bakery.',
      budget: 8700,
      status: 'Design',
      avatar: 'https://ui-avatars.com/api/?name=Thomas+Martin&background=6366f1&color=fff'
    }
  };

  setTimeout(() => {
    populateDashboard(mockData);
    toggleLoading(false);
  }, 1500);
}

/**
 * Inicializar dashboard
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!checkAuthentication()) return;

  updateGreeting();

  loadDashboardData().catch(() => {
    console.log('API no disponible, cargando datos de prueba...');
    loadMockData();
  });

  setInterval(updateGreeting, 60000);
});
