const { uniq, slice, flatMap, compose, shuffle, take, rest } = require('lodash/fp');

module.exports = function (lists, count = 25) {
    const targetNumber = (Object.keys(lists).length * count);
    const firstPass = fromEachListTake(slice(0, count))(lists);
    const rest = compose(shuffle, fromEachListTake(slice(count, count + 10)))(lists);

    const missingCount = targetNumber - firstPass.length;

    return firstPass.concat(take(missingCount, shuffle(rest)));
};

const fromEachListTake = (take) =>  compose(uniq, flatMap(take))
