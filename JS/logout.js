document.getElementById('logout').addEventListener('click', () => {
  const confirmar = confirm('Deseja realmente sair?');
  if (confirmar) {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
  }
});
