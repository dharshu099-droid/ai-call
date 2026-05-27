require('dotenv').config();

const twilio = require('twilio');

const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

client.calls
.create({

    // Your server webhook URL
    url: 'https://ai-call-8552.twil.io/voice',

    // Receiver number
    to: '+917418796356',

    // Your Twilio number
    from: process.env.TWILIO_PHONE,

})

.then(call => {

    console.log("Call started:", call.sid);

})

.catch(err => {

    console.log("Error:", err);

});