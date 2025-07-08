const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://resenha-backend.onrender.com';
document.getElementById('resetForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    
    const senha = document.getElementById('senha').value;
    const confirmSenha = document.getElementById('confirmSenha').value;
    
    if (senha !== confirmSenha) {
        alert('As senhas não coincidem.');
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    try {
        const response = await fetch(`${API_BASE_URL}/auth/resetar-senha/${token}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ senha })
        });

        if (response.ok) {
            const messageElement = document.getElementById('message');
            messageElement.style.display = 'block';

            // Espera 2 segundos antes de redirecionar
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            alert('Erro ao redefinir a senha. Tente novamente.');
        }
    } catch (error) {
        console.error('Erro:', error);
        alert('Erro ao redefinir a senha. Tente novamente.');
    }
});