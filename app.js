const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mysql = require('mysql');
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Admin1234',
    database: 'utm'
});


const ejs = require('ejs'); // Ajoutez cette ligne


db.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL database');
});

const app = express();

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: 'SECRETDECHEZUTM',
    resave: true,
    saveUninitialized: true
}));

// Définir EJS comme moteur de modèle
app.set('view engine', 'ejs');


app.post('/register', (req, res) => {
    console.log(req.body);
    const { username, password } = req.body;
    const role = 'users'; // Par défaut, vous pouvez ajouter une gestion plus avancée des rôles.

    db.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, password, role], (err, result) => {
        if (err) throw err;
        console.log('User registered');
        res.redirect('/login');
    });
});


app.post('/login', (req, res) => {
    const { username, password } = req.body;

    db.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password], (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            req.session.loggedin = true;
            req.session.username = username;
            res.redirect('/dashboard');
        } else {
            res.send('Incorrect username or password');
        }
    });
});

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
});


const requireLogin = (req, res, next) => {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/dashboard', requireLogin, (req, res) => {
    res.send(`Welcome, ${req.session.username}!`);
});


// Route pour récupérer la liste des utilisateurs
app.get('/userlist', (req, res) => {
    db.query('SELECT * FROM users', (err, results) => {
        if (err) throw err;
        res.render('userlist', { users: results });
    });
});

// Route pour accéder à la liste des utilisateurs
app.get('/userlist', (req, res) => {
    res.render('userlist', { users: [] }); // En attendant d'avoir des données réelles
});

app.get('/login', (req, res) => {
    res.render('login');
  });


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
