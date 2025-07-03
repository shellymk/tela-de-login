function submit()
{
    const form = document.getElementById ('formlogin');
    const msg = document.getElementById ('msg');
    
    form.addEventListener 
    ('submit', function (e)
    {
    
        e.preventDefault(); //evita que recarregue

        const usuario = form.usuario.value.trim();
        const senha = form.senha.value;

        if(usuario === 'admin' && senha ===  '012345' )
            {

                msg.textContent = ' ✅ Login Realizado com Sucesso';
                msg.className = 'msg sucesso';

                setTimeout(() => 
                    {
                        window.location.href = 'cadastro.html';
                    }, 1500);
                

            }
            else
            {
                msg.textContent = '❌ Usuario ou senha invalidos';
                msg.className= 'msg erro';
     
            }
            msg.classList.remove('oculto');

            setTimeout(() => 
                {
                    msg.classList.add('oculto');
                }, 3000);

    }        
    ); 
   
    
    
}
submit();
