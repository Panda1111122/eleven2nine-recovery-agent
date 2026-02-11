const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('1129 AI Agent is Awake! 🚀');
});

app.post('/webhook/abandoned-cart', (req, res) => {
    console.log('🔔 DOORBELL RUNG! Cart Abandoned!');
    
    // --- X-RAY VISION START ---
    // This prints the entire JSON data to your logs so we can see everything
    console.log('📦 FULL RAW DATA:', JSON.stringify(req.body, null, 2));
    // --- X-RAY VISION END ---

    const cartData = req.body;
    
    // Let's try to find the email/phone even if it's not in the usual spot
    // Sometimes it's at the top level, sometimes inside 'customer'
    const email = cartData.email || (cartData.customer ? cartData.customer.email : 'No Email Found');
    const phone = cartData.phone || (cartData.customer ? cartData.customer.phone : 'No Phone Found');
    
    console.log(`🔎 SEARCH RESULT:`);
    console.log(`📧 Email: ${email}`);
    console.log(`📱 Phone: ${phone}`);

    res.status(200).send('Received');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
