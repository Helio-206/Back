name: Feature Request
description: Sugerir uma nova funcionalidade
labels: ["enhancement"]
body:
  - type: markdown
    attributes:
      value: |
        Obrigado por sugerir uma feature! Use este template para descrever sua ideia.
  - type: input
    attributes:
      label: Sumário
      placeholder: Descrição breve da feature
    validations:
      required: true
  - type: textarea
    attributes:
      label: Descrição
      placeholder: Descreva a funcionalidade em detalhes
    validations:
      required: true
  - type: textarea
    attributes:
      label: Caso de Uso
      placeholder: |
        Por que essa feature é necessária?
        Qual problema ela resolve?
    validations:
      required: true
  - type: textarea
    attributes:
      label: Solução Proposta
      placeholder: Como você imaginaria implementar?
  - type: textarea
    attributes:
      label: Alternativas Consideradas
      placeholder: Outras maneiras de resolver?
  - type: textarea
    attributes:
      label: Impacto
      placeholder: Quantos utilizadores seriam afetados?
