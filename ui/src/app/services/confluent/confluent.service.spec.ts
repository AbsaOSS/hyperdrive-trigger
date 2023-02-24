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

import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { api } from '../../constants/api.constants';
import { ConfluentService } from './confluent.service';
import { KafkaTopicAuthorizationResponseModelFactory } from '../../models/kafkaTopicAuthorizationResponse.model';

describe('ConfluentService', () => {
  let underTest: ConfluentService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ConfluentService],
      imports: [HttpClientTestingModule],
    });
    underTest = TestBed.inject(ConfluentService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(underTest).toBeTruthy();
  });

  it('getKafkaTopicAuthorizations() should return topic authorizations', () => {
    const topic = 'topic';
    const response = KafkaTopicAuthorizationResponseModelFactory.create(true, true, true);
    underTest.getKafkaTopicAuthorizations(topic).subscribe(
      (data) => expect(data).toEqual(response),
      (error) => fail(error),
    );

    const req = httpTestingController.expectOne(api.GET_KAFKA_TOPIC_AUTHORIZATIONS.replace('{kafkaTopic}', topic));
    expect(req.request.method).toEqual('GET');
    req.flush(response);
  });
});
