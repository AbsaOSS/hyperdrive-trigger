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

import {Component} from '@angular/core';
import {routeName} from '../../app.routes';
import {User} from '../../models/user';
import {AlertService} from '../../services/alert.service';
import {HttpClient} from '@angular/common/http';
import {AuthService} from '../../services/auth.service';
import {Router} from '@angular/router';
import {api} from '../../app.api-paths';

@Component({
  selector: 'app-demo',
  templateUrl: './demo.component.html',
})
export class DemoComponent {

  constructor(private alertService: AlertService,
              private http: HttpClient,
              private authService: AuthService,
              private router: Router,
  ) {
  }

  getUserInfo() {
    this.http.get<User>(api.USER_INFO)
      .subscribe(value => this.alertService.success(value.username));
  }

  throwError() {
    throw new Error('Deliberate error thrown');
  }

  logout() {
    this.authService.logout()
      .subscribe(
        data => {
          this.router.navigate([`/${routeName.DEFAULT}`]);
        }
      );
  }

  info(message: string) {
    this.alertService.info(message);
  }

  warn(message: string) {
    this.alertService.warn(message);
  }

  clear() {
    this.alertService.clear();
  }
}
