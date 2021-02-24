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

package za.co.absa.hyperdrive.trigger.api.rest

import javax.inject.Inject
import javax.servlet.http.{HttpServletRequest, HttpServletResponse}
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.BeanFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.{Bean, Configuration}
import org.springframework.http.HttpStatus
import org.springframework.security.authentication.AuthenticationManager
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder
import org.springframework.security.config.annotation.web.builders.{HttpSecurity, WebSecurity}
import org.springframework.security.config.annotation.web.configuration.{EnableWebSecurity, WebSecurityConfigurerAdapter}
import org.springframework.security.core.{Authentication, AuthenticationException}
import org.springframework.security.web.AuthenticationEntryPoint
import org.springframework.security.web.authentication.logout.{HttpStatusReturningLogoutSuccessHandler, LogoutSuccessHandler}
import org.springframework.security.web.authentication.{AuthenticationFailureHandler, SimpleUrlAuthenticationFailureHandler, SimpleUrlAuthenticationSuccessHandler}
import org.springframework.security.web.csrf.CsrfToken
import org.springframework.stereotype.Component
import za.co.absa.hyperdrive.trigger.api.rest.auth.{HyperdriverAuthentication, InMemoryAuthentication, LdapAuthentication}

@EnableWebSecurity
class WebSecurityConfig {
  private val logger = LoggerFactory.getLogger(this.getClass)

  @Inject
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
  class ApiWebSecurityConfigurationAdapter @Inject() (
    restAuthenticationEntryPoint: RestAuthenticationEntryPoint,
    authenticationSuccessHandler: AuthSuccessHandler,
    authenticationFailureHandler: AuthenticationFailureHandler,
    logoutSuccessHandler: LogoutSuccessHandler
  ) extends WebSecurityConfigurerAdapter {

    override def configure(web: WebSecurity): Unit = {
      // Disable security for isManager endpoint
      web.ignoring.antMatchers("/admin/isManager")
    }

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
          "/", "/index.html",
          "/main-es5*.js",
          "/main-es2015*.js",
          "/polyfills-es5*.js",
          "/polyfills-es2015*.js",
          "/runtime-es5*.js",
          "/runtime-es2015*.js",
          "/scripts*.js",
          "/styles*.css",
          "/favicon.ico",
          "/app/info",
          "/admin/health"
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
