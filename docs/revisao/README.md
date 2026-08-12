# Revisão de conteúdo com a Vyvyan e a Tainá

Ciclo para mandar todo o texto do site para revisão clínica e trazer as
correções de volta para o código sem digitar nada à mão.

Não inclui os guias do blog: o conteúdo deles veio das cartilhas escritas pelas
duas, então já é texto delas.

## Os arquivos

| Arquivo | Para quem | O que é |
| --- | --- | --- |
| `textos-vyta.csv` | Vyvyan e Tainá | A planilha. Uma linha por trecho de texto, com uma coluna em branco para a nova versão. |
| `mapa-dos-textos.html` | Vyvyan e Tainá | Página de leitura: todo o texto na ordem do site, com o código de cada trecho. Responde "onde fica isso". |
| `textos-vyta.json` | o código | Mapa de cada código para arquivo e posição. É o que permite reimportar. Não editar. |

`textos-vyta.csv` e `textos-vyta.json` são gerados juntos e precisam continuar
sendo do mesmo par: o `apply` recusa uma planilha que veio de outra exportação.

## Ciclo

### 1. Exportar

```sh
npm run build        # o mapa embute as fontes do build
npm run copy:export
```

### 2. Subir para o Google Sheets

Arquivo → Importar → `textos-vyta.csv` → "Inserir nova planilha".

Três ajustes que evitam a maior parte dos problemas:

- **Congelar a primeira linha** (Ver → Congelar → 1 linha).
- **Proteger tudo menos as duas últimas colunas** (Dados → Proteger intervalos).
  Se alguém editar `Texto atual` ou reordenar as linhas, o `apply` recusa aquela
  linha — melhor impedir antes.
- **Quebra de texto** nas colunas `Texto atual` e `TEXTO NOVO`
  (Formatar → Quebra de texto → Quebrar).

Publicar o `mapa-dos-textos.html` como artifact e mandar o link junto com a
planilha. É o mapa que dá o contexto; a planilha sozinha é uma lista de frases
soltas.

### 3. Elas revisam

Só a coluna `TEXTO NOVO`. Linha em branco fica como está.

Duas convenções que precisam sobreviver:

- `*entre asteriscos*` vira itálico no site.
- `{u.district}` e afins são preenchidos pelo site com o nome do bairro, da
  unidade ou a data. Podem mudar de lugar na frase, mas não podem sumir nem
  virar outra coisa — o `apply` recusa um marcador que não existia no original.

### 4. Trazer de volta

Baixar como CSV (Arquivo → Fazer download → CSV) e:

```sh
npm run copy:apply -- docs/revisao/textos-revisados.csv --dry   # só mostra
npm run copy:apply -- docs/revisao/textos-revisados.csv         # aplica
npm run typecheck && npm test && npm run test:e2e && npm run build
```

O `--dry` imprime cada troca em formato de diff. Vale sempre rodar antes.

## O que o `apply` recusa

Cada linha passa por três conferências antes de virar escrita em disco. Basta
uma falhar para a linha ser recusada e listada no fim — nunca aplicada com
palpite.

1. O código existe no `textos-vyta.json` daquela exportação.
2. O texto que está hoje no código é o mesmo que foi exportado.
3. A coluna `Texto atual` da planilha bate com os dois.

Na prática isso cobre os três jeitos de errar: mexer no código depois de
exportar, mandar uma planilha antiga, ou reordenar as linhas na planilha.
A saída diz qual foi. A correção é quase sempre a mesma: exportar de novo e
transferir as colunas `TEXTO NOVO` para a planilha nova.

**Enquanto a revisão estiver em andamento, não mexer nos textos do código.**
Qualquer edição invalida as linhas correspondentes.

## Cobertura

O extrator anda pela árvore sintática dos arquivos, não por regex, e separa
texto de código pela chave do objeto ou pelo atributo JSX. A conferência de que
nada ficou de fora é feita contra o HTML renderizado das 21 rotas: todo trecho
com quatro palavras ou mais que aparece no site precisa estar na planilha. O que
sobra são strings montadas em tempo de execução — `Revisado em {data}` vira
`Revisado em 19 de fevereiro de 2026` na tela, e é o molde que está na planilha.

Chave de objeto nova que o extrator não reconhece é listada no fim da execução
em vez de ser descartada em silêncio. Se aparecer alguma que é texto de tela,
adicionar em `COPY_KEYS` no `scripts/copy/lib.mjs`.
