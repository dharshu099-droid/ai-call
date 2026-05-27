fetch('https://uninhabited-eustatically-jacque.ngrok-free.dev/save-response', {

    method: 'POST',

    headers: {

        'Content-Type': 'application/json'

    },

    body: JSON.stringify({

        phone_number: '+917305533079',

        language: 'en',

        question_number: 1,

        answer: '2'

    })

})
.then(res => res.text())
.then(data => console.log(data))
.catch(err => console.log(err));