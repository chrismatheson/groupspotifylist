const { uniq, slice, flatMap, compose, shuffle } = require('lodash/fp');

module.exports = function (lists) {
    const targetNumber = (Object.keys(lists).length * 25);
    const firstPass = fromEachListTake(0, 24)(lists);
    const rest = compose(shuffle, fromEachListTake(25, 35))(lists);

    const missingCount = targetNumber - firstPass.length;

    return firstPass.concat(rest.slice(0, missingCount - 1));
};

const fromEachListTake = (from, to) =>  compose(uniq, flatMap(slice(from, to)))
