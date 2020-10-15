const uuid = require('uuid');

const serverLogger = require('../../utils/ServerLogger.js');

const globalPrefix = '/models/Generator.js';

class Generator {
    constructor(context) {
        this.context = context
    }

    idgen() {
        const logger = serverLogger.child({
            source: globalPrefix + ':idgen',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });

        logger.debug('idgen starting');
        let node = [];

        for(let i=0; i<6; i++) {
            node.push(parseInt(Math.floor(Math.random()*16)), 16);
        }
        logger.debug('node: %j', node);

        let data = uuid.v1({node: node});
        logger.debug('data: %s', data);
        return data;
    }

    keygen() {
        const logger = serverLogger.child({
            source: globalPrefix + ':keygen',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });
        logger.debug('keygen starting');
        const dictionnary = "0123456789ABCDEF";
        const keylength = 256;
        let result = "";

        for(let i=0; i < Math.floor(keylength/8); i++) {
            result = result + dictionnary.substr(Math.floor(Math.random()*dictionnary.length), 1);
        }
        logger.debug('result: %s', result);
        return result;
    }
}

module.exports = Generator;