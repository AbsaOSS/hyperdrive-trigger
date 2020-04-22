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
import {WorkflowComponentsModel} from "../../models/workflowComponents.model";
import {DynamicFormParts, FormPart, WorkflowFormPartsModel} from "../../models/workflowFormParts.model";
import {workflowFromPartsSequences, workflowFormParts as workflowFormPartsConsts} from "../../constants/workflowFromParts.constants";
import get from 'lodash/get';
import {AppState, selectWorkflowState} from "../../stores/app.reducers";
import {Store} from "@ngrx/store";
import {accessibility1Icon} from "@clr/core/icon-shapes";
import * as fromWorkflows from "./workflows.reducers";

@Injectable()
export class WorkflowsEffects {
  constructor(private actions: Actions, private workflowService: WorkflowService, private store: Store<AppState>) {}

  @Effect({dispatch: true})
  workflowsInitialize = this.actions.pipe(
    ofType(WorkflowActions.INITIALIZE_WORKFLOWS),
    switchMap((action: WorkflowActions.InitializeWorkflows) => {
      return this.workflowService.getProjects().pipe(
        mergeMap((projects: ProjectModel[]) => {
          return this.workflowService.getWorkflowComponents().pipe(
            mergeMap((workflowComponents: DynamicFormParts) => {
              let workflowFormParts = new WorkflowFormPartsModel(
                workflowFromPartsSequences.getDetails,
                workflowFormPartsConsts.SENSOR.SENSOR_TYPE,
                workflowFormPartsConsts.JOB.JOB_NAME,
                workflowFormPartsConsts.JOB.JOB_TYPE,
                workflowComponents
              );
              return [{
                type: WorkflowActions.INITIALIZE_WORKFLOWS_SUCCESS,
                payload: {projects: projects, workflows: [].concat(...projects.map((project) => project.workflows)), workflowFormParts: workflowFormParts}
              }];
            }),
            catchError(() => {
              return [{
                type: WorkflowActions.INITIALIZE_WORKFLOWS_FAILURE
              }];
            })
          )
        })
      )
    })
  );

  @Effect({dispatch: true})
  workflowInitializationStart = this.actions.pipe(
    ofType(WorkflowActions.STAR_WORKFLOW_INITIALIZATION),
    withLatestFrom(
      this.store.select(selectWorkflowState),
      // , (action, state) => {
      //   return {action: action, state: state.workflowFormParts};
      // }
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
              let workflowDetailsData = workflowFromPartsSequences.getDetails.map(detail => {
                let value = get(worfklow, detail.property);
                if(value != undefined) {
                  return {property: detail.property, value: value}
                }
              });

              let sensorDynamicPart = workflowFormPartsConsts.SENSOR.SENSOR_TYPE;
              let sensorDynamicPartValue = get(worfklow.sensor, sensorDynamicPart.property);
              let sensorDynamicParts = state.workflowFormParts.dynamicParts.sensorDynamicParts.find(xxx => xxx.name == sensorDynamicPartValue).parts;
              let sensorData = sensorDynamicParts.concat(sensorDynamicPart).map(detail => {
                let value = get(worfklow.sensor, detail.property);
                if(value!= undefined) {
                  return {property: detail.property, value: value}
                }
              });

              let jobsData = worfklow.dagDefinitionJoined.jobDefinitions.map( job => {
                let jobStaticPart = workflowFormPartsConsts.JOB.JOB_NAME;
                let jobDynamicPart = workflowFormPartsConsts.JOB.JOB_TYPE;
                let jobDynamicPartValue = get(job, jobDynamicPart.property);
                // let jobStaticPartValue = get(job, jobStaticPart.property);
                let jobDynamicParts = state.workflowFormParts.dynamicParts.jobDynamicParts.find(xxx => xxx.name == jobDynamicPartValue).parts;
                let jobData = jobDynamicParts.concat(jobDynamicPart, jobStaticPart).map(detail => {
                  let value = get(job, detail.property);
                  if(value!= undefined) {
                    return {property: detail.property, value: value}
                  }
                });
                return {order: job.order, job:jobData}
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
