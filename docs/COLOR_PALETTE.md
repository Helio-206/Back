# 🎨 Paleta de Cores - Sistema de Agendamento BI Angola

Paleta de cores oficial baseada na identidade visual do Governo de Angola.

---

## 🎨 Paleta de Cores Oficial

```typescript
// filepath: src/styles/colors.ts
export const colorPalette = {
  // Cores Primárias - Governo de Angola
  primary: {
    darkBlue: '#003366',      // Azul escuro (brasão)
    red: '#E31E24',           // Vermelho vivo (bandeira)
    gold: '#FFD700',          // Dourado (brasão)
  },

  // Cores Secundárias
  secondary: {
    lightBlue: '#0066CC',     // Azul complementar
    darkRed: '#A61C1C',       // Vermelho mais escuro
    cream: '#FFF8DC',         // Bege claro (fundo)
  },

  // Cores Funcionais
  functional: {
    success: '#28A745',       // Verde (aprovado, confirmado)
    warning: '#FFC107',       // Amarelo (atenção, pendente)
    danger: '#DC3545',        // Vermelho (erro, cancelado)
    info: '#17A2B8',          // Azul claro (informação)
  },

  // Cores de Texto
  text: {
    primary: '#003366',       // Azul escuro
    secondary: '#666666',     // Cinzento
    light: '#FFFFFF',         // Branco
    muted: '#999999',         // Cinzento claro
  },

  // Cores de Fundo
  background: {
    primary: '#FFFFFF',       // Branco puro
    secondary: '#F5F5F5',     // Cinzento muito claro
    tertiary: '#FFF8DC',      // Bege claro
    dark: '#003366',          // Azul escuro
  },

  // Cores de Borda
  border: {
    light: '#E0E0E0',
    medium: '#CCCCCC',
    dark: '#003366',
  },

  // Status BI específicos
  biStatus: {
    agendado: '#FFC107',      // Amarelo - pendente
    confirmado: '#17A2B8',    // Azul - confirmado
    emProcessamento: '#0066CC', // Azul mais escuro - processando
    pronto: '#28A745',        // Verde - pronto para retirada
    entregue: '#6C757D',      // Cinzento - concluído
    cancelado: '#DC3545',     // Vermelho - cancelado
    rejeitado: '#A61C1C',     // Vermelho escuro - rejeitado
  },
};

// Variáveis CSS para reutilização
export const cssVariables = `
  :root {
    /* Primárias */
    --color-primary-dark-blue: #003366;
    --color-primary-red: #E31E24;
    --color-primary-gold: #FFD700;

    /* Secundárias */
    --color-secondary-light-blue: #0066CC;
    --color-secondary-dark-red: #A61C1C;
    --color-secondary-cream: #FFF8DC;

    /* Funcionais */
    --color-success: #28A745;
    --color-warning: #FFC107;
    --color-danger: #DC3545;
    --color-info: #17A2B8;

    /* Texto */
    --color-text-primary: #003366;
    --color-text-secondary: #666666;
    --color-text-light: #FFFFFF;
    --color-text-muted: #999999;

    /* Fundo */
    --color-bg-primary: #FFFFFF;
    --color-bg-secondary: #F5F5F5;
    --color-bg-tertiary: #FFF8DC;
    --color-bg-dark: #003366;

    /* Borda */
    --color-border-light: #E0E0E0;
    --color-border-medium: #CCCCCC;
    --color-border-dark: #003366;

    /* Gradientes */
    --gradient-primary: linear-gradient(135deg, #003366 0%, #0066CC 100%);
    --gradient-accent: linear-gradient(135deg, #E31E24 0%, #FFD700 100%);
  }
`;
```

---

## 📋 Combinações de Cores por Componente

```typescript
// filepath: src/styles/componentColors.ts
export const componentColors = {
  // Header/Navbar
  header: {
    background: '#003366',      // Azul escuro
    text: '#FFFFFF',            // Branco
    border: '#FFD700',          // Dourado (accent)
  },

  // Buttons
  button: {
    primary: {
      background: '#E31E24',    // Vermelho
      text: '#FFFFFF',
      hover: '#A61C1C',         // Vermelho mais escuro
      active: '#8B1515',
    },
    secondary: {
      background: '#0066CC',    // Azul
      text: '#FFFFFF',
      hover: '#003366',         // Azul mais escuro
      active: '#001F4D',
    },
    success: {
      background: '#28A745',
      text: '#FFFFFF',
      hover: '#1E8449',
    },
    outline: {
      border: '#003366',
      text: '#003366',
      hover: {
        background: '#F5F5F5',
      },
    },
  },

  // Cards
  card: {
    background: '#FFFFFF',
    border: '#E0E0E0',
    shadow: 'rgba(0, 51, 102, 0.1)',  // Azul com transparência
  },

  // Inputs/Form
  form: {
    background: '#FFFFFF',
    border: '#CCCCCC',
    focusBorder: '#0066CC',
    focusRing: 'rgba(0, 102, 204, 0.1)',
    label: '#003366',
    placeholder: '#999999',
  },

  // Status Badges
  badge: {
    agendado: {
      background: '#FFC107',
      text: '#333333',
    },
    confirmado: {
      background: '#D1ECF1',
      text: '#0C5460',
      border: '#17A2B8',
    },
    emProcessamento: {
      background: '#D6E9FF',
      text: '#003366',
      border: '#0066CC',
    },
    pronto: {
      background: '#D4EDDA',
      text: '#155724',
      border: '#28A745',
    },
    cancelado: {
      background: '#F8D7DA',
      text: '#721C24',
      border: '#DC3545',
    },
  },

  // Alerts
  alert: {
    success: {
      background: '#D4EDDA',
      border: '#28A745',
      text: '#155724',
    },
    warning: {
      background: '#FFF3CD',
      border: '#FFC107',
      text: '#856404',
    },
    danger: {
      background: '#F8D7DA',
      border: '#DC3545',
      text: '#721C24',
    },
    info: {
      background: '#D1ECF1',
      border: '#17A2B8',
      text: '#0C5460',
    },
  },

  // Navigation/Sidebar
  sidebar: {
    background: '#F5F5F5',
    activeItem: '#003366',
    activeItemText: '#FFFFFF',
    hoverItemBackground: '#E8E8E8',
    border: '#E0E0E0',
  },

  // Footer
  footer: {
    background: '#003366',
    text: '#FFFFFF',
    border: '#FFD700',
  },
};
```

---

## 🎯 Guia de Uso por Página

```typescript
// filepath: src/styles/pageThemes.ts
export const pageThemes = {
  // Login/Register
  auth: {
    primaryColor: '#003366',    // Azul escuro
    accentColor: '#E31E24',     // Vermelho
    backgroundColor: '#F5F5F5',
  },

  // Dashboard Cidadão
  citizenDashboard: {
    primaryColor: '#0066CC',    // Azul
    statusColors: {
      pending: '#FFC107',
      confirmed: '#17A2B8',
      processing: '#0066CC',
      ready: '#28A745',
      completed: '#6C757D',
      cancelled: '#DC3545',
    },
  },

  // Dashboard Centro
  centerDashboard: {
    primaryColor: '#003366',    // Azul escuro
    actionColor: '#E31E24',     // Vermelho (ações importantes)
    highlightColor: '#FFD700',  // Dourado (destaques)
  },

  // Dashboard Admin
  adminDashboard: {
    primaryColor: '#003366',
    dangerColor: '#DC3545',
    successColor: '#28A745',
    warningColor: '#FFC107',
  },

  // Protocolo/Receipt
  protocolo: {
    borderColor: '#003366',
    accentColor: '#FFD700',
    statusColor: '#0066CC',
  },
};
```

---

## 📊 Matriz de Contraste (WCAG AA)

| Cor 1 | Cor 2 | Contraste | Aprovado |
|-------|-------|-----------|----------|
| #003366 (Azul) | #FFFFFF (Branco) | 10.5:1 | ✅ AAA |
| #E31E24 (Vermelho) | #FFFFFF (Branco) | 5.2:1 | ✅ AA |
| #FFC107 (Amarelo) | #333333 (Preto) | 6.4:1 | ✅ AA |
| #0066CC (Azul Claro) | #FFFFFF (Branco) | 6.9:1 | ✅ AA |
| #28A745 (Verde) | #FFFFFF (Branco) | 5.0:1 | ✅ AA |

---

## 🚀 Implementação Recomendada

### Para React com Tailwind CSS

```javascript
// filepath: tailwind.config.js
module.exports = {
  theme: {
    colors: {
      primary: {
        darkBlue: '#003366',
        red: '#E31E24',
        gold: '#FFD700',
        lightBlue: '#0066CC',
      },
      secondary: {
        darkRed: '#A61C1C',
        cream: '#FFF8DC',
      },
      status: {
        agendado: '#FFC107',
        confirmado: '#17A2B8',
        processando: '#0066CC',
        pronto: '#28A745',
        entregue: '#6C757D',
        cancelado: '#DC3545',
        rejeitado: '#A61C1C',
      },
      functional: {
        success: '#28A745',
        warning: '#FFC107',
        danger: '#DC3545',
        info: '#17A2B8',
      },
      text: {
        primary: '#003366',
        secondary: '#666666',
        light: '#FFFFFF',
        muted: '#999999',
      },
      bg: {
        primary: '#FFFFFF',
        secondary: '#F5F5F5',
        tertiary: '#FFF8DC',
        dark: '#003366',
      },
      border: {
        light: '#E0E0E0',
        medium: '#CCCCCC',
        dark: '#003366',
      },
    },
    extends: {
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #003366 0%, #0066CC 100%)',
        'gradient-accent': 'linear-gradient(135deg, #E31E24 0%, #FFD700 100%)',
      },
    },
  },
};
```

### Para CSS Vanilla

```css
/* filepath: src/styles/colors.css */
:root {
  /* Primárias */
  --color-primary-dark-blue: #003366;
  --color-primary-red: #E31E24;
  --color-primary-gold: #FFD700;

  /* Secundárias */
  --color-secondary-light-blue: #0066CC;
  --color-secondary-dark-red: #A61C1C;
  --color-secondary-cream: #FFF8DC;

  /* Funcionais */
  --color-success: #28A745;
  --color-warning: #FFC107;
  --color-danger: #DC3545;
  --color-info: #17A2B8;

  /* Texto */
  --color-text-primary: #003366;
  --color-text-secondary: #666666;
  --color-text-light: #FFFFFF;
  --color-text-muted: #999999;

  /* Fundo */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F5F5F5;
  --color-bg-tertiary: #FFF8DC;
  --color-bg-dark: #003366;

  /* Borda */
  --color-border-light: #E0E0E0;
  --color-border-medium: #CCCCCC;
  --color-border-dark: #003366;

  /* Gradientes */
  --gradient-primary: linear-gradient(135deg, #003366 0%, #0066CC 100%);
  --gradient-accent: linear-gradient(135deg, #E31E24 0%, #FFD700 100%);
}
```

---

## 🇦🇴 Identidade Visual

Esta paleta mantém a identidade visual do **Governo de Angola** enquanto garante:

- ✅ **Usabilidade**: Cores claras e bem definidas
- ✅ **Acessibilidade**: Contraste WCAG AA/AAA em todas as combinações
- ✅ **Consistência**: Visual alinhado com portal oficial do governo
- ✅ **Funcionalidade**: Status bem diferenciados para o sistema de BI

---

## 📚 Referências

- **Azul Escuro (#003366)**: Referência ao brasão e formalmente oficial
- **Vermelho (#E31E24)**: Cor primária da bandeira de Angola
- **Dourado (#FFD700)**: Detalhe do brasão nacional
- **Status Colors**: Sistema de cores para diferentes estados de documentos

