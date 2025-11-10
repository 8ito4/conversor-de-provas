# Conversor de Provas - Word para SIGA

Conversor de avaliações do formato Word para o formato SIGA (CSV).

## 🚀 Deploy na Vercel

### Opção 1: Via CLI da Vercel

1. Instale a CLI da Vercel:
```bash
npm i -g vercel
```

2. Faça login:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Para produção:
```bash
vercel --prod
```

### Opção 2: Via GitHub

1. Faça push do código para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com)
3. Conecte seu repositório GitHub
4. A Vercel detectará automaticamente a configuração e fará o deploy

## 🏃 Desenvolvimento Local

```bash
npm install
npm start
```

O servidor rodará em `http://localhost:2006`

## 📦 Estrutura

- `index.html` - Interface principal
- `app.js` - Lógica de conversão
- `styles.css` - Estilos
- `server.js` - Servidor Express (compatível com Vercel)
- `vercel.json` - Configuração da Vercel

