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
                        let sql = "INSERT INTO playerData (playerId) VALUES ('" + playerId + "')";
                        con.query(sql, (err, result) => {
                            if (err) {
                                return res.status(500).json({ message: err.message });
                            }
                            return res.status(200).json({ message: "Player Added", token: token });
                        });
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

exports.updateClothingPurchase = (req, res) => {

    let playerId = req.playerId;
    let newClothId = req.body.clothId;

    let sql = "Select * from purchasedItems where playerId='" + playerId + "'";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        let updatedCloths;

        if (result[0].cloths) {
            updatedCloths = result[0].cloths + "," + newClothId;
        }
        else {
            updatedCloths = newClothId;
        }

        let sql = "Update purchasedItems set cloths='" + updatedCloths + "'" + " where playerId='" + playerId + "'";
        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result) {
                return res.status(200).json({ message: "Cloths Updated Successfully" });
            }
        });

    })
}

exports.updateEmotePurchase = (req, res) => {

    let playerId = req.playerId;
    let newEmoteId = req.body.emoteId;

    let sql = "Select * from purchasedItems where playerId='" + playerId + "'";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        let updatedEmotes;

        if (result[0].emotes) {
            updatedEmotes = result[0].emotes + "," + newEmoteId;
        }
        else {
            updatedEmotes = newEmoteId;
        }

        let sql = "Update purchasedItems set emotes='" + updatedEmotes + "'" + " where playerId='" + playerId + "'";
        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result) {
                return res.status(200).json({ message: "Emotes Updated Successfully" });
            }
        });

    })
}

exports.updateCharacterPurchase = (req, res) => {

    let playerId = req.playerId;
    let newCharacterId = req.body.characterId;

    let sql = "Select * from purchasedItems where playerId='" + playerId + "'";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        let updatedCharacters;

        if (result[0].characters) {
            updatedCharacters = result[0].characters + "," + newCharacterId;
        }
        else {
            updatedCharacters = newCharacterId;
        }

        let sql = "Update purchasedItems set characters='" + updatedCharacters + "'" + " where playerId='" + playerId + "'";
        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result) {
                return res.status(200).json({ message: "Characters Updated Successfully" });
            }
        });

    })
}

exports.updatePetPurchase = (req, res) => {

    let playerId = req.playerId;
    let newPetId = req.body.petId;

    let sql = "Select * from purchasedItems where playerId='" + playerId + "'";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        let updatedPets;

        if (result[0].pets) {
            updatedPets = result[0].pets + "," + newPetId;
        }
        else {
            updatedPets = newPetId;
        }

        let sql = "Update purchasedItems set Pets='" + updatedPets + "'" + " where playerId='" + playerId + "'";
        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result) {
                return res.status(200).json({ message: "Pets Updated Successfully" });
            }
        });

    })
}

exports.updatePetEmotePurchase = (req, res) => {

    let playerId = req.playerId;
    let newPetEmoteId = req.body.petEmoteId;

    let sql = "Select * from purchasedItems where playerId='" + playerId + "'";

    db.query(sql, (err, result) => {
        if (err) {
            return res.status(500).json({ message: err.message });
        }

        let updatedPetEmotes;

        if (result[0].petsEmotes) {
            updatedPetEmotes = result[0].petsEmotes + "," + newPetEmoteId;
        }
        else {
            updatedPetEmotes = newPetEmoteId;
        }

        let sql = "Update purchasedItems set petsEmotes='" + updatedPetEmotes + "'" + " where playerId='" + playerId + "'";
        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ message: err.message });
            if (result) {
                return res.status(200).json({ message: "Pets Emotes Updated Successfully" });
            }
        });

    })
}

exports.updateDailyReward = (req, res) => {

    let daysToUpdate = req.body.daysToUpdate;
    let category = req.body.category;
    let rewardId = req.body.rewardId;

    let sql = "Update dailyrewards set rewardCategory='" + category + "' , rewardId='" + rewardId + "' where days='" + daysToUpdate + "'";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result) {
            return res.status(200).json({ message: "Daily Rewards Updated Successfully" });
        }
    });

}

exports.viewDailyReward = (req, res) => {
    let sql = "Select * from dailyRewards";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: err.message });
        if (result) {
            return res.status(200).json({ rewards: result });
        }
    });
}

