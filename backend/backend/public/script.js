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
 * Mostrar estado de validación en tiempo real
 */
function showFieldStatus(fieldId, message, type) {
  const statusElement = document.getElementById(fieldId);
  if (statusElement) {
    statusElement.textContent = message;
    statusElement.className = `field-status ${type}`;
    statusElement.style.display = message ? 'block' : 'none';
  }
}

/**
 * Validar formato del username
 */
function validateUsername(username) {
  if (!username || username.trim() === '') {
    return { valid: false, message: 'El nombre de usuario es requerido' };
  }
  
  if (username.length < 3) {
    return { valid: false, message: 'Mínimo 3 caracteres' };
  }
  
  if (username.length > 20) {
    return { valid: false, message: 'Máximo 20 caracteres' };
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    return { valid: false, message: 'Solo letras, números y guiones bajos' };
  }
  
  return { valid: true, message: '✓ Username válido' };
}

/**
 * Validar formato del email
 */
function validateEmail(email) {
  if (!email || email.trim() === '') {
    return { valid: true, message: '' }; // Email es opcional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Formato de email inválido' };
  }
  
  return { valid: true, message: '✓ Email válido' };
}

/**
 * Calcular fortaleza de contraseña
 */
function calculatePasswordStrength(password) {
  let score = 0;
  let feedback = [];
  
  if (password.length >= 6) score += 20;
  if (password.length >= 8) score += 10;
  if (password.length >= 12) score += 10;
  
  if (/[a-z]/.test(password)) score += 15;
  if (/[A-Z]/.test(password)) score += 15;
  if (/[0-9]/.test(password)) score += 15;
  if (/[^A-Za-z0-9]/.test(password)) score += 15;
  
  // Determinar nivel y color
  let level, color, text;
  if (score < 30) {
    level = 'weak';
    color = '#ff4757';
    text = 'Muy débil';
  } else if (score < 60) {
    level = 'medium';
    color = '#ffa726';
    text = 'Débil';
  } else if (score < 80) {
    level = 'good';
    color = '#66bb6a';
    text = 'Buena';
  } else {
    level = 'strong';
    color = '#4caf50';
    text = 'Muy fuerte';
  }
  
  return { score, level, color, text };
}

/**
 * Validar contraseña y actualizar indicador visual
 */
function validatePassword(password) {
  if (!password || password.trim() === '') {
    return { valid: false, message: 'La contraseña es requerida' };
  }
  
  if (password.length < 6) {
    return { valid: false, message: 'Mínimo 6 caracteres' };
  }
  
  if (password.length > 50) {
    return { valid: false, message: 'Máximo 50 caracteres' };
  }
  
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (!hasLetter || !hasNumber) {
    return { 
      valid: false, 
      message: 'Debe contener letras y números' 
    };
  }
  
  const strength = calculatePasswordStrength(password);
  updatePasswordStrengthIndicator(strength);
  
  return { valid: true, message: '✓ Contraseña válida' };
}

/**
 * Actualizar indicador visual de fortaleza
 */
function updatePasswordStrengthIndicator(strength) {
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');
  
  if (strengthBar && strengthText) {
    strengthBar.style.width = `${strength.score}%`;
    strengthBar.style.backgroundColor = strength.color;
    strengthText.textContent = strength.text;
    strengthText.style.color = strength.color;
  }
}

/**
 * Validar confirmación de contraseña
 */
function validatePasswordConfirmation(password, confirmation) {
  if (!confirmation || confirmation.trim() === '') {
    return { valid: false, message: 'Confirma tu contraseña' };
  }
  
  if (password !== confirmation) {
    return { valid: false, message: 'Las contraseñas no coinciden' };
  }
  
  return { valid: true, message: '✓ Contraseñas coinciden' };
}

/**
 * Validar todos los campos del formulario
 */
