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

import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AbsaKafkaComponent } from './absa-kafka.component';
import { AbsaKafkaSensorProperties } from '../../../../../../models/sensorProperties.model';

describe('AbsaKafkaComponent', () => {
  let fixture: ComponentFixture<AbsaKafkaComponent>;
  let underTest: AbsaKafkaComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [AbsaKafkaComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(AbsaKafkaComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.isShow = false;
    underTest.sensorProperties = AbsaKafkaSensorProperties.createEmpty();
  });

  it('should create', () => {
    expect(underTest).toBeTruthy();
  });

  it('should emit updated properties when topicChange() is called', () => {
    spyOn(underTest.sensorPropertiesChange, 'emit');
    const newTopicValue = 'newTopicValue';
    const newSensorProperties = { ...underTest.sensorProperties, topic: newTopicValue };

    underTest.topicChange(newTopicValue);

    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalled();
    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });

  it('should emit updated properties when kafkaServersChange() is called', () => {
    spyOn(underTest.sensorPropertiesChange, 'emit');
    const newKafkaServersValue = ['server1', 'server2'];
    const newSensorProperties = { ...underTest.sensorProperties, servers: newKafkaServersValue };

    underTest.kafkaServersChange(newKafkaServersValue);

    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalled();
    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });

  it('should emit updated properties when ingestionTokenChange() is called', () => {
    spyOn(underTest.sensorPropertiesChange, 'emit');
    const newIngestionTokenValue = 'newIngestionTokenValue';
    const newSensorProperties = { ...underTest.sensorProperties, ingestionToken: newIngestionTokenValue };

    underTest.ingestionTokenChange(newIngestionTokenValue);

    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalled();
    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });
});
