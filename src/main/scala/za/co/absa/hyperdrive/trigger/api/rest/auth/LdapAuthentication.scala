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

import org.springframework.beans.factory.annotation.Value
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.ldap.authentication.ad.ActiveDirectoryLdapAuthenticationProvider
import org.springframework.stereotype.Component

@Component
class LdapAuthentication extends HyperdriverAuthentication {

  @Value("${auth.ad.domain:}")
  val adDomain: String = ""

  @Value("${auth.ad.server:}")
  val adServer: String = ""

  @Value("${auth.ldap.search.base:}")
  val ldapSearchBase: String = ""

  @Value("${auth.ldap.search.filter:}")
  val ldapSearchFilter: String = ""

  private lazy val requiredParameters = Seq(
    (adDomain, "auth.ad.domain"),
    (adServer, "auth.ad.server"),
    (ldapSearchBase, "auth.ldap.search.base"),
    (ldapSearchFilter, "auth.ldap.search.filter")
  )

  private def validateParams() {
    requiredParameters.foreach {
      case param if param._1.isEmpty =>
        throw new IllegalArgumentException(s"${param._2} has to be configured in order to use ldap authentication")
      case _ => 
    }
  }

  override def configure(auth: AuthenticationManagerBuilder): Unit = {
    this.validateParams()
    auth.authenticationProvider(activeDirectoryLdapAuthenticationProvider())
  }

  private def activeDirectoryLdapAuthenticationProvider(): ActiveDirectoryLdapAuthenticationProvider = {
    val prov = new ActiveDirectoryLdapAuthenticationProvider(adDomain, adServer, ldapSearchBase)
    prov.setSearchFilter(ldapSearchFilter)
    prov.setUseAuthenticationRequestCredentials(true)
    prov.setConvertSubErrorCodesToExceptions(true)
    prov
  }

}
