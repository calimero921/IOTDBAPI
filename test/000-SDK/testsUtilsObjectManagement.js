const uuid = require('uuid');

class TestsUtilsObjectManagement {
    constructor() {
    }

    defineRandomId() {
        let node = [];
        for(let i=0; i<6; i++) {
            node.push(parseInt(Math.floor(Math.random()*16)), 16);
        }
        return uuid.v1({node: node});
    }

    defineRandomSessionId() {
        const dictionnary = "0123456789_ABCDEFGHIJKLMNOPQRSTUVWXYZ_abcdefghisjklmopqrstuvwxyz_";
        const keylength = 32;
        let result = "";

        for(let i=0; i < keylength; i++) {
            result = result + dictionnary.substr(Math.floor(Math.random()*dictionnary.length), 1);
        }
        return result;
    }
}

module.exports = TestsUtilsObjectManagement;