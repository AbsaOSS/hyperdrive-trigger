
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

package za.co.absa.hyperdrive.trigger.configuration.application

import org.springframework.boot.context.properties.ConfigurationPropertiesBindHandlerAdvisor
import org.springframework.boot.context.properties.bind.{AbstractBindHandler, BindContext, BindHandler, Bindable}
import org.springframework.boot.context.properties.source.ConfigurationPropertyName

import javax.validation.constraints.{NotBlank, NotEmpty, NotNull}

class NotNullValidationBindHandlerAdvisor extends ConfigurationPropertiesBindHandlerAdvisor {
  override def apply(bindHandler: BindHandler): BindHandler = new NotNullValidationBindHandler(bindHandler)
}

class NotNullValidationBindHandler(bindHandler: BindHandler) extends AbstractBindHandler(bindHandler) {

  override def onFinish(name: ConfigurationPropertyName, target: Bindable[_], context: BindContext, result: Object) {
    val hasNotNullConstraint = target.getAnnotations.exists {
      case _: NotNull => true
      case _: NotBlank => true
      case _: NotEmpty => true
      case _ => false
    }

    if (hasNotNullConstraint && result == null) {
      throw new NotNullValidationException(name)
    }

    super.onFinish(name, target, context, result);
  }
}
