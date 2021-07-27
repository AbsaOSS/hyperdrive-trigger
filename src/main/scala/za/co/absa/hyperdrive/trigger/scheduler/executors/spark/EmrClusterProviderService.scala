
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

package za.co.absa.hyperdrive.trigger.scheduler.executors.spark

import com.amazonaws.auth.profile.ProfileCredentialsProvider
import com.amazonaws.services.elasticmapreduce.{AmazonElasticMapReduce, AmazonElasticMapReduceClientBuilder}
import org.springframework.stereotype.Service
import za.co.absa.hyperdrive.trigger.configuration.application.SparkConfig

import javax.inject.Inject

trait EmrClusterProviderService {
  def get(): AmazonElasticMapReduce
}

@Service
class EmrClusterProviderServiceImpl @Inject()(sparkConfig: SparkConfig) extends EmrClusterProviderService {
  override def get(): AmazonElasticMapReduce = {
    val emrBuilder = AmazonElasticMapReduceClientBuilder.standard()
    val emrWithRegion = sparkConfig.emr.region
      .map(region => emrBuilder.withRegion(region))
      .getOrElse(emrBuilder)
    sparkConfig.emr.awsProfile
      .map(profile => emrWithRegion.withCredentials(new ProfileCredentialsProvider(profile)))
      .getOrElse(emrWithRegion)
      .build()
  }
}
