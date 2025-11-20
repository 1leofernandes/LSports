require('dotenv').config();
const express = require('express');  
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./auth'); // Arquivo que contém as rotas de autenticação
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { authenticateToken, isAdmin, isFuncionarioOuAdmin } = require('./middlewares');

// Lista de e-mails autorizados para administradores
const adminEmails = ['leonardoff24@gmail.com', 'BONIEQUES2020@GMAIL.COM', 'bonieques2020@gmail.com', 'guyhenryck06@gmail.com'];

// Middleware
const corsOptions = {
    origin: ['https://cantinhodoboni.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:5500'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};
app.use(cors(corsOptions)); // Permite CORS
app.use(bodyParser.json()); // Analisa o corpo das requisições como JSON
app.use('/auth', authRoutes); // Usa as rotas de autenticação definidas no arquivo auth.js
app.use(express.static('public')); // Serve os arquivos estáticos (HTML, CSS, JS)

// Conexão ao banco de dados (MySQL)
const db = require('./db'); // Certifique-se de que 'db.js' está configurado corretamente

const secret = 'secreta'; // Defina sua chave secreta

// Middleware de autenticação
// function authenticateToken(req, res, next) {
//     const token = req.headers['authorization']?.split(' ')[1];
//     if (!token) return res.status(401).json({ message: 'Token não encontrado' });

//     jwt.verify(token, secret, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Token inválido' });
//         req.user = user;
//         next();
//     });
// }

// Middleware para verificar e atualizar roles de administrador
async function updateAdminRoles() {
    try {
        // Método 1: Usando ANY (recomendado para PostgreSQL)
        const query = `
            UPDATE usuarios 
            SET roles = 'admin' 
            WHERE email = ANY($1::text[])
        `;
        await db.query(query, [adminEmails]);
        
        console.log('Admin roles updated successfully!');
    } catch (error) {
        console.error('Error updating admin roles:', error);
    }
}

// Execute a função ao iniciar o servidor
updateAdminRoles();


// Rota para registrar usuário
app.post('/registrar', async (req, res) => {
    const { nome, email, senha, telefone } = req.body;

    if (!nome || !email || !senha || !telefone) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    try {
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (rows.length > 0) {
            return res.status(400).json({ message: 'Usuário já registrado' });
        }

        const hashedPassword = await bcrypt.hash(senha, 10);

        const role = 'cliente';
        let roles = 'cliente';

        if (adminEmails.includes(email)) {
            roles = 'admin';
        }

        await db.query(
            'INSERT INTO usuarios (nome, email, senha, telefone, role, roles) VALUES ($1, $2, $3, $4, $5, $6)',
            [nome, email, hashedPassword, telefone, role, roles]
        );

        res.status(201).json({ message: 'Usuário registrado com sucesso' });
    } catch (error) {
        console.error('Erro ao registrar usuário:', error);
        res.status(500).json({ message: 'Erro interno no servidor' });
    }
});


app.get('/agendamentos/horarios', async (req, res) => {
    const { data_agendada } = req.query;

    try {
        // Verifica os agendamentos para o dia específico
        const [rows] = await db.query('SELECT hora_inicio FROM agendamentos WHERE data_agendada = $1', [data_agendada]);

        res.json({
            agendamentos: rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao carregar horários.' });
    }
});

app.post('/registrar-funcionario', async (req, res) => {
    const { nome, email, senha, telefone } = req.body;

    try {
        // Verifica se o email já existe no banco de dados
        const { rows } = await db.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        
        if (rows.length > 0) {
            // console.log('Email já registrado');
            return res.status(400).send({ mensagem: 'Email já registrado' });
        }

        // Gera o hash da senha
        const senhaHash = await bcrypt.hash(senha, 8);
        // console.log('Hash da senha gerado:', senhaHash);

        // Insere o funcionario no banco de dados
        await db.query(
            'INSERT INTO usuarios (nome, telefone, email, senha, role) VALUES ($1, $2, $3, $4, $5)',
            [nome, telefone, email, senhaHash, 'funcionario']
        );
        // console.log('Funcionário registrado com sucesso');
        res.status(201).send({ mensagem: 'Funcionário registrado com sucesso!' });
    } catch (error) {
        console.error('Erro no servidor:', error);
        res.status(500).send({ erro: 'Erro ao registrar funcionário' });
    }
});

app.post('/auth/resetar-senha', async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Verifica o token
        const decoded = jwt.verify(token, secret);
        
        // Encripta a nova senha
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Atualiza a senha no banco de dados
        await db.query('UPDATE usuarios SET senha = $1 WHERE id = $2', [hashedPassword, decoded.id]);

        res.status(200).json({ message: 'Senha redefinida com sucesso!' });
    } catch (error) {
        console.error('Erro ao redefinir a senha:', error);
        res.status(400).json({ message: 'Token inválido ou expirado.' });
    }
});
// Remova a rota duplicada de login no server.js, já que ela está no auth.js

// Rota para obter o ID do funcionario autenticado
app.get('/user-info', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; // Captura o token de 'Bearer <token>'
    
    if (!token) {
        return res.status(401).send({ mensagem: 'Token não fornecido' });
    }

    try {
        const decoded = jwt.verify(token, secret); // Decodifica o token usando a chave secreta
        res.send({ id: decoded.id, role: decoded.role });
    } catch (err) {
        res.status(401).send({ mensagem: 'Token inválido' });
    }
});


