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

import { KafkaComponent } from './kafka.component';
import { KafkaSensorProperties } from '../../../../../../models/sensorProperties.model';

describe('KafkaComponent', () => {
  let fixture: ComponentFixture<KafkaComponent>;
  let underTest: KafkaComponent;

  beforeEach(
    waitForAsync(() => {
      TestBed.configureTestingModule({
        declarations: [KafkaComponent],
      }).compileComponents();
    }),
  );

  beforeEach(() => {
    fixture = TestBed.createComponent(KafkaComponent);
    underTest = fixture.componentInstance;

    //set test data
    underTest.isShow = false;
    underTest.sensorProperties = KafkaSensorProperties.createEmpty();
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

  it('should emit updated properties when matchPropertiesChange() is called', () => {
    spyOn(underTest.sensorPropertiesChange, 'emit');
    const newMatchProperties = new Map<string, string>([
      ['newMatchPropertyKey1', 'newMatchPropertyValue1'],
      ['newMatchPropertyKey2', 'newMatchPropertyValue2'],
      ['newMatchPropertyKey3', 'newMatchPropertyValue3'],
    ]);
    const newSensorProperties = { ...underTest.sensorProperties, matchProperties: newMatchProperties };

    underTest.matchPropertiesChange(newMatchProperties);

    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalled();
    expect(underTest.sensorPropertiesChange.emit).toHaveBeenCalledWith(newSensorProperties);
  });
});
