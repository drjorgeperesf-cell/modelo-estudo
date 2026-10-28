// Progresso do aluno. Fica só no localStorage deste navegador; exportar/importar em Ajustes faz o backup.
const CHAVE = 'modelo-estudo-v1';

const PROGRESSO = {
  d: { q: {}, f: {}, aulas: {}, dias: {}, tema: 'claro' },

  carregar() {
    try {
      const bruto = localStorage.getItem(CHAVE);
      if (bruto) this.d = Object.assign(this.d, JSON.parse(bruto));
    } catch (e) { /* navegador sem storage: segue sem salvar */ }
  },

  salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(this.d)); } catch (e) { /* idem */ }
  },

  hoje() {
    const t = new Date();
    return t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  },

  dia(chave) {
    const k = chave || this.hoje();
    return this.d.dias[k] || (this.d.dias[k] = { q: 0, ok: 0, f: 0 });
  },

  // ---- questões: q[id] = { n: tentativas, ok: acertos, ultima: true/false }
  responder(id, acertou) {
    const e = this.d.q[id] || (this.d.q[id] = { n: 0, ok: 0, ultima: false });
    e.n += 1;
    if (acertou) e.ok += 1;
    e.ultima = acertou;
    const dia = this.dia();
    dia.q += 1;
    if (acertou) dia.ok += 1;
    this.salvar();
  },

  // ---- flashcards (SM-2 simplificado): f[id] = { facilidade, intervalo, vence: 'AAAA-MM-DD' }
  avaliarCartao(id, nota) {
    // nota: 0 errei, 1 difícil, 2 bom, 3 fácil
    const e = this.d.f[id] || { facilidade: 2.5, intervalo: 0, vence: this.hoje() };
    if (nota === 0) {
      e.intervalo = 0;
      e.facilidade = Math.max(1.3, e.facilidade - 0.2);
    } else {
      const base = e.intervalo === 0 ? 1 : e.intervalo;
      const fator = nota === 1 ? 1.2 : nota === 2 ? e.facilidade : e.facilidade * 1.3;
      e.intervalo = e.intervalo === 0 ? (nota === 3 ? 3 : 1) : Math.max(base + 1, Math.round(base * fator));
      e.facilidade = Math.max(1.3, e.facilidade + (nota === 3 ? 0.1 : nota === 1 ? -0.15 : 0));
    }
    const venc = new Date();
    venc.setDate(venc.getDate() + e.intervalo);
    e.vence = venc.getFullYear() + '-' + String(venc.getMonth() + 1).padStart(2, '0') + '-' + String(venc.getDate()).padStart(2, '0');
    this.d.f[id] = e;
    this.dia().f += 1;
    this.salvar();
  },

  cartoesDevidos(todos) {
    const h = this.hoje();
    return todos.filter((c) => !this.d.f[c.id] || this.d.f[c.id].vence <= h);
  },

  // ---- aulas
  marcarAula(id, visto) {
    if (visto) this.d.aulas[id] = true; else delete this.d.aulas[id];
    this.salvar();
  },

  // ---- sequência de dias seguidos com alguma atividade
  sequencia() {
    let n = 0;
    const t = new Date();
    for (;;) {
      const k = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
      const d = this.d.dias[k];
      if (d && (d.q || d.f)) n += 1;
      else if (k !== this.hoje()) break;
      t.setDate(t.getDate() - 1);
      if (n > 3650) break;
    }
    return n;
  },

  exportar() { return JSON.stringify(this.d, null, 2); },

  importar(texto) {
    const o = JSON.parse(texto);
    if (typeof o !== 'object' || !o || !o.q || !o.f || !o.dias) throw new Error('arquivo não é um backup deste app');
    this.d = Object.assign({ q: {}, f: {}, aulas: {}, dias: {}, tema: 'claro' }, o);
    this.salvar();
  },

  zerar() {
    this.d = { q: {}, f: {}, aulas: {}, dias: {}, tema: this.d.tema };
    this.salvar();
  },
};
