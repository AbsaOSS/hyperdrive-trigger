/*
 * Copyright 2018-2019 ABSA Group Limited
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

let WSClient = new function () {

    this.get = function (url, fnSuccess, fnError) {
        this._ajax("GET", url, fnSuccess, fnError, {});
    };

    this.put = function (url, fnSuccess, fnError, data) {
        this._ajax("PUT", url, fnSuccess, fnError, data);
    };

    this.post = function (url, fnSuccess, fnError, data) {
        this._ajax("POST", url, fnSuccess, fnError, data);
    };

    this.delete = function (url, fnSuccess, fnError) {
        this._ajax("DELETE", url, fnSuccess, fnError, {});
    };

    this._ajax = function (method, url, fnSuccess, fnError, data) {
        let fnUnauthorized = (xhr) => {
            if (xhr.status === 401) {
                sap.ui.getCore().getEventBus().publish("nav", "unauthorized");
            } else {
                fnError();
            }
        };
        let oFormattedData = null;
        if ((method.toLowerCase() === "post" || method.toLowerCase() === "put")
            && (typeof data === "object")) {
            oFormattedData = JSON.stringify(data)
        }
        $.ajax({
            beforeSend: (oJqXHR, oSettings) => {
                if (method.toLowerCase() !== "get") {
                    let csrfToken = localStorage.getItem("csrfToken");
                    oJqXHR.setRequestHeader("X-CSRF-TOKEN", csrfToken);
                }
            },
            type: method,
            url: url,
            contentType: "application/json",
            dataType: "json",
            data:  oFormattedData,
            async: false,
            success: fnSuccess,
            error: fnUnauthorized
        });
    }

}();
