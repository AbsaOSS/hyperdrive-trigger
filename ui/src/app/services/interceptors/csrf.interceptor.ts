import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from "@angular/common/http";
import {Observable} from "rxjs";

@Injectable({providedIn: 'root'})
export class CsrfInterceptor implements HttpInterceptor {

  constructor() {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const csrfToken =  localStorage.getItem('csrf-token');
    if (request.method !== 'GET' && csrfToken) {
      request = request.clone({setHeaders: {'X-CSRF-TOKEN': csrfToken}});
    }
    return next.handle(request);
  }

}
