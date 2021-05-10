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

FROM tomcat:9-jre8-alpine

LABEL \
    vendor="ABSA" \
    copyright="2020 ABSA Group Limited" \
    license="Apache License, version 2.0" \
    name="Hyperdrive Workflow Manager"

# SET ENVIRONMENT VARIABLES
ENV JAVA_HOME=/usr/lib/jvm/java-1.8-openjdk/jre \
    HADOOP_HOME=/hyperdrive/hadoop \
    HADOOP_CONF_DIR=/hyperdrive/hadoop/etc/hadoop \
    SPARK_HOME=/hyperdrive/spark \
    SPARK_CONF_DIR=/hyperdrive/spark/conf \
    KRB_FILE=/hyperdrive/conf/krb5.conf

ARG WAR_FILE

ADD src/main/resources/docker/start_trigger.sh conf/start_trigger.sh
ADD src/main/resources/docker/server.xml /tmp/server.xml
RUN chmod +x conf/start_trigger.sh && \
    rm -rf webapps/*

# SPARK-CONF AND KRB S LINKS.
RUN mkdir -p /etc/spark/ && \
    ln -s ${SPARK_CONF_DIR} /etc/spark && \
    rm -rf /etc/krb5.conf && \
    ln -s ${KRB_FILE} /etc/krb5.conf

# TRIGGER APPLICATION: WEB ARCHIVE.
COPY ${WAR_FILE} webapps/hyperdrive_trigger.war

EXPOSE 8080
EXPOSE 8443
EXPOSE 8009
CMD ["conf/start_trigger.sh"]