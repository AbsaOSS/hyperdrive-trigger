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

import {Injectable} from "@angular/core";
import {Actions, Effect, ofType} from "@ngrx/effects";
import * as WorkflowActions from "../workflows/workflows.actions";

import {catchError, mergeMap, switchMap, withLatestFrom} from "rxjs/operators";
import {WorkflowService} from "../../services/workflow/workflow.service";
import {ProjectModel} from "../../models/project.model";
import {WorkflowJoinedModel} from "../../models/workflowJoined.model";
import {workflowModes} from "../../models/enums/workflowModes.constants";
import {DynamicFormParts, WorkflowFormPartsModel} from "../../models/workflowFormParts.model";
import {workflowFormPartsSequences, workflowFormParts as workflowFormPartsConsts} from "../../constants/workflowFromParts.constants";
import get from 'lodash/get';
import {AppState, selectWorkflowState} from "../app.reducers";
import {Store} from "@ngrx/store";
import * as fromWorkflows from "./workflows.reducers";
import {WorkflowEntryModel} from "../../models/workflowEntry.model";
import {JobEntryModel} from "../../models/jobEntry.model";

@Injectable()
export class WorkflowsEffects {
  constructor(private actions: Actions, private workflowService: WorkflowService, private store: Store<AppState>) {}

  @Effect({dispatch: true})
  workflowsInitialize = this.actions.pipe(
    ofType(WorkflowActions.INITIALIZE_WORKFLOWS),
    switchMap((action: WorkflowActions.InitializeWorkflows) => {
      return this.workflowService.getProjects()
    }),
    mergeMap((projects: ProjectModel[]) => {
      return this.workflowService.getWorkflowDynamicFormParts().pipe(
        mergeMap((workflowComponents: DynamicFormParts) => {
          let workflowFormParts = new WorkflowFormPartsModel(
            workflowFormPartsSequences.allDetails,
            workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
            workflowFormPartsConsts.JOB.JOB_NAME,
            workflowFormPartsConsts.JOB.JOB_TYPE,
            workflowComponents
          );
          return [{
            type: WorkflowActions.INITIALIZE_WORKFLOWS_SUCCESS,
            payload: {
              projects: projects,
              workflowFormParts: workflowFormParts
            }
          }];
        }),
        catchError(() => {
          return [{
            type: WorkflowActions.INITIALIZE_WORKFLOWS_FAILURE
          }];
        })
      )
    })
  );

  @Effect({dispatch: true})
  workflowInitializationStart = this.actions.pipe(
    ofType(WorkflowActions.START_WORKFLOW_INITIALIZATION),
    withLatestFrom(
      this.store.select(selectWorkflowState)
    ),
    switchMap(([action, state]: [WorkflowActions.StartWorkflowInitialization,  fromWorkflows.State]) => {
      if(action.payload.mode === workflowModes.CREATE) {
        return [{
          type: WorkflowActions.SET_EMPTY_WORKFLOW
        }];
      } else {
        if(!action.payload.id) {
          return [{
            type: WorkflowActions.LOAD_WORKFLOW_FAILURE_INCORRECT_ID
          }];
        } else {
          return this.workflowService.getWorkflow(action.payload.id).pipe(

            mergeMap((worfklow: WorkflowJoinedModel) => {
              let workflowDetailsData = workflowFormPartsSequences.allDetails.map(detail => {
                let value = get(worfklow, detail.property);
                if(value != undefined) {
                  return new WorkflowEntryModel(detail.property, value);
                }
              });

              let sensorType = workflowFormPartsConsts.SENSOR.SENSOR_TYPE;
              let sensorTypeValue = get(worfklow.sensor, sensorType.property);
              let sensorDynamicParts = state.workflowFormParts.dynamicParts.sensorDynamicParts.find(
                part => part.name == sensorTypeValue
              ).parts;
              let sensorData = sensorDynamicParts.concat(sensorType).map(part => {
                let value = get(worfklow.sensor, part.property);
                if(value != undefined) {
                  return new WorkflowEntryModel(part.property, value);
                }
              });

              let jobsData = worfklow.dagDefinitionJoined.jobDefinitions.map( job => {
                let jobStaticPart = workflowFormPartsConsts.JOB.JOB_NAME;
                let jobDynamicPart = workflowFormPartsConsts.JOB.JOB_TYPE;
                let jobDynamicPartValue = get(job, jobDynamicPart.property);
                let jobDynamicParts = state.workflowFormParts.dynamicParts.jobDynamicParts.find(
                  part => part.name == jobDynamicPartValue
                ).parts;
                let jobData = jobDynamicParts.concat(jobDynamicPart, jobStaticPart).map(part => {
                  let value = get(job, part.property);
                  if(value != undefined) {
                    return new WorkflowEntryModel(part.property, value);
                  }
                });
                return new JobEntryModel(job.order, jobData);
              });

              return [{
                type: WorkflowActions.LOAD_WORKFLOW_SUCCESS,
                payload: {workflow: worfklow, detailsData: workflowDetailsData, sensorData: sensorData, jobsData: jobsData}
              }];
            }),
            catchError(() => {
              return [{
                type: WorkflowActions.LOAD_WORKFLOW_FAILURE
              }];
            })
          )
        }
      }
    })
  );

}
