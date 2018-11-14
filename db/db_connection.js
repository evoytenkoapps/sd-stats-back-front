var pgp = require("pg-promise")( /*options*/);
var environment = require('../environment');
var db = pgp(`postgres://${environment.db_user}:${environment.db_password}@${environment.db_host}:${environment.db_port}/${environment.db_dbname}`);
var {
    helpers
} = pgp;

module.exports = {
    db,
    helpers,
};