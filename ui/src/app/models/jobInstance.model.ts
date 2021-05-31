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

import { JobType } from './jobType.model';

export type JobInstanceModel = {
  id: number;
  jobName: string;
  jobParameters: JobInstanceParametersModel;
  applicationId: string;
  created: Date;
  updated: Date;
  jobStatus: JobStatus;
  order: number;
};

export type JobStatus = {
  name: string;
};

export class JobInstanceModelFactory {
  static create(
    id: number,
    jobName: string,
    jobParameters: JobInstanceParametersModel,
    applicationId: string,
    created: Date,
    updated: Date,
    jobStatus: JobStatus,
    order: number,
  ): JobInstanceModel {
    return {
      id: id,
      jobName: jobName,
      jobParameters: jobParameters,
      applicationId: applicationId,
      created: created,
      updated: updated,
      jobStatus: jobStatus,
      order: order,
    };
  }
}

export class JobStatusFactory {
  static create(name: string): JobStatus {
    return { name: name };
  }
}

export type JobInstanceParametersModel = {
  jobType: JobType;
};

export class JobInstanceParametersModelFactory {
  static create(jobType: JobType): JobInstanceParametersModel {
    return {
      jobType: jobType,
    };
  }
}
