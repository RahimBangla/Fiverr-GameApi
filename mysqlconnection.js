var mysql = require('mysql');
const mysql2 = require("mysql2-promise")();

mysql2.configure({
    "host": "51.81.86.244",
    "user": "rupeshpa_jlbhgFTDFHBJ120vh",
    "password": "u%JjwMvx+9LSu%JjwMvx+9LS",
    "database": "rupeshpa_Qwe12$vx95824"
});

let con = mysql.createConnection({
    host: "51.81.86.244",
    user: "rupeshpa_jlbhgFTDFHBJ120vh",
    password: "u%JjwMvx+9LSu%JjwMvx+9LS",
    database:"rupeshpa_Qwe12$vx95824"
});
con.connect(function (err) {
    if (err) {
        throw err;
    };
    console.log("Mysql Connected!");
});

module.exports=con