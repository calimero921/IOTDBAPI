const testsUtils = require('./000-SDK/testsUtils');

let app = undefined;

before(done => {
    console.log("before in file");

    testsUtils.startServer()
        .then(startedServer => {
            app = startedServer;
            done();
        })
        .catch(beforeError => {
            console.log("beforeError = ", beforeError);
            done(beforeError);
        });
});

