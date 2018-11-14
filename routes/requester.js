class Requester {

    getDbError(error) {
        console.error('error', error.message);
        return {
            success: false,
            data: null,
            error: {
                code: 0,
                text: 'Server error'
            }
        }
    }

    createBody(success, data, error) {
        return {
            success,
            data,
            error,
        };
    }

}
module.exports = new Requester();