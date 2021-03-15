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

# SET ENVIRONMENT VARIABLES
ENV TOMCAT_MAJOR=9 \
    TOMCAT_VERSION=9.0.37 \
    TOMCAT_HOME=/opt/tomcat \
    CATALINA_HOME=/opt/tomcat \
    JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk/jre \
    HADOOP_HOME=/hyperdrive/hadoop \
    HADOOP_CONF_DIR=/hyperdrive/hadoop/etc/hadoop \
    SPARK_HOME=/hyperdrive/spark \
    SPARK_CONF_DIR=/hyperdrive/spark/conf \
    KRB_FILE=/etc/krb5.conf


ENV PATH $CATALINA_HOME/bin:$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$SPARK_HOME/bin:$PATH

EXPOSE 8080

ARG WAR_FILE

# TOMCAT
RUN apk upgrade --update && \
    apk add --update curl && \
    apk add bash && \
    apk add --no-cache krb5-pkinit krb5-dev krb5 && \
    curl -jksSL -o /tmp/apache-tomcat.tar.gz http://archive.apache.org/dist/tomcat/tomcat-${TOMCAT_MAJOR}/v${TOMCAT_VERSION}/bin/apache-tomcat-${TOMCAT_VERSION}.tar.gz && \
    gunzip /tmp/apache-tomcat.tar.gz && \
    tar -C /opt -xf /tmp/apache-tomcat.tar && \
    ln -s /opt/apache-tomcat-${TOMCAT_VERSION} ${TOMCAT_HOME} && \
    rm -rf ${TOMCAT_HOME}/webapps/* && \
    apk del curl && \
    rm -rf /tmp/* /var/cache/apk/*

# USE ROOT USER
USER 0

# SPARK-CONF AND KRB S LINKS.
RUN mkdir -p /etc/spark/ && \
    ln -s ${SPARK_CONF_DIR} /etc/spark && \
    rm -rf ${KRB_FILE} && \
    ln -s /hyperdrive/config/krb5.conf ${KRB_FILE}

# TRIGGER APPLICATION: WEB ARCHIVE.
COPY ${WAR_FILE} ${TOMCAT_HOME}/webapps/hyperdrive_trigger.war
#
# START THE APPLICATION AT START UP.
CMD ["catalina.sh", "run"]
