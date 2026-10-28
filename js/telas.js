// Telas do app. Cada função recebe o elemento <main> e desenha dentro dele (sem framework, sem build).

function h(tag, attrs, ...filhos) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (k === 'class') el.className = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (v === true) el.setAttribute(k, '');
    else if (v !== false && v != null) el.setAttribute(k, v);
  }
  for (const f of filhos.flat()) if (f != null && f !== false) el.append(f.nodeType ? f : document.createTextNode(String(f)));
  return el;
}

function porcento(a, b) { return b ? Math.round((100 * a) / b) : 0; }

function placaNumero(valor, rotulo, extra) {
  return h('div', { class: 'placa' }, h('div', { class: 'num' }, valor), h('div', null, rotulo), extra ? h('div', { class: 'fraco' }, extra) : null);
}

function seletorArea(valor, aoMudar) {
  const s = h('select', { 'aria-label': 'Área', onchange: () => aoMudar(s.value) },
    h('option', { value: 'todas' }, 'Todas as áreas'),
    (DADOS.config.areas || []).map((a) => h('option', { value: a.id, selected: a.id === valor }, a.nome)));
  return s;
}

// ------------------------------------------------------------------ HOJE
function telaHoje(el) {
  const dia = PROGRESSO.dia();
  const meta = DADOS.config.metaDiaria || 10;
  const devidos = PROGRESSO.cartoesDevidos(DADOS.flashcards).length;
  const naoFeitas = DADOS.questoes.filter((q) => !PROGRESSO.d.q[q.id]).length;
  const diaSemana = new Date().getDay();
  const plano = (DADOS.plano || []).filter((p) => p.dia === diaSemana);

  el.append(h('h1', null, 'Hoje'));
  el.append(h('div', { class: 'grade' },
    placaNumero(dia.q + '/' + meta, 'questões hoje', dia.q ? porcento(dia.ok, dia.q) + '% de acerto' : 'meta do dia'),
    placaNumero(devidos, 'cartões para revisar', dia.f + ' revisados hoje'),
    placaNumero(PROGRESSO.sequencia(), 'dias seguidos', 'qualquer atividade conta'),
  ));
  const barra = h('div', { class: 'barra' }, h('i', { style: 'width:' + Math.min(100, porcento(dia.q, meta)) + '%' }));
  el.append(h('div', { class: 'placa' }, h('h3', null, 'Meta do dia'), barra,
    h('p', { class: 'fraco' }, naoFeitas + ' questões ainda não feitas no banco.'),
    h('div', { class: 'linha' },
      h('button', { class: 'btn', onclick: () => { location.hash = '#/questoes/nao-feitas'; } }, 'Começar questões'),
      h('button', { class: 'btn sec', onclick: () => { location.hash = '#/flashcards'; } }, 'Revisar cartões'))));
  if (plano.length) {
    el.append(h('div', { class: 'placa' }, h('h3', null, 'Plano de hoje'),
      plano.map((p) => h('p', null, h('span', { class: 'etiqueta' }, DADOS.area(p.area).nome), p.texto))));
  }
}

// ------------------------------------------------------------------ QUESTÕES
function telaQuestoes(el, modo) {
  const est = { area: 'todas', status: modo === 'nao-feitas' || modo === 'erradas' ? modo : 'todas', i: 0 };
  const raiz = h('div');
  el.append(h('h1', null, 'Questões'), raiz);

  function lista() {
    return DADOS.questoes.filter((q) => {
      if (est.area !== 'todas' && q.area !== est.area) return false;
      const p = PROGRESSO.d.q[q.id];
      if (est.status === 'nao-feitas') return !p;
      if (est.status === 'erradas') return p && !p.ultima;
      return true;
    });
  }

  function desenhar() {
    raiz.replaceChildren();
    const itens = lista();
    const filtros = h('div', { class: 'linha' },
      seletorArea(est.area, (v) => { est.area = v; est.i = 0; desenhar(); }),
      (() => {
        const s = h('select', { 'aria-label': 'Situação', onchange: () => { est.status = s.value; est.i = 0; desenhar(); } },
          [['todas', 'Todas'], ['nao-feitas', 'Não feitas'], ['erradas', 'Erradas por último']].map(([v, t]) => h('option', { value: v, selected: v === est.status }, t)));
        return s;
      })(),
      h('span', { class: 'fraco' }, itens.length + ' questão(ões)'));
    raiz.append(filtros);
    if (!itens.length) {
      raiz.append(h('div', { class: 'placa' }, 'Nenhuma questão neste filtro.'));
      return;
    }
    if (est.i >= itens.length) est.i = 0;
    const q = itens[est.i];
    const placa = h('div', { class: 'placa' });
    placa.append(h('div', { class: 'linha entre' },
      h('div', null, h('span', { class: 'etiqueta' }, DADOS.area(q.area).nome), q.tema ? h('span', { class: 'fraco' }, q.tema) : null),
      h('span', { class: 'fraco' }, (est.i + 1) + ' de ' + itens.length)));
    placa.append(h('p', { style: 'white-space:pre-line' }, q.enunciado));
    const letras = 'ABCDEFGH';
    const botoes = q.alternativas.map((t, k) => h('button', { class: 'alt', onclick: () => responder(k) }, letras[k] + ') ' + t));
    botoes.forEach((b) => placa.append(b));
    const retorno = h('div');
    placa.append(retorno);

    function responder(k) {
      const certo = k === q.gabarito;
      PROGRESSO.responder(q.id, certo);
      botoes.forEach((b, j) => {
        b.disabled = true;
        if (j === q.gabarito) b.classList.add('certa');
        else if (j === k) b.classList.add('errada');
      });
      retorno.append(
        h('p', null, h('strong', null, certo ? 'Certo!' : 'Errado. Gabarito: ' + letras[q.gabarito] + ')')),
        q.comentario ? h('div', { class: 'comentario' }, q.comentario) : null,
        h('div', { class: 'linha', style: 'margin-top:14px' },
          h('button', { class: 'btn', onclick: () => { if (est.status !== 'nao-feitas') est.i += 1; desenhar(); } }, 'Próxima')));
    }
    raiz.append(placa);
  }
  desenhar();
}

