package za.co.absa.hyperdrive.trigger.api.rest.auth

import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper
import org.springframework.security.core.authority.{AuthorityUtils, SimpleGrantedAuthority}

import java.util

class LdapGrantedAuthoritiesMapper extends GrantedAuthoritiesMapper {
  import scala.collection.JavaConversions._

  override def mapAuthorities(grantedAuthorities: util.Collection[_ <: GrantedAuthority]): util.Collection[_ <: GrantedAuthority] = {
    if (grantedAuthorities == null) {
      AuthorityUtils.NO_AUTHORITIES
    } else {
      grantedAuthorities.map(grantedAuthority => new SimpleGrantedAuthority(grantedAuthority.getAuthority)).toList
    }
  }
}