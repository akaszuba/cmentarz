require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const app = express();

const db = mysql.createPool(process.env.CLEARDB_DATABASE_URL);


app.set('port', process.env.PORT);

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.urlencoded({ extended: true }));


var index = function (req, res) {
    res.render('index')
}

var szukaj = function (req, res) {

    if (req.body.nazwisko) {
        db.query(
            `select imie, nazwisko,  rok_zgonu, sektor, numer_parceli ` +
            `from zmarli where UPPER(nazwisko) = UPPER('${req.body.nazwisko}')`
            + ((req.body.imie != null && req.body.imie != "")? ` and UPPER(imie) = UPPER('${req.body.imie}')`:"")
            + ((req.body.rok != null && req.body.rok != "")? ` and UPPER(rok_zgonu) = UPPER('${req.body.rok}')`:""),            
            (err, result, fields) => {
                if (err) throw err;
                res.render('search', { zmarli: result })
            });
    } else {
        res.render('error', { errorMessage: 'Nazwisko jest wymagane' })
    }

}

app.get('/', index);
app.post('/search', szukaj);


app.listen(process.env.PORT, () => {
    console.log(`Server running on port: ${process.env.PORT}`);
});