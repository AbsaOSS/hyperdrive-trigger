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

let AuthRepository = new function () {

    this.getUserInfo = function (fnSuccess) {
        $.ajax("user/info", {
            method: "GET",
            success: fnSuccess,
            async: false
        })
    };

    this.login = function (oData, fnSuccess, fnError) {
        $.ajax("login", {
            data: oData,
            method: "POST",
            success: fnSuccess,
            error: fnError,
            async: false
        })
    };

    this.logout = function () {
        $.ajax("logout", {
            method: "POST",
            beforeSend: (oJqXHR, oSettings) => {
                let csrfToken = localStorage.getItem("csrfToken");
                oJqXHR.setRequestHeader("X-CSRF-TOKEN", csrfToken);
            },
            async: false
        })
    };

}();
