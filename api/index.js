const { readFileSync } = require('fs');
const { join, extname } = require('path');

module.exports = (req, res) => {
    const url = req.url || '/';
    const filePath = join(__dirname, '..', url === '/' ? 'index.html' : url);
    
    try {
        const content = readFileSync(filePath);
        const ext = extname(filePath);
        
        // Definir Content-Type correto
        const contentTypes = {
            '.html': 'text/html',
            '.css': 'text/css',
            '.js': 'application/javascript',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.svg': 'image/svg+xml',
            '.json': 'application/json'
        };
        
        res.setHeader('Content-Type', contentTypes[ext] || 'text/plain');
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        res.send(content);
    } catch (error) {
        // Se não encontrar o arquivo, servir index.html
        if (url === '/') {
            res.status(404).send('Not found');
        } else {
            const indexPath = join(__dirname, '..', 'index.html');
            const html = readFileSync(indexPath, 'utf8');
            res.setHeader('Content-Type', 'text/html');
            res.send(html);
        }
    }
};
