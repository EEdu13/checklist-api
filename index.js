const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: 'gestaoti2',
    password: 'NovaSenha123!',
    server: 'alrflorestal.database.windows.net',
    database: 'Tabela_teste',
    options: { encrypt: true }
};

// GET - Listar perguntas
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

// POST - Criar nova pergunta
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

// DELETE - Excluir pergunta
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

// PUT - Editar pergunta
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

// POST - Salvar respostas do checklist (mantendo sua rota antiga)
app.post('/api/respostas', async (req, res) => {
    const { NomeResponsavel, Prefixo, Observacoes, Json_Respostas } = req.body;

    try {
        await sql.connect(dbConfig);
        const jsonString = JSON.stringify(Json_Respostas);
        await sql.query(`
            INSERT INTO Respostas_Usuarios (NomeResponsavel, Prefixo, Observacoes, Json_Respostas, DataHora)
            VALUES ('${NomeResponsavel}', '${Prefixo}', '${Observacoes}', '${jsonString}', GETDATE())
        `);
        res.send('Checklist salvo com sucesso');
    } catch (err) {
        console.error("ERRO AO SALVAR RESPOSTAS:", err);
        res.status(500).send('Erro ao salvar respostas');
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`API rodando na porta ${port}`);
});
