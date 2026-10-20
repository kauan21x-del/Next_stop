// Ponto de entrada: roteador por hash (#/aprender, #/cursos, ...) e relógio das vidas.
import { h, mascot } from './ui.js';
import { getState, subscribe } from './store.js';
import { authView } from './views/auth.js';
import { formatCountdown, heartsNow } from './progress.js';
import { welcomeView } from './views/welcome.js';
import { learnView } from './views/learn.js';
import { coursesView } from './views/courses.js';
import { profileView } from './views/profile.js';
import { lessonView } from './views/lesson.js';

const app = document.getElementById('app');
let cleanup = null;

const TITLES = {
  entrar: 'Entrar',
  aprender: 'Aprender',
  cursos: 'Cursos',
  perfil: 'Perfil',
  licao: 'Lição',
};

function notFound() {
  return h(
    'div',
    { class: 'result' },
    mascot('olhando'),
    h('h1', { class: 'result__title', tabindex: '-1', 'data-autofocus': '' }, 'Essa parada não existe'),
    h('p', { class: 'result__text' }, 'O endereço que você abriu não leva a nenhuma tela.'),
    h('a', { class: 'btn btn--sol', href: '#/' }, 'Voltar ao início'),
  );
}

function render({ fresh = false } = {}) {
  const [name, a, b] = (location.hash.replace(/^#/, '') || '/').split('/').filter(Boolean);
  const { onboarded } = getState();

  if (name === 'entrar') {
    cleanup?.();
    cleanup = null;
    app.replaceChildren(authView());
    document.title = 'Entrar · Next Stop';
    return;
  }

  // Quem ainda não escolheu um curso começa pela tela de boas-vindas.
  if (!onboarded && name !== undefined) return location.replace('#/');
  if (onboarded && name === undefined) return location.replace('#/aprender');
  cleanup?.();
  cleanup = null;

  const views = {
    undefined: () => welcomeView({ rerender: render }),
    aprender: () => learnView(),
    cursos: () => coursesView(),
    perfil: () => profileView({ rerender: render }),
    licao: () => lessonView({ courseId: a, lessonId: b }),
  };
  const out = (views[name] ?? notFound)();
  const el = out instanceof Node ? out : out.el;
  cleanup = out.cleanup ?? null;

  app.replaceChildren(el);
  const pageTitle = TITLES[name];
  document.title = pageTitle && pageTitle !== 'Next Stop' ? `${pageTitle} · Next Stop` : 'Next Stop';
  if (fresh) {
    window.scrollTo(0, 0);
    app.querySelector('[data-autofocus]')?.focus({ preventScroll: true });
  }
}

window.addEventListener('hashchange', () => render({ fresh: true }));

// Mudanças no progresso atualizam a tela, menos durante uma lição (para não perder o exercício aberto).
subscribe(() => {
  if (!location.hash.startsWith('#/licao')) render();
});

// Relógio das vidas: atualiza a contagem e redesenha a tela quando uma vida volta.
let lastHearts = heartsNow(getState()).hearts;
setInterval(() => {
  const now = heartsNow(getState());
  for (const el of document.querySelectorAll('[data-heart-timer]')) el.textContent = formatCountdown(now.nextIn);
  if (now.hearts !== lastHearts) {
    lastHearts = now.hearts;
    if (!location.hash.startsWith('#/licao')) render();
  }
}, 1000);

render({ fresh: true });
