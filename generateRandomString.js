let randomStringModule = {

function generateRandomString() {
    let usableChars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let stringLength = 6
    let result = '';
    for (let i = stringLength; i > 0; --i) {
      result += usableChars[Math.floor(Math.random() * usableChars.length)];
    }
    return result;
  };

}

module.exports = randomStringModule;