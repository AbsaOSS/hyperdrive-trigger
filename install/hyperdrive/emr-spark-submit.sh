#!/bin/sh


        spark-submit --master yarn --deploy-mode cluster \
        --conf "spark.driver.extraJavaOptions=-Djava.security.auth.login.config==hyper_jaas.conf -Djavax.net.ssl.trustStore=hyperdrive-uat-truststore.jks -Djavax.net.ssl.keyStore=hyperdrive-uat-keystore.jks -Djavax.net.ssl.trustStorePassword=hyperdrive -Djavax.net.ssl.keyStorePassword=hyperdrive -Djavax.net.ssl.password=hyperdrive -Dsun.security.krb5.debug=true -Djava.security.krb5.conf=krb5.conf" \
        --conf "spark.executor.extraJavaOptions=-Djava.security.auth.login.config==hyper_jaas.conf -Djavax.net.ssl.trustStore=hyperdrive-uat-truststore.jks -Djavax.net.ssl.keyStore=hyperdrive-uat-keystore.jks -Djavax.net.ssl.trustStorePassword=hyperdrive -Djavax.net.ssl.keyStorePassword=hyperdrive -Djavax.net.ssl.password=hyperdrive -Dsun.security.krb5.debug=true -Djava.security.krb5.conf=krb5.conf" \
        --conf spark.yarn.keytab="/home/ec2-user/hyperdrive/svc-dehdlza-hypert-for-yarn.keytab" \
        --conf spark.yarn.principal="svc-dehdlza-hypert@CORP.DSARENA.COM" \
        --files "/home/ec2-user/hyperdrive/svc-dehdlza-hypert.keytab#svc-dehdlza-hypert.keytab,/home/ec2-user/hyperdrive/hyper_jaas.conf#hyper_jaas.conf,/home/ec2-user/hyperdrive/hyperdrive-uat-truststore.jks#hyperdrive-uat-truststore.jks,/home/ec2-user/hyperdrive/hyperdrive-uat-keystore.jks#hyperdrive-uat-keystore.jks,/etc/krb5.conf#krb5.conf" \
        --class za.co.absa.hyperdrive.driver.drivers.CommandLineIngestionDriver \
        /home/ec2-user/hyperdrive/driver.jar \
        component.ingestor=Spark \
        component.reader=za.co.absa.hyperdrive.ingestor.implementation.reader.kafka.KafkaStreamReader \
        component.transformer.id.0=[avro.decoder] \
        component.transformer.class.[avro.decoder]=za.co.absa.hyperdrive.ingestor.implementation.transformer.avro.confluent.ConfluentAvroDecodingTransformer \
        component.transformer.id.1=[enceladus.columns] \
        component.transformer.class.[enceladus.columns]=za.co.absa.hyperdrive.ingestor.implementation.transformer.enceladus.columns.AddEnceladusColumnsTransformer \
        component.writer=za.co.absa.hyperdrive.ingestor.implementation.writer.parquet.ParquetStreamWriter \
        ingestor.spark.app.name=ingestor-app-pane \
        reader.kafka.brokers=https://awsdevkb1004.ctodataengdev.aws.dsarena.com:9093,https://awsdevkb1005.ctodataengdev.aws.dasrena.com:9093,https://awsdevkb1006.ctodataengdev.aws.dsarena.com:9093 \
        reader.kafka.topic=global.avaf.za.application.func \
        reader.option.failOnDataLoss=false \
        reader.option.kafka.sasl.jaas.config="com.sun.security.auth.module.Krb5LoginModule required doNotPrompt=false useKeyTab=true storeKey=true useTicketCache=false keyTab=\"svc-dehdlza-hypert.keytab\" serviceName=\"kafka\" principal=\"svc-dehdlza-hypert@CORP.DSARENA.COM\";" \
        reader.option.kafka.sasl.kerberos.service.name=kafka \
        reader.option.kafka.sasl.mechanism=GSSAPI \
        reader.option.kafka.security.protocol=SASL_PLAINTEXT \
        reader.option.kafka.ssl.key.password=hyperdrive \
        reader.option.kafka.ssl.keystore.location=hyperdrive-uat-keystore.jks \
        reader.option.kafka.ssl.keystore.password=hyperdrive \
        reader.option.kafka.ssl.truststore.location=hyperdrive-uat-truststore.jks \
        reader.option.kafka.ssl.truststore.password=hyperdrive \
        transformer.[avro.decoder].schema.registry.url=https://ursaminorawsdevsr.ctodataengdev.aws.dsarena.com:8081 \
        transformer.[avro.decoder].value.schema.id=latest \
        transformer.[avro.decoder].value.schema.naming.strategy=record.name \
        transformer.[avro.decoder].value.schema.record.name=ApplicationProcessedResult \
        transformer.[avro.decoder].value.schema.record.namespace=za.co.absa.avaf.schema.application \
        writer.common.checkpoint.location=/user/ec2-user/hyperdrive/checkpoint-location/containerr/global.avaf.za.application.func \
        writer.parquet.partition.columns=enceladus_info_date,enceladus_info_version \
        writer.parquet.destination.directory=s3://af1-ctodatadev-dev-bigdatarnd-s3-hyperdrive-test/from-container/global.avaf.za.application.func
