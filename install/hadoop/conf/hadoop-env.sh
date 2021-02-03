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

# The only required environment variable is JAVA_HOME.  All others are
# optional.  When running a distributed configuration it is best to
# set JAVA_HOME in this file, so that it is correctly defined on
# remote nodes.

# The java implementation to use.  Required.
#export JAVA_HOME=

# Extra Java CLASSPATH elements.  Optional.
#export HADOOP_CLASSPATH=

# The maximum amount of heap to use, in MB. Default is 1000.
#export HADOOP_HEAPSIZE=

# Extra Java runtime options.  Empty by default.
#export HADOOP_OPTS=

# Command specific options appended to HADOOP_OPTS when specified
#export HADOOP_NAMENODE_OPTS=
#export HADOOP_SECONDARYNAMENODE_OPTS=
#export HADOOP_DATANODE_OPTS=
#export HADOOP_BALANCER_OPTS=
#export HADOOP_JOBTRACKER_OPTS=
#export HADOOP_TASKTRACKER_OPTS=

# The following applies to multiple commands (fs, dfs, fsck, distcp etc)
#export HADOOP_CLIENT_OPTS=

# Extra ssh options.  Empty by default.
#export HADOOP_SSH_OPTS=

# Where log files are stored.  $HADOOP_HOME/logs by default.
#export HADOOP_LOG_DIR=

# File naming remote slave hosts.  $HADOOP_HOME/conf/slaves by default.
#export HADOOP_WORKERS=

# host:path where hadoop code should be rsync'd from.  Unset by default.
#export HADOOP_MASTER=

# Seconds to sleep between slave commands.  Unset by default.  This
# can be useful in large clusters, where, e.g., slave rsyncs can
# otherwise arrive faster than the master can service them.
#export HADOOP_WORKER_SLEEP=

# The directory where pid files are stored. /tmp by default.
#export HADOOP_PID_DIR=

# A string representing this instance of hadoop. $USER by default.
#export HADOOP_IDENT_STRING=

# The scheduling priority for daemon processes.  See 'man nice'.
#export HADOOP_NICENESS=

# tez environment, needed to enable tez
export TEZ_CONF_DIR=/etc/tez/conf
export TEZ_JARS=/usr/lib/tez
# Add tez into HADOOP_CLASSPATH
export HADOOP_CLASSPATH=$HADOOP_CLASSPATH:${TEZ_CONF_DIR}:${TEZ_JARS}/*:${TEZ_JARS}/lib/*

export HADOOP_CLASSPATH="$HADOOP_CLASSPATH:/usr/lib/hadoop-lzo/lib/*"
export JAVA_LIBRARY_PATH="$JAVA_LIBRARY_PATH:/usr/lib/hadoop-lzo/lib/native"


export HADOOP_CLASSPATH=$HADOOP_CLASSPATH:/usr/share/aws/aws-java-sdk/*

export HADOOP_CLASSPATH="$HADOOP_CLASSPATH:/usr/share/aws/emr/emrfs/conf:/usr/share/aws/emr/emrfs/lib/*:/usr/share/aws/emr/emrfs/auxlib/*"


export HADOOP_CLASSPATH="$HADOOP_CLASSPATH:/usr/share/aws/emr/ddb/lib/emr-ddb-hadoop.jar"


export HADOOP_CLASSPATH="$HADOOP_CLASSPATH:/usr/share/aws/emr/goodies/lib/emr-hadoop-goodies.jar"


export HADOOP_CLASSPATH="$HADOOP_CLASSPATH:/usr/share/aws/emr/kinesis/lib/emr-kinesis-hadoop.jar"



# Add CloudWatch sink jar to classpath
export HADOOP_CLASSPATH="$HADOOP_CLASSPATH:/usr/share/aws/emr/cloudwatch-sink/lib/*"

# Add security artifacts to classpath
export HADOOP_CLASSPATH="$HADOOP_CLASSPATH:/usr/share/aws/emr/security/conf:/usr/share/aws/emr/security/lib/*"

export HADOOP_OPTS="$HADOOP_OPTS -server -XX:+ExitOnOutOfMemoryError"
export HADOOP_NAMENODE_HEAPSIZE=1843
export HADOOP_DATANODE_HEAPSIZE=778
export HADOOP_JOB_HISTORYSERVER_HEAPSIZE=2416