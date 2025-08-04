// server.js

const express = require('express');
// Importa as classes necessárias do SDK do Mercado Pago
const { MercadoPagoConfig, Payment } = require('mercadopago');
const cors = require('cors');

// --- CONFIGURAÇÃO ---
const app = express();
const PORT = 3000;

// IMPORTANTE: Seu ACCESS TOKEN de PRODUÇÃO.
const YOUR_ACCESS_TOKEN = "APP_USR-487182888981079-072003-27c542b0828e1b8e5eed51596a99a1be-689339825";

// Cria um cliente de configuração com seu Access Token
const client = new MercadoPagoConfig({ accessToken: YOUR_ACCESS_TOKEN });

app.use(express.json());
app.use(cors()); // Permite que seu arquivo HTML se comunique com este servidor

// --- ROTAS DA API ---

// Rota raiz para verificar se o servidor está online
app.get('/', (req, res) => {
    res.send('<h1>Servidor do Gerador de Currículo está online!</h1><p>Abra o arquivo gerador-curriculo-saas.html para usar a aplicação.</p>');
});

// Rota para criar um pagamento
app.post('/criar-pagamento', async (req, res) => {
    try {
        const { email, valor } = req.body;
        
        const payment = new Payment(client);

        const payment_body = {
            transaction_amount: Number(valor),
            description: 'Download de Currículo Premium',
            payment_method_id: 'pix',
            payer: {
                email: email || 'test_user@test.com',
            },
            notification_url: "https://seusite.com/webhook" // Opcional para o futuro
        };

        const data = await payment.create({ body: payment_body });

        res.json({
            payment_id: data.id,
            qr_code: data.point_of_interaction.transaction_data.qr_code,
        });

    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        res.status(500).json({ error: 'Falha ao criar pagamento.' });
    }
});

// Rota para verificar o status do pagamento
app.get('/verificar-pagamento/:id', async (req, res) => {
    try {
        const payment = new Payment(client);
        const data = await payment.get({ id: req.params.id });
        res.json({ status: data.status });
    } catch (error) {
        console.error('Erro ao verificar pagamento:', error);
        res.status(500).json({ error: 'Falha ao verificar pagamento.' });
    }
});

// --- INICIAR O SERVIDOR ---
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Acesse http://localhost:${PORT} para verificar o status.`);
});