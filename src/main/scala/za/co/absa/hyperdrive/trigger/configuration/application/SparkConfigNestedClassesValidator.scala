
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

import com.amazonaws.regions.Regions
import org.hibernate.validator.internal.constraintvalidators.bv.{NotBlankValidator, NotNullValidator}

import javax.validation.{ConstraintValidator, ConstraintValidatorContext}
import scala.util.Try

class SparkConfigNestedClassesValidator extends ConstraintValidator[SparkConfigNestedClasses, SparkConfig]{

  private val notNullValidator = new NotNullValidator
  private val notBlankValidator = new NotBlankValidator
  private val notNullMessage = "must not be null"
  private val notBlankMessage = "must no be blank"
  private val sparkSubmitApi = "spark.submitApi"
  private case class Constraint(isValid: Boolean, field: String, message: String)

  override def isValid(sparkConfig: SparkConfig, constraintValidatorContext: ConstraintValidatorContext): Boolean = {
    if (sparkConfig.submitApi == "yarn") {
      validateSparkYarnSink(sparkConfig)(constraintValidatorContext)
    } else if (sparkConfig.submitApi == "emr") {
      validateSparkEmr(sparkConfig)(constraintValidatorContext)
    } else {
      addConstraintViolation(sparkSubmitApi, s"$sparkSubmitApi has to be either 'yarn' or 'emr'")(constraintValidatorContext)
      false
    }
  }

  private def validateSparkYarnSink(sparkConfig: SparkConfig)(implicit context: ConstraintValidatorContext): Boolean = {
    val yarnIsNull = !validateConstraints(Seq(
      Constraint(notNullValidator.isValid(sparkConfig.yarn, context),
        sparkSubmitApi, s"If $sparkSubmitApi is yarn, sparkYarnSink arguments are required")))
    if (yarnIsNull) {
      false
    } else {
      validateConstraints(Seq(
        Constraint(sparkConfig.yarn.submitTimeout > 0,
          "sparkYarnSink.submitTimeout", "must be > 0"),
        Constraint(notBlankValidator.isValid(sparkConfig.yarn.master, context),
          "sparkYarnSink.master", notBlankMessage)
      ))
    }
  }

  private def validateSparkEmr(sparkConfig: SparkConfig)(implicit context: ConstraintValidatorContext): Boolean = {
    val emrIsNull = !validateConstraints(Seq(
      Constraint(notNullValidator.isValid(sparkConfig.emr, context),
        sparkSubmitApi, s"If $sparkSubmitApi is emr, spark.emr arguments are required")))
    if (emrIsNull) {
      false
    } else {
      val regionValid = sparkConfig.emr.region.isEmpty || Try(Regions.fromName(sparkConfig.emr.region.get)).isSuccess
      validateConstraints(Seq(
        Constraint(notNullValidator.isValid(sparkConfig.emr, context),
          sparkSubmitApi, s"If $sparkSubmitApi is emr, spark.emr arguments are required"),
        Constraint(notBlankValidator.isValid(sparkConfig.emr.clusterId, context),
          "spark.emr.clusterId", notBlankMessage),
        Constraint(regionValid, "spark.emr.region", "must be a valid aws region string")
      ))
    }
  }

  private def validateConstraints(constraints: Seq[Constraint])(implicit context: ConstraintValidatorContext): Boolean = {
    constraints.foreach(c => if(!c.isValid) addConstraintViolation(c.field, c.message))
    constraints.map(_.isValid).reduce(_ && _)
  }
  
  private def addConstraintViolation(field: String, message: String)(implicit context: ConstraintValidatorContext): Unit = {
    context.buildConstraintViolationWithTemplate(message)
      .addPropertyNode(field)
      .addConstraintViolation()
  }
}
