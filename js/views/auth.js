
import { h } from '../ui.js';
import { supabase } from '../supabase.js';

export function authView() {
  const container = h('div', { class: 'result' });

  const title = h(
    'h1',
    { class: 'result__title' },
    'Entrar no Next Stop'
  );

  const description = h(
    'p',
    { class: 'result__text' },
    'Entre na sua conta ou crie uma conta para começar.'
  );

  const form = h('form', { class: 'welcome__card' });

  const emailLabel = h('label', { for: 'auth-email' }, 'E-mail');
  const email = h('input', {
    class: 'field',
    id: 'auth-email',
    type: 'email',
    placeholder: 'seu@email.com',
    autocomplete: 'email',
    required: true,
  });

  const passwordLabel = h(
    'label',
    { for: 'auth-password' },
    'Senha'
  );

  const password = h('input', {
    class: 'field',
    id: 'auth-password',
    type: 'password',
    placeholder: 'Sua senha',
    autocomplete: 'current-password',
    minlength: '6',
    required: true,
  });

  const message = h('p', {
    class: 'result__text',
    role: 'status',
    'aria-live': 'polite',
  });

  const loginButton = h(
    'button',
    { class: 'btn btn--sol', type: 'submit' },
    'Entrar'
  );

  const signupButton = h(
    'button',
    { class: 'btn', type: 'button' },
    'Criar conta'
  );

  const resetButton = h(
    'button',
    { class: 'btn', type: 'button' },
    'Esqueci minha senha'
  );

  form.append(
    emailLabel,
    email,
    passwordLabel,
    password,
    loginButton,
    signupButton,
    resetButton,
    message
  );

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = 'Entrando...';
    loginButton.disabled = true;
    signupButton.disabled = true;

    const { error } = await supabase.auth.signInWithPassword({
      email: email.value.trim(),
      password: password.value,
    });

    loginButton.disabled = false;
    signupButton.disabled = false;

    if (error) {
      message.textContent = `Não foi possível entrar: ${error.message}`;
      return;
    }

    location.hash = '#/aprender';
  });

  signupButton.addEventListener('click', async () => {
    message.textContent = 'Criando conta...';
    signupButton.disabled = true;

    const { data, error } = await supabase.auth.signUp({
      email: email.value.trim(),
      password: password.value,
      options: {
        emailRedirectTo: window.location.origin + window.location.pathname,
      },
    });

    signupButton.disabled = false;

    if (error) {
      message.textContent = `Não foi possível criar a conta: ${error.message}`;
      return;
    }

    message.textContent = data.session
      ? 'Conta criada! Você já pode entrar.'
      : 'Conta criada! Confira seu e-mail para confirmar o cadastro.';
  });

  resetButton.addEventListener('click', async () => {
    if (!email.value.trim()) {
      message.textContent = 'Digite seu e-mail primeiro.';
      email.focus();
      return;
    }

    message.textContent = 'Enviando solicitação...';
    const { error } = await supabase.auth.resetPasswordForEmail(
      email.value.trim(),
      {
        redirectTo: window.location.origin + window.location.pathname,
      }
    );

    message.textContent = error
      ? `Não foi possível enviar: ${error.message}`
      : 'Se o e-mail estiver cadastrado, você receberá instruções para redefinir a senha.';
  });

  container.append(title, description, form);

  return container;
}
