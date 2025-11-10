const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Obter o diretório correto
const publicPath = __dirname;

// Servir arquivos estáticos com prioridade máxima
app.use((req, res, next) => {
    // Se for um arquivo estático conhecido, servir diretamente
    const staticFiles = ['styles.css', 'app.js', 'image.png', 'index.html'];
    const fileName = req.path.split('/').pop();
    
    if (staticFiles.includes(fileName)) {
        const filePath = path.join(publicPath, fileName);
        if (fs.existsSync(filePath)) {
            const ext = path.extname(fileName);
            let contentType = 'text/plain';
            
            if (ext === '.css') contentType = 'text/css';
            else if (ext === '.js') contentType = 'application/javascript';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.html') contentType = 'text/html';
            
            res.setHeader('Content-Type', contentType);
            return res.sendFile(filePath);
        }
    }
    next();
});

// Servir outros arquivos estáticos
app.use(express.static(publicPath, {
    maxAge: '1d',
    etag: true
}));

// Rota principal - serve index.html para todas as rotas
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
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

