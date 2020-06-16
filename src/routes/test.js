import express from 'express';
import md5 from "md5";
import moment from "moment";
import schedule from "node-schedule";
import mysql from "../utils/mysql";
import {cacheSave, cacheDelUsr, getUsr} from '../utils/cache';
import response from '../utils/response';
import {reqCheck} from '../utils/snGenerator';

const router = express.Router();

/**
 * 登陆
 */
router.get('/reqTest', async (req, res) => {
    const pdu = req.body;
    const checkRet = await reqCheck(pdu.data);
    if (!checkRet) {
        return res.json(response(310));
    }

    const data = {
        account : "ACCOUNT",
        name : "jack",
        age : 15
    }

    // redis cache
    const usr = await cacheSave(data);
    const jret = {

        resp: {
            code: 0,
            desc: ''
        },
        data: {}
    };

    console.log(`test/reqTest ====> ${JSON.stringify(jret)}`);
    return res.json(jret);
});

export default router;
