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

package za.co.absa.hyperdrive.trigger.api.rest.utils

import org.scalatest.{FlatSpec, Matchers}
import za.co.absa.hyperdrive.trigger.models.enums.JobTypes
import za.co.absa.hyperdrive.trigger.models.{DagDefinitionJoined, HyperdriveDefinitionParameters, JobDefinition, ShellDefinitionParameters, ShellInstanceParameters, ShellTemplateParameters, SparkDefinitionParameters, SparkInstanceParameters, SparkTemplateParameters}
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateFixture.{GenericShellJobTemplate, GenericSparkJobTemplate}
import za.co.absa.hyperdrive.trigger.api.rest.services.JobTemplateResolutionServiceImpl

class JobTemplateResolutionServiceTest extends FlatSpec with Matchers {
  private val underTest = new JobTemplateResolutionServiceImpl

  "resolveDagDefinition" should "return a ResolvedJobDefinition with the same jobType as in the template" in {
    // given
    val jobTemplate = GenericSparkJobTemplate
    val jobDefinition = createJobDefinition().copy(jobTemplateId = jobTemplate.id)
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)

    // when
    val resolvedJobDefinitions = underTest.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate))

    // then
    val resolvedJobDefinition = resolvedJobDefinitions.head
    resolvedJobDefinition.name shouldBe "JobDefinition0"
    resolvedJobDefinition.jobParameters.jobType shouldBe JobTypes.Spark
    resolvedJobDefinition.order shouldBe 2
  }

  it should "resolve templates for multiple JobDefinitions" in {
    // given
    val jobParameters1 = SparkDefinitionParameters(jobJar = Option("jobJar"), mainClass = Option("mainClass"), additionalSparkConfig = Map("key1" -> "value1"))
    val jobTemplate1 = GenericSparkJobTemplate.copy(id = 1)
    val jobDefinition1 = createJobDefinition().copy(jobTemplateId = jobTemplate1.id, jobParameters = jobParameters1)

    val jobParameters2 = ShellDefinitionParameters(scriptLocation = Option("scriptLocation"))
    val jobTemplate2 = GenericShellJobTemplate.copy(id = 2)
    val jobDefinition2 = createJobDefinition().copy(jobTemplateId = jobTemplate2.id, jobParameters = jobParameters2)

    val dagDefinitionJoined = DagDefinitionJoined(jobDefinitions = Seq(jobDefinition1, jobDefinition2))

    // when
    val resolvedJobDefinitions = underTest.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate1, jobTemplate2))

    // then
    resolvedJobDefinitions should have size 2
    resolvedJobDefinitions.head.jobParameters.jobType shouldBe JobTypes.Spark
    resolvedJobDefinitions.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs Map("key1" -> "value1")
    resolvedJobDefinitions(1).jobParameters.jobType shouldBe JobTypes.Shell
    resolvedJobDefinitions(1).jobParameters.asInstanceOf[ShellInstanceParameters].scriptLocation shouldBe jobParameters2.scriptLocation.get
  }

  it should "merge shell types" in {
    // given
    val shellJobParametersNoScript = ShellDefinitionParameters(
      scriptLocation = None
    )
    val shellJobParametersWithScript = ShellDefinitionParameters(
      scriptLocation = Option("jobScript.sh")
    )
    val shellTemplateParametersNoScript = ShellTemplateParameters(
      scriptLocation = None
    )
    val shellTemplateParametersWithScript = ShellTemplateParameters(
      scriptLocation = Option("templateScript.sh")
    )
    val jobTemplateNoScript = GenericShellJobTemplate.copy(jobParameters = shellTemplateParametersNoScript, id = 1)
    val jobTemplateWithScript = GenericShellJobTemplate.copy(jobParameters = shellTemplateParametersWithScript, id = 2)

    // when
    val bothScriptsUndefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateNoScript.id, jobParameters = shellJobParametersNoScript)),
      Seq(jobTemplateNoScript)
    )
    val templateScriptDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateWithScript.id, jobParameters = shellJobParametersNoScript)),
      Seq(jobTemplateWithScript)
    )
    val jobScriptDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateNoScript.id, jobParameters = shellJobParametersWithScript)),
      Seq(jobTemplateNoScript)
    )
    val bothScriptsDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateWithScript.id, jobParameters = shellJobParametersWithScript)),
      Seq(jobTemplateWithScript)
    )

    // then
    bothScriptsUndefined.head.jobParameters.jobType shouldBe JobTypes.Shell
    bothScriptsUndefined.head.jobParameters.asInstanceOf[ShellInstanceParameters].scriptLocation shouldBe ""

    templateScriptDefined.head.jobParameters.jobType shouldBe JobTypes.Shell
    templateScriptDefined.head.jobParameters.asInstanceOf[ShellInstanceParameters].scriptLocation shouldBe shellTemplateParametersWithScript.scriptLocation.get

    jobScriptDefined.head.jobParameters.jobType shouldBe JobTypes.Shell
    jobScriptDefined.head.jobParameters.asInstanceOf[ShellInstanceParameters].scriptLocation shouldBe shellJobParametersWithScript.scriptLocation.get

    bothScriptsDefined.head.jobParameters.jobType shouldBe JobTypes.Shell
    bothScriptsDefined.head.jobParameters.asInstanceOf[ShellInstanceParameters].scriptLocation shouldBe shellJobParametersWithScript.scriptLocation.get
  }

  it should "merge spark types" in {
    // given
    val sparkJobParametersUndefined = SparkDefinitionParameters(
      jobJar = None,
      mainClass = None,
      appArguments = List.empty[String],
      additionalJars = List.empty[String],
      additionalFiles = List.empty[String],
      additionalSparkConfig = Map.empty[String, String]
    )
    val sparkJobParametersDefined = SparkDefinitionParameters(
      jobJar = Option("jobJar.jar"),
      mainClass = Option("jobClass"),
      appArguments = List("jobAppArgument1", "jobAppArgument2", "appArgument"),
      additionalJars = List("jobJar1", "jobJar2", "jar"),
      additionalFiles = List("jobFile1", "jobFile2", "file"),
      additionalSparkConfig = Map("jobKey1" -> "jobValue1", "jobKey2" -> "jobValue2", "sharedKey1" -> "jobValueSharedKey1")
    )
    val sparkTemplateParametersUndefined = SparkTemplateParameters(
      jobJar = None,
      mainClass = None,
      appArguments = List.empty[String],
      additionalJars = List.empty[String],
      additionalFiles = List.empty[String],
      additionalSparkConfig = Map.empty[String, String]
    )
    val sparkTemplateParametersDefined = SparkTemplateParameters(
      jobJar = Option("templateJar.jar"),
      mainClass = Option("templateClass"),
      appArguments = List("templateAppArgument1", "templateAppArgument2", "appArgument"),
      additionalJars = List("templateJar1", "templateJar2", "jar"),
      additionalFiles = List("templateFile1", "templateFile2", "file"),
      additionalSparkConfig = Map("templateKey1" -> "templateValue1", "templateKey2" -> "templateValue2", "sharedKey1" -> "templateValueSharedKey1")
    )
    val jobTemplateUndefined = GenericShellJobTemplate.copy(jobParameters = sparkTemplateParametersUndefined, id = 1)
    val jobTemplateDefined = GenericShellJobTemplate.copy(jobParameters = sparkTemplateParametersDefined, id = 2)

    // when
    val bothUndefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateUndefined.id, jobParameters = sparkJobParametersUndefined)),
      Seq(jobTemplateUndefined)
    )
    val templateDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateDefined.id, jobParameters = sparkJobParametersUndefined)),
      Seq(jobTemplateDefined)
    )
    val jobDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateUndefined.id, jobParameters = sparkJobParametersDefined)),
      Seq(jobTemplateUndefined)
    )
    val bothScriptsDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateDefined.id, jobParameters = sparkJobParametersDefined)),
      Seq(jobTemplateDefined)
    )

    // then
    bothUndefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe ""
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe ""
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments shouldBe List.empty[String]
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars shouldBe List.empty[String]
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles shouldBe List.empty[String]
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig shouldBe Map.empty[String, String]

    templateDefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe sparkTemplateParametersDefined.jobJar.get
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe sparkTemplateParametersDefined.mainClass.get
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments should contain theSameElementsAs sparkTemplateParametersDefined.appArguments
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars should contain theSameElementsAs sparkTemplateParametersDefined.additionalJars
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles should contain theSameElementsAs sparkTemplateParametersDefined.additionalFiles
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs sparkTemplateParametersDefined.additionalSparkConfig

    jobDefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe sparkJobParametersDefined.jobJar.get
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe sparkJobParametersDefined.mainClass.get
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments should contain theSameElementsAs sparkJobParametersDefined.appArguments
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars should contain theSameElementsAs sparkJobParametersDefined.additionalJars
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles should contain theSameElementsAs sparkJobParametersDefined.additionalFiles
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs sparkJobParametersDefined.additionalSparkConfig

    bothScriptsDefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe sparkJobParametersDefined.jobJar.get
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe sparkJobParametersDefined.mainClass.get
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments should contain theSameElementsAs sparkJobParametersDefined.appArguments ++ sparkTemplateParametersDefined.appArguments
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars should contain theSameElementsAs sparkJobParametersDefined.additionalJars ++ sparkTemplateParametersDefined.additionalJars
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles should contain theSameElementsAs sparkJobParametersDefined.additionalFiles ++ sparkTemplateParametersDefined.additionalFiles
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs Map("templateKey1" -> "templateValue1", "templateKey2" -> "templateValue2", "jobKey1" -> "jobValue1", "jobKey2" -> "jobValue2", "sharedKey1" -> "jobValueSharedKey1")
  }

  it should "merge hyperdrive and spark types" in {
    // given
    val hyperdriveJobParametersUndefined = HyperdriveDefinitionParameters(
      appArguments = List.empty[String],
      additionalJars = List.empty[String],
      additionalFiles = List.empty[String],
      additionalSparkConfig = Map.empty[String, String]
    )
    val hyperdriveJobParametersDefined = HyperdriveDefinitionParameters(
      appArguments = List("jobAppArgument1", "jobAppArgument2", "appArgument"),
      additionalJars = List("jobJar1", "jobJar2", "jar"),
      additionalFiles = List("jobFile1", "jobFile2", "file"),
      additionalSparkConfig = Map("jobKey1" -> "jobValue1", "jobKey2" -> "jobValue2", "sharedKey1" -> "jobValueSharedKey1")
    )
    val sparkTemplateParametersUndefined = SparkTemplateParameters(
      jobJar = None,
      mainClass = None,
      appArguments = List.empty[String],
      additionalJars = List.empty[String],
      additionalFiles = List.empty[String],
      additionalSparkConfig = Map.empty[String, String]
    )
    val sparkTemplateParametersDefined = SparkTemplateParameters(
      jobJar = Option("templateJar.jar"),
      mainClass = Option("templateClass"),
      appArguments = List("templateAppArgument1", "templateAppArgument2", "appArgument"),
      additionalJars = List("templateJar1", "templateJar2", "jar"),
      additionalFiles = List("templateFile1", "templateFile2", "file"),
      additionalSparkConfig = Map("templateKey1" -> "templateValue1", "templateKey2" -> "templateValue2", "sharedKey1" -> "templateValueSharedKey1")
    )
    val jobTemplateUndefined = GenericShellJobTemplate.copy(jobParameters = sparkTemplateParametersUndefined, id = 1)
    val jobTemplateDefined = GenericShellJobTemplate.copy(jobParameters = sparkTemplateParametersDefined, id = 2)

    // when
    val bothUndefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateUndefined.id, jobParameters = hyperdriveJobParametersUndefined)),
      Seq(jobTemplateUndefined)
    )
    val templateDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateDefined.id, jobParameters = hyperdriveJobParametersUndefined)),
      Seq(jobTemplateDefined)
    )
    val jobDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateUndefined.id, jobParameters = hyperdriveJobParametersDefined)),
      Seq(jobTemplateUndefined)
    )
    val bothScriptsDefined = underTest.resolveDagDefinitionJoined(
      createDagDefinitionJoined(createJobDefinition().copy(jobTemplateId = jobTemplateDefined.id, jobParameters = hyperdriveJobParametersDefined)),
      Seq(jobTemplateDefined)
    )

    // then
    bothUndefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe ""
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe ""
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments shouldBe List.empty[String]
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars shouldBe List.empty[String]
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles shouldBe List.empty[String]
    bothUndefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig shouldBe Map.empty[String, String]

    templateDefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe sparkTemplateParametersDefined.jobJar.get
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe sparkTemplateParametersDefined.mainClass.get
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments should contain theSameElementsAs sparkTemplateParametersDefined.appArguments
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars should contain theSameElementsAs sparkTemplateParametersDefined.additionalJars
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles should contain theSameElementsAs sparkTemplateParametersDefined.additionalFiles
    templateDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs sparkTemplateParametersDefined.additionalSparkConfig

    jobDefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe ""
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe ""
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments should contain theSameElementsAs hyperdriveJobParametersDefined.appArguments
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars should contain theSameElementsAs hyperdriveJobParametersDefined.additionalJars
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles should contain theSameElementsAs hyperdriveJobParametersDefined.additionalFiles
    jobDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs hyperdriveJobParametersDefined.additionalSparkConfig

    bothScriptsDefined.head.jobParameters.jobType shouldBe JobTypes.Spark
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].jobJar shouldBe sparkTemplateParametersDefined.jobJar.get
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].mainClass shouldBe sparkTemplateParametersDefined.mainClass.get
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].appArguments should contain theSameElementsAs hyperdriveJobParametersDefined.appArguments ++ sparkTemplateParametersDefined.appArguments
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalJars should contain theSameElementsAs hyperdriveJobParametersDefined.additionalJars ++ sparkTemplateParametersDefined.additionalJars
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalFiles should contain theSameElementsAs hyperdriveJobParametersDefined.additionalFiles ++ sparkTemplateParametersDefined.additionalFiles
    bothScriptsDefined.head.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs Map("templateKey1" -> "templateValue1", "templateKey2" -> "templateValue2", "jobKey1" -> "jobValue1", "jobKey2" -> "jobValue2", "sharedKey1" -> "jobValueSharedKey1")
  }

  it should "in additionalSparkConfig, concatenate the values if the key is extraJavaOptions" in {
    // given
    val userParameters = SparkDefinitionParameters(
      jobJar = None,
      mainClass = None,
      additionalSparkConfig = Map(
        "spark.driver.extraJavaOptions" -> "-user.prop=userDriver",
        "spark.executor.extraJavaOptions" -> "-user.prop=userExecutor"
      )
    )
    val templateParameters = SparkTemplateParameters(
      jobJar = None,
      mainClass = None,
      additionalSparkConfig = Map(
        "spark.driver.extraJavaOptions" -> "-template.prop=templateDriver",
        "spark.executor.extraJavaOptions" -> "-template.prop=templateExecutor"
      )
    )

    val jobTemplate = GenericSparkJobTemplate.copy(jobParameters = templateParameters)
    val jobDefinition = createJobDefinition().copy(jobTemplateId = jobTemplate.id, jobParameters = userParameters)
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)

    // when
    val resolvedJobDefinitions = underTest.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate))

    // then
    val resolvedJobDefinition = resolvedJobDefinitions.head
    resolvedJobDefinition.jobParameters.asInstanceOf[SparkInstanceParameters].additionalSparkConfig should contain theSameElementsAs Map(
        "spark.driver.extraJavaOptions" -> "-template.prop=templateDriver -user.prop=userDriver",
        "spark.executor.extraJavaOptions" -> "-template.prop=templateExecutor -user.prop=userExecutor"
      )
  }

  it should "throw an error if the jobTemplate is of the different type as job definiton" in {
    // given
    val jobTemplate = GenericShellJobTemplate
    val jobDefinition = createJobDefinition().copy(jobTemplateId = jobTemplate.id)
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)

    // when
    val result = intercept[IllegalArgumentException](underTest.resolveDagDefinitionJoined(dagDefinitionJoined, Seq(jobTemplate)))

    // then
    result.getMessage should include("Could not mix different job types.")
  }

  it should "throw an error if the jobTemplate doesn't exist" in {
    // given
    val jobDefinition = createJobDefinition().copy(jobTemplateId = 1)
    val dagDefinitionJoined = createDagDefinitionJoined(jobDefinition)

    // when
    val result = intercept[NoSuchElementException](underTest.resolveDagDefinitionJoined(dagDefinitionJoined, Seq.empty))

    // then
    result.getMessage should include("template with id 1")
  }

  private def createDagDefinitionJoined(jobDefinition: JobDefinition) = {
    DagDefinitionJoined(jobDefinitions = Seq(jobDefinition))
  }

  private def createJobDefinition() = {
    JobDefinition(
      dagDefinitionId = 53,
      name = "JobDefinition0",
      jobParameters = SparkDefinitionParameters(jobJar = None, mainClass = None),
      order = 2,
      id = 42
    )
  }
}
