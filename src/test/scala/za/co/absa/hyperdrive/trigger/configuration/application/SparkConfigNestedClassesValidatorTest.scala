
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

import org.mockito.ArgumentCaptor
import org.mockito.ArgumentMatchers.{eq => eqTo, _}
import org.mockito.Mockito._
import org.scalatest.mockito.MockitoSugar
import org.scalatest.{BeforeAndAfter, FlatSpec, Matchers}

import java.util.Properties
import javax.validation.ConstraintValidatorContext
import javax.validation.ConstraintValidatorContext.ConstraintViolationBuilder
import javax.validation.ConstraintValidatorContext.ConstraintViolationBuilder.NodeBuilderCustomizableContext

class SparkConfigNestedClassesValidatorTest extends FlatSpec with MockitoSugar with Matchers with BeforeAndAfter {

  private val underTest = new SparkConfigNestedClassesValidator
  private val mockContext = mock[ConstraintValidatorContext]
  private val mockConstraintViolationBuilder = mock[ConstraintViolationBuilder]
  private val sparkSubmitApi = "spark.submitApi"
  private val baseSparkConfig = TestSparkConfig(
    submitApi = "yarn",
    yarn = TestSparkYarnSinkConfig(
      submitTimeout = 160000,
      hadoopConfDir = "/opt/hadoop",
      master = "yarn",
      sparkHome = "/opt/spark",
      filesToDeployInternal = "/opt/file1,/opt/file2",
      additionalConfsInternal = new Properties(),
    ),
    emr = TestSparkEmrSinkConfig(
      clusterId = null,
      awsProfileInternal = null,
      regionInternal = null,
      filesToDeployInternal = null,
      additionalConfsInternal = null
    ),
    hadoopResourceManagerUrlBase = "http://localhost:8088",
    userUsedToKillJob = "spark-user",
    sparkSubmitThreadPoolSize = 10,
  )

  before {
    reset(mockContext, mockConstraintViolationBuilder)
    val mockNodeBuilderCustomizableContext = mock[NodeBuilderCustomizableContext]
    when(mockContext.buildConstraintViolationWithTemplate(any())).thenReturn(mockConstraintViolationBuilder)
    when(mockConstraintViolationBuilder.addPropertyNode(any())).thenReturn(mockNodeBuilderCustomizableContext)
  }

  "isValid" should "return true for submitApi = yarn" in {
    val config = baseSparkConfig.toSparkConfig

    val isValid = underTest.isValid(config, mockContext)

    isValid shouldBe true
  }

  it should "return true for submitApi = emr" in {
    val config = baseSparkConfig.copy(
      submitApi = "emr",
      emr = baseSparkConfig.emr.copy(clusterId = "abc")
    ).toSparkConfig

    val isValid = underTest.isValid(config, mockContext)

    isValid shouldBe true
  }

  it should "return false if submitApi is yarn but no yarn config is given" in {
    // given
    val config = baseSparkConfig
      .copy(yarn = null)
      .toSparkConfig

    // when
    val isValid = underTest.isValid(config, mockContext)

    // then
    isValid shouldBe false
    verify(mockConstraintViolationBuilder).addPropertyNode(eqTo(sparkSubmitApi))
  }

  it should "return false if submitApi is emr but no emr config is given" in {
    // given
    val config = baseSparkConfig
      .copy(submitApi = "emr", emr = null)
      .toSparkConfig

    // when
    val isValid = underTest.isValid(config, mockContext)

    // then
    isValid shouldBe false
    verify(mockConstraintViolationBuilder).addPropertyNode(eqTo(sparkSubmitApi))
  }

  it should "return false if there are constraint violations in the yarn config" in {
    // given
    val config = baseSparkConfig.copy(yarn = baseSparkConfig.yarn.copy(
      submitTimeout = 0,
      hadoopConfDir = "",
      master = "",
      sparkHome = ""
    )).toSparkConfig

    // when
    val isValid = underTest.isValid(config, mockContext)

    // then
    isValid shouldBe false
    val stringCaptor: ArgumentCaptor[String] = ArgumentCaptor.forClass(classOf[String])
    verify(mockConstraintViolationBuilder, times(4)).addPropertyNode(stringCaptor.capture())
    import scala.collection.JavaConverters._
    stringCaptor.getAllValues.asScala should contain theSameElementsAs Seq(
      "sparkYarnSink.submitTimeout",
      "sparkYarnSink.hadoopConfDir",
      "sparkYarnSink.master",
      "sparkYarnSink.sparkHome"
    )
  }

  it should "return false if there are constraint violations in the emr config" in {
    // given
    val config = baseSparkConfig
      .copy(submitApi = "emr",
        emr = baseSparkConfig.emr.copy(regionInternal = "non-existing-aws-region"))
      .toSparkConfig

    // when
    val isValid = underTest.isValid(config, mockContext)

    // then
    isValid shouldBe false
    val stringCaptor: ArgumentCaptor[String] = ArgumentCaptor.forClass(classOf[String])
    verify(mockConstraintViolationBuilder, times(2)).addPropertyNode(stringCaptor.capture())
    import scala.collection.JavaConverters._
    stringCaptor.getAllValues.asScala should contain theSameElementsAs Seq(
      "spark.emr.clusterId",
      "spark.emr.region"
    )
  }

  it should "return false if submitApi is neither yarn nor emr" in {
    val config = baseSparkConfig
      .copy(submitApi = "non-existent submit api")
      .toSparkConfig

    underTest.isValid(config, mockContext)

    verify(mockConstraintViolationBuilder).addPropertyNode(eqTo(sparkSubmitApi))
  }
}
