# HyperDriver - Workflow Manager

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 8.3.17.

## Frontend maven integration
From the root directory, run `mvn clean install`. It builds and tests the Angular frontend by invoking `npm build` and `npm test`. It also downloads node and npm. 

To skip downloading node and npm (e.g. if you are offline), use `-Dskip.installnodenpm`.

To skip the entire frontend build,  use `-Dskip.npm -Dskip.installnodenpm`.

To run the backend with the Angular frontend, set the following flags (either in a `.properties` file or as command-line arguments:
- `rest.api.prefix=/api`
- `spring.resources.static-locations=classpath:/ui-angular/`

## Angular CLI
Move to `<root>/src/main/ui-angular` to use the Angular CLI (commands with `ng`) or `npm` commands defined in the `package.json`

### Development server
Run `npm start` to start the dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
For backend integration, run the backend on `localhost:7123` with the flag `rest.api.prefix=/api`. If you need to use a different port, you can set it in `proxy.conf.json`.

### Code scaffolding
Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Linting code
Run `ng lint` to have the code linted.

### Running unit tests
Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests
Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

### Further help
To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
