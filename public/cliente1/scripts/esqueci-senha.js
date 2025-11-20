const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://lsports.onrender.com';
function logout() {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
}
document.getElementById('esqueciSenhaForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    try {
        const response = await fetch(`${API_BASE_URL}/auth/esqueci-senha`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert('Erro ao enviar solicitação');
    }
});