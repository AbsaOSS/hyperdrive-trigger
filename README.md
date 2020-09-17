# hyperdrive-trigger
Event based workflow manager.


# Development
## Liquibase
The liquibase maven plugin may be used to issue liquibase commands. To use it, three environment variables have to be defined
- `HYP_DB_URL`: The connection url to the db, starting with `jdbc://postgresql`
- `HYP_DB_USER`: The database user
- `HYP_DB_PASSWORD`: The password for the database user

Then, the liquibase maven plugin can be executed, e.g.
`mvn liquibase:status`

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

### Liquibase
The docker-compose file creates a container for liquibase. To access it, find its container id with `docker ps`, and log into the container
using `docker exec -it <container-id> sh`. The liquibase binary is located under `/liquibase/liquibase`. To execute a command,
simply type e.g. `/liquibase/liquibase history`

## Testdata
`mvn test -Ptestdata` creates testdata in `localhost:5432/hyperdriver`, assuming the DB-user `hyperdriver` exists.
