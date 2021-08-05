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
            `select imie, nazwisko,  rok_zgonu, sektor, rzad, numer_parceli, oplata_do ` +
            `from zmarli where UPPER(nazwisko) like UPPER('${req.body.nazwisko}%')
            order by nazwisko, imie, rok_zgonu`
            + ((req.body.imie != null && req.body.imie != "") ? ` and UPPER(imie) = UPPER('${req.body.imie}')` : ""),
            (err, result, fields) => {
                if (err) throw err;
                res.render('search', { zmarli: result })
            });
    } else {
        res.render('error', { errorMessage: 'Nazwisko jest wymagane' })
    }

};

var import_get = function (req, res) {
    res.render('import');
};
var import_post = async function (req, res) {
    if (req.body.password != process.env.ADMIN_PASS) {
        res.render('error', { errorMessage: 'Błędne hasło.' })
        return;
    }
    if (!req.body.data) {
        res.render('error', { errorMessage: 'Brak danych do zaimportBowania.' })
        return;
    }

    var errors = [];
    var data = [];
    req.body.data.split(/\r?\n/).forEach((line, i) => {
        if (line) {
            var cols = line.split(/\t/);
            if (cols.length != 7) {
                errors.push(i);
            } else {
                if(isNaN(cols[6])){
                    cols[6] = null;
                }

                if(isNaN(cols[2])){
                    cols[2] = null;
                }

                data.push(cols);
            }
        }
    });

    if (errors.length > 0) {
        res.render('error', { errorMessage: 'Błędy w wierszach:' + errors.join(",") });
        return;
    }

    var affectedRows = 0;
    data.map(record=>insertRecord(record)).reduce((prev,curr, index, arr)=>prev.then((gg)=>{
        affectedRows +=1;
        return curr;
    }),Promise.resolve())
    .then((tt)=>{ 
        res.render('error', { errorMessage: `Pomyślnie zaimportowano ${affectedRows} wierszy` });
    })
    .catch((err)=>{
        res.render('error', { errorMessage: `Błąd podczas importowania danych. ${err}` });
    });       
}

var insertRecord = function(recordData){
    return new Promise((resolve,reject)=>{
        var sql = mysql.format('insert into zmarli (nazwisko,imie,rok_zgonu,sektor,rzad,numer_parceli,oplata_do) values (?)', [recordData]);
        db.query(sql,
            (err, result, fields) => {
                if (err) {
                    reject(err);
                }
                resolve(result)
            });
    })
}

var clearData = function (req, res) {
    if (req.body.password != process.env.ADMIN_PASS) {
        res.render('error', { errorMessage: 'Błędne hasło.' })
        return;
    }
    db.query('delete from zmarli',
        (err, result, fields) => {
            if (err) throw err;
            res.render('error', { errorMessage: `Usunięto wszystkie dane.` });
            return;
        });
};



app.get('/', index);
app.post('/search', szukaj);
app.get('/import', import_get);
app.post('/import', import_post);
app.post('/clear', clearData);
app.listen(process.env.PORT, () => {
    console.log(`Server running on port: ${process.env.PORT}`);
});