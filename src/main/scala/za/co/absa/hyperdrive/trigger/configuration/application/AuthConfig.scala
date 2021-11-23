
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

import org.springframework.boot.context.properties.bind.{DefaultValue, Name}
import org.springframework.boot.context.properties.{ConfigurationProperties, ConstructorBinding}
import org.springframework.validation.annotation.Validated

@ConfigurationProperties("auth")
@ConstructorBinding
@Validated
class AuthConfig (
  @DefaultValue(Array(""))
  val mechanism: String,
  @DefaultValue(Array(""))
  @Name("ad.domain")
  val adDomain: String,
  @DefaultValue(Array(""))
  @Name("ad.server")
  val adServer: String,
  @DefaultValue(Array(""))
  @Name("ldap.search.base")
  val ldapSearchBase: String,
  @DefaultValue(Array(""))
  @Name("ldap.search.filter")
  val ldapSearchFilter: String,
  @DefaultValue(Array("hyperdriver-user"))
  @Name("inmemory.user")
  val inMemoryUser: String,
  @DefaultValue(Array("hyperdriver-password"))
  @Name("inmemory.password")
  val inMemoryPassword: String,
  @DefaultValue(Array("hyperdriver-admin-user"))
  @Name("inmemory.admin.user")
  val inMemoryAdminUser: String,
  @DefaultValue(Array("hyperdriver-admin-password"))
  @Name("inmemory.admin.password")
  val inMemoryAdminPassword: String,
  @DefaultValue(Array("ROLE_USER"))
  @Name("admin.role")
  val adminRole: String
)
