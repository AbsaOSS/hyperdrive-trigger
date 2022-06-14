# Copyright 2018 ABSA Group Limited
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


# leave it empty, the value is passed from outside
ARG DOCKER_BASE_IMAGE_PREFIX

# specify your desired base image
ARG TOMCAT_BASE_IMAGE=tomcat:9-jre8-alpine

# all pulling images MUST be prefixed like this
FROM "$DOCKER_BASE_IMAGE_PREFIX""$TOMCAT_BASE_IMAGE"

LABEL \
    vendor="ABSA" \
    copyright="2020 ABSA Group Limited" \
    license="Apache License, version 2.0" \
    name="Hyperdrive Workflow Manager"

# These arguments are propagated from the corresponding Maven properties.
# Uncomment what you need.
#
# ARG PROJECT_NAME
# ARG PROJECT_GROUP_ID
# ARG PROJECT_ARTIFACT_ID
# ARG PROJECT_VERSION
# ARG PROJECT_BASEDIR
# ARG PROJECT_BUILD_DIRECTORY
# ARG PROJECT_BUILD_FINAL_NAME

# SET ENVIRONMENT VARIABLES

ADD src/main/resources/docker/start_trigger.sh conf/start_trigger.sh
ADD src/main/resources/docker/server.xml /tmp/server.xml
RUN chmod +x conf/start_trigger.sh && \
    rm -rf webapps/*

# TRIGGER APPLICATION: WEB ARCHIVE.
COPY target/*.war webapps/hyperdrive_trigger.war

EXPOSE 8080
EXPOSE 8443
EXPOSE 8009
CMD ["conf/start_trigger.sh"]