exports.viewLeaderboard = (req, res) => {

    let playersByKills;
    let playersByWins;

    let sql = "SELECT * FROM (playerData inner join player_details on playerData.playerId=player_details.playerId inner join friends on playerData.playerId=friends.playerId) ORDER BY kills Desc Limit 20";

    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result) {
            playersByKills = result;
            let sql2 = "SELECT * FROM (playerData inner join player_details on playerData.playerId=player_details.playerId inner join friends on playerData.playerId=friends.playerId) ORDER BY win Desc Limit 20";

            con.query(sql2, function (err, result) {
                if (err) throw err;
                if (result) {
                    playersByWins = result;
                    res.status(200).json({ playersByKills: playersByKills, playersByWins: playersByWins });
                }
            });
        }
    });
}

exports.postFeedback = (req, res) => {

    let username = req.body.username;
    let feedback = req.body.feedback;
    let sql = "INSERT INTO feedback (username,feedback) VALUES ('" + username + "','" + feedback + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        return res.status(200).json({ message: "feedback added" });
    });
}

exports.postMessages = (req, res) => {

    let message = req.body.message;
    let sql = "INSERT INTO messages (message) VALUES ('" + message + "')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        return res.status(200).json({ message: "message sent" });
    });
}

exports.playerData = (req, res) => {

    let playerId = req.playerId;
    let lastmatchkills = req.body.lastmatchkills;
    let lastmatchdamage = req.body.lastmatchdamage;
    let matchresult = req.body.result;

    let sql = "Select * from playerData where playerId=' " + playerId + "'";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            let totalmatch = result[0].totalmatchplayed;
            totalmatch += 1;
            let kills = parseInt(result[0].kills) + parseInt(lastmatchkills);
            let dem = parseInt(result[0].damages) + parseInt(lastmatchdamage);
            let win;
            let loss;
            if (matchresult == "win") {
                win = result[0].win + 1;
                loss = result[0].loss;
            }
            else {
                win = result[0].win;
                loss = result[0].loss + 1;
            }
            var sql = "UPDATE playerData SET totalmatchplayed = '" + totalmatch + "',lastmatchkills =   '" + lastmatchkills + "' ,kills =   '" + kills + "'  ,damages =   '" + dem + "', win =   '" + win + "',loss =   '" + loss + "' WHERE playerId = ' " + playerId + "'";
            db.query(sql, (err, result) => {
                if (err) throw err;
                return res.status(200).json({ message: "player data updated Successfully" });
            })

        }
        else {
            let tmp = 1;
            let win
            let loss;
            if (matchresult == "win") {
                win = 1;
                loss = 0;
            }

            let sqll = "INSERT INTO playerdata (playerId, totalmatchplayed, lastmatchkills, kills, damages, win, loss) VALUES ('" + playerId + "','" + tmp + "','" + lastmatchkills + "','" + lastmatchkills + "','" + lastmatchdamage + "','" + win + "','" + loss + "')";
            db.query(sqll, (err, result) => {
                if (err) throw err;
                return res.status(200).json({ message: "player data updated Successfully" });
            })
        }
    })
}



exports.getPlayerData = (req, res) => {
    const playerId = req.query.id;
    let sql = "Select * from playerData where playerId=' " + playerId + "'";
    db.query(sql, (err, result) => {
        if (err) throw err;
        if (result.length > 0) {
            res.status(200).json({
                totalmatchplayed: result[0].totalmatchplayed,
                lastmatchkills: result[0].lastmatchkills,
                kills: result[0].kills,
                damages: result[0].damages,
                win: result[0].win,
                loss: result[0].loss
            });

        }
        else {
            res.status(500).json({ message: "user not found" });
        }
    })

}

exports.toggelmaintainance = (req, res) => {
    var sql = "SELECT * FROM maintenancestatus";
    con.query(sql, function (err, result) {
        if (err) throw err;
        if (result[0].status == 1) {
            var sql = "UPDATE maintenancestatus SET status =0";
            con.query(sql, function (err, result) {
                if (err) throw err;
                return res.status(200).send('toggled')
            });
        }
        else {
            var sql = "UPDATE maintenancestatus SET status =1";
            con.query(sql, function (err, result) {
                if (err) throw err;
                return res.status(200).send('toggled')
            });
        }
    });

}