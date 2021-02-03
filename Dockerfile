# Copyright 2018-2020 ABSA Group Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

FROM openjdk:8-jre-alpine

LABEL \
    vendor="ABSA" \
    copyright="2020 ABSA Group Limited" \
    license="Apache License, version 2.0" \
    name="Hyperdrive Workflow Manager"

ENV TOMCAT_MAJOR=9 \
    TOMCAT_VERSION=9.0.37 \
    TOMCAT_HOME=/opt/tomcat \
    CATALINA_HOME=/opt/tomcat

ENV PATH $CATALINA_HOME/bin:$PATH

EXPOSE 8080

ARG WAR_FILE

# TOMCAT
#RUN apk upgrade --update && \
#    apk add --update curl && \
#    apk add --no-cache krb5-pkinit krb5-dev krb5 && \
#    curl -jksSL -o /tmp/apache-tomcat.tar.gz http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_MAJOR}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz && \
#    gunzip /tmp/apache-tomcat.tar.gz && \
#    tar -C /opt -xf /tmp/apache-tomcat.tar && \
#    ln -s /opt/apache-tomcat-${TOMCAT_VERSION} ${TOMCAT_HOME} && \
#    rm -rf ${TOMCAT_HOME}/webapps/* && \
#    apk del curl && \
#    rm -rf /tmp/* /var/cache/apk/*


# SPARK HADOOP DIRECTORIES
RUN mkdir -p /var/aws/emr/ && \
    mkdir -p /etc/hadoop/conf && \
    mkdir -p /etc/spark/conf && \
    mkdir -p /var/log/spark/user/ && \
    mkdir -p /var/aws/emr/ && \
    chmod 777 -R /var/log/spark/

# REPO FILES
COPY install/repo/emr-apps.repo /etc/yum.repos.d/ \
     install/repo/repoPublicKey.txt /var/aws/emr/

# SPARK HADOOP BINARIES
#RUN yum install -y hadoop-client && \
#    yum install -y hadoop-hdfs && \
#    yum install -y spark-core && \
#    yum install -y java-1.8.0-openjdk && \
#    yum install -y krb5-workstation krb5-libs && \
#    rm -f /etc/krb5.conf && \
#    cp install/krb/krb5.conf /etc/

# HADOOP USER
RUN hdfs dfs –mkdir /user/fargate-user && \
    hdfs dfs –mkdir /user/root && \
    hdfs dfs -chown fargate-user:fargate-user /user/fargate-user && \
    hdfs dfs -chown root:root /user/root

# SPARK HADOOP CONFIGS
COPY install/hadoop/conf/ /etc/hadoop/conf/ \
     install/spark/conf/ /etc/spark/conf/

COPY ${WAR_FILE} ${TOMCAT_HOME}/webapps/hyperdrive_trigger.war

CMD ["catalina.sh", "run"]