// Rota para obter a lista de funcionarios
app.get('/funcionarios', async (req, res) => {
    try {
        const { rows } = await db.query("SELECT * FROM usuarios WHERE role = 'funcionario'");
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao carregar funcionarios:', error);
        res.status(500).json({ message: 'Erro ao carregar funcionarios' });
    }
});

app.get('/horarios-ocupados', async (req, res) => {
    const { data, quadra } = req.query;

    if (!data) {
        return res.status(400).json({ message: "Data é obrigatória." });
    }

    try {
        let query = "SELECT hora_inicio, hora_fim, quadra FROM agendamentos WHERE data_agendada = $1";
        const params = [data];
        
        // Se veio quadra válida (1 ou 2), adicionamos ao WHERE
        if (quadra && !isNaN(quadra)) {
            query += " AND quadra = $2";
            params.push(parseInt(quadra));
        }

        const { rows } = await db.query(query, params);

        const horariosOcupadosQuadra1       = new Set();
        const horariosOcupadosQuadra2       = new Set();
        const horariosInicioBloqueadosQuadra1 = new Set();
        const horariosInicioBloqueadosQuadra2 = new Set();
        const horasFimQuadra1               = new Set();
        const horasFimQuadra2               = new Set();

        rows.forEach(agendamento => {
            const horaInicio = agendamento.hora_inicio.slice(0, 5);
            let horaAtual     = horaInicio;
            const ultimaHoraOcupada = agendamento.hora_fim.slice(0, 5);
            const quadraNum   = agendamento.quadra;

            // Marca o início bloqueado
            if (quadraNum === 1) {
                horariosInicioBloqueadosQuadra1.add(horaInicio);
            } else if (quadraNum === 2) {
                horariosInicioBloqueadosQuadra2.add(horaInicio);
            }

            // Preenche, em increments de 30 min, todos os slots “ocupados” (sem incluir o hora_fim)
            while (horaAtual < ultimaHoraOcupada) {
                const [h, m] = horaAtual.split(':').map(Number);
                const horaFormatada = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

                if (quadraNum === 1) {
                    horariosOcupadosQuadra1.add(horaFormatada);
                } else {
                    horariosOcupadosQuadra2.add(horaFormatada);
                }

                // incrementa 30 minutos
                let novoMin = m + 30;
                let novoHora = h;
                if (novoMin === 60) {
                    novoHora += 1;
                    novoMin = 0;
                }
                horaAtual = `${String(novoHora).padStart(2, '0')}:${String(novoMin).padStart(2, '0')}`;
            }

            // Adiciona a hora_fim ao conjunto de “finalizações”
            if (quadraNum === 1) {
                horasFimQuadra1.add(ultimaHoraOcupada);
            } else {
                horasFimQuadra2.add(ultimaHoraOcupada);
            }
        });

        return res.json({ 
            horariosOcupadosQuadra1: [...horariosOcupadosQuadra1],
            horariosOcupadosQuadra2: [...horariosOcupadosQuadra2],
            horariosInicioBloqueadosQuadra1: [...horariosInicioBloqueadosQuadra1],
            horariosInicioBloqueadosQuadra2: [...horariosInicioBloqueadosQuadra2],
            horasFimQuadra1: [...horasFimQuadra1],
            horasFimQuadra2: [...horasFimQuadra2],
            reservas: rows // Mantemos todas as reservas completas para eventuais verificações no front-end
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Erro ao buscar horários ocupados." });
    }
});


// Rota para buscar agendamentos do usuário
app.get('/meus-agendamentos', authenticateToken, async (req, res) => {
    const usuario_id = req.user.id;

    try {
        const { rows } = await db.query(
            `SELECT id, data_agendada, hora_inicio, hora_fim, quadra, status, payment_method
            FROM agendamentos 
            WHERE usuario_id = $1 
            AND data_agendada >= CURRENT_DATE
            ORDER BY data_agendada, hora_inicio`,
            [usuario_id]
        );

        res.json(rows);
    } catch (error) {
        console.error('Erro ao buscar agendamentos:', error);
        res.status(500).json({ message: "Erro ao buscar agendamentos." });
    }
});


app.delete('/cancelar-agendamento/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const usuario_id = req.user.id;

    try {
        // console.log(`Tentando excluir agendamento ID: ${id} do usuário ID: ${usuario_id}`);

        // Verifica se o agendamento pertence ao usuário antes de excluir
        const { rows } = await db.query(
            "SELECT * FROM agendamentos WHERE id = $1 AND usuario_id = $2",
            [id, usuario_id]
        );

        if (rows.length === 0) {
            // console.log("Agendamento não encontrado ou usuário não autorizado.");
            return res.status(403).json({ message: "Agendamento não encontrado ou não autorizado." });
        }

        // Remove o agendamento
        await db.query("DELETE FROM agendamentos WHERE id = $1", [id]);

        // console.log("Agendamento removido com sucesso.");
        res.json({ message: "Agendamento cancelado com sucesso!" });
    } catch (error) {
        console.error('Erro ao cancelar agendamento:', error);
        res.status(500).json({ message: "Erro ao cancelar agendamento.", error: error.message });
    }
});



// Rota para salvar um novo agendamento
app.post('/agendar', async (req, res) => {
    try {
        const { usuario_id, data_agendada, hora_inicio, hora_fim, quadra, payment_method } = req.body;

        // Verifica se todos os campos foram preenchidos
        if (!usuario_id || !data_agendada || !hora_inicio || !hora_fim || !quadra) {
            return res.status(400).json({ message: 'Preencha todos os campos' });
        }

        // Verifica se já existe um agendamento nesse horário e quadra
        const verificaAgendamento = `
            SELECT * FROM agendamentos 
            WHERE data_agendada = $1 
            AND quadra = $2
            AND (
                (hora_inicio >= $3 AND hora_inicio < $4) 
                OR (hora_fim > $5 AND hora_fim <= $6) 
                OR (hora_inicio <= $7 AND hora_fim >= $8)
            )
        `;

        const { rows } = await db.query(verificaAgendamento, [
            data_agendada, quadra, hora_inicio, hora_fim, hora_inicio, hora_fim, hora_inicio, hora_fim
        ]);

        if (rows.length > 0) {
            return res.status(400).json({ message: 'Horário já reservado nesta quadra' });
        }

        // Insere o agendamento no banco de dados
        const inserirAgendamento = `
            INSERT INTO agendamentos (usuario_id, data_agendada, hora_inicio, hora_fim, quadra, created_at, status, payment_method)
            VALUES ($1, $2, $3, $4, $5, NOW(), 'nao_pago', $6)
        `;

        await db.query(inserirAgendamento, [usuario_id, data_agendada, hora_inicio, hora_fim, quadra, payment_method]);

        return res.status(201).json({ message: 'Agendamento realizado com sucesso!' });

    } catch (error) {
        console.error('Erro ao salvar agendamento:', error);
        return res.status(500).json({ message: 'Erro interno do servidor' });
    }
});
  
// function authenticateToken(req, res, next) {
//     const authHeader = req.headers['authorization'];
//     const token = authHeader && authHeader.split(' ')[1];

//     if (!token) {
//         return res.status(401).json({ message: 'Token não fornecido' });
//     }

//     jwt.verify(token, secret, (err, user) => {
//         if (err) return res.status(403).json({ message: 'Token inválido' });
//         req.user = user;
//         next();
//     });
// }


// Rota para obter todos os agendamentos funcionario
app.get('/agendamentos', authenticateToken, async (req, res) => {
    try {
        // Consulta para buscar todos os agendamentos a partir da data atual
        const { rows } = await db.query(`
            SELECT 
                a.id,
                u.nome AS nome_cliente,
                u.telefone AS telefone_cliente,
                a.data_agendada,
                a.hora_inicio,
                a.hora_fim,
                a.quadra,
                a.status,
                a.payment_method
            FROM agendamentos a
            JOIN usuarios u ON a.usuario_id = u.id
            WHERE a.data_agendada >= CURRENT_DATE
            ORDER BY a.data_agendada, a.hora_inicio
        `);

        res.json(rows || []);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
});


// Rota para adicionar um bloqueio
app.post('/bloquear-horario', authenticateToken, async (req, res) => {

    const usuarioId = req.user.id;
    const { data, hora_inicio, hora_fim } = req.body;

    try {
        // Verifica se o usuário é um funcionário
        const { rows } = await db.query(
            `SELECT role, roles FROM usuarios WHERE id = $1`, 
            [usuarioId]
        );

        if (rows.length === 0 || 
            (rows[0].role !== 'funcionario' && rows[0].roles !== 'admin')) {
            return res.status(403).json({ message: 'Acesso restrito a funcionários e administradores' });
        }

        // Insere o bloqueio no banco de dados
        await db.query(
            `INSERT INTO bloqueios (data, hora_inicio, hora_fim, quadra) 
            VALUES ($1, $2, $3, $4)`, 
            [data, hora_inicio, hora_fim, quadra]
        );

        return res.json({ message: 'Horário bloqueado com sucesso!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Erro ao bloquear o horário' });
    }
});


app.get('/horarios-bloqueados', async (req, res) => {
    const { data, quadra } = req.query;

    if (!data) {
        return res.status(400).json({ message: "A data é obrigatória." });
    }

    try {
        const diaSemana = new Date(data).getDay();
        let quadraNum = null;

        // Validação da quadra
        if (quadra && !isNaN(quadra)) {
            quadraNum = parseInt(quadra);
        }

        // Bloqueios específicos (sem quadra)
        const { rows: bloqueios } = await db.query(
            "SELECT hora_inicio, hora_fim FROM bloqueios WHERE data = $1",
            [data]
        );

        // Bloqueios recorrentes (com validação de quadra)
        let queryRecorrentes = "SELECT start_time, end_time, quadra FROM blocked_slots WHERE day_of_week = $1";
        const paramsRecorrentes = [diaSemana];
        
        if (quadraNum !== null) {
            queryRecorrentes += " AND (quadra IS NULL OR quadra = $2)";
            paramsRecorrentes.push(quadraNum);
        }

        const { rows: bloqueiosRecorrentes } = await db.query(queryRecorrentes, paramsRecorrentes);

        // Função para gerar horários entre inicio e fim
        const gerarHorariosBloqueados = (inicio, fim) => {
            const horarios = [];
            let [hora, minuto] = inicio.split(':').map(Number);
            const [horaFim, minutoFim] = fim.split(':').map(Number);
            
            while (hora < horaFim || (hora === horaFim && minuto <= minutoFim)) {
                horarios.push(`${String(hora).padStart(2, '0')}:${String(minuto).padStart(2, '0')}`);
                minuto += 30;
                if (minuto >= 60) {
                    hora++;
                    minuto = 0;
                }
            }
            return horarios;
        };

        // Processar todos os bloqueios
        const horariosBloqueados = [];
        const bloqueiosEspecificos = [];
        const bloqueiosRecorrentesFormatados = [];

        // Bloqueios específicos
        bloqueios.forEach(bloqueio => {
            const horarios = gerarHorariosBloqueados(bloqueio.hora_inicio, bloqueio.hora_fim);
            bloqueiosEspecificos.push({
                tipo: 'especifico',
                hora_inicio: bloqueio.hora_inicio,
                hora_fim: bloqueio.hora_fim,
                quadra: bloqueio.quadra,
                horarios
            });
            horariosBloqueados.push(...horarios);
        });

        // Bloqueios recorrentes
        bloqueiosRecorrentes.forEach(bloqueio => {
            const horarios = gerarHorariosBloqueados(bloqueio.start_time, bloqueio.end_time);
            bloqueiosRecorrentesFormatados.push({
                tipo: 'recorrente',
                hora_inicio: bloqueio.start_time,
                hora_fim: bloqueio.end_time,
                quadra: bloqueio.quadra,
                horarios
            });
            horariosBloqueados.push(...horarios);
        });

        // Remover horários duplicados
        const horariosUnicos = [...new Set(horariosBloqueados)];

        res.json({ 
            bloqueiosEspecificos: bloqueios,
            bloqueiosRecorrentes: bloqueiosRecorrentesFormatados,
            // horariosBloqueados: horariosUnicos
        });

    } catch (error) {
        console.error("Erro ao buscar horários bloqueados:", error);
        res.status(500).json({ message: "Erro ao buscar horários bloqueados." });
    }
});

// Rota para bloquear um dia inteiro
app.post('/bloquear-dia', authenticateToken, async (req, res) => {
    const usuarioId = req.user.id;
    const { data } = req.body;

    try {
        // Verifica se o usuário é um funcionário OU admin
        const { rows } = await db.query(
            `SELECT role, roles FROM usuarios WHERE id = $1`, 
            [usuarioId]
        );

        if (rows.length === 0 || 
            (rows[0].role !== 'funcionario' && rows[0].roles !== 'admin')) {
            return res.status(403).json({ message: 'Acesso restrito a funcionários e administradores' });
        }

        // Verifica se o dia já está bloqueado
        const { rows: bloqueios } = await db.query(
            `SELECT id FROM bloqueios WHERE data = $1`,
            [data]
        );

        if (bloqueios.length > 0) {
            return res.status(400).json({ message: 'Este dia já está bloqueado' });
        }

        // Insere o bloqueio no banco de dados
        await db.query(
            `INSERT INTO bloqueios (data, hora_inicio, hora_fim, quadra) 
            VALUES ($1, $2, $3, $4)`,
            [data, '00:00:00', '23:59:59', quadra]
        );

        res.json({ message: 'Dia bloqueado com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao bloquear o dia' });
    }
});

app.get('/bloqueios', authenticateToken, async (req, res) => {
    try {
        const { rows } = await db.query(
            "SELECT id, data, hora_inicio, hora_fim FROM bloqueios WHERE data >= CURRENT_DATE"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar bloqueios' });
    }
});


app.delete('/bloqueios/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM bloqueios WHERE id = $1", [id]);
        res.json({ message: 'Bloqueio removido com sucesso!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao remover bloqueio' });
    }
});

// Rota de login para administradores
app.post('/admin-login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "E-mail e senha são obrigatórios." });
    }

    try {
        const { rows } = await db.query('SELECT id, nome, email, senha FROM usuarios WHERE email = $1', [email]);

        // console.log("Resultado da consulta:", rows);

        const user = rows[0];
        if (!user) {
            // console.log("Usuário não encontrado.");
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        // console.log("Usuário encontrado:", user);

        if (!adminEmails.includes(user.email)) {
            // console.log("Acesso negado: O e-mail não está na lista de administradores.");
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.senha);
        if (!isPasswordValid) {
            // console.log("Senha inválida.");
            return res.status(401).json({ message: "Senha inválida." });
        }

        const token = jwt.sign(
            { id: user.id, nome: user.nome, email: user.email },
            'secreta',
            { expiresIn: '365d' }
        );

        console.log("Login de administrador bem-sucedido.");
        res.status(200).json({ 
            message: "Login de administrador bem-sucedido.",
            token,
            isAdmin: true 
        });
    } catch (error) {
        console.error("Erro ao tentar fazer login de admin:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

// Protege a rota de administrador (página admin.html)
app.get('/admin', authenticateToken, (req, res) => {
    try {
        if (!adminEmails.includes(req.user.email)) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        res.sendFile(path.join(__dirname, 'public', 'admin.html'));
    } catch (error) {
        console.error('Erro ao verificar token:', error);
        res.status(403).json({ message: 'Token inválido' });
    }
});

// Rota para registrar um novo funcionario
app.post('/admin/funcionarios', authenticateToken, async (req, res) => {
    const { nome, telefone, email, senha } = req.body;

    try {
        if (!adminEmails.includes(req.user.email)) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        await db.query(
            `INSERT INTO usuarios (nome, telefone, email, senha, role) VALUES ($1, $2, $3, $4, 'funcionario')`,
            [nome, telefone, email, senha]
        );

        res.status(201).json({ message: 'Funcionário registrado com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao registrar funcionário' });
    }
});


// Rota para listar todos os funcionarios
app.get('/admin/funcionarios', authenticateToken, async (req, res) => {
    try {
        if (req.user.roles !== 'admin') {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const { rows } = await db.query(`SELECT id, nome, email FROM usuarios WHERE role = 'funcionario'`);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao buscar funcionarios' });
    }
});


// Rota para excluir um funcionário
app.delete('/admin/funcionarios/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        // console.log(req.user);

        if (!adminEmails.includes(req.user.email)) {
            return res.status(403).json({ message: 'Acesso negado' });
        }

        const { rowCount } = await db.query(
            `DELETE FROM usuarios WHERE id = $1 AND role = 'funcionario'`, 
            [id]
        );

        if (rowCount === 0) {
            return res.status(404).json({ message: 'Funcionário não encontrado ou já excluído' });
        }

        res.json({ message: 'Funcionário excluído com sucesso' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao excluir funcionário' });
    }
});

// Rota para criar bloqueio recorrente
app.post('/bloquear-horario-recorrente', authenticateToken, async (req, res) => {
    try {
        const { dia_semana, hora_inicio, hora_fim, quadra } = req.body;
        
        const bloqueio = await db.query(
            `INSERT INTO blocked_slots
             (day_of_week, start_time, end_time, quadra) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [dia_semana, hora_inicio, hora_fim, quadra]
        );
        
        res.status(201).json(bloqueio.rows[0]);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para listar bloqueios recorrentes
app.get('/bloqueios-recorrentes', authenticateToken, async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM blocked_slots');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Rota para remover bloqueio recorrente
app.delete('/bloqueios-recorrentes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('DELETE FROM blocked_slots WHERE id = $1', [id]);
        res.json({ message: 'Bloqueio recorrente removido com sucesso' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


app.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT NOW()');
        res.json({ status: 'Online', dbTime: result.rows[0].now });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/relatorio-financeiro', authenticateToken, async (req, res) => {
    try {
        const { periodo = '3' } = req.query; // Padrão: últimos 3 meses
        
        // 1. Validar o parâmetro periodo
        if (isNaN(periodo) || periodo < 1 || periodo > 12) {
            return res.status(400).json({ error: 'Período inválido. Use um valor entre 1 e 12 meses.' });
        }

        // 2. Query segura usando parameterized query
        const { rows: agendamentos } = await db.query(`
            SELECT 
                data_agendada,
                hora_inicio,
                hora_fim,
                quadra,
                EXTRACT(DOW FROM data_agendada) as dia_semana
            FROM agendamentos
            WHERE data_agendada >= NOW() - ($1 || ' months')::INTERVAL
            AND data_agendada <= NOW()
            ORDER BY data_agendada
        `, [periodo]);

        // 3. Processamento dos dados
        const report = {
            mensal: {},
            diario: {},
            por_dia_semana: Array(7).fill(0).map((_, i) => ({
                dia: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][i],
                total: 0,
                agendamentos: 0,
                quadras: {} // Adicionando detalhes por quadra
            })),
            quadras: {} // Dados agregados por quadra
        };

        agendamentos.forEach(ag => {
            const date = new Date(ag.data_agendada);
            const mesAno = `${date.getFullYear()}-${(date.getMonth()+1).toString().padStart(2, '0')}`;
            const diaMes = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth()+1).toString().padStart(2, '0')}`;
            const diaSemana = ag.dia_semana;
            const quadra = ag.quadra || '0'; // Quadra 0 para não especificada

            // Cálculo do valor
            const inicio = new Date(`1970-01-01T${ag.hora_inicio}`);
            const fim = new Date(`1970-01-01T${ag.hora_fim}`);
            const diffMinutos = (fim - inicio) / 60000;
            const valor = Math.floor(diffMinutos / 60) * 50 + ((diffMinutos % 60) >= 30 ? 25 : 0);

            // Acumular por mês
            if (!report.mensal[mesAno]) {
                report.mensal[mesAno] = { total: 0, agendamentos: 0, quadras: {} };
            }
            report.mensal[mesAno].total += valor;
            report.mensal[mesAno].agendamentos += 1;
            
            // Acumular por quadra no mês
            if (!report.mensal[mesAno].quadras[quadra]) {
                report.mensal[mesAno].quadras[quadra] = { total: 0, agendamentos: 0 };
            }
            report.mensal[mesAno].quadras[quadra].total += valor;
            report.mensal[mesAno].quadras[quadra].agendamentos += 1;

            // Acumular por dia
            if (!report.diario[diaMes]) {
                report.diario[diaMes] = { total: 0, agendamentos: 0, quadras: {} };
            }
            report.diario[diaMes].total += valor;
            report.diario[diaMes].agendamentos += 1;
            
            // Acumular por quadra no dia
            if (!report.diario[diaMes].quadras[quadra]) {
                report.diario[diaMes].quadras[quadra] = { total: 0, agendamentos: 0 };
            }
            report.diario[diaMes].quadras[quadra].total += valor;
            report.diario[diaMes].quadras[quadra].agendamentos += 1;

            // Acumular por dia da semana
            report.por_dia_semana[diaSemana].total += valor;
            report.por_dia_semana[diaSemana].agendamentos += 1;
            
            // Acumular por quadra no dia da semana
            if (!report.por_dia_semana[diaSemana].quadras[quadra]) {
                report.por_dia_semana[diaSemana].quadras[quadra] = { total: 0, agendamentos: 0 };
            }
            report.por_dia_semana[diaSemana].quadras[quadra].total += valor;
            report.por_dia_semana[diaSemana].quadras[quadra].agendamentos += 1;

            // Acumular dados gerais por quadra
            if (!report.quadras[quadra]) {
                report.quadras[quadra] = { total: 0, agendamentos: 0 };
            }
            report.quadras[quadra].total += valor;
            report.quadras[quadra].agendamentos += 1;
        });

        res.json(report);

    } catch (error) {
        console.error('Erro no relatório financeiro:', error);
        res.status(500).json({ 
            error: 'Erro ao gerar relatório',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

app.delete('/agendamentos/:id', authenticateToken, async (req, res) => {
  const agendamentoId = req.params.id;

  try {
    const result = await db.query('DELETE FROM agendamentos WHERE id = $1', [agendamentoId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    return res.status(200).json({ message: 'Agendamento excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir agendamento:', error);
    res.status(500).json({ error: 'Erro ao excluir agendamento' });
  }
});

app.post('/verificar-disponibilidade', async (req, res) => {
  try {
    const { data_agendada, hora_inicio, hora_fim, quadra } = req.body;

    // Validação da quadra
    const quadraNum = parseInt(quadra);
    if (isNaN(quadraNum) || (quadraNum !== 1 && quadraNum !== 2)) {
      return res.status(400).json({ message: "Quadra inválida" });
    }

    // 1) Verificar conflitos com agendamentos existentes
    //    Aqui usamos a lógica "OVERLAP" própria:
    //    conflito se NÃO (hora_fim_existente <= nova_hora_inicio OR hora_inicio_existente >= nova_hora_fim)
    const conflitosAgendamentos = await db.query(`
      SELECT id 
        FROM agendamentos
       WHERE data_agendada = $1
         AND quadra = $2
         AND NOT (
           hora_fim <= $3 
           OR hora_inicio >= $4
         )
    `, [data_agendada, quadraNum, hora_inicio, hora_fim]);

    // 2) Verificar conflitos com bloqueios específicos
    const conflitosEspecificos = await db.query(`
      SELECT id
        FROM bloqueios
       WHERE data = $1
         AND (quadra IS NULL OR quadra = $2)
         AND NOT (
           hora_fim <= $3
           OR hora_inicio >= $4
         )
    `, [data_agendada, quadraNum, hora_inicio, hora_fim]);

    // 3) Verificar conflitos com bloqueios recorrentes
    const diaSemana = new Date(data_agendada).getDay();
    const conflitosRecorrentes = await db.query(`
      SELECT id
        FROM blocked_slots
       WHERE day_of_week = $1
         AND (quadra IS NULL OR quadra = $2)
         AND NOT (
           end_time <= $3
           OR start_time >= $4
         )
    `, [diaSemana, quadraNum, hora_inicio, hora_fim]);

    const conflitos = 
      conflitosAgendamentos.rowCount > 0 ||
      conflitosEspecificos.rowCount   > 0 ||
      conflitosRecorrentes.rowCount   > 0;

    return res.json({
      disponivel: !conflitos,
      conflitos: {
        agendamentos: conflitosAgendamentos.rowCount > 0,
        bloqueios:    conflitosEspecificos.rowCount > 0,
        recorrentes:  conflitosRecorrentes.rowCount > 0
      }
    });
  } catch (error) {
    console.error("Erro na verificação:", error);
    return res.status(500).json({
      message: "Erro na verificação",
      error: error.message
    });
  }
});

app.put('/agendamentos/:id/marcar-pago', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const usuario = req.user;
        
        // Verificar se é admin ou funcionário
        // if (usuario.role !== 'funcionario' && usuario.roles !== 'admin') {
        //     return res.status(403).json({ message: 'Acesso restrito' });
        // }

        await db.query(
            `UPDATE agendamentos SET status = 'pago' WHERE id = $1`,
            [id]
        );
        
        res.json({ message: 'Agendamento marcado como pago!' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erro ao atualizar' });
    }
});

app.get('/agendamentos/historico', authenticateToken, async (req, res) => {
  try {
    const { rows } = await db.query(`
      SELECT 
        a.id,
        u.nome      AS nome_cliente,
        u.telefone  AS telefone_cliente,
        a.data_agendada,
        a.hora_inicio,
        a.hora_fim,
        a.quadra,
        a.status,
        a.payment_method
      FROM agendamentos a
      JOIN usuarios u
        ON a.usuario_id = u.id
      ORDER BY 
        a.data_agendada DESC,
        a.hora_inicio  DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error('Erro ao buscar histórico de agendamentos:', error);
    res.status(500).json({ message: 'Erro ao buscar histórico' });
  }
});


// Inicia o servidor
app.listen(port, () => {
    // console.log(`Servidor rodando em http://localhost:${port}`);
    console.log ('servidor rodando');
});
