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
const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ email, senha: password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('token', data.token);
            localStorage.setItem('nome', data.nome);
            localStorage.setItem('usuario_id', data.usuario_id);
            const role = JSON.parse(atob(data.token.split('.')[1])).role; 

            if (role === 'cliente') {
                window.location.href = 'agendamento.html'; 
            } else if (role === 'funcionario') {
                window.location.href = 'funcionario.html';
            }
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.error('Erro ao fazer login:', error);
    }
});