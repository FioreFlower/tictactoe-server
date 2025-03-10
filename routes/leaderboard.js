var express = require('express');
var router = express.Router();

// 랭킹 조회
router.get("/", async function (req, res, next) {
    try {
        if(!req.session.isAuthenticated) {
            return res.status(403).send("로그인이 필요합니다.");
        }

        var database = req.app.get('database');
        var users = database.collection('users');

        var allUsers = await users
            .find({ }, { projection: { username:1, nickname: 1, score: 1 } })
            .sort({ score: -1 }) // 점수가 높은 순으로 정렬
            .toArray();

        var result = allUsers.map((user) => (
            {
                username: user.username,
                nickname: user.nickname,
                score: user.score || 0,
            }
        ))

        res.json({ leaderboardDatas : result ?? [] });
    } catch(err) {
        console.error(err);
        res.status(500).send("서버 오류가 발생했습니다.");
    }
})

module.exports = router;