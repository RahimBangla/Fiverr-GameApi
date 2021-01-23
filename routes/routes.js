const express = require('express');
const router = express.Router();
const controllers = require('./../controllers/controllers');
const isAuth = require("./../controllers/auth");
const checkMantainence = require("./../controllers/checkMaintainence");

router.get("/checkPlayer?:id", checkMantainence, controllers.checkPlayer);
router.post("/addPlayer", checkMantainence, controllers.addPlayer);
router.post("/sendFriendRequest", checkMantainence, isAuth, controllers.sendRequest);
router.post("/acceptRequest", isAuth, checkMantainence, controllers.acceptReq);
router.post("/updateClothingPurchase", checkMantainence, isAuth, controllers.updateClothingPurchase);
router.post("/updateEmotePurchase", checkMantainence, isAuth, controllers.updateEmotePurchase);
router.post("/updateCharacterPurchase", checkMantainence, isAuth, controllers.updateCharacterPurchase);
router.post("/updatePetPurchase", checkMantainence, isAuth, controllers.updatePetPurchase);
router.post("/updatePetEmotePurchase", checkMantainence, isAuth, controllers.updatePetEmotePurchase);
router.post("/UpdateDailyReward", checkMantainence, controllers.updateDailyReward);
router.post("/postFeedback", checkMantainence, isAuth, controllers.postFeedback);
router.post("/postMessage", checkMantainence, controllers.postMessages);
router.get("/viewDailyReward", checkMantainence, controllers.viewDailyReward);
router.get("/leaderboard", checkMantainence, controllers.viewLeaderboard);
router.post("/updatePlayerData",checkMantainence,isAuth, controllers.playerData);
router.get("/getPlayerData?:id", checkMantainence, controllers.getPlayerData);
router.post('/toggleMaintainance',controllers.toggelmaintainance);

module.exports = router;