# Modelo de Estudo

Plataforma de estudo **open source**, simples e rápida, para qualquer assunto: teste de inglês, concurso, faculdade, certificação.
Só arquivos estáticos (HTML, CSS, JavaScript). **Sem build, sem banco de dados, sem conta.** O progresso fica no navegador de quem estuda.

## Começar em 3 passos
1. Baixe: no GitHub, botão verde **Code > Download ZIP** (descompacte), ou `git clone <endereço deste repositório>`.
2. Rode: Windows, dê dois cliques em `INICIAR.bat`. Mac/Linux, `./iniciar.sh`. O navegador abre em http://localhost:8000 já com o exemplo funcionando.
3. Implemente com o Claude Code: abra um terminal na pasta e digite `claude`. Ele lê o `CLAUDE.md` e já sabe como o projeto funciona. Peça, por exemplo: "troque o conteúdo para o meu assunto: ...".

## O que vem pronto
- **Hoje:** meta diária, cartões para revisar, dias seguidos e plano do dia da semana.
- **Questões:** múltipla escolha com gabarito e comentário na hora; filtros por área e por "não feitas" ou "erradas".
- **Flashcards:** revisão espaçada (algoritmo SM-2 simplificado: Errei, Difícil, Bom, Fácil).
- **Desempenho:** acerto geral, últimos 14 dias e mapa de calor por área e tema.
- **Aulas:** vídeo do YouTube dentro do app, link ou texto de resumo, com marca de "vista".
- **Ajustes:** tema claro/escuro, backup do progresso (exportar e importar) e zerar.

O conteúdo de exemplo é de inglês. Troque pelo seu assunto (veja abaixo).

## Rodar no seu computador
Precisa só do Python 3 (nada para instalar):

```
python servir.py
```

Abra http://localhost:8000. (Abrir o `index.html` direto do disco não funciona: o navegador bloqueia a leitura dos arquivos de `data/`.)

## Publicar no Vercel (grátis)
1. Crie conta em vercel.com e instale a CLI: `npm i -g vercel` (ou use o site: "Add New Project" e importe este repositório do GitHub).
2. Na pasta do projeto: `vercel --prod`.
3. Framework: "Other". Não precisa de comando de build nem de pasta de saída (deixe em branco ou `.`).

Funciona igual no Netlify, GitHub Pages ou Cloudflare Pages.

## Trocar o conteúdo: edite só `data/`
| Arquivo | O que tem |
|---|---|
| `config.json` | nome, subtítulo, cor, meta diária e a lista de **áreas** |
| `questoes.json` | `id`, `area`, `tema`, `enunciado`, `alternativas`, `gabarito` (0 = primeira), `comentario` |
| `flashcards.json` | `id`, `area`, `frente`, `verso` |
| `aulas.json` | `id`, `area`, `titulo`, `resumo`, e `url` (YouTube ou link) e/ou `texto` |
| `plano.json` | `dia` (0 = domingo ... 6 = sábado), `area`, `texto` |

Cada `id` é único dentro do arquivo. Nunca mude o `id` de algo que alguém já respondeu (o progresso usa o id).
Antes de publicar, confira o formato: `python tools/validar.py`.

## Peça para o Claude Code adaptar
Abra a pasta no Claude Code e diga, por exemplo: "troque o conteúdo para preparação do Cambridge B2 com 60 questões, 40 cartões e 6 aulas". O arquivo `CLAUDE.md` já explica as regras.

## Como o código é organizado
```
index.html          casca da página
css/estilo.css      cores e layout (modo claro e escuro)
js/dados.js         lê os arquivos de data/
js/progresso.js     progresso, revisão espaçada, backup (localStorage)
js/telas.js         as telas
js/app.js           menu e navegação
tools/validar.py    confere os dados
servir.py           servidor local
```

## Limites (de propósito)
Sem contas e sem sincronização entre aparelhos: use Exportar/Importar em Ajustes para levar o progresso para outro lugar.
Sem login, então não guarde nada secreto em `data/`: tudo ali é público para quem abrir o site.

## Licença
MIT. Use, copie e modifique à vontade.
