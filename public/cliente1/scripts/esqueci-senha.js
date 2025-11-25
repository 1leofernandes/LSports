const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000' 
    : 'https://lsports.onrender.com';
// extrai tenant do path (ex: /cliente1/...) — usado pelo backend para identificar tenant
const _pathParts = window.location.pathname.split('/');
const tenant = _pathParts[1] || localStorage.getItem('tenant') || '';
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
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', 'X-Tenant': tenant },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        alert(data.message);
    } catch (error) {
        alert('Erro ao enviar solicitação');
    }
});