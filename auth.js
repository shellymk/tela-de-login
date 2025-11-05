// auth.js
(function() {
    // Verifica se há token no localStorage
    const token = localStorage.getItem('token');

    // Se não tiver token, redireciona para login
    if (!token) {
        window.location.href = 'index.html'; // sua página de login
    }

    // Se quiser, pode validar o token via API aqui antes de permitir acesso
})();
