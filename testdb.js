const db = require('./db');

db.query(

  `INSERT INTO responses
  (phone_number, language, question_number, answer)

  VALUES (?, ?, ?, ?)`,

  ['+917418796356', 'en', 1, '2'],

  (err, result) => {

    if (err) {

      console.log(err);

    } else {

      console.log('Data inserted successfully');

    }

  }

);