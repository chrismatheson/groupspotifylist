function makeGen (arr = []) {
  return function*  () {
    while(arr.length) {
      yield arr.shift();
    }
  }()
}

module.exports = {
  makeGen
}