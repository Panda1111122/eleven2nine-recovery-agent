const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// This allows us to read the data Shopify sends
app.use(bodyParser.json());

// 1. The "Home" Route (To check if server is alive)
app.get('/', (req, res) => {
    res.send('1129 AI Agent is Awake and Listening! 🚀');
});

// 2. The "Doorbell" Route (Shopify calls this)
app.post('/webhook/abandoned-cart', (req, res) => {
    console.log('🔔 DOORBELL RUNG! Cart Abandoned!');
    
    // Capturing the data Shopify sent us
    const cartData = req.body;
    
    // extracting customer info (Safety check in case data is missing)
    if (cartData.customer) {
        const customerName = cartData.customer.first_name;
        const customerPhone = cartData.customer.phone;
        const cartPrice = cartData.total_price;
        
        console.log(`👤 Customer: ${customerName}`);
        console.log(`📱 Phone: ${customerPhone}`);
        console.log(`💰 Value: ${cartPrice}`);
        
        // TODO: In Step 2, we will add the WhatsApp trigger here.
    } else {
        console.log('⚠️ No customer data attached.');
    }

    // We must tell Shopify "We heard you" or it will keep ringing
    res.status(200).send('Received');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
