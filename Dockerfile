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
    HADOOP_HOME=/opt/hadoop \
    HADOOP_CONF_DIR=/opt/hadoop/etc/hadoop \
    SPARK_HOME=/opt/spark \
    SPARK_CONF_DIR=/opt/spark/conf \
    KRB_HOME=/etc/

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

# COPY SPARK AND HADOOP BINARIES CPT
#COPY --chown=0:0 install/hadoop-3.2.1 ${HADOOP_HOME}
#COPY --chown=0:0 install/spark-3.0.1-bin-hadoop3.2 ${SPARK_HOME}

# COPY SPARK AND HADOOP BINARIES IRE
COPY --chown=0:0 install/hadoop-2.7.7 ${HADOOP_HOME}
COPY --chown=0:0 install/spark-2.4.5-bin-hadoop2.7 ${SPARK_HOME}

# REMOVE DEFAULT CONFIG FILES
RUN rm -rf /etc/krb5.conf && \
    rm -rf ${HADOOP_CONF_DIR}/* && \
    rm -rf ${SPARK_CONF_DIR}/*

# COPY REGION CONFIG FILES
COPY install/krb/krb5.conf ${KRB_HOME}
COPY install/hadoop/conf-ire/ ${HADOOP_CONF_DIR}
COPY install/spark/conf-ire/ ${SPARK_CONF_DIR}
#COPY install/hadoop/conf-cpt/ ${HADOOP_CONF_DIR}
#COPY install/spark/conf-cpt/ ${SPARK_CONF_DIR}

# SPARK-HADOOP MISSING LIBRARIES - LINKS
RUN ln -s ${HADOOP_HOME}/share/hadoop/tools/lib/*aws* ${SPARK_HOME}/jars/ && \
    ln -s ${HADOOP_HOME}/share/hadoop/tools/lib/*aws* ${HADOOP_HOME}/share/hadoop/common/lib/

# add below three lines for spark 3 - cpt region. On the above RUN command
#    && \
#    rm -rf ${SPARK_HOME}/jars/guava-14.0.1.jar && \
#    cp ${HADOOP_HOME}/share/hadoop/hdfs/lib/guava-27.0-jre.jar ${SPARK_HOME}/jars/

# SPARK-CONF LINK.
RUN mkdir -p /etc/spark/conf/ && \
    ln -s ${SPARK_CONF_DIR} /etc/spark/conf/

# TRIGGER APPLICATION: WEB ARCHIVE.
COPY ${WAR_FILE} ${TOMCAT_HOME}/webapps/hyperdrive_trigger.war

# START THE APPLICATION AT START UP.
CMD ["catalina.sh", "run"]
