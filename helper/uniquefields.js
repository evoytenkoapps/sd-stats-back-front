class UniqueFields {

    /**
     * Формируем уникальный массив моделей
     *
     * @param {*} data
     * @memberof UniqueFields
     */
    parseFields(data) {
        const result = [];
        data.forEach(el => {
            for (const property in el) {
                if (property != 'date' && property != 'count') {
                    result.find(position => position === el.position) ? null : result.push(el.position);
                }
            }
        });
        return result;
    }
}

module.exports = new UniqueFields();