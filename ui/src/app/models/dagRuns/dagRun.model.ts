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

export type DagRunModel = {
  workflowName: string;
  projectName: string;
  jobCount: number;
  status: string;
  triggeredBy: string;
  started: Date;
  finished: Date;
  id: number;
};

export class DagRunModelFactory {
  static create(
    workflowName: string,
    projectName: string,
    jobCount: number,
    status: string,
    triggeredBy: string,
    started: Date,
    finished: Date,
    id: number,
  ): DagRunModel {
    return {
      workflowName: workflowName,
      projectName: projectName,
      jobCount: jobCount,
      status: status,
      triggeredBy: triggeredBy,
      started: started,
      finished: finished,
      id: id,
    };
  }
}
