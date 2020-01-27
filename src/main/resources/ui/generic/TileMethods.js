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

let TileMethods = new function () {

    this.reorderTiles = function (oEvent, model, path, view) {
        let positions = this._getPositions(oEvent);

        if(positions.oldIndex !== positions.dropIndex && positions.oldIndex !== positions.newIndex) {
            let oldJobs = model.getProperty(path);
            let newJobs = [];
            oldJobs.forEach(function(e) {
                if(e.order === positions.oldIndex) {
                    e.order = positions.newIndex;
                } else {
                    if((e.order > positions.oldIndex && e.order <= positions.newIndex)) {
                        e.order = e.order - 1
                    }
                    if((e.order < positions.oldIndex && e.order >= positions.newIndex)) {
                        e.order = e.order + 1
                    }
                }
                newJobs.push(e);
            });
            model.setProperty(path, newJobs.sort(function(f, s){return f.order - s.order}));
        } else {
            view.invalidate();
        }
    };

    this._getPositions = function (oEvent) {
        let oDraggedItem = oEvent.getParameter("draggedControl");
        let oDraggedItemContext = oDraggedItem.getBindingContext();
        let oDroppedItem = oEvent.getParameter("droppedControl");
        let sDropPosition = oEvent.getParameter("dropPosition");
        let oDroppedTable = oDroppedItem.getParent();
        let iDroppedItemIndex = oDroppedTable.indexOfItem(oDroppedItem);
        let sSplittedString = oDraggedItemContext.toString().split("/");

        let oldIndex = parseInt(sSplittedString[sSplittedString.length - 1]);
        let dropIndex = iDroppedItemIndex + (sDropPosition === "After" ? 1 : -1);
        let newIndex;

        if(oldIndex > dropIndex) {
            if(sDropPosition === "Before") {
                newIndex = iDroppedItemIndex;
            } else {
                newIndex = dropIndex;
            }
        } else {
            if(sDropPosition === "Before") {
                newIndex = dropIndex
            } else {
                newIndex = iDroppedItemIndex;
            }
        }

        return {
            oldIndex: oldIndex,
            newIndex: newIndex,
            dropIndex: dropIndex
        }
    };

}();