const express = require('express')
    , app = express()
    , bodyParser = require('body-parser')
    , path = require('path')
    , cors = require('cors')
    , db = require('./database')
    , multer = require('multer')
    , uuidv4 = require('uuid/v4')
    , fs = require('fs')
    , { commentRoutes, photoRoutes, userRoutes } = require('../app/routes');

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
    fs.mkdirSync(uploadDir + '/imgs');
}

const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/imgs')
    },
    filename: function (req, file, cb) {
        cb(null, `${uuidv4()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({
    storage,
    fileFilter(req, file, cb) {
        console.log("express.js - Recebendo arquivo de imagem")
        cb(null, true)
    }
});

app.set('secret', 'your secret phrase here');
app.set('upload', upload);

const corsOptions = {
    exposedHeaders: ['x-access-token']
};

app.use(express.static('uploads'));
app.use(cors(corsOptions));
app.use(bodyParser.json());

app.use((req, res, next) => {
    req.db = db;
    next();
});

app.use((req, res, next) => {
    const token = req.headers['x-access-token'];
    console.log('#--------------express.js - criação--do--token-----------#');
    if(token) {
        console.log('express.js - Um token enviado pela aplicação');
        console.log('express.js - Token value is ' + token);
    } else {
        console.log('express.js - Sem token enviado pela aplicação');
    }
    console.log('#---------------------express.js---------------------------#');
    next();
});

userRoutes(app);
photoRoutes(app);
commentRoutes(app);


app.use('*', (req, res) => {
    res.status(404).json({ message: `route ${req.originalUrl} não existe!` });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal server error' });
});

module.exports = app;