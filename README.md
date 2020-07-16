# hyperdrive-trigger
Event based workflow manager.


# Development
## Docker image
For development purposes, hyperdrive-trigger can be executed as a docker image. This requires a running local docker instance. The provided docker composition consists of the hyperdrive-trigger and a Postgres database. It is currently not possible to start spark-jobs using this docker composition.

To create the docker image, the project has to be built with the `-Pdocker` flag.
```
mvn clean package -Pdocker
```

To start the application, type
```
docker-compose up
```

This creates one container for hyperdrive-trigger and another container for postgres. Additionally, there will be a shared network and a persistent volume for the database.

Access the application at 
```
http://localhost:7123
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

### Liquibase
The docker-compose file creates a container for liquibase. To access it, find its container id with `docker ps`, and log into the container
using `docker exec -it <container-id> sh`. The liquibase binary is located under `/liquibase/liquibase`. To execute a command,
simply type e.g. `/liquibase/liquibase history`

### Troubleshooting

#### Error: Get https://registry-1.docker.io/v2/: net/http: request canceled while waiting for connection (Client.Timeout exceeded while awaiting headers)

If `mvn clean package -Pdocker` fails due to proxy settings, you may want to try to build the image using the docker console.

```
docker build --build-arg JAR_FILE=target/hyperdrive-trigger-0.0.1-SNAPSHOT.jar -t absaoss/hyperdrive-trigger:latest .
```

#### Error: hyperdrive-trigger_hyperdrive-trigger_1 exited with code 1

If `docker-compose up` fails with this error message, probably the docker image was not present when `docker-compose up` was called. `docker-compose` tries to build the image by itself, which doesn't work.

## Testdata
`mvn test -Ptestdata` creates testdata in `localhost:5432/hyperdriver`, assuming the DB-user `hyperdriver` exists.