// ------------------------------------------------------------------ FLASHCARDS
function telaFlashcards(el) {
  const raiz = h('div');
  el.append(h('h1', null, 'Flashcards'), raiz);
  const est = { area: 'todas' };

  function fila() {
    return PROGRESSO.cartoesDevidos(DADOS.flashcards).filter((c) => est.area === 'todas' || c.area === est.area);
  }

  function desenhar() {
    raiz.replaceChildren();
    const itens = fila();
    raiz.append(h('div', { class: 'linha' }, seletorArea(est.area, (v) => { est.area = v; desenhar(); }),
      h('span', { class: 'fraco' }, itens.length + ' para revisar agora')));
    if (!itens.length) {
      raiz.append(h('div', { class: 'placa' }, 'Tudo revisado por hoje. Volte amanhã ou adicione cartões em data/flashcards.json.'));
      return;
    }
    const c = itens[0];
    const placa = h('div', { class: 'placa' });
    const rosto = h('div', { class: 'cartao' }, c.frente);
    const acoes = h('div', { class: 'linha' });
    placa.append(h('span', { class: 'etiqueta' }, DADOS.area(c.area).nome), rosto, acoes);
    acoes.append(h('button', { class: 'btn', onclick: revelar }, 'Mostrar resposta'));

    function revelar() {
      rosto.textContent = c.verso;
      acoes.replaceChildren(...[['Errei', 0, 'perigo'], ['Difícil', 1, 'sec'], ['Bom', 2, ''], ['Fácil', 3, 'sec']].map(([t, nota, cl]) =>
        h('button', { class: 'btn ' + cl, onclick: () => { PROGRESSO.avaliarCartao(c.id, nota); desenhar(); } }, t)));
    }
    raiz.append(placa);
  }
  desenhar();
}

