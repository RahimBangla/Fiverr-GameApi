const db = require("./../mysqlconnection");

module.exports = (req, res, next) => {
   
    let sql = "Select * from  maintenancestatus";

    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result) {
            let data = result[0].status;
            if(data==1){
               return res.status(500).json({ message: "System is under maintenance" });
            }
            else {
                next();
            }
        }
    })
}