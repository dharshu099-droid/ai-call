const mysql = require('mysql2');

const db = mysql.createConnection({

    host: 'kodama.proxy.rlwy.net',

    user: 'root',

    password: 'xbmnbTnHooKGdFvdNVEvhnSNBoAVYeBr',

    database: 'railway',

    port: 47181,

    ssl: {
        rejectUnauthorized: false
    }

});

db.connect((err) => {

    if (err) {

        console.log('Database connection failed:', err);

    } else {

        console.log('Connected to Railway MySQL');

    }

});

module.exports = db;