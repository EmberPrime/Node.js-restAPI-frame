import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';

import cashierRouter from './routes/cashier';

dotenv.config();
const app = express();

app.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Chinese : 使用正则表达式，检测字符串是否含有攻击特征，检测到攻击特征返回true，没检测到返回false
// English : Regular expression is used to detect whether the string contains attack characteristics. If the attack characteristics are detected, true will be returned, but false will not be returned
function waf_detect(str_to_detect){
    let regexp_rule =[
        /select.+(from|limit)/i,
        /update.+(set)/i,
        /delete.+(from)/i,
        /insert.+(into)/i,
        /truncate.+(table)/i,
        /show.+(databases)/i,
        /drop.+(database)/i,
        /\*|\+|\;|\||databases|join|\(|\)|union|exec|drop|>|<|%/i,
        /(?:(union(.*?)select))/i,
        /sleep\((\s*)(\d*)(\s*)\)/i,
        /group\s+by.+\(/i,
        /(?:from\W+information_schema\W)/i,
        /(?:(?:current_)user|database|schema|connection_id)\s*\(/i,
        /\s*or\s+.*=.*/i,
        /order\s+by\s+.*--$/i,
        /benchmark\((.*)\,(.*)\)/i,
        /base64_decode\(/i,
        /(?:(?:current_)user|database|version|schema|connection_id)\s*\(/i,
        /(?:etc\/\W*passwd)/i,
        /into(\s+)+(?:dump|out)file\s*/i,
        /xwork.MethodAccessor/i,
        /(?:define|eval|file_get_contents|include|require|require_once|shell_exec|phpinfo|system|passthru|preg_\w+|execute|echo|print|print_r|var_dump|(fp)open|alert|showmodaldialog)\(/i,
        /\<(iframe|script|body|img|layer|div|meta|style|base|object|input)/i,
        /(onmouseover|onmousemove|onerror|onload)\=/i,
        /javascript:/i,
        /\.\.\/\.\.\//i,
        /\|\|.*(?:ls|pwd|whoami|ll|ifconfog|ipconfig|&&|chmod|cd|mkdir|rmdir|cp|mv)/i,
        /(?:ls|pwd|whoami|ll|ifconfog|ipconfig|&&|chmod|cd|mkdir|rmdir|cp|mv).*\|\|/i,
        /(gopher|doc|php|glob|file|phar|zlib|ftp|ldap|dict|ogg|data)\:\//i
    ];
    for(let i = 0; i < regexp_rule.length; i++){
        if(regexp_rule[i].test(str_to_detect) == true){
			console.log("检测到攻击特征/Attack characteristics detected, rule number:", "("+i+")", regexp_rule[i]);
			return true;
        }
    }
    return false;
}

app.use(function(req, res, next) {
    let path = req.url;
    if(waf_detect(path) == false){
        next();
    }else{
    	console.log('index ===> path非法字符');
    	return res.json(response(310));
    }
});

app.use(bodyParser.json());

app.use('/api/cashier', cashierRouter);

app.get('/*', (req, res) => {
  res.status(404).json({ errors: 'Service invalid.' });
});

const port = process.env.EXPRESS_PORT || 3000;
// eslint-disable-next-line
app.listen(port, () => console.info(`express server running on ${port}`));
