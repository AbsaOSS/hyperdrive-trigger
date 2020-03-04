
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

export const routeNames = {
  DEFAULT: '',
  LOGIN: 'login',
  HOME: 'home',
  WORKFLOWS: 'workflows',
  RUNS: 'runs',
};

export const absoluteRoutes = {
  DEFAULT: `/${routeNames.DEFAULT}`,
  LOGIN: `/${routeNames.LOGIN}`,
  HOME: `/${routeNames.HOME}`,
  WORKFLOWS: `/${routeNames.WORKFLOWS}`,
  RUNS: `/${routeNames.RUNS}`,
};

export const api = {
  USER_INFO: '/api/user/info',
  LOGIN: '/api/login',
  LOGOUT: '/api/logout',
};

export const localStorageKeys = {
  CSRF_TOKEN: 'csrf-token',
  USERNAME: 'username',
};
