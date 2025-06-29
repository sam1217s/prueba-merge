const apiUrl = 'http://localhost:4000/api/auth';

/**
 * Función para mostrar alertas al usuario
 */
const showAlert = (message, isSuccess = false, redirectUrl = null) => {
  alert(message);
  if (isSuccess && redirectUrl) {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, 1500);
  }
};

/**
 * Validar campos del formulario de login
 */
function validateLoginFields(username, password) {
  if (!username || username.trim() === '') {
    showAlert('El nombre de usuario es requerido');
    return false;
  }
  
  if (!password || password.trim() === '') {
    showAlert('La contraseña es requerida');
    return false;
  }
  
  if (username.length < 3) {
    showAlert('El nombre de usuario debe tener al menos 3 caracteres');
    return false;
  }
  
  return true;
}

/**
 * Manejar el proceso de login
 */
async function handleLogin(username, password) {
  try {
    // Deshabilitar botón durante el proceso
    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = true;
    loginButton.textContent = 'Iniciando sesión...';
    
    const response = await fetch(`${apiUrl}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (response.ok && data.token) {
      // Guardar token en localStorage
      localStorage.setItem('token', data.token);
      showAlert(`¡Bienvenido ${data.user.username}! Login exitoso.`, true, 'dashboard.html');
    } else {
      showAlert(data.error || data.msg || 'Credenciales inválidas');
    }
  } catch (error) {
    showAlert('No se pudo conectar con el servidor');
    console.error('Error:', error);
  } finally {
    // Rehabilitar botón
    const loginButton = document.getElementById('loginButton');
    loginButton.disabled = false;
    loginButton.textContent = 'Iniciar Sesión';
  }
}

/**
 * Configurar event listeners cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // ❌ REGISTRO NO IMPLEMENTADO - Desarrollador 2 debe implementar
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      showAlert('Función de registro no implementada. Desarrollador 2 debe completar esta funcionalidad.');
    });
  }

  // ✅ LOGIN IMPLEMENTADO - Desarrollador 1
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = loginForm.username.value.trim();
      const password = loginForm.password.value.trim();

      if (validateLoginFields(username, password)) {
        await handleLogin(username, password);
      }
    });
    
    // Agregar efectos visuales a los inputs
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
  }

  // Verificar si ya está autenticado
//   const token = localStorage.getItem('token');
//   if (token && loginForm) {
//     showAlert('Ya tienes una sesión activa', true, 'dashboard.html');
//   }
});

/**
 * Función para cerrar sesión (para dashboard)
 */
function logout() {
  localStorage.removeItem('token');
  showAlert('Sesión cerrada correctamente', true, 'index.html');
}
