/**
 * IOTDB API
 *
 * Copyright (C) 2019 - 2020 EDSoft
 *
 * This software is confidential and proprietary information of EDSoft.
 * You shall not disclose such Confidential Information and shall use it only in
 * accordance with the terms of the agreement you entered into.
 * Unauthorized copying of this file, via any medium is strictly prohibited.
 *
 * @author Calimero921
 */

'use strict';

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