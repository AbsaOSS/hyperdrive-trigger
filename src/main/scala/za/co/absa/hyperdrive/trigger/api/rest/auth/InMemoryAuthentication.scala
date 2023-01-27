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

package za.co.absa.hyperdrive.trigger.api.rest.auth

import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.crypto.factory.PasswordEncoderFactories
import org.springframework.security.crypto.password.PasswordEncoder
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.configuration.application.AuthConfig

import javax.inject.Inject

@Component
class InMemoryAuthentication @Inject() (authConfig: AuthConfig) extends HyperdriverAuthentication {
  private val ROLE_USER = "ROLE_USER"
  val username: String = authConfig.inMemoryUser
  val password: String = authConfig.inMemoryPassword
  val adminUsername: String = authConfig.inMemoryAdminUser
  val adminPassword: String = authConfig.inMemoryAdminPassword
  val adminRole: Option[String] = authConfig.adminRole

  def validateParams(): Unit = {
    if (username.isEmpty || password.isEmpty) {
      throw new IllegalArgumentException("Both username and password have to configured for inmemory authentication.")
    }
  }

  override def configure(auth: AuthenticationManagerBuilder): Unit = {
    val encoder: PasswordEncoder = PasswordEncoderFactories.createDelegatingPasswordEncoder()

    this.validateParams()
    auth
      .inMemoryAuthentication()
      .withUser(username)
      .password(encoder.encode(password))
      .authorities(ROLE_USER)
      .and()
      .withUser(adminUsername)
      .password(encoder.encode(adminPassword))
      .authorities(adminRole.getOrElse(ROLE_USER))
  }
}
