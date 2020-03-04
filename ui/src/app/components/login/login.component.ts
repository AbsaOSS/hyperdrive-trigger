import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {AppState} from "../../stores/app.reducers";
import {Login} from "../../stores/auth/auth.actions";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {

  authStateSubscription: Subscription;
  authenticationFailed: boolean = false;
  logInForm = {
    username: 'hyperdriver-user',
    password: 'hyperdriver-password'
  };

  constructor(private store: Store<AppState>) {}

  ngOnInit(): void {
    this.authStateSubscription = this.store.select('auth').subscribe((state) => {
      this.authenticationFailed = state.authenticationFailed;
    });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  onSubmit() {
    this.store.dispatch(new Login(this.logInForm));
  }

}
