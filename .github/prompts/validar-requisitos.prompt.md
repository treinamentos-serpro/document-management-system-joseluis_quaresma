---
description: Compara uma especificação com a implementação e identifica requisitos atendidos, parciais ou ausentes com evidências.
name: validar-requisitos
argument-hint: caminho da especificação (padrão: docs/specs/dms-spec.md)
agent: agent
---

# Validar requisitos contra a implementação

Compare a especificação `${input:especificacao:caminho do arquivo}` com a implementação correspondente neste workspace. Se nenhum caminho for informado, use `docs/specs/dms-spec.md`. A finalidade é avaliar o cumprimento dos requisitos, não alterar o código.

## Procedimento

1. Leia a especificação por completo e identifique todos os requisitos verificáveis, incluindo requisitos funcionais, não funcionais, contratos de API, restrições, critérios de aceitação e itens explicitamente fora de escopo.
2. Inspecione o código, a configuração e os testes que controlam cada requisito. Siga o fluxo entre camadas e componentes quando necessário; não conclua conformidade apenas pela existência de um nome ou de um teste.
3. Para cada requisito, associe evidências concretas, como comportamento implementado, teste relevante ou configuração. Cite arquivos com links e linhas quando disponíveis.
4. Marque cada requisito como **Atendido**, **Parcial**, **Não atendido**, **Não verificável** ou **Fora de escopo**, explicando brevemente a decisão. Não trate ausência de evidência como prova automática de falha: use **Não verificável** quando não for possível confirmar pelo código ou pelas checagens disponíveis.
5. Execute testes, build ou outras checagens já disponíveis e pertinentes ao escopo. Registre os comandos e resultados. Não instale dependências, não modifique arquivos e não afirme que os testes provam comportamentos que não cobrem.
6. Compare os resultados com os itens explicitamente fora de escopo e com as limitações ou riscos registrados na especificação. Não os apresente como requisitos descumpridos.

## Formato da resposta

Comece com um resumo do resultado geral e conte os requisitos por status. Em seguida, apresente uma matriz com as colunas **ID**, **Requisito**, **Status** e **Evidência**. Para requisitos sem ID explícito, crie identificadores temporários estáveis, como `R-01`.

Depois da matriz, liste primeiro as lacunas e divergências mais importantes, em ordem de impacto. Para cada uma, explique o comportamento observado, o impacto, a evidência com referência ao arquivo e uma recomendação objetiva de correção. Separe claramente falhas confirmadas de pontos não verificáveis.

Finalize com as checagens executadas e seus resultados, além de qualquer limitação que impeça afirmar conformidade total. Não faça alterações nem apresente correções como já aplicadas.