/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

const puppeteer = require('puppeteer');

process.env.CHROMIUM_BIN = puppeteer.executablePath();
console.log('Chromium bin path: ' + process.env.CHROMIUM_BIN);

const baseConfig = require('./karma.conf.js');
module.exports = function (config) {
  baseConfig(config);
  config.set({
    colors: false,
    autoWatch: false,
    browsers: ['ChromiumHeadless'],
    singleRun: true,
    restartOnFileChange: false
  });
};
