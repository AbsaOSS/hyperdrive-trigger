# Licensed to the Apache Software Foundation (ASF) under one or more
# contributor license agreements.  See the NOTICE file distributed with
# this work for additional information regarding copyright ownership.
# The ASF licenses this file to You under the Apache License, Version 2.0
# (the "License"); you may not use this file except in compliance with
# the License.  You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.


# WARNING: Heavy puppet machinery is involved managing this file,
#          your edits stand no chance
#
# Set Hadoop-specific environment variables here.

# Where log files are stored.  $HADOOP_HOME/logs by default(for emr-5.x).
# In emr-6.x, /var/log/hadoop-hdfs by default(overridden in node provisioner)
# export HADOOP_LOG_DIR=/var/log/hadoop-hdfs
#export HADOOP_LOG_DIR=
export HADOOP_LOG_DIR=/var/log/hadoop-hdfs