# Hyperdrive-trigger

### <a name="build_status"/>Build Status
| develop |
| ------------- |
| [![Build Status](https://opensource.bigusdatus.com/jenkins/buildStatus/icon?job=Absa-OSS-Projects%2Fhyperdrive-trigger%2Fdevelop)](https://opensource.bigusdatus.com/jenkins/job/Absa-OSS-Projects/job/hyperdrive-trigger/job/develop/) |
___

<!-- toc -->
- [What is Hyperdrive-trigger?](#what-is-hyperdive-trigger)
- [Requirements](#requirements)
- [How to build](#how-to-build)
- [User Interface](#user-interface)
- [How to contribute](#how-to-contribute)
- [Documentation](#documentation)
<!-- tocstop -->

# What is Hyperdrive-trigger?
**Hyperdrive-trigger** is a **Event based workflow manager and scheduler**.

Workflow is defined via graphical interface and consists of three parts: **details**, **sensor** and **jobs**:
- **details** - General workflow's information (workflow name, project name and whether is workflow active)
- **sensor** - Definition of workflow trigger, describes when workflow will be executed. Sensors that could be used:
  - *Kafka* - waits for kafka message with specific message 
  - *Time* - time based trigger, cron-quartz expression or user friendly time recurring definition can be used
  - *Recurring* - worklfow is triggered always when previous execution is finished 
- **jobs** - list of jobs, defined as a linear directed acyclic graph. Supported jobs types: 
  - *Spark* - spark job deployed to Apache Hadoop YARN
  - *Shell* - shell job

User interface also provide nice visualization of running workflow with ability to monitor and troubleshoot execution.

# Requirements
Tested with:
|              | version                |
| ------------ | ---------------------- | 
| OpenJDK      | 1.8.0_25               |
| Scala        | 2.11                   |
| Maven        | 3.5.4+                 |
| PostgreSQL   | 12.2_1                 | 
| Spark        | 2.4.4                  | 
| Hadoop Yarn  | 2.6.4.0+               | 
| Tomcat       | 9.0.24+                | 
| Docker       | 2.3.0.5                | 

> Note: Docker is not required.

# How to build and run
## Application properties
Before building application, update of application properties is required. Application properties templeate file could be find at `src/main/resources/application.properties`. Application properties that could be adjusted: 

```
# Version of application. 
version=@project.version@
# Enviroment where application will be running
environment=Local
```
```
# How will users authenticate. Available options: inmemory, ldap
auth.mechanism=inmemory
# INMEMORY authentication: username and password defined here will be used for authentication.
auth.inmemory.user=user
auth.inmemory.password=password
# LDAP authentication: props template that has to be defined in case of LDAP authentication
auth.ad.domain=
auth.ad.server=
auth.ldap.search.base=
auth.ldap.search.filter=
```
```
# Unique app id, for easier application identification
appUniqueId=
```
```
# Core properties.
# How many threads to use for each part of the "scheduler".
# Heart beat interval in milliseconds.
scheduler.thread.pool.size=10
scheduler.sensors.thread.pool.size=20
scheduler.executors.thread.pool.size=30
scheduler.jobs.parallel.number=100
scheduler.heart.beat=5000
```
```
#Kafka sensor properties. Not all are required. Adjust according to your use case.
kafkaSource.group.id=hyper_drive_${appUniqueId}
kafkaSource.key.deserializer=org.apache.kafka.common.serialization.StringDeserializer
kafkaSource.value.deserializer=org.apache.kafka.common.serialization.StringDeserializer
kafkaSource.poll.duration=500
kafkaSource.max.poll.records=3
kafkaSource.properties.enable.auto.commit=false
kafkaSource.properties.auto.offset.reset=latest
kafkaSource.properties.security.protocol=
kafkaSource.properties.ssl.truststore.location=
kafkaSource.properties.ssl.truststore.password=
kafkaSource.properties.ssl.keystore.location=
kafkaSource.properties.ssl.keystore.password=
kafkaSource.properties.ssl.key.password=
kafkaSource.properties.sasl.kerberos.service.name=
kafkaSource.properties.sasl.mechanism=
kafkaSource.properties.sasl.jaas.config=
```
```
#Spark yarn sink properties. Properties used to deploy and run Spark job in Yarn. Not all are required. Adjust according to your use case.
sparkYarnSink.hadoopResourceManagerUrlBase=
sparkYarnSink.hadoopConfDir=
sparkYarnSink.sparkHome=
sparkYarnSink.master=yarn
sparkYarnSink.submitTimeout=160000
sparkYarnSink.filesToDeploy=
sparkYarnSink.additionalConfs.spark.ui.port=
sparkYarnSink.additionalConfs.spark.executor.extraJavaOptions=
sparkYarnSink.additionalConfs.spark.driver.extraJavaOptions=
sparkYarnSink.additionalConfs.spark.driver.memory=2g
sparkYarnSink.additionalConfs.spark.executor.instances=2
sparkYarnSink.additionalConfs.spark.executor.cores=2
sparkYarnSink.additionalConfs.spark.executor.memory=2g
sparkYarnSink.additionalConfs.spark.yarn.keytab=
sparkYarnSink.additionalConfs.spark.yarn.principal=
sparkYarnSink.additionalConfs.spark.shuffle.service.enabled=true
sparkYarnSink.additionalConfs.spark.dynamicAllocation.enabled=true
```
```
#Postgresql properties for connection to trigger metastore
db.driver=org.postgresql.Driver
db.url=jdbc:postgresql://
db.user=
db.password=
db.keepAliveConnection=true
db.connectionPool=HikariCP
db.numThreads=4
```

## Embedded Tomcat
#### Tested with :
 - **Maven 3.5.4+**
 - **NPM 6.14.4**
 - **Angular CLI 9.0.3**
 - **OpenJDK 1.8.0_25**
 
For development purposes, hyperdrive-trigger can be executed as a application with embedded tomcat. Embedded tomcat version can be found in **feature/embedded-tomcat-2** branch with latest changes from develop branch.

To build executable jar and execute it use following commands:
- Package jar: `mvn clean package` or without tests `mvn clean package -DskipTests`
- Execute it: `java -jar ./target/hyperdrive-trigger-<VERSION>.jar`

Access the application at 
```
http://localhost:7123/#
```

For fast, local and iterative front end development you can run ui separatly using following commands: 
- Install required packages: `cd ui & npm install`
- Strat front end application: `cd ui & ng serve` or `cd ui & npm start`

Access the application at 
```
http://localhost:4200/#
```
 
## Docker image
For development purposes, hyperdrive-trigger can be executed as a docker image.
The provided docker composition consists of one container for the hyperdrive-trigger application and a container for the Postgres database. 
Additionally, there will be a persistent volume for the database.
It is currently not possible to start spark-jobs using this docker composition.

To create the docker image, build the application and create the image using the following command. Please replace `<current_version>` accordingly.
```
mvn clean package
docker build --build-arg WAR_FILE=target/hyperdrive-trigger-<current_version>.war -t absaoss/hyperdrive-trigger .
```

To start the application, type
```
docker-compose up
```

Access the application at 
```
http://localhost:8082/hyperdrive_trigger
```

To stop the application, type
```
docker-compose down
```

This will stop the containers, but the database data will not be removed.

To remove database data, type
```
docker container prune
docker volume prune
```
This removes stopped containers and volumes that are not referenced by any containers.

## Web Application Archive
#### Tested with :
 - **Tomcat 9.0.24+**
 - **Maven 3.5.4+**
 
Hyperdrive-trigger can be packaged as a Web Application Archive and executed in web server.  

- Without tests: `mvn clean package -DskipTests`
- With unit tests: `mvn clean package`

# User Interface

# How to contribute
Please see our [**Contribution Guidelines**](CONTRIBUTING.md).

# Documentation
Please see the [documentation pages](https://page/).

