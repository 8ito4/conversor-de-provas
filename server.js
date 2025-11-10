const express = require('express');
const path = require('path');

const app = express();

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handler para Vercel (serverless)
module.exports = app;

// Para desenvolvimento local
if (require.main === module) {
    const PORT = process.env.PORT || 2006;
    app.listen(PORT, () => {
        console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    });
}

