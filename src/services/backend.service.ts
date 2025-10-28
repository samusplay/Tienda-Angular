import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../environments/enviroment';

type Params = Record<string, string | number | boolean | null | undefined>;

@Injectable({ providedIn: 'root' })
export class BackendService {
  private readonly base = environment.apiUrl.replace(/\/+$/, '');

  constructor(private http: HttpClient) {}

  private buildUrl(path: string): string {
    const p = path.replace(/^\/+/, '');
    return `${this.base}/${p}`;
  }

  private toParams(params?: Params): HttpParams | undefined {
    if (!params) return undefined;
    let hp = new HttpParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined) hp = hp.set(k, String(v));
    });
    return hp;
  }

  get<T>(path: string, params?: Params): Observable<T> {
    return this.http
      .get<T>(this.buildUrl(path), { params: this.toParams(params) })
      .pipe(catchError(this.handleError));
  }

  post<T>(path: string, body?: unknown, params?: Params): Observable<T> {
    return this.http
      .post<T>(this.buildUrl(path), body, { params: this.toParams(params) })
      .pipe(catchError(this.handleError));
  }

  put<T>(path: string, body?: unknown, params?: Params): Observable<T> {
    return this.http
      .put<T>(this.buildUrl(path), body, { params: this.toParams(params) })
      .pipe(catchError(this.handleError));
  }

  patch<T>(path: string, body?: unknown, params?: Params): Observable<T> {
    return this.http
      .patch<T>(this.buildUrl(path), body, { params: this.toParams(params) })
      .pipe(catchError(this.handleError));
  }

  delete<T>(path: string, params?: Params): Observable<T> {
    return this.http
      .delete<T>(this.buildUrl(path), { params: this.toParams(params) })
      .pipe(catchError(this.handleError));
  }

  private handleError(err: any) {
    console.error('[BackendService] error', err);
    return throwError(() => err);
  }
}
