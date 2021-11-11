package za.co.absa.hyperdrive.trigger.api.rest.services

import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.core.userdetails.UserDetails

trait UserDetailsService {
  private[services] def getUserName: () => String = {
    SecurityContextHolder.getContext.getAuthentication.getPrincipal.asInstanceOf[UserDetails].getUsername.toLowerCase
  }
}
