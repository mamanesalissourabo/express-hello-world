const express = require('express');
const app = express();

// Variables d'environnement
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'EAAQQ3aRWelMBRHqiSqTA1iJ1NXFZBAvpDic12thrODTUEJiUqKNSd397SsrA7ZC9ntVZCnYUy79vkDmvcFFqeTPBvyOReB4HgiRALxsu5HdqDjwiZC2okhC7vmjvm9twV17q41V0R0jNZCOy27aN3sG4DWmxZAN6jVhgD6dWs1oC55ASRCzV0djtIywtDZAXFJdHAMomn3WFAHCQ3jUYoNx5mGpKb1iYy17S4vK5ZBoYFEQXyntSkutYzX0cMJQA5gNH5YFvKS6Lzpd1ZAZAd1YgCZB';
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN || 'vibecoding';

const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Route racinepour vérifier que le serveur fonctionne
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'WhatsApp Webhook Server is running',
    webhook: '/webhooks/whatsapp'
  });
});

// WEBHOOK WHATSAPP - GET (Vérification par Meta)
app.get('/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`\n📨 GET /webhooks/whatsapp`);
  console.log(`  mode: ${mode}`);
  console.log(`  token: ${token ? '✓ reçu' : '✗ manquant'}`);
  console.log(`  challenge: ${challenge ? '✓ reçu' : '✗ manquant'}`);

  // Vérifier mode et token
  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log(`✅ Webhook VALIDÉ avec succès !`);
    // IMPORTANT: retourner le challenge en TEXTE PUR, pas du JSON
    res.status(200)
      .type('text/plain')
      .send(challenge);
  } else {
    console.log(`❌ Échec de validation`);
    console.log(`  Expected token: ${VERIFY_TOKEN}`);
    console.log(`  Received token: ${token}`);
    res.status(403).json({ error: 'Forbidden' });
  }
});

// WEBHOOK WHATSAPP - POST (Réception des messages)
app.post('/webhooks/whatsapp', (req, res) => {
  const body = req.body;
  
  console.log(`\n📨 POST /webhooks/whatsapp`);
  console.log(`Payload reçu:`, JSON.stringify(body, null, 2));

  // Toujours répondre 200 à Meta immédiatement
  res.status(200).json({ status: 'received' });

  // Traiter le message en arrière-plan
  if (body.object === 'whatsapp_business_account' && body.entry) {
    body.entry.forEach((entry) => {
      entry.changes?.forEach((change) => {
        const value = change.value;
        const messages = value.messages || [];
        
        messages.forEach((message) => {
          console.log(`\n💬 Nouveau message reçu:`);
          console.log(`   De: ${message.from}`);
          console.log(`   Type: ${message.type}`);
          if (message.text) {
            console.log(`   Texte: ${message.text.body}`);
          }
          // TODO: Appeler ton Crew AI ici pour traiter le message
        });
      });
    });
  }
});

// Démarrer le serveur
const server = app.listen(port, () => {
  console.log(`\n✅ WhatsApp Webhook Server démarré`);
  console.log(`   Port: ${port}`);
  console.log(`   Verify Token: ${VERIFY_TOKEN}`);
  console.log(`   GET:  /webhooks/whatsapp (Vérification Meta)`);
  console.log(`   POST: /webhooks/whatsapp (Réception messages)`);
  console.log(`\n`);
});

// Gestion des timeouts
server.keepAliveTimeout = 120 * 1000;
server.headersTimeout = 120 * 1000;
