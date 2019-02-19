var environment = {};
const currentEnv = process.env.NODE_ENV || 'prod';
console.log('currentEnv', currentEnv);

if (currentEnv === 'prod') {
    // prod 
    environment.host = '192.168.20.129';
    environment.port = '8882';
    environment.db_host = '127.0.0.1';
    environment.db_port = '5432';
    environment.db_password = 'Qwe12345';
    environment.db_user = 'postgres';
    environment.db_dbname = 'postgres';
    environment.table_calls = 'sd';
    environment.table_holidays = 'holidays';
    environment.sd_server = 'sd/j_security_check';
}

if (currentEnv === 'test') {
    // dev
    environment.host = '192.168.27.59'; //'localhost';
    environment.port = '8882';
    environment.db_host = '192.168.20.129';
    environment.db_port = '5432';
    environment.db_password = 'Qwe12345';
    environment.db_user = 'postgres';
    environment.db_dbname = 'postgres';
    environment.table_calls = 'sd';
    environment.table_holidays = 'holidays';
    environment.sd_server = 'sd/j_security_check';
}


if (currentEnv === 'dev') {
    // dev
    environment.host = '192.168.27.59'; //'localhost';
    environment.port = '8882';
    environment.db_host = '192.168.20.129';
    environment.db_port = '5432';
    environment.db_password = 'Qwe12345';
    environment.db_user = 'postgres';
    environment.db_dbname = 'test';
    environment.table_calls = 'test_sd';
    environment.table_holidays = 'holidays';
    environment.sd_server = 'sd/j_security_check';
}

module.exports = environment;