import { authReducer, State } from './auth.reducers';
import { Login, LoginFailure, LoginSuccess, Logout, LogoutSuccess, LogoutWithoutRedirect } from './auth.actions';
import { localStorageKeys } from '../../constants/localStorage.constants';
import { UserInfoModelFactory } from '../../models/userInfo.model';

describe('AuthReducers', () => {
  const initialState = {
    userInfo: null,
    isAuthenticated: null,
    authenticationFailed: null,
  } as State;

  function toState(dict: {}) {
    return dict as State;
  }

  it('should not change state on login', () => {
    const authAction = new Login({ username: 'the-username', password: 'password' });

    const actual = authReducer(initialState, authAction);

    expect(actual).toEqual(initialState);
  });

  it('should set authenticated flag and user info on login success', () => {
    const userInfo = UserInfoModelFactory.create('the-username', 'env', 'ver');
    const authAction = new LoginSuccess({ token: '1234', userInfo: userInfo });
    spyOn(localStorage, 'setItem');

    const actual = authReducer(initialState, authAction);

    expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.USERNAME, userInfo.username);
    expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.ENVIRONMENT, userInfo.environment);
    expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.VERSION, userInfo.version);
    expect(localStorage.setItem).toHaveBeenCalledWith(localStorageKeys.CSRF_TOKEN, '1234');
    expect(actual).toEqual(
      toState({
        userInfo: userInfo,
        isAuthenticated: true,
        authenticationFailed: null,
        showLoginDialog: false,
      }),
    );
  });

  it('should set authentication failed flag on login failure', () => {
    const authAction = new LoginFailure();

    const actual = authReducer(initialState, authAction);

    expect(actual).toEqual(
      toState({
        userInfo: null,
        isAuthenticated: null,
        authenticationFailed: true,
      }),
    );
  });

  it('should not change state on logout', () => {
    const authAction = new Logout();

    const actual = authReducer(initialState, authAction);

    expect(actual).toEqual(initialState);
  });

  it('should set authentication failed flag on logout success', () => {
    const state = {
      userInfo: UserInfoModelFactory.create('the-username', 'env', 'ver'),
      isAuthenticated: true,
      authenticationFailed: true,
    } as State;
    const authAction = new LogoutSuccess();
    spyOn(localStorage, 'removeItem');

    const actual = authReducer(state, authAction);

    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.USERNAME);
    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.ENVIRONMENT);
    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.VERSION);
    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.CSRF_TOKEN);
    expect(actual).toEqual(
      toState({
        userInfo: null,
        isAuthenticated: false,
        authenticationFailed: false,
      }),
    );
  });

  it('should set show modal login on logout without redirect', () => {
    const state = {
      userInfo: UserInfoModelFactory.create('the-username', 'env', 'ver'),
      isAuthenticated: true,
      authenticationFailed: true,
      showLoginDialog: false,
    } as State;
    const authAction = new LogoutWithoutRedirect();
    spyOn(localStorage, 'removeItem');

    const actual = authReducer(state, authAction);

    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.USERNAME);
    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.ENVIRONMENT);
    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.VERSION);
    expect(localStorage.removeItem).toHaveBeenCalledWith(localStorageKeys.CSRF_TOKEN);
    expect(actual).toEqual(
      toState({
        userInfo: null,
        isAuthenticated: false,
        authenticationFailed: false,
        showLoginDialog: true,
      }),
    );
  });
});
