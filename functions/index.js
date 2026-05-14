const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

admin.initializeApp();

exports.createPreference = functions.https.onCall(async (data, context) => {
  // Verifica autenticação
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'É preciso estar logado para criar um pagamento.');
  }

  const { type } = data; // 'profile' ou 'services'
  const userId = context.auth.uid;
  
  const price = type === 'profile' ? 4.99 : 1.99;
  const title = type === 'profile' ? 'Destaque de Perfil (7 dias)' : 'Destaque de Serviços (7 dias)';

  // O Token de Produção deve ser setado antes via: firebase functions:config:set mercadopago.token="APP_USR-..."
  const token = functions.config().mercadopago?.token;
  if (!token) {
     throw new functions.https.HttpsError('internal', 'Chave do Mercado Pago não configurada no Firebase.');
  }

  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  try {
    const extRef = `${userId}___${type}`; // Divisor simples para resgatar no webhook

    const response = await preference.create({
      body: {
        items: [
          {
            id: type,
            title: title,
            quantity: 1,
            unit_price: price
          }
        ],
        external_reference: extRef,
        back_urls: {
          success: "https://bytebanner-26.web.app/dashboard?payment=success",
          failure: "https://bytebanner-26.web.app/dashboard?payment=failure",
          pending: "https://bytebanner-26.web.app/dashboard?payment=pending"
        },
        auto_return: "approved",
        // Webhook URL: Será acessada pelo MP para confirmar o PIX/Cartão
        notification_url: "https://us-central1-bytebanner-26.cloudfunctions.net/mpWebhook"
      }
    });

    return {
      init_point: response.init_point // URL para redirecionar o usuário pro checkout do MP
    };
  } catch (error) {
    console.error("Erro criando preferência MP:", error);
    throw new functions.https.HttpsError('internal', 'Erro ao processar integração do pagamento.');
  }
});

exports.mpWebhook = functions.https.onRequest(async (req, res) => {
  // O MP envia o ID do pagamento de duas formas dependendo da versão
  const topic = req.query.topic || req.query.type;
  
  if (topic === 'payment') {
    const paymentId = req.query.id || req.query['data.id'] || req.body?.data?.id;
    
    if (!paymentId) return res.status(400).send('No payment ID');

    try {
      const token = functions.config().mercadopago?.token;
      if (!token) return res.status(500).send('No MP Token configured');

      const client = new MercadoPagoConfig({ accessToken: token });
      const paymentApi = new Payment(client);
      
      const paymentData = await paymentApi.get({ id: paymentId });
      
      if (paymentData.status === 'approved') {
        const ref = paymentData.external_reference; // ex: "userId___profile"
        if (ref) {
          const [userId, type] = ref.split('___');
          
          if (userId && type) {
            // Pagamento confirmado! Salvar no Firestore que o usuário está destacado (Impulsionado)
            await admin.firestore().collection('users').doc(userId).update({
              isHighlighted: true,
              highlightType: type,
              // Adiciona 7 dias em ms
              highlightExpires: Date.now() + (7 * 24 * 60 * 60 * 1000)
            });
            console.log(`Sucesso: Impulsionamento ${type} ativado para o user ${userId}`);
          }
        }
      }
    } catch(err) {
      console.error("Erro processando webhook do MP:", err);
      return res.status(500).send('Webhook Process Error');
    }
  }
  
  res.status(200).send('OK');
});
