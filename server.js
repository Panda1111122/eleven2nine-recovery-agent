const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

// --- YOUR SECRETS ---
const TOKEN = 'EAAX2B464K9cBQiz4ZBbXkjquTEEKMniBnLO6TkZBTdZCMBUsxjYh1OnZCVaYIR3ecVqFZCPYSGYVw2q78FPvAwXve8dxL8tpZAq4uD3ElEng0ofr9rZAu2iCIZA3jGllzbNyeY59F1Ijgcpa8HnfMWRTjbk4ZACBOKWytUs76KjD1ro26jdUsGJ7UDIAz7jhSDrGKDiCIMmKEDDRZBJ82mgZBKqLt8ysHqY8cUmcvklzuchmou1q2HvuhfmI2ygclaoTw8i7eKJHlRInjvmtwMenfy0S6a7hAZDZD';
const PHONE_NUMBER_ID = '980667585134254';
// --------------------

app.get('/', (req, res) => {
    res.send('1129 Agent: Visual Mode 📸');
});

app.post('/webhook/abandoned-cart', async (req, res) => {
    console.log('🔔 DOORBELL RUNG! Processing Visual Recovery...');

    const data = req.body;
    
    // 1. Get Customer Info
    const customerName = data.customer ? data.customer.first_name : 'Friend';
    const recoveryUrl = data.abandoned_checkout_url;
    
    // 2. Sherlock Search for Phone
    let phone = null;
    if (data.customer && data.customer.phone) phone = data.customer.phone;
    else if (data.phone) phone = data.phone;
    else if (data.shipping_address && data.shipping_address.phone) phone = data.shipping_address.phone;

    // 3. GET THE PRODUCT IMAGE & NAME
    // Shopify stores products in a list called 'line_items'
    let productName = 'some amazing items';
    let productImage = 'https://cdn.shopify.com/s/files/1/0533/2089/files/placeholder-images-image_large.png'; // Default fallback

    if (data.line_items && data.line_items.length > 0) {
        const firstItem = data.line_items[0];
        productName = firstItem.title;
        
        // Sometimes the image is deep inside 'properties' or just 'image_url', 
        // but often webhook data lacks the direct image URL in 'line_items'.
        // TRICK: We will use a generic "We miss you" image if Shopify doesn't give us the direct link,
        // OR if you are using a real store, Shopify usually passes 'image_url' inside line_items.
        if (firstItem.image_url) {
            productImage = firstItem.image_url;
        } else if (firstItem.properties && firstItem.properties.image) {
            productImage = firstItem.properties.image;
        }
    }

    console.log(`📸 Image to send: ${productImage}`);

    if (phone) {
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
                    type: 'image', // <--- THIS IS THE MAGIC CHANGE
                    image: {
                        link: productImage,
                        caption: `Hey ${customerName}! 👋\n\nI saw you looking at **${productName}**. It's a great choice! 🔥\n\nWe saved it for you (but stock is low). Click to grab it:\n${recoveryUrl}`
                    }
                }
            });
            console.log('✅ PHOTO MESSAGE SENT!');
        } catch (error) {
            console.error('❌ Failed:', error.response ? JSON.stringify(error.response.data) : error.message);
        }
    } else {
        console.log('⚠️ No phone found.');
    }

    res.status(200).send('Received');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
