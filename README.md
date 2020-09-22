# Hyperdrive-trigger

### <a name="build_status"/>Build Status
| develop |
| ------------- |
| [![Build Status](https://opensource.bigusdatus.com/jenkins/buildStatus/icon?job=Absa-OSS-Projects%2Fhyperdrive-trigger%2Fdevelop)](https://opensource.bigusdatus.com/jenkins/job/Absa-OSS-Projects/job/hyperdrive-trigger/job/develop/) |
___

<!-- toc -->
- [What is Hyperdrive-trigger?](#what-is-hyperdrive-trigger)
- [Requirements](#requirements)
- [How to build and run](#how-to-build-and-run)
    - [Application properties](#application-properties)
    - [Embedded Tomcat](#embedded-tomcat)
    - [Docker image](#docker-image)
    - [Web Application Archive](#web-application-archive)
- [User Interface](#user-interface)
- [How to contribute](#how-to-contribute)
<!-- tocstop -->

# What is Hyperdrive-trigger?
**Hyperdrive-trigger** is a **Event based workflow manager and scheduler**.

A workflow is defined via the graphical interface and consists of three parts: **details**, **sensor** and **jobs**:
- **Details** - General workflow's information (workflow name, project name and whether is workflow active)
- **Sensor** - Definition of workflow trigger, describes when workflow will be executed. Sensors that could be used:
  - *Kafka* - waits for kafka message with specific message 
  - *Time* - time based trigger, cron-quartz expression or user friendly time recurring definition can be used
  - *Recurring* - workflow is triggered always when previous execution is finished 
- **Jobs** - list of jobs. Supported job types: 
  - *Generic Spark Job* - spark job deployed to Apache Hadoop YARN
  - *Generic Shell Job* - job executing a user-defined shell script

The user interface provides a visualization of running workflows with the ability to monitor and troubleshoot executions.

# Requirements
Tested with:
|              |                        |
| ------------ | ---------------------- | 
| OpenJDK      | 1.8.0_25               |
| Scala        | 2.11                   |
| Maven        | 3.5.4                  |
| PostgreSQL   | 12.2_1                 | 
| Spark        | 2.4.4                  | 
| Hadoop Yarn  | 2.6.4.0                | 
| Tomcat       | 9.0.24                 | 
| Docker       | 2.3.0.5                | 
| NPM          | 6.14.4                 | 
| Angular CLI  | 9.0.3                  | 

> Note: Docker is not required.

# How to build and run
## Application properties
Adjusted application properties have to be provided. Application properties template file could be find at `src/main/resources/application.properties`. Application properties that could be adjusted: 

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
#Postgresql properties for connection to trigger database
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
 - **Maven 3.5.4**
 - **NPM 6.14.4**
 - **Angular CLI 9.0.3**
 - **OpenJDK 1.8.0_25**
 
For development purposes, hyperdrive-trigger can be executed as an application with an embedded tomcat. Please check out branch **feature/embedded-tomcat-2** to use it.

To build an executable jar and execute it, use the following commands:
- Package jar: `mvn clean package` or without tests `mvn clean package -DskipTests`
- Execute it: `java -jar ./target/hyperdrive-trigger-<VERSION>.jar`

Access the application at 
```
http://localhost:7123/#
```

For local and iterative front end development, the UI can be run using a live development server with the following commands: 
- Install required packages: `cd ui && npm install`
- Start front end application: `cd ui && ng serve` or `cd ui && npm start`

Access the application at 
```
http://localhost:4200/#
```
 
## Docker image
#### Tested with :
 - **Maven 3.5.4**
 - **OpenJDK 1.8.0_25**
 - **Docker 2.3.0.5**
 
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
 - **Tomcat 9.0.24**
 - **Maven 3.5.4**
 - **OpenJDK 1.8.0_25**
 
Hyperdrive-trigger can be packaged as a Web Application Archive and executed in a web server.  

- Without tests: `mvn clean package -DskipTests`
- With unit tests: `mvn clean package`

# User Interface
- **Workflows**: Overview of all workflows.
![](/docs/img/all_workflows.png)

- **Show workflow**
![](/docs/img/create_workflow.png)

- **Create workflow**
![](/docs/img/create_workflow.png)

- **Workflow history comparison**
![](/docs/img/history_comparison.png)

- **Runs**: Overview of all workflow's runs.
![](/docs/img/all_runs.png)

- **Run Detail**
![](/docs/img/run_detail.png)


# How to contribute
Please see our [**Contribution Guidelines**](CONTRIBUTING.md).
