const express = require('express');
const router = express.Router();
const controllers = require('./../controllers/controllers');
const isAuth = require("./../controllers/auth");

router.get("/checkPlayer?:id", controllers.checkPlayer);
router.post("/addPlayer", controllers.addPlayer);
router.post("/sendFriendRequest", isAuth, controllers.sendRequest);
router.post("/acceptRequest", isAuth, controllers.acceptReq);


module.exports = router;