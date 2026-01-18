// JS/script.js — API mode (reqres.in) robusto e pronto para testes
(function () {
  // ----- CONFIG -----
  const API_URL = 'https://reqres.in/api/login'; // use this for login (change when moving to real API)
  const API_KEY = 'reqres-free-v1';              // example header key (string)
  const DEFAULT_TOKEN_TTL_MS = 15 * 60 * 1000;   // 15 minutes if backend doesn't send exp
  const LIMITE_TENTATIVAS = 3;
  const BLOQUEIO_TEMPO = 60 * 1000;              // 1 minute

  // ----- DOM -----
  const form = document.getElementById('formlogin');
  const msg = document.getElementById('msg');
  const btLogin = document.getElementById('bt1');
  const btCriar = document.getElementById('bt2');
  const recuperarSenha = document.getElementById('recuperar-senha');

  if (!form) { console.error('[AUTH] #formlogin não encontrado.'); return; }

  // ----- Tentativas / Bloqueio -----
  let tentativas = parseInt(localStorage.getItem('tentativasLogin')) || 0;
  let bloqueadoAte = parseInt(localStorage.getItem('bloqueadoAte')) || 0;


  // ----- Token helpers -----
  function saveToken(token, expiresAtMs = null) {
    sessionStorage.setItem('accessToken', token);
    const exp = expiresAtMs || (Date.now() + DEFAULT_TOKEN_TTL_MS);
    sessionStorage.setItem('accessToken_expiresAt', String(exp));
    console.log('[AUTH] Token salvo. expira em:', new Date(exp).toLocaleString());
  }
  function clearToken() {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken_expiresAt');
    console.log('[AUTH] Token limpo.');
  }

  function getToken() { return sessionStorage.getItem('accessToken'); }

  function decodeJwtPayload(token) {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const json = decodeURIComponent(atob(payload).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      return JSON.parse(json);
    } catch { return null; }
  }

  function isTokenValid() {
    const token = getToken(); if (!token) return false;
    const expStored = parseInt(sessionStorage.getItem('accessToken_expiresAt') || '0', 10);
    if (expStored && Date.now() < expStored) return true;
    if (expStored && Date.now() >= expStored) return false;
    const payload = decodeJwtPayload(token);
    if (payload && payload.exp) {

      const expMs = payload.exp * 1000;
      sessionStorage.setItem('accessToken_expiresAt', String(expMs));
      return Date.now() < expMs;
    }
    return false;
  }

  // ----- UI message -----
  function mostrarMsg(texto, tipo = 'erro') {
    if (!msg) { alert(texto); return; }
    msg.textContent = texto;
    msg.className = `msg ${tipo}`;
    msg.classList.remove('oculto');
    setTimeout(() => msg.classList.add('oculto'), tipo === 'sucesso' ? 2500 : 4000);
  }

  // ----- Submit handler -----
  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // sync state from storage
    bloqueadoAte = parseInt(localStorage.getItem('bloqueadoAte')) || bloqueadoAte;
    tentativas = parseInt(localStorage.getItem('tentativasLogin')) || tentativas;

    if (Date.now() < bloqueadoAte) {
      const tempo = Math.ceil((bloqueadoAte - Date.now())/1000);
      return mostrarMsg(`⏳ Bloqueado. Tente novamente em ${tempo}s.`, 'erro');
    }

    const email = (form.usuario.value || '').trim().replace(/[<>"'`;]/g, '');
    const senha = form.senha.value || '';

    if (!email || !senha) return mostrarMsg('Preencha todos os campos.', 'erro');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return mostrarMsg('E-mail inválido.', 'erro');

    // reCAPTCHA check
    const recaptchaResponse = (typeof grecaptcha !== 'undefined') ? grecaptcha.getResponse() : 'simulado';
    if (!recaptchaResponse) return mostrarMsg('Confirme que você não é um robô.', 'erro');

    // UI loading
    btLogin.textContent = 'Entrando...';
    btLogin.disabled = true;
    btCriar.disabled = true;

    try {
      const payload = { email: s, password: senha };
      console.log('[AUTH] Enviando login para API:', API_URL);
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': API_KEY
        },
        body: JSON.stringify(payload)
      });

      console.log('[AUTH] Status HTTP:', response.status);
      let data = {};
      try { data = await response.json(); } catch { data = {}; }
      console.log('[AUTH] Resposta API:', data);

      // Prefer token, but accept id (created user) as success for testing:
      if (response.ok && (data.token || data.id)) {
        // if token provided, use it; if only id present, fabricate a simulated token
        const token = data.token ? data.token : `sim-token-from-id-${data.id}-${Date.now()}`;
        // try to extract exp if token is real JWT
        let expiresAtMs = null;
        const jwtPayload = data.token ? decodeJwtPayload(data.token) : null;
        if (jwtPayload && jwtPayload.exp) expiresAtMs = jwtPayload.exp * 1000;
        saveToken(token, expiresAtMs);
        localStorage.setItem('tentativasLogin', '0');
        mostrarMsg('✅ Login realizado com sucesso!', 'sucesso');
        if (typeof grecaptcha !== 'undefined') grecaptcha.reset();
        setTimeout(() => { window.location.href = '/cadastro.html'; }, 900);
        return;
      }

      // failure branch
      tentativas = (parseInt(localStorage.getItem('tentativasLogin')) || 0) + 1;
      localStorage.setItem('tentativasLogin', String(tentativas));
      if (tentativas >= LIMITE_TENTATIVAS) {
        bloqueadoAte = Date.now() + BLOQUEIO_TEMPO;
        localStorage.setItem('bloqueadoAte', String(bloqueadoAte));
        mostrarMsg('🚫 Muitas tentativas. Bloqueado por 1 minuto.', 'erro');
      } else {
        const apiMsg = data && data.error ? data.error : 'Usuário ou senha incorretos.';
        mostrarMsg(apiMsg, 'erro');
      }
      if (typeof grecaptcha !== 'undefined') grecaptcha.reset();

    } catch (err) {
      console.error('[AUTH] Erro de conexão:', err);
      mostrarMsg('❌ Falha ao conectar com a API. Veja o Console.', 'erro');
    } finally {
      btLogin.textContent = 'Login';
      btLogin.disabled = false;
      btCriar.disabled = false;
    }
  });

  // ----- session check on load -----
  (function checkExistingSession() {
    if (isTokenValid()) {
      console.log('[AUTH] Sessão ativa — token válido.');
    } else {
      clearToken();
    }
  })();

  // ----- extras -----
  btCriar.addEventListener('click', () => { window.location.href = 'cadastro.html'; });
  recuperarSenha.addEventListener('click', (e) => { e.preventDefault(); mostrarMsg('✉ E-mail de recuperação enviado (simulado).', 'sucesso'); });

  // debug helpers
  window._authDebug = {
    showStorage: () => {
      console.log('tentativasLogin =', localStorage.getItem('tentativasLogin'));
      console.log('bloqueadoAte =', localStorage.getItem('bloqueadoAte'));
      console.log('accessToken =', sessionStorage.getItem('accessToken'));
      console.log('accessToken_expiresAt =', sessionStorage.getItem('accessToken_expiresAt'));
    },
    clearAll: () => {
      localStorage.removeItem('tentativasLogin');
      localStorage.removeItem('bloqueadoAte');
      clearToken();
      console.log('[AUTH DEBUG] storages limpos.');
    }
  };
})();