function validateAllFields(username, email, password, confirmPassword) {
  const usernameValidation = validateUsername(username);
  const emailValidation = validateEmail(email);
  const passwordValidation = validatePassword(password);
  const confirmValidation = validatePasswordConfirmation(password, confirmPassword);
  
  // Mostrar estados en tiempo real
  showFieldStatus('usernameStatus', usernameValidation.message, 
    usernameValidation.valid ? 'success' : 'error');
  showFieldStatus('emailStatus', emailValidation.message, 
    emailValidation.valid ? 'success' : 'error');
  showFieldStatus('passwordStatus', passwordValidation.message, 
    passwordValidation.valid ? 'success' : 'error');
  showFieldStatus('confirmPasswordStatus', confirmValidation.message, 
    confirmValidation.valid ? 'success' : 'error');
  
  // Verificar términos y condiciones
  const termsAccepted = document.getElementById('termsAccepted').checked;
  if (!termsAccepted) {
    showAlert('Debes aceptar los términos y condiciones');
    return false;
  }
  
  return usernameValidation.valid && emailValidation.valid && 
         passwordValidation.valid && confirmValidation.valid;
}

/**
 * Manejar el proceso de registro
 */
async function handleRegister(username, password, email = null) {
  try {
    // Deshabilitar botón durante el proceso
    const registerButton = document.getElementById('registerButton');
    registerButton.disabled = true;
    registerButton.textContent = 'Registrando...';
    
    // Preparar datos para enviar
    const userData = { 
      username: username.trim(), 
      password: password.trim() 
    };
    
    if (email && email.trim()) {
      userData.email = email.trim();
    }
    
    // Llamar a la API
    const response = await fetch(`${apiUrl}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });

    const data = await response.json();

    if (response.ok) {
      // Mostrar mensaje de éxito
      showAlert(
        `¡Usuario ${data.user.username} registrado exitosamente!`, 
        true
      );
      
      // Limpiar formulario
      document.getElementById('registerForm').reset();
      
      // Limpiar indicadores visuales
      ['usernameStatus', 'emailStatus', 'passwordStatus', 'confirmPasswordStatus'].forEach(id => {
        showFieldStatus(id, '', '');
      });
      
      // Reiniciar indicador de fortaleza
      updatePasswordStrengthIndicator({ score: 0, color: '#ddd', text: 'Fortaleza de contraseña' });
      
      // Redirigir al login después de un delay
      setTimeout(() => {
        showAlert('Redirigiendo al login...', true, 'index.html');
      }, 2000);
      
    } else {
      showAlert(data.error || data.msg || 'Error al registrar usuario');
    }
  } catch (error) {
    showAlert('No se pudo conectar con el servidor');
    console.error('Error:', error);
  } finally {
    // Rehabilitar botón
    const registerButton = document.getElementById('registerButton');
    registerButton.disabled = false;
    registerButton.textContent = 'Crear Cuenta';
  }
}

/**
 * Configurar event listeners cuando el DOM esté listo
 */
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // ✅ REGISTRO IMPLEMENTADO - Desarrollador 2
  if (registerForm) {
    // Manejar envío del formulario
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('usuario').value.trim();
      const email = document.getElementById('email').value.trim();
      const password = document.getElementById('contrasena').value.trim();
      const confirmPassword = document.getElementById('confirmarContrasena').value.trim();
      
      if (validateAllFields(username, email, password, confirmPassword)) {
        await handleRegister(username, password, email);
      }
    });
    
    // Validación en tiempo real del username
    const usernameInput = document.getElementById('usuario');
    if (usernameInput) {
      let timeoutId;
      usernameInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const validation = validateUsername(usernameInput.value.trim());
          showFieldStatus('usernameStatus', validation.message, 
            validation.valid ? 'success' : 'error');
        }, 300);
      });
    }
    
    // Validación en tiempo real del email
    const emailInput = document.getElementById('email');
    if (emailInput) {
      let timeoutId;
      emailInput.addEventListener('input', () => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          const validation = validateEmail(emailInput.value.trim());
          showFieldStatus('emailStatus', validation.message, 
            validation.valid ? 'success' : 'error');
        }, 300);
      });
    }
    
    // Validación en tiempo real del password
    const passwordInput = document.getElementById('contrasena');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        const validation = validatePassword(passwordInput.value);
        showFieldStatus('passwordStatus', validation.message, 
          validation.valid ? 'success' : 'error');
      });
    }
    
    // Validación de confirmación de contraseña
    const confirmPasswordInput = document.getElementById('confirmarContrasena');
    if (confirmPasswordInput) {
      confirmPasswordInput.addEventListener('input', () => {
        const password = document.getElementById('contrasena').value;
        const validation = validatePasswordConfirmation(password, confirmPasswordInput.value);
        showFieldStatus('confirmPasswordStatus', validation.message, 
          validation.valid ? 'success' : 'error');
      });
    }
  }

});