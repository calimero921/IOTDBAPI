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

import testsUtils from './000-SDK/testsUtils.mjs';

before(done => {
    console.log("before in file");

    testsUtils.startServer()
        .then(startedServer => {
            console.log('server started')
            done();
        })
        .catch(beforeError => {
            console.log("beforeError = ", beforeError);
            done(beforeError);
        });
});

