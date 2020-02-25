module.exports = {
    url: 'mongodb://admin:admin@localhost:27017/admin?connectTimeoutMS=30000',
    login: 'admin',
    passwd: 'admin',
    host: 'localhost',
    port: 27017,
    adminDbName: 'admin',
    connectTimeoutMS: 30000,
    dbName: 'iotdb',
    options: {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
};