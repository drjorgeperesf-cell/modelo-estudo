// Roteador por hash (#/hoje, #/questoes, ...) e menu. Nada de build: abra por qualquer servidor estático.
const ROTAS = [
  ['hoje', 'Hoje'],
  ['questoes', 'Questões'],
  ['flashcards', 'Flashcards'],
  ['desempenho', 'Desempenho'],
  ['aulas', 'Aulas'],
  ['ajustes', 'Ajustes'],
];

function aplicarTema() {
  document.documentElement.setAttribute('data-tema', PROGRESSO.d.tema === 'escuro' ? 'escuro' : 'claro');
}

function alternarTema() {
  PROGRESSO.d.tema = PROGRESSO.d.tema === 'escuro' ? 'claro' : 'escuro';
  PROGRESSO.salvar();
  aplicarTema();
}

function desenharMenu(atual) {
  const menu = document.getElementById('menu');
  menu.replaceChildren(...ROTAS.map(([id, nome]) => h('button', {
    'aria-current': id === atual ? 'page' : false,
    onclick: () => { location.hash = '#/' + id; },
  }, nome)));
}

function irPara() {
  const [rota, param] = (location.hash.replace(/^#\//, '') || 'hoje').split('/');
  const id = ROTAS.some(([r]) => r === rota) ? rota : 'hoje';
  const tela = document.getElementById('tela');
  tela.replaceChildren();
  desenharMenu(id);
  ({ hoje: telaHoje, questoes: telaQuestoes, flashcards: telaFlashcards, desempenho: telaDesempenho,
     aulas: telaAulas, ajustes: (el) => telaAjustes(el, alternarTema) })[id](tela, param);
  window.scrollTo(0, 0);
}

async function iniciar() {
  PROGRESSO.carregar();
  aplicarTema();
  try {
    await DADOS.carregar();
  } catch (e) {
    document.getElementById('tela').append(h('div', { class: 'placa' },
      h('h2', null, 'Não consegui carregar o conteúdo'), h('p', null, String(e.message)),
      h('p', { class: 'fraco' }, 'Abra o app por um servidor (python servir.py ou Vercel); abrir o index.html direto do disco não funciona.')));
    return;
  }
  const c = DADOS.config;
  document.title = c.nome || document.title;
  document.getElementById('marca-nome').textContent = c.nome || 'Modelo de Estudo';
  document.getElementById('marca-sub').textContent = c.subtitulo || '';
  if (c.cor) {
    document.documentElement.style.setProperty('--cor', c.cor);
  }
  window.addEventListener('hashchange', irPara);
  irPara();
}

iniciar();
