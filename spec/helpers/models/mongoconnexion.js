beforeEach(() => {
    jasmine.addMatchers({
        toBeConnected: () => {
            return {
                compare: function (connexion) {
                    return {
                        pass: connexion !== null
                    }
                }
            };
        }
    });
});
