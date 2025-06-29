const API_URL = 'http://localhost:4000/api';
const AUTH_URL = `${API_URL}/auth`;

// Detectar página actual
const isDashboardPage = document.body.classList.contains('dashboard-page');
const isRegisterPage = document.body.classList.contains('register-page');
const isLoginPage = document.body.classList.contains('login-page');

/* ========= FUNCIONES COMUNES ========= */
function showAlert(message, isSuccess = false, redirectUrl = null) {
  alert(message);
  if (isSuccess && redirectUrl) {
    setTimeout(() => window.location.href = redirectUrl, 1500);
  }
}

function checkAuthentication() {
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Debes iniciar sesión para acceder al dashboard');
    window.location.href = 'index.html';
    return false;
  }
  return token;
}

/* ========= LOGIN ========= */
if (isLoginPage) {
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();

      if (!username || username.length < 3) {
        return showAlert('El nombre de usuario debe tener al menos 3 caracteres');
      }

      if (!password) return showAlert('La contraseña es requerida');

      try {
        const loginButton = document.getElementById('loginButton');
        loginButton.disabled = true;
        loginButton.textContent = 'Iniciando sesión...';

        const res = await fetch(`${AUTH_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok && data.token) {
          localStorage.setItem('token', data.token);
          showAlert(`¡Bienvenido ${data.user.username}!`, true, 'dashboard.html');
        } else {
          showAlert(data.msg || 'Credenciales inválidas');
        }
      } catch (err) {
        console.error(err);
        showAlert('No se pudo conectar con el servidor');
      } finally {
        const loginButton = document.getElementById('loginButton');
        loginButton.disabled = false;
        loginButton.textContent = 'Iniciar Sesión';
      }
    });

    // Efecto visual en inputs
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        input.style.borderColor = '#6D3C52';
        input.style.transform = 'translateY(-2px)';
      });
      input.addEventListener('blur', () => {
        input.style.borderColor = '#ddd';
        input.style.transform = 'translateY(0)';
      });
    });
  });
}

/* ========= REGISTRO ========= */
if (isRegisterPage) {
  document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;

    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('usuario').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('contrasena').value;
      const confirm = document.getElementById('confirmarContrasena').value;
      const accepted = document.getElementById('termsAccepted').checked;

      if (!accepted) return showAlert('Debes aceptar los términos');
      if (password !== confirm) return showAlert('Las contraseñas no coinciden');

      try {
        const res = await fetch(`${AUTH_URL}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        if (res.ok) {
          showAlert('Usuario registrado correctamente', true, 'index.html');
        } else {
          showAlert(data.msg || 'Error en el registro');
        }
      } catch (err) {
        console.error(err);
        showAlert('Error de red');
      }
    });
  });
}

/* ========= DASHBOARD ========= */
if (isDashboardPage) {
  document.addEventListener('DOMContentLoaded', () => {
    if (!checkAuthentication()) return;

    updateGreeting();
    loadDashboardData().catch(() => {
      console.log('API no disponible, cargando datos de prueba...');
      loadMockData();
    });

    setInterval(updateGreeting, 60000);
  });

  function toggleLoading(show = true) {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.toggle('show', show);
  }

  function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  }

  function updateGreeting() {
    const greetingElement = document.querySelector('.greeting-text');
    if (greetingElement) greetingElement.textContent = getGreeting();
  }

  async function loadDashboardData() {
    try {
      toggleLoading(true);
      const token = checkAuthentication();
      if (!token) return;

      const res = await fetch(`${AUTH_URL}/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Error al cargar dashboard');
      const data = await res.json();
      populateDashboard(data);
    } catch (e) {
      console.error(e);
      showErrorState();
    } finally {
      toggleLoading(false);
    }
  }

  function showErrorState() {
    const content = document.querySelector('.dashboard-content');
    if (content) content.innerHTML = `<div style="text-align:center">Error al cargar datos</div>`;
  }

  function populateDashboard(data) {
    updateUserInfo(data.user);
    updateStats(data);
    updateInvoices(data.recentInvoices);
    updateProjects(data.yourProjects);
    updateRecommendedProject(data.recommendedProject);
  }

  function updateUserInfo(user) {
    document.getElementById('userAvatar').src = user.avatar;
    document.getElementById('userName').textContent = user.name;
    document.getElementById('headerUserName').textContent = user.name;
  }

  function animateNumber(element, target, duration) {
    const start = 0;
    const startTime = performance.now();
    function animate(time) {
      const progress = Math.min((time - startTime) / duration, 1);
      element.textContent = formatNumber(Math.floor(start + (target - start) * progress));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }

  function updateStats(data) {
    animateNumber(document.getElementById('earningsAmount'), data.earnings.amount, 2000);
    document.getElementById('earningsChange').textContent = data.earnings.change;

    animateNumber(document.getElementById('rankNumber'), data.rank.position, 1500);
    document.getElementById('rankDescription').textContent = data.rank.description;

    animateNumber(document.getElementById('projectsNumber'), data.projects.total, 1000);
    document.getElementById('projectsPending').textContent = data.projects.pending;
    document.getElementById('projectsCompleted').textContent = data.projects.completed;
  }

  function updateInvoices(invoices) {
    const container = document.getElementById('invoicesList');
    container.innerHTML = invoices.map(i => `
      <div class="invoice-item">
        <img src="${i.avatar}" alt="${i.client}" class="invoice-avatar">
        <div>
          <div class="invoice-client">${i.client}</div>
          <div class="invoice-company">${i.company}</div>
        </div>
        <div class="invoice-amount">€ ${formatNumber(i.amount)}</div>
      </div>
    `).join('');
  }

  function updateProjects(projects) {
    const container = document.getElementById('projectsList');
    container.innerHTML = projects.map(p => `
      <div class="project-item">
        <img src="${p.avatar}" alt="${p.title}" class="project-avatar">
        <div>
          <div class="project-title">${p.title}</div>
          <div class="project-days">${p.daysRemaining} días restantes</div>
        </div>
      </div>
    `).join('');
  }

  function updateRecommendedProject(project) {
    const container = document.getElementById('recommendedProject');
    container.innerHTML = `
      <img src="${project.avatar}" alt="${project.client}" />
      <div class="recommended-content">
        <div>${project.client} - ${project.company}</div>
        <h4>${project.title}</h4>
        <p>${project.description}</p>
        <strong>${formatNumber(project.budget)}€</strong>
      </div>
    `;
  }

  function logout() {
    if (confirm('¿Cerrar sesión?')) {
      localStorage.removeItem('token');
      alert('Sesión cerrada');
      window.location.href = 'index.html';
    }
  }

  function loadMockData() {
    console.log('Datos simulados no implementados aún');
  }
}
