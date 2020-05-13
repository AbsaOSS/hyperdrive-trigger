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

import { TestBed } from '@angular/core/testing';

import { PreviousRouteService } from './previous-route.service';
import { RouterTestingModule } from '@angular/router/testing';
import { NavigationEnd, Router } from '@angular/router';

describe('PreviousRouteService', () => {
  let underTest: PreviousRouteService;
  let router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PreviousRouteService],
      imports: [RouterTestingModule.withRoutes([])],
    });
    underTest = TestBed.inject(PreviousRouteService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getPreviousUrl() should return undefined when there is no previous url', () => {
    expect(underTest.getPreviousUrl()).toBe(undefined);
  });

  it('getPreviousUrl() should return previous url when is defined', () => {
    const firstUrl = '/first/url';
    const secondUrl = '/next/url';
    const lastUrl = '/last/url';

    router.events.next(new NavigationEnd(0, firstUrl, firstUrl));
    router.events.next(new NavigationEnd(1, secondUrl, secondUrl));
    expect(underTest.getPreviousUrl()).toBe(firstUrl);

    router.events.next(new NavigationEnd(2, lastUrl, lastUrl));
    expect(underTest.getPreviousUrl()).toBe(secondUrl);
  });
});
