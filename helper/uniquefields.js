class UniqueFields {
  /**
   * Формируем уникальный массив атрибутов
   *
   * @param {*} data
   * @memberof UniqueFields
   */
  parseFields(data) {
    const result = [];
    data.forEach(el => {
      for (const property in el) {
        if (property !== "date" && property !== "count") {
          !result.find(position => position === el[property])
            ? result.push(el[property])
            : null;
        }
      }
    });
    return result;
  }
}

module.exports = new UniqueFields();
