const db = require("./../mysqlconnection");
const jwt = require("jsonwebtoken");
const con = require("./../mysqlconnection");

exports.checkPlayer = (req, res) => {

    const playerId = req.query.id;

    //search for playerid
    let sql = "Select * from player_details where playerId='" + playerId + "'";

    const token = jwt.sign({
        playerId: playerId
    }, "kwi9owl");

    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            //player found
            let data = result[0];
            res.status(200).json({ message: "Player Found", data: data, token: token });
        }
        else {
            res.status(500).json({ message: "Player Not Found" });
        }
    })
}

exports.addPlayer = (req, res) => {

    let playerId = req.body.playerId;
    let username = req.body.username;

    //Username Pattern Validation
    // var patt = new RegExp("/^[A-Za-z0-9]{8,9}$/");
    // var flag = patt.test(username);
    // console.log(flag);

    let sql = "INSERT INTO player_details (playerId,username) VALUES ('" + playerId + "','" + username + "')";

    con.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        };
        //create a token
        const token = jwt.sign({
            playerId: playerId
        }, "kwi9owl");
        
        let sql = "INSERT INTO purchasedItems (playerId) VALUES ('" + playerId + "')";
        con.query(sql, (err, result) => {
            if (err) {
               
           }
        });

        return res.status(200).json({ message: "Player Added", token: token });
    });
}

exports.sendRequest = (req, res) => {

    let senderId = req.playerId;
    let recId = req.body.recId;

    let sql = "Select * from friendrequests where fr_sent=' " + senderId + "' AND fr_rec='" + recId + "'";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            return res.status(200).json({ message: "Request Already Sent" });
        }
        else {
            let sql = "INSERT INTO friendrequests (fr_sent,fr_rec) VALUES ('" + senderId + "','" + recId + "')";
            db.query(sql, (err, result) => {
                if (err) throw err;
                return res.status(200).json({ message: "Request Sent Successfully" });
            })
        }
    })

}

exports.receiveReq = (req, res) => {

}