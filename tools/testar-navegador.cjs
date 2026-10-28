// Teste opcional de navegador (precisa de Playwright: npm i -D playwright). Rode "python servir.py 8765" antes e depois: node tools/testar-navegador.cjs
const { chromium } = require('playwright');
const falhas = [];
const ok = (n, c, x = '') => { console.log((c ? 'ok   ' : 'FALHA') + ' ' + n + ' ' + x); if (!c) falhas.push(n); };
(async () => {
  const b = await chromium.launch({ headless: true });
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const nav = async (t) => { await p.click('#menu button:has-text("' + t + '")'); await p.waitForSelector('#menu button[aria-current=page]:has-text("' + t + '")'); await p.waitForTimeout(80); };
  const erros = [];
  p.on('pageerror', (e) => erros.push(String(e)));
  p.on('console', (m) => { if (m.type() === 'error') erros.push(m.text()); });
  await p.goto('http://127.0.0.1:8765/');
  await p.waitForSelector('#tela h1');
  ok('hoje abre', (await p.textContent('#tela h1')) === 'Hoje');
  ok('menu com 6 abas', (await p.locator('#menu button').count()) === 6);
  ok('nome vem do config', (await p.textContent('#marca-nome')) === 'Meu Estudo');
  // questões: responder errado (g1: gabarito B=1; clicar A)
  await nav('Questões');
  await p.waitForSelector('.alt');
  await p.locator('.alt').nth(0).click();
  ok('errada mostra comentário', (await p.locator('.comentario').count()) === 1 && (await p.locator('.alt.errada').count()) === 1 && (await p.locator('.alt.certa').count()) === 1);
  await p.click('button:has-text("Próxima")');
  await p.locator('.alt').nth(2).click();   // g2 gabarito 2 = certa
  ok('certa marca verde', (await p.locator('.alt.certa').count()) === 1 && (await p.locator('.alt.errada').count()) === 0);
  // filtro erradas
  await p.selectOption('select[aria-label="Situação"]', 'erradas');
  ok('filtro erradas acha 1', (await p.textContent('.linha .fraco')).includes('1 questão'));
  // hoje reflete 2 questões, 50% 
  await nav('Hoje');
  ok('hoje mostra 2/10', (await p.textContent('.grade')).includes('2/10') && (await p.textContent('.grade')).includes('50%'));
  // flashcards: 12 devidos, avaliar 1
  await nav('Flashcards');
  ok('12 devidos', (await p.textContent('#tela')).includes('12 para revisar'));
  await p.click('button:has-text("Mostrar resposta")');
  await p.click('button:has-text("Bom")');
  ok('11 devidos depois de revisar', (await p.textContent('#tela')).includes('11 para revisar'));
  await p.click('button:has-text("Mostrar resposta")');
  await p.click('button:has-text("Errei")');
  ok('cartão errado continua devido (11)', (await p.textContent('#tela')).includes('11 para revisar'));
  // desempenho: mapa tem célula vermelha (Gramática·Tempos verbais 1/2 = 50% -> v2) 
  await nav('Desempenho');
  ok('mapa de calor tem células', (await p.locator('.celula').count()) === 7);
  ok('célula com dado fica colorida', (await p.locator('.celula.v2, .celula.v1, .celula.v3').count()) >= 1);
  ok('controle: célula sem dados fica cinza', (await p.locator('.celula.v0').count()) >= 1);
  // aulas
  await nav('Aulas');
  await p.locator('input[type=checkbox]').first().check();
  // tema escuro persiste
  await nav('Ajustes');
  await p.click('button:has-text("Alternar claro/escuro")');
  ok('tema escuro aplicado', (await p.getAttribute('html', 'data-tema')) === 'escuro');
  // persistência após recarregar
  await p.reload();
  await p.waitForSelector('#tela h1');
  ok('tema escuro persiste', (await p.getAttribute('html', 'data-tema')) === 'escuro');
  await nav('Hoje');
  ok('progresso persiste (2/10)', (await p.textContent('.grade')).includes('2/10'));
  // exportar -> zerar (2 cliques) -> importar
  await nav('Ajustes');
  const bkp = await p.evaluate(() => PROGRESSO.exportar());
  await p.click('button:has-text("Zerar progresso")');
  ok('zerar exige 2º clique (ainda tem progresso)', (await p.evaluate(() => Object.keys(PROGRESSO.d.q).length)) === 2);
  await p.click('button:has-text("Clique de novo")');
  ok('zerou', (await p.evaluate(() => Object.keys(PROGRESSO.d.q).length)) === 0);
  await p.evaluate((t) => PROGRESSO.importar(t), bkp);
  ok('importar restaura', (await p.evaluate(() => Object.keys(PROGRESSO.d.q).length)) === 2);
  ok('importar lixo falha', await p.evaluate(() => { try { PROGRESSO.importar('{"x":1}'); return false; } catch (e) { return true; } }));
  // celular
  await p.setViewportSize({ width: 375, height: 700 });
  await nav('Hoje');
  ok('sem rolagem horizontal no celular', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok('nenhum erro no console', erros.length === 0, erros.join(' | ').slice(0, 300));
  await b.close();
  console.log(falhas.length ? 'FALHOU: ' + falhas.join('; ') : 'TUDO OK');
  process.exit(falhas.length ? 1 : 0);
})();
