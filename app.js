//imports
const express = require("express");
const bodyParser = require('body-parser');
const app = express();
const path = require("path");
process.on('uncaughtException', function (err) {
    console.log(err);
});
const routes = require("./routes/routes");

//middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

//routes 
app.use("/", routes);

//Server start
app.listen(8080);