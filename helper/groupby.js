class GroupBy {

    parse(data, formatter) {
        const result = [];
        const buff = this.groupBy(data, formatter);
        for (const key in buff) {
            const obj = {};
            buff[key].forEach(element => {
                obj[element.product] = element.count;
            });
            obj.date = key;
            result.push(obj);
        }
        return result;
    };

    // Делаем группировку по продукту
    groupBy(arr, key) {
        return arr.reduce(function (groups, item) {
            const val = item[key];
            groups[val] = groups[val] || [];
            groups[val].push(item);
            return groups;
        }, {});
    };
}

module.exports = new GroupBy();