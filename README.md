# hyperdrive-trigger
Event based workflow manager.


# Development
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

## Testdata
`mvn test -Ptestdata` creates testdata in `localhost:5432/hyperdriver`, assuming the DB-user `hyperdriver` exists.
