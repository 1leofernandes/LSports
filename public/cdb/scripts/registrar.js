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
document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
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
                'Accept': 'application/json'
            },
            body: JSON.stringify({ nome, email, telefone, senha })  // Enviando dados formatados
        });

        const data = await response.json();

        if (response.ok) {
            alert('Usuário registrado com sucesso!');
            window.location.href = 'login.html';
        } else {
            alert(data.message || "Erro ao registrar");
        }
    } catch (error) {
        console.error('Erro ao registrar:', error);
        alert("Erro ao conectar ao servidor");
    }
});