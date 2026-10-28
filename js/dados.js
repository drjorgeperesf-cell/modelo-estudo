// Carrega o conteúdo de data/*.json. Para trocar de assunto, edite só esses arquivos (veja o README).
const DADOS = { config: {}, questoes: [], flashcards: [], aulas: [], plano: [] };

DADOS.carregar = async function () {
  const nomes = ['config', 'questoes', 'flashcards', 'aulas', 'plano'];
  const lidos = await Promise.all(nomes.map(async (n) => {
    const r = await fetch('data/' + n + '.json', { cache: 'no-cache' });
    if (!r.ok) throw new Error('Não achei data/' + n + '.json (HTTP ' + r.status + ')');
    return r.json();
  }));
  nomes.forEach((n, i) => { DADOS[n] = lidos[i]; });
};

DADOS.area = function (id) {
  return (DADOS.config.areas || []).find((a) => a.id === id) || { id: id, nome: id };
};
