name: Bug Report
description: Reporte um bug encontrado
labels: ["bug"]
body:
  - type: markdown
    attributes:
      value: |
        Obrigado por reportar um bug! Preencha os detalhes abaixo.
  - type: input
    attributes:
      label: Título
      placeholder: Descrição breve do bug
    validations:
      required: true
  - type: textarea
    attributes:
      label: Descrição
      placeholder: Descreva o bug em detalhes
    validations:
      required: true
  - type: textarea
    attributes:
      label: Passos para Reproduzir
      placeholder: |
        1. Acesse...
        2. Clique em...
        3. Veja o erro...
    validations:
      required: true
  - type: textarea
    attributes:
      label: Comportamento Esperado
      placeholder: O que deveria acontecer?
  - type: textarea
    attributes:
      label: Comportamento Atual
      placeholder: O que realmente está acontecendo?
  - type: input
    attributes:
      label: Versão Afetada
      placeholder: ex: 1.0.0
  - type: textarea
    attributes:
      label: Logs/Screenshots
      placeholder: Cole logs ou screenshots
  - type: textarea
    attributes:
      label: Notas Adicionais
      placeholder: Qualquer outra informação relevante