// ------------------------------------------------------------------ DESEMPENHO
function telaDesempenho(el) {
  el.append(h('h1', null, 'Desempenho'));
  const feitas = DADOS.questoes.filter((q) => PROGRESSO.d.q[q.id]);
  const tent = Object.values(PROGRESSO.d.q).reduce((s, e) => s + e.n, 0);
  const acertos = Object.values(PROGRESSO.d.q).reduce((s, e) => s + e.ok, 0);
  el.append(h('div', { class: 'grade' },
    placaNumero(feitas.length + '/' + DADOS.questoes.length, 'questões feitas'),
    placaNumero(porcento(acertos, tent) + '%', 'acerto geral', tent + ' tentativas'),
    placaNumero(Object.keys(PROGRESSO.d.f).length + '/' + DADOS.flashcards.length, 'cartões iniciados')));

  // últimos 14 dias
  const dias = [];
  const t = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(t);
    d.setDate(t.getDate() - i);
    const k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    dias.push(PROGRESSO.d.dias[k] || { q: 0, f: 0 });
  }
  const topo = Math.max(1, ...dias.map((d) => d.q + d.f));
  el.append(h('div', { class: 'placa' }, h('h3', null, 'Últimos 14 dias (questões + cartões)'),
    h('div', { class: 'dias' }, dias.map((d) => h('i', { style: 'height:' + Math.round((100 * (d.q + d.f)) / topo) + '%', title: (d.q + d.f) + ' itens' })))));

  // mapa de calor: área > tema
  const celulas = {};
  DADOS.questoes.forEach((q) => {
    const k = q.area + '|' + (q.tema || 'Geral');
    const c = celulas[k] || (celulas[k] = { area: q.area, tema: q.tema || 'Geral', total: 0, n: 0, ok: 0 });
    c.total += 1;
    const p = PROGRESSO.d.q[q.id];
    if (p) { c.n += p.n; c.ok += p.ok; }
  });
  const mapa = h('div', { class: 'mapa' });
  Object.values(celulas).sort((a, b) => a.area.localeCompare(b.area) || a.tema.localeCompare(b.tema)).forEach((c) => {
    const taxa = porcento(c.ok, c.n);
    const nivel = !c.n ? 0 : taxa < 50 ? 1 : taxa < 75 ? 2 : 3;
    mapa.append(h('div', { class: 'celula v' + nivel },
      h('b', null, c.n ? taxa + '%' : '–'), DADOS.area(c.area).nome + ' · ' + c.tema, h('div', { class: 'fraco' }, c.total + ' questão(ões)')));
  });
  el.append(h('div', { class: 'placa' }, h('h3', null, 'Mapa de calor por tema'),
    h('p', { class: 'fraco' }, 'Cinza: ainda sem dados. Vermelho: abaixo de 50%. Amarelo: 50 a 74%. Verde: 75% ou mais.'), mapa));
}

// ------------------------------------------------------------------ AULAS
function telaAulas(el) {
  el.append(h('h1', null, 'Aulas'));
  const areas = DADOS.config.areas || [];
  areas.forEach((a) => {
    const aulas = DADOS.aulas.filter((x) => x.area === a.id);
    if (!aulas.length) return;
    el.append(h('h2', null, a.nome));
    aulas.forEach((x) => {
      const visto = !!PROGRESSO.d.aulas[x.id];
      const corpo = h('div', { class: 'placa' });
      const caixa = h('input', { type: 'checkbox', checked: visto, 'aria-label': 'Marcar como vista', onchange: () => PROGRESSO.marcarAula(x.id, caixa.checked) });
      corpo.append(h('div', { class: 'aula' }, caixa, h('div', null, h('strong', null, x.titulo), x.resumo ? h('p', { class: 'fraco' }, x.resumo) : null)));
      const yt = x.url && x.url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{11})/);
      if (yt) corpo.append(h('div', { class: 'video' }, h('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + yt[1], allowfullscreen: true, loading: 'lazy', title: x.titulo })));
      else if (x.url) corpo.append(h('p', null, h('a', { href: x.url, target: '_blank', rel: 'noopener noreferrer' }, 'Abrir material')));
      if (x.texto) corpo.append(h('div', { class: 'comentario' }, x.texto));
      el.append(corpo);
    });
  });
}

// ------------------------------------------------------------------ AJUSTES
function telaAjustes(el, aoMudarTema) {
  el.append(h('h1', null, 'Ajustes'));
  const aviso = h('p', { class: 'fraco', role: 'status' });
  const arq = h('input', { type: 'file', accept: 'application/json', hidden: true, onchange: () => {
    const f = arq.files[0];
    if (!f) return;
    f.text().then((t) => { PROGRESSO.importar(t); aviso.textContent = 'Backup importado.'; }).catch((e) => { aviso.textContent = 'Erro: ' + e.message; });
  } });
  let armado = false;
  const zerar = h('button', { class: 'btn perigo', onclick: () => {
    if (!armado) { armado = true; zerar.textContent = 'Clique de novo para apagar TODO o progresso'; return; }
    PROGRESSO.zerar();
    armado = false;
    zerar.textContent = 'Zerar progresso';
    aviso.textContent = 'Progresso apagado.';
  } }, 'Zerar progresso');
  el.append(h('div', { class: 'placa' },
    h('h3', null, 'Aparência'),
    h('div', { class: 'linha' }, h('button', { class: 'btn sec', onclick: () => aoMudarTema() }, 'Alternar claro/escuro'))),
  h('div', { class: 'placa' },
    h('h3', null, 'Backup do progresso'),
    h('div', { class: 'linha' },
      h('button', { class: 'btn', onclick: () => {
        const a = h('a', { href: URL.createObjectURL(new Blob([PROGRESSO.exportar()], { type: 'application/json' })), download: 'progresso-' + PROGRESSO.hoje() + '.json' });
        a.click();
        URL.revokeObjectURL(a.href);
      } }, 'Exportar'),
      h('button', { class: 'btn sec', onclick: () => arq.click() }, 'Importar'), arq, zerar), aviso));
}
