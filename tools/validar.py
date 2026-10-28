"""Valida os arquivos de data/ antes de publicar. Uso: python tools/validar.py   (só stdlib; código 1 = achou erro)"""
import json
import pathlib
import sys

DATA = pathlib.Path(__file__).resolve().parent.parent / 'data'
erros = []


def ler(nome):
    try:
        return json.loads((DATA / (nome + '.json')).read_text(encoding='utf-8'))
    except (OSError, ValueError) as x:
        erros.append(f'{nome}.json: não consegui ler ({x})')
        return None


def ids_unicos(nome, itens):
    vistos = set()
    for i, it in enumerate(itens):
        if not isinstance(it, dict) or not it.get('id'):
            erros.append(f'{nome}[{i}]: falta "id"')
        elif it['id'] in vistos:
            erros.append(f'{nome}: id repetido "{it["id"]}"')
        else:
            vistos.add(it['id'])


config = ler('config')
questoes = ler('questoes') or []
cartoes = ler('flashcards') or []
aulas = ler('aulas') or []
plano = ler('plano') or []
areas = {a.get('id') for a in (config or {}).get('areas', [])}
if config is not None and not areas:
    erros.append('config.json: "areas" vazia')

for nome, itens in (('questoes', questoes), ('flashcards', cartoes), ('aulas', aulas)):
    ids_unicos(nome, itens)
    for it in itens:
        if isinstance(it, dict) and it.get('area') not in areas:
            erros.append(f'{nome} "{it.get("id")}": área "{it.get("area")}" não existe em config.json')

for q in questoes:
    alts = q.get('alternativas')
    if not q.get('enunciado'):
        erros.append(f'questão "{q.get("id")}": sem enunciado')
    if not isinstance(alts, list) or len(alts) < 2:
        erros.append(f'questão "{q.get("id")}": precisa de 2+ alternativas')
    elif not isinstance(q.get('gabarito'), int) or not 0 <= q['gabarito'] < len(alts):
        erros.append(f'questão "{q.get("id")}": "gabarito" deve ser o número da alternativa certa (0 = primeira)')
for c in cartoes:
    if not c.get('frente') or not c.get('verso'):
        erros.append(f'cartão "{c.get("id")}": precisa de frente e verso')
for a in aulas:
    if not a.get('titulo'):
        erros.append(f'aula "{a.get("id")}": sem título')
for p in plano:
    if p.get('dia') not in range(7) or p.get('area') not in areas:
        erros.append(f'plano: item inválido {p} (dia 0-6 e área existente)')

for e in erros:
    print('ERRO:', e)
print(f'{len(questoes)} questões, {len(cartoes)} cartões, {len(aulas)} aulas, {len(plano)} itens de plano:',
      'OK' if not erros else f'{len(erros)} erro(s)')
sys.exit(1 if erros else 0)
