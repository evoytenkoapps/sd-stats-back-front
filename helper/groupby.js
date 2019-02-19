class GroupBy {

    /**
     *
     *
     * @param {*} data
     * @param {*} attr
     * @returns
     * @memberof GroupBy
     */
    parse(data, attr) {
        const result = [];
        const buff = this._groupBy(data, 'date');
        for (const key in buff) {
            const obj = {};
            buff[key].forEach(element => {
                obj[element[attr]] = element.count;
            });
            obj.date = key;
            result.push(obj);
        }
        return result;
    };

    // Делаем группировку по продукту
    _groupBy(arr, key) {
        return arr.reduce(function (groups, item) {
            const val = item[key];
            groups[val] = groups[val] || [];
            groups[val].push(item);
            return groups;
        }, {});
    };
}

module.exports = new GroupBy();