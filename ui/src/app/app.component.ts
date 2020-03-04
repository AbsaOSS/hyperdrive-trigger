import {Component, OnDestroy, OnInit} from '@angular/core';
import {Store} from "@ngrx/store";
import {Subscription} from "rxjs";
import * as AuthActions from './stores/auth/auth.actions';
import * as fromApp from './stores/app.reducers';
import {absoluteRoutes} from './app.constants';
import {selectAuthState} from './stores/app.reducers';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  routes = absoluteRoutes;
  authStateSubscription: Subscription;
  isAuthenticated: boolean;
  username: string;

  constructor(private store: Store<fromApp.AppState>) {}

  ngOnInit(): void {
    this.authStateSubscription = this.store.select(selectAuthState).subscribe((state) => {
      this.isAuthenticated = state.isAuthenticated;
      this.username = state.username;
    });
  }

  ngOnDestroy(): void {
    this.authStateSubscription.unsubscribe();
  }

  onLogOut(){
    this.store.dispatch(new AuthActions.Logout());
  }

}
