const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// --- YOUR WHATSAPP SECRETS ---
const TOKEN = 'EAAX2B464K9cBQvhI9jYBisV5aQEungAlpL91C5S6Tx59ZBKfFCqXaQhzearjcQ6fZCZCP0DjnmzvjSJPEgdia0Ir88MfP1VKmRimKgduqLA8Su0JDVoka5aHjmAPQzOw2dKC2ktZAtMPbqpjpU8z4AIaInZBsIixoiPR8ogxiHNXz2lLRpWiD3mxMaJrHQy7oBD7No4nEa6lse650ZCEOSUvqEbwBknbeIIwlwBdrQEhViUNiFG0PfVXZBMLZCXoQae7gSkHemze8Xmj2fqTSVnM9PYi';
const PHONE_NUMBER_ID = '980667585134254';
// -----------------------------

app.get('/', (req, res) => {
    res.send('1129 Agent: Sherlock Mode 🕵️‍♂️');
});

app.post('/webhook/abandoned-cart', async (req, res) => {
    console.log('🔔 DOORBELL RUNG! Searching for phone number...');

    const data = req.body;
    const customerName = data.customer ? data.customer.first_name : 'Friend';
    const recoveryUrl = data.abandoned_checkout_url;

    // --- THE SHERLOCK HOLMES SEARCH ---
    // We look in 4 different places for the phone number
    let phone = null;

    if (data.customer && data.customer.phone) {
        phone = data.customer.phone;
        console.log('📍 Found phone in: Customer Profile');
    } else if (data.phone) {
        phone = data.phone;
        console.log('📍 Found phone in: Top Level Data');
    } else if (data.shipping_address && data.shipping_address.phone) {
        phone = data.shipping_address.phone;
        console.log('📍 Found phone in: Shipping Address');
    } else if (data.billing_address && data.billing_address.phone) {
        phone = data.billing_address.phone;
        console.log('📍 Found phone in: Billing Address');
    }

    console.log(`👤 Customer: ${customerName}`);
    console.log(`📱 Phone Found: ${phone}`);

    // --- SEND WHATSAPP ---
    if (phone) {
        // Remove the '+' for WhatsApp if needed, but Cloud API usually likes it.
        // Let's send it!
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
                    to: phone,
                    type: 'text',
                    text: {
                        body: `Hey ${customerName}! 👋 Divyansh's AI here. \n\nYou left something behind! Grab it here: \n${recoveryUrl}`
                    }
                }
            });
            console.log('✅ WHATSAPP SENT SUCCESSFULLY!');
        } catch (error) {
            console.error('❌ WhatsApp Failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        }
    } else {
        console.log('⚠️ Still null. Did you click "Continue to Shipping"?');
    }

    res.status(200).send('Received');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
