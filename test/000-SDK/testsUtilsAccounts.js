const superAgent = require('superagent');

const testsUtils = require('./testsUtils');
const TestUtilsObjectManagement = require('./testsUtilsObjectManagement.js');

const POST_ACCOUNT_BODY = {
    id: "ab4d6570-dab6-11e9-b47a-08100f100c10",
    firstname: "test",
    lastname: "user",
    email: "test.user@orange.com",
    admin: false,
    active: true,
    session_id: "no session",
    creation_date: 1568881370440.0,
    current_connexion_date: 1568881370439.0,
    last_connexion_date: 1568881370440.0,
    token: "4405D9EF5E3F50698EEC808E3DAF9975"
};

const MONGODB_ACCOUNT_BODY = {
    id: "ab4d6570-dab6-11e9-b47a-08100f100c10",
    firstname: "test",
    lastname: "user",
    email: "test.user@orange.com",
    admin: false,
    active: true,
    session_id: "no session",
    creation_date: 1568881370440.0,
    current_connexion_date: 1568881370439.0,
    last_connexion_date: 1568881370440.0,
    token: "4405D9EF5E3F50698EEC808E3DAF9975"
};

class TestsUtilsAccounts extends TestUtilsObjectManagement {
    constructor() {
        super();
    }

    getPost(mock) {
        let object = JSON.parse(JSON.stringify(POST_ACCOUNT_BODY));

        Object.keys(mock).forEach(key => {
            if (mock[key] === null) {
                delete object[key];
            } else {
                object[key] = mock[key];
            }
        });

        console.log('getPost object: %j', object);
        return object;
    }

    getMongoDB(mock) {
        let object = JSON.parse(JSON.stringify(MONGODB_ACCOUNT_BODY));

        Object.keys(mock).forEach(key => {
            if (mock[key] === null) {
                delete object[key];
            } else {
                object[key] = mock[key];
            }
        });

        console.log('getMongoDB object: %j', object);
        return object;
    }

    create(accountToDelete) {
        return new Promise((resolve, reject) => {
            try {
                // console.log('create server: %s', testsUtils.getServerUrlVersion());
                superAgent
                    .post(`${testsUtils.getServerUrlVersion()}/account`)
                    .ca(testsUtils.httpsClientOptions().ca)
                    .cert(testsUtils.httpsClientOptions().cert)
                    .key(testsUtils.httpsClientOptions().key)
                    .send(accountToDelete)
                    .end((error, response) => {
                        if (error !== null) {
                            reject(`Account creation error : ${JSON.stringify(error)}`);
                        } else if (response.status !== 201) {
                            reject(`Account creation failed : ${JSON.stringify(response.status)}`);
                        } else {
                            resolve(response.body);
                        }
                    });
            } catch (exception) {
                reject(`Account creation exception : ${JSON.stringify(exception)}`);
            }
        });
    }

    delete(accountToDelete, token) {
        return new Promise((resolve, reject) => {
            try {
                // console.log('delete server: %s', testsUtils.getServerUrlVersion());
                superAgent
                    .delete(`${testsUtils.getServerUrlVersion()}/account/${accountToDelete}/${token}`)
                    .ca(testsUtils.httpsClientOptions().ca)
                    .cert(testsUtils.httpsClientOptions().cert)
                    .key(testsUtils.httpsClientOptions().key)
                    .send()
                    .end((error, response) => {
                        if (error !== null) {
                            if (error.status === 404) {
                                reject(`Account deletion failed : ${JSON.stringify(error.status)}`);
                            } else {
                                reject(`Account deletion error : ${JSON.stringify(error)}`);
                            }
                        } else if (response.status !== 204) {
                            reject(`Account deletion failed : ${JSON.stringify(response.status)}`);
                        } else {
                            resolve({});
                        }
                    });
            } catch (exception) {
                reject(`Account deletion exception : ${JSON.stringify(exception)}`);
            }
        });
    }

    deleteIfExists(accountToDelete, token) {
        return new Promise((resolve, reject) => {
            try {
                this.delete(accountToDelete, token)
                    .then(deleteAccountResponse => {
                        resolve({});
                    })
                    .catch(deleteAccountError => {
                        if (deleteAccountError === "Account deletion failed : 404") {
                            resolve({});
                        } else {
                            reject(deleteAccountError)
                        }
                    });
            } catch (exception) {
                reject(`Account deletion exception : ${JSON.stringify(exception)}`);
            }
        });
    }
}

module.exports = TestsUtilsAccounts;