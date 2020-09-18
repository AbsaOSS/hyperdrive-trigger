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
 
Hyperdrive-trigger can be packaged as a Web Application Archive and executed in web server.  

- Without tests: `mvn clean package -DskipTests`
- With unit tests: `mvn clean package`

# User Interface

# How to contribute
Please see our [**Contribution Guidelines**](CONTRIBUTING.md).

# Documentation
Please see the [documentation pages](https://page/).

