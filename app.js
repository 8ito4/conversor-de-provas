const inputText = document.getElementById('inputText');
const gabaritoText = document.getElementById('gabaritoText');
const convertBtn = document.getElementById('convertBtn');
const outputSection = document.getElementById('outputSection');
const outputText = document.getElementById('outputText');
const copyBtn = document.getElementById('copyBtn');
const downloadBtn = document.getElementById('downloadBtn');
const copyStatus = document.getElementById('copyStatus');
const previewSection = document.getElementById('previewSection');
const previewContent = document.getElementById('previewContent');
const templateFile = document.getElementById('templateFile');
const templateStatus = document.getElementById('templateStatus');

let templateHeaders = null;

convertBtn.addEventListener('click', convertToSIGA);
copyBtn.addEventListener('click', copyToClipboard);
downloadBtn.addEventListener('click', downloadTXT);
templateFile.addEventListener('change', handleTemplateFile);

function handleTemplateFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const lines = content.split('\n');
        
        if (lines.length > 0) {
            const firstLine = lines[0].trim();
            // Check if it's a header line (contains field names)
            if (firstLine.toLowerCase().includes('questao') || 
                firstLine.toLowerCase().includes('texto') ||
                firstLine.toLowerCase().includes('tipo')) {
                templateHeaders = firstLine;
                templateStatus.textContent = '✓ Modelo carregado com sucesso!';
                templateStatus.className = 'template-status success show';
            } else {
                templateStatus.textContent = '⚠ Arquivo carregado, mas formato não reconhecido. Usando formato padrão.';
                templateStatus.className = 'template-status error show';
            }
            
            setTimeout(() => {
                templateStatus.classList.remove('show');
            }, 3000);
        }
    };
    reader.readAsText(file);
}

function parseQuestions(text) {
    const questions = [];
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        const questionMatch = line.match(/^(\d+)\s+(.+)/);
        if (questionMatch) {
            if (currentQuestion) {
                questions.push(currentQuestion);
            }
            currentQuestion = {
                number: parseInt(questionMatch[1]),
                text: questionMatch[2],
                alternatives: []
            };
        }
        else if (line.match(/^[a-e]\)/)) {
            if (currentQuestion) {
                const altText = line.substring(2).trim();
                currentQuestion.alternatives.push(altText);
            }
        }
        else if (currentQuestion && currentQuestion.alternatives.length === 0) {
            currentQuestion.text += ' ' + line;
        }
    }

    if (currentQuestion) {
        questions.push(currentQuestion);
    }

    return questions;
}

function parseGabarito(text) {
    const gabarito = {};
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);

    for (const line of lines) {
        const match = line.match(/^(\d+)\s+([A-E])/i);
        if (match) {
            gabarito[parseInt(match[1])] = match[2].toUpperCase();
        }
    }

    return gabarito;
}

function convertToSIGA() {
    const input = inputText.value.trim();
    const gabaritoInput = gabaritoText.value.trim();

    if (!input || !gabaritoInput) {
        alert('Por favor, preencha o texto da prova e o gabarito.');
        return;
    }

    const questions = parseQuestions(input);
    const gabarito = parseGabarito(gabaritoInput);

    if (questions.length === 0) {
        alert('Nenhuma questão foi encontrada. Verifique o formato do texto.');
        return;
    }

    // Calculate points per question (10 points total divided by number of questions)
    const totalQuestions = questions.length;
    const pointsPerQuestion = totalQuestions === 5 ? 2 : (totalQuestions === 10 ? 1 : (10 / totalQuestions));
    const pointsPerQuestionStr = pointsPerQuestion.toString();

    // CSV format for SIGA with exact SIGA format: semicolon delimiter, 13 columns, pipe at end
    let csvFormat = '';

    // Use exact SIGA header format (13 columns with pipe at end)
    if (templateHeaders && templateHeaders.includes(';')) {
        csvFormat = templateHeaders + '\n';
    } else {
        // Default SIGA header format with semicolons and pipe at end
        csvFormat = 'Enunciado da questão;Tipo de alternativa (1=escolha única, 2=multipla escolha, 3=resposta em texto);Alternativa A;A Correta/Valor;Alternativa B;B Correta/Valor;Alternativa C;C Correta/Valor;Alternativa D;D Correta/Valor;Alternativa E;E Correta/Valor;|\n';
    }

    for (const question of questions) {
        const correctAnswer = gabarito[question.number];

        if (!correctAnswer) {
            alert(`Gabarito não encontrado para a questão ${question.number}`);
            return;
        }

        // Escape field using QUOTE_MINIMAL approach - only quote when necessary
        function escapeField(field) {
            if (!field) return '';
            const s = String(field);
            // Only quote if contains semicolon, quotes, newlines, or carriage returns
            if (s.includes(';') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
                return '"' + s.replace(/"/g, '""') + '"';
            }
            return s;
        }

        const row = [];
        
        // Question text (enunciado)
        row.push(escapeField(question.text));
        
        // Type (always 1 for single choice)
        row.push('1');

        // Alternatives and their correct/value fields
        const altLabels = ['A', 'B', 'C', 'D', 'E'];
        for (let i = 0; i < 5; i++) {
            const altText = question.alternatives[i] || '';
            const isCorrect = altLabels[i] === correctAnswer ? pointsPerQuestionStr : '0';
            
            // Alternative text
            row.push(escapeField(altText));
            // Correct/Value (points if correct, 0 if not)
            row.push(isCorrect);
        }

        // Final pipe column
        row.push('|');

        csvFormat += row.join(';') + '\n';
    }

    outputText.value = csvFormat;
    outputSection.style.display = 'block';

    generatePreview(questions, gabarito);
    previewSection.style.display = 'block';

    outputSection.scrollIntoView({ behavior: 'smooth' });
}

function generatePreview(questions, gabarito) {
    let html = '';

    for (const question of questions) {
        const correctAnswer = gabarito[question.number];
        const altLabels = ['a', 'b', 'c', 'd', 'e'];

        html += `<div class=\"question-preview\">`;
        html += `<div class=\"question-number\">Questão ${question.number}</div>`;
        html += `<div class=\"question-text\">${question.text}</div>`;

        for (let i = 0; i < question.alternatives.length; i++) {
            const isCorrect = altLabels[i].toUpperCase() === correctAnswer;
            const className = isCorrect ? 'alternative correct' : 'alternative';
            html += `<div class=\"${className}\">${altLabels[i]}) ${question.alternatives[i]}</div>`;
        }

        html += `</div>`;
    }

    previewContent.innerHTML = html;
}

function copyToClipboard() {
    outputText.select();
    document.execCommand('copy');

    copyStatus.textContent = '✓ Copiado!';
    copyStatus.classList.add('show');

    setTimeout(() => {
        copyStatus.classList.remove('show');
    }, 2000);
}

function downloadTXT() {
    const content = outputText.value;
    
    // Convert to ISO-8859-1 (latin-1) encoding
    // Note: Browsers use UTF-8 by default, but we add charset to help
    const blob = new Blob([content], { type: 'text/csv;charset=ISO-8859-1;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'prova_siga.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}