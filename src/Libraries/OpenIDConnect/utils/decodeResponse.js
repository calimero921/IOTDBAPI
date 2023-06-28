/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2023 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

const globalPrefix = '/Libraries/OpenIDConnect/utils/decodeResponse.js';

class DecodeResponse {
    constructor(context, serverLogger) {
        this.context = context;
        this.context.serverLogger = serverLogger;
        const logger = context.serverLogger.child({
            source: globalPrefix + ':constructor',
            httpRequestId: context.httpRequestId,
            authorizedClient: context.authorizedClient
        });
        logger.debug('DecodeResponse constructor done');
    }

    decode(response) {
        const logger = this.context.serverLogger.child({
            source: globalPrefix + ':decode',
            httpRequestId: this.context.httpRequestId,
            authorizedClient: this.context.authorizedClient
        });
        logger.debug('response: %j', response);

        //décodage en JSON
        if (isJSON(this.context, response)) {
            logger.debug('Done - JSON');
            return parseJSON(this.context, response);
        }

        //décodage en HTML
        if (isHTML(this.context, response)) {
            logger.debug('Done - HTML');
            return parseHTML(this.context, response);
        }

        //décodage en XML
        if (isXML(this.context, response)) {
            logger.debug('Done - XML');
            return response;
        }

        logger.debug('Done - Raw');
        return response;
    }
}

function isJSON(context, response) {
    const logger = context.serverLogger.child({
        source: globalPrefix + ':isJSON',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.debug('Done - Ok');
    return response.startsWith("[") || response.startsWith("{");
}

function isXML(context, response) {
    const logger = context.serverLogger.child({
        source: globalPrefix + ':isXML',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.debug('Done - Ok');
    return response.startsWith("<?xml");
}

function isHTML(context, response) {
    const logger = context.serverLogger.child({
        source: globalPrefix + ':isHTML',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    logger.debug('Done - Ok');
    return response.startsWith("<!DOCTYPE html>");
}

function parseJSON(context, content) {
    const logger = context.serverLogger.child({
        source: globalPrefix + ':parseJSON',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    // logger.debug("content: %O", content);
    const result = JSON.parse(content);
    // logger.debug("result: %O", result);

    let error;
    if (result.code) {
        if (!error) {
            error = {}
        }
        error.code = result.code;
        result.code = {};
        if (result.type) {
            if (!error) {
                error = {}
            }
            error.type = result.type;
            result.type = {};
        }
        if (result.message) {
            if (!error) {
                error = {}
            }
            error.message = result.message;
            result.message = {};
        }
    }
    if (error) {
        result.error = error
    }

    logger.debug("result: %O", result);
    return result;
}

function parseHTML(context, content) {
    const logger = context.serverLogger.child({
        source: globalPrefix + ':parseHTML',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    let result = {};
    const error = {};

    let body = getSection(context, content, "body");
    logger.debug("body: %O", body);

    const h1 = getSection(context, body, "h1");
    logger.debug("h1: %s", h1);
    if (h1.length > 0) {
        body = removeSection(context, body, "h1");
        logger.debug("body: %O", body);
        if (h1.startsWith("HTTP Status")) {
            error.code = h1.substr(12, 3);
            let p = getSection(context, body, "p");
            logger.debug("p: %s", p);
            while (p.length > 0) {
                body = removeSection(context, body, "p");
                logger.debug("body: %O", body);

                const b = getSection(context, p, "b");
                logger.debug("b: %s", b);

                if (b.length > 0) {
                    switch (b) {
                        case "type":
                            error.type = removeSection(context, p, "b").trim();
                            break;
                        case "message":
                            error.message = getSection(context, p, "u").trim();
                            break;
                        case "description":
                            error.description = getSection(context, p, "u").trim();
                            break;
                        default:
                            break;
                    }
                }
                p = getSection(context, body, "p");
                logger.debug("p: %s", p);
            }
        }
    }

    if (!result) {
        error.code = "500";
        error.message = "Internal hostName error";
    }

    if (error) {
        result.error = error
    }

    logger.debug("result: %O", result);
    return result;
}

function getSection(context, content, section) {
    const logger = context.serverLogger.child({
        source: globalPrefix + ':getSection',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });

    let start = content.indexOf(`<${section}>`);
    if (start > -1) {
        start = start + section.length + 2;
        const stop = content.indexOf(`</${section}>`);
        if (stop > -1) {
            return content.substring(start, stop)
        }
    }
    logger.debug('Done - Ok');
    return "";
}

function removeSection(context, content, section) {
    const logger = context.serverLogger.child({
        source: globalPrefix + ':removeSection',
        httpRequestId: context.httpRequestId,
        authorizedClient: context.authorizedClient
    });
    let result = "";
    const start = content.indexOf(`<${section}>`);
    if (start > -1) {
        result = content.substring(0, start);
        //start = start + section.length + 2;
        const stop = content.indexOf(`</${section}>`);
        if (stop > -1) {
            return result + content.substring(stop + section.length + 3)
        }
    }
    logger.debug("result: %O", result);
    return result;
}

module.exports = DecodeResponse;
