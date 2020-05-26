require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();

//const db = mysql.createPool(process.env.CLEARDB_DATABASE_URL);


app.set('port', process.env.PORT);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));


var index = function (req, res) {
    res.render('index')
}

var szukaj = function (req, res) {

    var wyniki = [];
    res.render('index',wyniki)
}

app.get('/', index);
app.post('/search', szukaj);

app.listen(process.env.PORT,() => {
    console.log(`Server running on port: {process.env.PORT}`);
  });