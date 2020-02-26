import { Component, OnInit } from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState, reducers} from "../../stores/app.reducers";
import {AuthActions, Login} from "../../stores/auth/auth.actions";
import {Observable} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  getState: Observable<any>;
  form = {
    username: 'hyperdriver-user',
    password: 'hyperdriver-password'
  };

  constructor(private store: Store<AppState>) {
    this.getState = this.store.select('auth');
  }

  ngOnInit(): void {
  }

  onSubmit() {
    const payload: {username: string, password: string} = {
      username: this.form.username,
      password: this.form.password
    };
    this.store.dispatch(new Login(payload));
  }

}
