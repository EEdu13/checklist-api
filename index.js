const express = require('express');
const sql = require('mssql');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const dbConfig = {
    user: 'gestaoti2',
    password: 'NovaSenha123!',
    server: 'alrflorestal.database.windows.net',
    database: 'Tabela_teste',
    options: {
        encrypt: true
    }
};

app.get('/api/perguntas', async (req, res) => {
    try {
        await sql.connect(dbConfig);
        const result = await sql.query('SELECT Id, Texto_Pergunta FROM Perguntas_Checklist WHERE Ativa = 1');
        res.json(result.recordset);
    } catch (err) {
        console.error("ERRO DETALHADO:", err);  // <--- Essa linha vai mostrar o erro real no terminal
        res.status(500).send('Erro ao buscar perguntas');
    }
});


app.post('/api/respostas', async (req, res) => {
    const { NomeResponsavel, Prefixo, Observacoes, Json_Respostas } = req.body;

    try {
        await sql.connect(dbConfig);

        const jsonString = JSON.stringify(Json_Respostas);

        await sql.query(`
            INSERT INTO Respostas_Usuarios (NomeResponsavel, Prefixo, Observacoes, Json_Respostas, DataHora)
            VALUES (
                '${NomeResponsavel}',
                '${Prefixo}',
                '${Observacoes}',
                '${jsonString}',
                GETDATE()
            )
        `);

        res.send('Checklist salvo com sucesso');
    } catch (err) {
        console.error("ERRO AO SALVAR RESPOSTAS:", err);
        res.status(500).send('Erro ao salvar respostas');
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log(`API rodando em http://0.0.0.0:${port}`);
});

