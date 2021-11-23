package za.co.absa.hyperdrive.trigger.api.rest.auth

import org.springframework.ldap.core.DirContextOperations
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.authority.{AuthorityUtils, SimpleGrantedAuthority}
import org.springframework.security.ldap.userdetails.LdapAuthoritiesPopulator

import java.util
import javax.naming.ldap.LdapName

class ActiveDirectoryLdapAuthoritiesPopulator extends LdapAuthoritiesPopulator {

  import scala.collection.JavaConversions._

  override def getGrantedAuthorities(userData: DirContextOperations, username: String): util.Collection[_ <: GrantedAuthority] = {
    val groups = userData.getStringAttributes("memberOf")

    if (groups == null) {
      AuthorityUtils.NO_AUTHORITIES
    }
    else {
      groups.map({group =>
        val ldapName = new LdapName(group)
        val role = ldapName.getRdn(ldapName.size() - 1).getValue.toString
        new SimpleGrantedAuthority(role)
      }).toList
    }
  }
}