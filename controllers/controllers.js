const db = require("./../mysqlconnection");
const jwt = require("jsonwebtoken");
const con = require("./../mysqlconnection");

exports.checkPlayer = (req, res) => {

    const playerId = req.query.id;

    //search for playerid
    let sql = "Select * from (player_details inner join purchaseditems on player_details.playerId=purchaseditems.playerId) where player_details.playerId='" + playerId + "'";

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
    let numberFlag = false;
    let lengthFlag = false;

    //Username Pattern Validation
    if (username.length == 8) {
        lengthFlag = true;
    }

    for (let i = 0; i < username.length; i++) {
        if (username[i] >= '0' && username[i] <= "9") {
            numberFlag = true;
        }
    }

    var patt = new RegExp("^[a-zA-Z0-9]*$");
    var flag = patt.test(username);
    if (flag & lengthFlag & numberFlag) {

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
                    return res.status(500).json({ message: err.message });
                }
                let sql = "INSERT INTO friendRequests (playerId) VALUES ('" + playerId + "')";
                con.query(sql, (err, result) => {
                    if (err) {
                        return res.status(500).json({ message: err.message });
                    }
                    let sql = "INSERT INTO friends (playerId) VALUES ('" + playerId + "')";
                    con.query(sql, (err, result) => {
                        if (err) {
                            return res.status(500).json({ message: err.message });
                        }
                        return res.status(200).json({ message: "Player Added", token: token });
                    });
                });
            });

        });
    }
    else {
        return res.status(500).json({ message: "Username should contain be of length 8 characters including number" });
    }

}

exports.sendRequest = (req, res) => {

    let toSend = req.body.toSend;

    let sql = "Select * from friendrequests where playerId='" + req.playerId + "'";
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }
        else {
            let fr_sent;
            let flag1 = false;
            let flag2 = false;
            let fr_sent_new;
            let fr_recieved;

            if (result[0].fr_sent) {
                fr_sent = result[0].fr_sent.split(',');
                fr_sent_new = result[0].fr_sent + "," + toSend;
                fr_sent.map(fr => {
                    if (fr == toSend) {
                        flag1 = true;
                        return res.status(200).json({ message: "Request Sent Already" });
                    }
                });
            }
            else {
                fr_sent_new = toSend;
            }

            if (result[0].fr_recieved) {
                fr_recieved = result[0].fr_recieved.split(',');
                fr_recieved.map(fr => {
                    if (fr == toSend & flag1 == false) {
                        flag2 = true;
                        return res.status(200).json({ message: "You already got the request of same person" });
                    }
                });
            }

            if (flag1 == false & flag2 == false) {
                let sql = "Update friendrequests set fr_sent='" + fr_sent_new + "'" + " where playerId='" + req.playerId + "'";
                db.query(sql, (err, result) => {
                    if (err) return res.status(500).json({ message: err.message });
                    if (result) {
                        return res.status(200).json({ message: "Request Sent Successfully" });
                    }
                });
            }
        }
    });

}


exports.acceptReq = (req, res) => {

    let acceptedId = req.body.acceptedId;
    let playerId = req.playerId;

    console.log(acceptedId,playerId);

    let sql = "Select * from friends where playerId='" + playerId + "'";
    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        let newFriendList;
        if (result[0].friends) {
            newFriendList = result[0].friends + "," + acceptedId;
        }
        else {
            newFriendList = acceptedId;
        }

        let sql = "Update friends set friends='" + newFriendList + "'" + " where playerId='" + req.playerId + "'";
        con.query(sql, (err, result) => {

            if (err) {
                return res.status(500).json({ message: err.message });
            }

            let sql = "Select * from friendrequests where playerId='" + req.playerId + "'";
            db.query(sql, (err, result) => {
                if (err) {
                    return res.status(500).json({ message: err.message });
                }

                let friendReqs = (result[0].fr_recieved).split(',');
                let newFrs;

                friendReqs.map(fr => {
                    if (fr !== acceptedId) {
                        newFrs = "," + fr;
                    }
                })

                let sql = "Update friendrequests set fr_recieved='" + newFrs + "'" + " where playerId='" + req.playerId + "'";
                db.query(sql, (err, result) => {
                    if (err) return res.status(500).json({ message: err.message });
                    if (result) {
                        return res.status(200).json({ message: "Friend Added Successfully" });
                    }
                });

            })

        })

    })


}