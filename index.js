const express = require('express');
const sql = require('mssql');
const cors = require('cors');
const multer = require('multer');
const { BlobServiceClient } = require('@azure/storage-blob');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Configurações globais
app.use(cors());
app.use(express.json());

// Configuração do SQL Server
const dbConfig = {
    user: 'gestaoti2',
    password: 'NovaSenha123!',
    server: 'alrflorestal.database.windows.net',
    database: 'Tabela_teste',
    options: { encrypt: true }
};

// ------------------------------------
// ROTA: GET - Listar Perguntas
app.get('/api/perguntas', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query('SELECT Id, Texto_Pergunta FROM Perguntas_Checklist WHERE Ativa = 1');
        res.json(result.recordset);
    } catch (err) {
        console.error("ERRO AO LISTAR PERGUNTAS:", err);
        res.status(500).send('Erro ao buscar perguntas');
    }
});

// ------------------------------------
// ROTA: POST - Criar nova pergunta
app.post('/api/perguntas', async (req, res) => {
    try {
        const { Texto_Pergunta } = req.body;
        await sql.connect(dbConfig);
        await sql.query(`
            INSERT INTO Perguntas_Checklist (Texto_Pergunta, Ativa)
            VALUES ('${Texto_Pergunta}', 1)
        `);
        res.send('Pergunta criada com sucesso.');
    } catch (err) {
        console.error("ERRO AO CRIAR PERGUNTA:", err);
        res.status(500).send('Erro ao criar pergunta');
    }
});

// ------------------------------------
// ROTA: DELETE - Excluir pergunta
app.delete('/api/perguntas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await sql.connect(dbConfig);
        await sql.query(`DELETE FROM Perguntas_Checklist WHERE Id = ${id}`);
        res.send('Pergunta excluída com sucesso.');
    } catch (err) {
        console.error("ERRO AO EXCLUIR PERGUNTA:", err);
        res.status(500).send('Erro ao excluir pergunta');
    }
});

// ------------------------------------
// ROTA: PUT - Editar pergunta
app.put('/api/perguntas/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { Texto_Pergunta } = req.body;
        await sql.connect(dbConfig);
        await sql.query(`
            UPDATE Perguntas_Checklist
            SET Texto_Pergunta = '${Texto_Pergunta}'
            WHERE Id = ${id}
        `);
        res.send('Pergunta atualizada com sucesso.');
    } catch (err) {
        console.error("ERRO AO EDITAR PERGUNTA:", err);
        res.status(500).send('Erro ao editar pergunta');
    }
});

// ------------------------------------
// ROTA: POST - Salvar respostas
app.post('/api/respostas', async (req, res) => {
    const { NomeResponsavel, Prefixo, Observacoes, Json_Respostas } = req.body;

    try {
        await sql.connect(dbConfig);
        const jsonString = JSON.stringify(Json_Respostas);
        await sql.query(`
            INSERT INTO Respostas_Usuarios (NomeResponsavel, Prefixo, Observacoes, Json_Respostas, DataHora)
            VALUES ('${NomeResponsavel}', '${Prefixo}', '${Observacoes}', '${jsonString}', GETDATE())
        `);
        res.send('Checklist salvo com sucesso.');
    } catch (err) {
        console.error("ERRO AO SALVAR RESPOSTAS:", err);
        res.status(500).send('Erro ao salvar respostas');
    }
});

// ------------------------------------
// Upload de Foto para o Azure Blob Storage
const upload = multer({ storage: multer.memoryStorage() });
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = 'fotos-checklist';

app.post('/api/upload-foto', upload.single('file'), async (req, res) => {
    try {
        const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);
        const containerClient = blobServiceClient.getContainerClient(containerName);

        const blobName = `${Date.now()}_${req.file.originalname}`;
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        await blockBlobClient.uploadData(req.file.buffer);

        res.json({ url: blockBlobClient.url });
    } catch (err) {
        console.error('Erro ao fazer upload no Azure Blob:', err);
        res.status(500).send('Erro ao fazer upload da imagem');
    }
});

// ------------------------------------
// Start API
app.listen(port, '0.0.0.0', () => {
    console.log(`API rodando na porta ${port}`);
});
