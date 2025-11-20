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
    : 'https://lsports.onrender.com';
function logout() {
    window.location.href = 'admin.html';
}
const adminEmails = ['leonardoff24@gmail.com', 'BONIEQUES2020@GMAIL.COM', 'bonieques2020@gmail.com', 'guyhenryck06@gmail.com'];
const form = document.getElementById('registrarFuncionarioForm');

document.addEventListener('DOMContentLoaded', () => {
    validarUsuario();
});

async function validarUsuario() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Você não está logado. Redirecionando para o login...');
        window.location.href = 'login.html';
        return;
    }
    try {
        // Decodifica o token JWT manualmente para obter o e-mail
        const payload = JSON.parse(atob(token.split('.')[1])); // Decodifica o payload do token
        const userEmail = payload.email; // Extrai o e-mail do payload

        // Verifica se o e-mail do usuário está na lista de administradores
        if (!adminEmails.includes(userEmail)) {
            alert('Acesso negado. Somente administradores podem acessar esta página.');
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Erro na autenticação:', error);
        alert('Erro na autenticação. Tente novamente.');
        window.location.href = 'login.html';
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const senha = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_BASE_URL}/registrar-funcionario`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nome, telefone, email, senha })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Funcionário registrado com sucesso!');
            window.location.href = 'admin.html';
        } else {
            alert(data.mensagem);
        }
    } catch (error) {
        console.error('Erro ao registrar funcionário:', error);
    }
});