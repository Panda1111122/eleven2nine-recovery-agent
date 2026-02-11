const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios'); // We need this to send requests to WhatsApp

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// --- YOUR WHATSAPP SECRETS (PASTE FROM FACEBOOK PAGE HERE) ---
const TOKEN = 'EAAX2B464K9cBQvhI9jYBisV5aQEungAlpL91C5S6Tx59ZBKfFCqXaQhzearjcQ6fZCZCP0DjnmzvjSJPEgdia0Ir88MfP1VKmRimKgduqLA8Su0JDVoka5aHjmAPQzOw2dKC2ktZAtMPbqpjpU8z4AIaInZBsIixoiPR8ogxiHNXz2lLRpWiD3mxMaJrHQy7oBD7No4nEa6lse650ZCEOSUvqEbwBknbeIIwlwBdrQEhViUNiFG0PfVXZBMLZCXoQae7gSkHemze8Xmj2fqTSVnM9PYi';
const PHONE_NUMBER_ID = '+1 555 138 2371';
// -------------------------------------------------------------

app.get('/', (req, res) => {
    res.send('1129 Agent: Ready to Recover Sales! 💸');
});

app.post('/webhook/abandoned-cart', async (req, res) => {
    console.log('🔔 DOORBELL RUNG! Processing Data...');

    const cartData = req.body;
    
    // 1. Extract Data safely
    const customerName = cartData.customer ? cartData.customer.first_name : 'Friend';
    // Shopify often sends phone as '+91...', we need to remove the '+' for WhatsApp sometimes, 
    // but Cloud API usually handles it. We'll use the raw one first.
    let customerPhone = cartData.customer ? cartData.customer.phone : null;
    
    // 2. The "Recovery Link" - This takes them back to their cart!
    const recoveryUrl = cartData.abandoned_checkout_url;

    console.log(`👤 Customer: ${customerName}`);
    console.log(`📱 Phone: ${customerPhone}`);

    if (customerPhone) {
        // 3. Send Message via WhatsApp Cloud API
        try {
            await axios({
                method: 'POST',
                url: `https://graph.facebook.com/v17.0/${PHONE_NUMBER_ID}/messages`,
                headers: {
                    'Authorization': `Bearer ${TOKEN}`,
                    'Content-Type': 'application/json'
                },
                data: {
                    messaging_product: 'whatsapp',
                    to: customerPhone,
                    type: 'text',
                    text: {
                        // The magic message
                        body: `Hey ${customerName}! 👋 It's Sara from 1129. \n\nWe noticed you left some items in your cart. No worries! \n\nClick here to complete your order (and maybe get a surprise?): \n${recoveryUrl}`
                    }
                }
            });
            console.log('✅ WHATSAPP SENT SUCCESSFULLY!');
        } catch (error) {
            console.error('❌ WhatsApp Failed:', error.response ? error.response.data : error.message);
        }
    } else {
        console.log('⚠️ No phone number found to send message.');
    }

    res.status(200).send('Received');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
