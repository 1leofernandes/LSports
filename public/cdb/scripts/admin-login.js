const senhaInput = document.getElementById("password");
const toggleSenha = document.getElementById("toggleSenha");

toggleSenha.addEventListener("click", function () {
    if (senhaInput.type === "password") {
        senhaInput.type = "text";
        toggleSenha.classList.remove("fa-eye");
        toggleSenha.classList.add("fa-eye-slash");
    } else {
        senhaInput.type = "password";
        toggleSenha.classList.remove("fa-eye-slash");
        toggleSenha.classList.add("fa-eye");
    }
});
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://resenha-backend.onrender.com';

function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}

document.getElementById('adminLoginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    // Validação dos campos
    let isValid = true;
    if (!email) {
        document.getElementById('email').classList.add('invalid');
        isValid = false;
    } else {
        document.getElementById('email').classList.remove('invalid');
    }

    if (!password) {
        document.getElementById('password').classList.add('invalid');
        isValid = false;
    } else {
        document.getElementById('password').classList.remove('invalid');
    }

    if (!isValid) {
        errorMessage.textContent = 'Por favor, preencha todos os campos.';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/admin-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await res.json();

        if (res.ok && data.isAdmin) {
            // Armazena o token no localStorage
            localStorage.setItem('token', data.token);
            window.location.href = 'admin.html'; // Redireciona para a página de administração
        } else {
            errorMessage.textContent = data.message || 'Acesso negado';
        }
    } catch (error) {
        console.error('Erro no login de administrador:', error);
        errorMessage.textContent = 'Erro no servidor. Tente novamente mais tarde.';
    }
});

// Função para alternar a visibilidade da senha
function togglePassword() {
    const passwordField = document.getElementById('password');
    const passwordType = passwordField.type === 'password' ? 'text' : 'password';
    passwordField.type = passwordType;
}