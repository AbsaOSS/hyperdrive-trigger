/*
 * Copyright 2018-2019 ABSA Group Limited
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

package za.co.absa.hyperdrive.trigger.api.rest

import za.co.absa.hyperdrive.trigger.api.rest.auth.{HyperdriverAuthentication, InMemoryAuthentication, LdapAuthentication}
import org.springframework.beans.factory.BeanFactory
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.authentication.AuthenticationFailureHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler
import org.springframework.security.web.authentication.logout.HttpStatusReturningLogoutSuccessHandler
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.stereotype.Component
import javax.servlet.http.HttpServletRequest
import javax.servlet.http.HttpServletResponse
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.AuthenticationManager

@EnableWebSecurity
class WebSecurityConfig {
  private val logger = LoggerFactory.getLogger(this.getClass)

  @Autowired
  val beanFactory: BeanFactory = null

  @Value("${auth.mechanism:}")
  val authMechanism: String = ""

  @Bean
  def authenticationFailureHandler(): AuthenticationFailureHandler = {
    new SimpleUrlAuthenticationFailureHandler()
  }

  @Bean
  def logoutSuccessHandler(): LogoutSuccessHandler = {
    new HttpStatusReturningLogoutSuccessHandler(HttpStatus.OK)
  }

  @Configuration
  class ApiWebSecurityConfigurationAdapter @Autowired() (
    restAuthenticationEntryPoint: RestAuthenticationEntryPoint,
    authenticationSuccessHandler: AuthSuccessHandler,
    authenticationFailureHandler: AuthenticationFailureHandler,
    logoutSuccessHandler: LogoutSuccessHandler
  ) extends WebSecurityConfigurerAdapter {

    override def configure(http: HttpSecurity) {
      http
        .csrf()
        .ignoringAntMatchers("/login")
        .and()

        .exceptionHandling()
        .authenticationEntryPoint(restAuthenticationEntryPoint)
        .and()

        .authorizeRequests()
        .antMatchers(
          "/", "/index.html", "/css/**", "/webjars/**",
          "/repository/**", "/Component.js", "/manifest.json",
          "/i18n/**", "/model/**", "/view/**",
          "/controller/**", "/lib/**", "/generic/**",
          "/favicon.ico"
        )
        .permitAll()
        .anyRequest()
        .authenticated()
        .and()

        .formLogin()
        .loginProcessingUrl("/login")
        .successHandler(authenticationSuccessHandler)
        .failureHandler(authenticationFailureHandler)
        .permitAll()
        .and()

        .logout()
        .logoutUrl("/logout")
        .logoutSuccessHandler(logoutSuccessHandler)
        .permitAll()
        .clearAuthentication(true)
        .deleteCookies("JSESSIONID")
        .invalidateHttpSession(true)
    }

    override def configure(auth: AuthenticationManagerBuilder): Unit = {
      this.getAuthentication().configure(auth)
    }

    private def getAuthentication(): HyperdriverAuthentication = {
      authMechanism.toLowerCase match {
        case "inmemory" => {
          logger.info(s"Using $authMechanism authentication")
          beanFactory.getBean(classOf[InMemoryAuthentication])
        }
        case "ldap" => {
          logger.info(s"Using $authMechanism authentication")
          beanFactory.getBean(classOf[LdapAuthentication])
        }
        case _ => throw new IllegalArgumentException("Invalid authentication mechanism - use one of: inmemory, ldap")
      }
    }

    @Bean
    override def authenticationManagerBean(): AuthenticationManager = {
      super.authenticationManagerBean()
    }
  }

  @Component
  class RestAuthenticationEntryPoint extends AuthenticationEntryPoint {
    override def commence(
      request: HttpServletRequest,
      response: HttpServletResponse,
      authException: AuthenticationException
    ): Unit = {
      response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized")
    }
  }

  @Component
  class AuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    override def onAuthenticationSuccess(
      request: HttpServletRequest,
      response: HttpServletResponse,
      authentication: Authentication
    ): Unit = {
      val csrfToken = request.getAttribute("_csrf").asInstanceOf[CsrfToken]
      response.addHeader(csrfToken.getHeaderName, csrfToken.getToken)
      clearAuthenticationAttributes(request)
    }

  }

}
