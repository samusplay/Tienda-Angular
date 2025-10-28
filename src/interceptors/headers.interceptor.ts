import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


@Injectable()
export class HeadersInterceptor implements HttpInterceptor {

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const clonedRequest = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    });
    const hasContentType = clonedRequest.headers.has('Content-Type');

    return next.handle(clonedRequest);
  }

  addHeaders(request: HttpRequest<unknown>): HttpRequest<any> {
    return (request = request.clone({
      setHeaders: {
        'Content-Type': 'application/json',
      },
    }));
  }
}