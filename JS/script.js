function submitLogin() {
    const form = document.getElementById('formlogin');
    const msg = document.getElementById('msg');
    const btLogin = document.getElementById('bt1');
    const btCriar = document.getElementById('bt2');
    const recuperarSenha = document.getElementById('recuperar-senha');

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Captura os dados do formulário
        const email = form.usuario.value.trim();
        const password = form.senha.value;

        // Loading
        btLogin.textContent = 'Entrando...';
        btLogin.disabled = true;
        btCriar.disabled = true;

        try {
            console.log('🔹 Enviando dados para API:', { email, password });

            // Chamada para API pública de teste
            const response = await fetch('https://reqres.in/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': 'reqres-free-v1' // 🔑 coloque sua chave aqui!
                }, body: JSON.stringify({ email: "eve.holt@reqres.in", password: "cityslicka" })
            });


            const data = await response.json();
            console.log('🔹 Status da resposta:', response.status);
            console.log('🔹 Dados recebidos da API:', data);

            if (response.ok && data.token) {
                // Armazena token
                localStorage.setItem('token', data.token);

                msg.textContent = '✅ Login realizado com sucesso!';
                msg.className = 'msg sucesso';
                msg.classList.remove('oculto');

                setTimeout(() => {
                    window.location.href = '/cadastro.html';
                }, 1500);
            } else {
                msg.textContent = `❌ ${data.error || 'Usuário ou senha inválidos'}`;
                msg.className = 'msg erro';
                msg.classList.remove('oculto');
            }
        } catch (err) {
            console.error('Erro na API:', err);
            msg.textContent = '❌ Erro ao conectar com o servidor';
            msg.className = 'msg erro';
            msg.classList.remove('oculto');
        }

        // Volta o botão ao normal
        btLogin.textContent = 'Login';
        btLogin.disabled = false;
        btCriar.disabled = false;

        setTimeout(() => { msg.classList.add('oculto'); }, 3000);
    });

    // Criar conta (simulado)
    btCriar.addEventListener('click', function () {
        msg.textContent = '📝 Função de criação de conta ainda não implementada';
        msg.className = 'msg sucesso';
        msg.classList.remove('oculto');
        setTimeout(() => { msg.classList.add('oculto'); }, 3000);
    });

    // Recuperar senha (simulado)
    recuperarSenha.addEventListener('click', function (e) {
        e.preventDefault();
        msg.textContent = '✉ E-mail de recuperação enviado (simulado)';
        msg.className = 'msg sucesso';
        msg.classList.remove('oculto');
        setTimeout(() => { msg.classList.add('oculto'); }, 3000);
    });
}

submitLogin();
