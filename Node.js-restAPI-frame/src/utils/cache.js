import md5 from 'md5';
import {
  redisGet,
  redisDel,
  redisExists,
  redisExpire,
  redisHset,
  redisSet, redisHgetall
} from "./redis";

import {cachePrefix, cacheExpire} from '../conf/redisConf';

/**
 * @returns {*}
 */
const expire = () =>
  cacheExpire;

/**
 *
 * @param account
 * @returns {*}
 */
const newToken = account => {
  const expireTime = Date.now()+expire();
  return md5(`T:${account}:${expireTime}`);
};

/**
 * @param token
 * @returns {string}
 */
const sessionKey = token =>
  `${cachePrefix}:SESSION:${token}`;

/**
 * 删除session
 * @param key
 */
const cleanSession = async(key) => {
  if (redisExists(key)) {
      const val = await redisGet(key);
      const session = await sessionKey(val);
      await redisDel(session);
  }
};

/**
 * @param data
 * @returns {*}
 */
const newSecret = data =>
  md5(`S:${data}`);

// Chinese : 保存手机验证码 有效期5分钟
// English : save phone Verification Code, term of validity 5 min
const verCodeSave = async (data) => {
    const masterKey = `${cachePrefix}:MASTER:${data.phone}`;
    await cleanSession(masterKey);
    await redisSet(masterKey, data.phone);
    const verCodeSession = sessionKey(data.phone);
    await redisHset(verCodeSession, data);
    await redisExpire(verCodeSession, 300);
    const result = await redisHgetall(verCodeSession);
    return result;
};

/**
 * 保存缓存并返回/Save cache and return
 * @param data
 */
const save = async (data) => {
  const obj = data;
  const masterKey = `${cachePrefix}:MASTER:${data.account}`;
  await cleanSession(masterKey);

  // 将account放入cache/put account in cache
  obj.token = newToken(data.account);
  await redisSet(masterKey, data.token);

  const session = sessionKey(data.token);
  obj.secret = newSecret(data.token);

  // 放入到哈希缓存中/Put in hash cache
  await redisHset(session, obj);

  // 设置有效时间/Set effective time
  await redisExpire(session, expire());

  const result = await redisHgetall(session);

  return result;
};

const delUsr = async (token) => {
    const session = sessionKey(token);
    let usr;
    let result = await redisExists(session);


    if (result) {
        usr = await redisHgetall(session);
        result = await redisDel(session);
        console.log(result);
        if (!result){
            return {result};
        }
    }

    return {result, usr};
};

const getusr = async (token) => {
    const session = sessionKey(token);
    let usr;
    const result = await redisExists(session);
    if (result) {
        usr = await redisHgetall(session);
        usr.parent_id = Number(usr.parent_id);
        return {result,usr};
    }
    return {result, usr};
}

export { save as cacheSave, delUsr as cacheDelUsr, getusr as getUsr,verCodeSave as VerCodeSave};