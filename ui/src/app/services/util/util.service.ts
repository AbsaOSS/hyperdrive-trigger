import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { api } from '../../constants/api.constants';
import { map } from 'rxjs/operators';
import { QuartzExpressionDetailModel } from '../../models/quartzExpressionDetail.model';

@Injectable({
  providedIn: 'root',
})
export class UtilService {
  constructor(private httpClient: HttpClient) {}

  getQuartzDetail(expression: string): Observable<QuartzExpressionDetailModel[]> {
    const params = new HttpParams().set('expression', expression);

    return this.httpClient
      .get<QuartzExpressionDetailModel[]>(api.GET_QUARTZ_DETAIL, {
        params: params,
        observe: 'response',
      })
      .pipe(
        map((_) => {
          return _.body;
        }),
      );
  }
}
