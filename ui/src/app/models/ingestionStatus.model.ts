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

import { KeyValueModel } from './keyValue.model';

export type IngestionStatusModel = {
  jobName: string;
  jobType: string;
  topic?: TopicModel;
};

export class IngestionStatusModelFactory {
  static create(jobName: string, jobType: string, topic?: TopicModel): IngestionStatusModel {
    return { jobName: jobName, jobType: jobType, topic: topic };
  }

  static fromIngestionStatusResponseModel(ingestionStatusResponse: IngestionStatusResponseModel): IngestionStatusModel {
    return this.create(
      ingestionStatusResponse.jobName,
      ingestionStatusResponse.jobType,
      ingestionStatusResponse?.topic
        ? TopicModelFactory.create(
            ingestionStatusResponse.topic.topic,
            ingestionStatusResponse.topic.messagesToIngest.map((keyValue) => keyValue.value).reduce((acc, cur) => acc + Number(cur), 0),
          )
        : null,
    );
  }
}

export type TopicModel = {
  topic: string;
  messagesToIngest: number;
};

export class TopicModelFactory {
  static create(topic: string, messagesToIngest: number): TopicModel {
    return { topic: topic, messagesToIngest: messagesToIngest };
  }
}

export type IngestionStatusResponseModel = {
  jobName: string;
  jobType: string;
  topic?: TopicResponseModel;
};

export class IngestionStatusResponseModelFactory {
  static create(jobName: string, jobType: string, topic?: TopicResponseModel): IngestionStatusResponseModel {
    return { jobName: jobName, jobType: jobType, topic: topic };
  }
}

export type TopicResponseModel = {
  topic: string;
  messagesToIngest: KeyValueModel[];
};

export class TopicResponseModelFactory {
  static create(topic: string, messagesToIngest: KeyValueModel[]): TopicResponseModel {
    return { topic: topic, messagesToIngest: messagesToIngest };
  }
}
