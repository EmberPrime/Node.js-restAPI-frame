const RESP_CODE = {
  0   : "OK",
  310 : "非法字符/Illegal character",
  500 : "服务器错误/Server error"
};

/**
 * 错误回复信息
 * @param _code
 * @param desc
 * @returns {{resp: {code: *, desc: string}, data: {}}}
 */
const response = (_code, desc) => {
  const jret = {
    resp: {
      code: _code,
      desc: 'OK'
    },
    data: {}
  };

  if (RESP_CODE[_code]) {
    jret.resp.desc = RESP_CODE[_code];
  }else{
    jret.resp.desc = RESP_CODE[900];
  }

  if (desc){
    jret.resp.desc = desc;
  }

  return jret;
}

const respSuccess = (data = {}) => {
    const jret = {
        code: 0,
        desc: 'OK',
    }

    if (data !== {}) {
        jret.data = data;
    }

    return jret;
}

export { response as default, respSuccess};