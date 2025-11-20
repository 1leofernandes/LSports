// cliente1/scripts/registrar.js
// extrai tenant da URL (ex.: /cliente1/registrar.html)
const pathParts = window.location.pathname.split('/');
const tenant = pathParts[1] || ''; // 'cliente1'

const senhaInput = document.getElementById("password");
const toggleSenha = document.getElementById("toggleSenha");

if (toggleSenha && senhaInput) {
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
}

const API_BASE_URL = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    ? 'http://localhost:3000'
    : 'https://lsports.onrender.com';

document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    const senha = document.getElementById('password').value;

    if (!nome || !email || !telefone || !senha) {
        alert("Preencha todos os campos!");
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/registrar`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Tenant': tenant   // <<< importante: envia o tenant para o backend
            },
            body: JSON.stringify({ nome, email, telefone, senha })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Usuário registrado com sucesso!');
            // redireciona para a versão do login daquele tenant
            window.location.href = 'login.html';
        } else {
            alert(data.message || "Erro ao registrar");
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alert("Erro ao conectar ao servidor");
    }
});
