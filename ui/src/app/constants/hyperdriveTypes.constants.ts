/*
 * Copyright 2018 ABSA Group Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HyperdriveFieldsModel } from '../models/hyperdriveFields.model';

export const hyperdriveTypes = {
  HYPERCONFORMANCE_RAW_TO_PUBLISH_TOPIC: 'HyperConformance Raw to Publish Topic',
  OFFLOAD_RAW_TOPIC_WITH_HYPERCONFORMANCE: 'Offload Raw Topic with HyperConformance',
  OFFLOAD_PUBLISH_TOPIC: 'Offload Publish Topic',
};

export const hyperdriveTypesMap: Map<string, string> = new Map([
  [hyperdriveTypes.HYPERCONFORMANCE_RAW_TO_PUBLISH_TOPIC, hyperdriveTypes.HYPERCONFORMANCE_RAW_TO_PUBLISH_TOPIC],
  [hyperdriveTypes.OFFLOAD_RAW_TOPIC_WITH_HYPERCONFORMANCE, hyperdriveTypes.OFFLOAD_RAW_TOPIC_WITH_HYPERCONFORMANCE],
  [hyperdriveTypes.OFFLOAD_PUBLISH_TOPIC, hyperdriveTypes.OFFLOAD_PUBLISH_TOPIC],
]);

export const hyperdriveFields = {
  READER_TOPIC: 'reader.kafka.topic=',
  WRITER_TOPIC: 'writer.kafka.topic=',
  WRITER_DESTINATION_DIR: 'writer.parquet.destination.directory=',
  MENAS_DATASET_NAME: 'transformer.hyperconformance.dataset.name=',
  MENAS_DATASET_VERSION: 'transformer.hyperconformance.dataset.version=',
};

export const hyperdriveTypesFields: HyperdriveFieldsModel[] = [
  new HyperdriveFieldsModel(hyperdriveTypes.HYPERCONFORMANCE_RAW_TO_PUBLISH_TOPIC, [
    hyperdriveFields.READER_TOPIC,
    hyperdriveFields.WRITER_TOPIC,
    hyperdriveFields.MENAS_DATASET_NAME,
    hyperdriveFields.MENAS_DATASET_VERSION,
  ]),
  new HyperdriveFieldsModel(hyperdriveTypes.OFFLOAD_RAW_TOPIC_WITH_HYPERCONFORMANCE, [
    hyperdriveFields.READER_TOPIC,
    hyperdriveFields.WRITER_DESTINATION_DIR,
    hyperdriveFields.MENAS_DATASET_NAME,
    hyperdriveFields.MENAS_DATASET_VERSION,
  ]),
  new HyperdriveFieldsModel(
    hyperdriveTypes.OFFLOAD_PUBLISH_TOPIC,
    [hyperdriveFields.READER_TOPIC, hyperdriveFields.WRITER_DESTINATION_DIR],
    [hyperdriveFields.MENAS_DATASET_NAME, hyperdriveFields.MENAS_DATASET_VERSION, hyperdriveFields.WRITER_TOPIC],
  ),
];

export const hyperdriveTemplateFields = {
  KAFKA_STREAM_READER: 'component.reader=za.co.absa.hyperdrive.ingestor.implementation.reader.kafka.KafkaStreamReader',
  KAFKA_STREAM_WRITER: 'component.writer=za.co.absa.hyperdrive.ingestor.implementation.writer.kafka.KafkaStreamWriter',
  PARQUET_STREAM_WRITER: 'component.writer=za.co.absa.hyperdrive.ingestor.implementation.writer.parquet.ParquetStreamWriter',
  HYPERCONFORMANCE_TRANSFORMER: 'component.transformer.class.hyperconformance=za.co.absa.enceladus.conformance.HyperConformance',
};

export const hyperdriveTypesJobTemplateFields: HyperdriveFieldsModel[] = [
  new HyperdriveFieldsModel(hyperdriveTypes.HYPERCONFORMANCE_RAW_TO_PUBLISH_TOPIC, [
    hyperdriveTemplateFields.KAFKA_STREAM_READER,
    hyperdriveTemplateFields.KAFKA_STREAM_WRITER,
    hyperdriveTemplateFields.HYPERCONFORMANCE_TRANSFORMER,
  ]),
  new HyperdriveFieldsModel(hyperdriveTypes.OFFLOAD_RAW_TOPIC_WITH_HYPERCONFORMANCE, [
    hyperdriveTemplateFields.KAFKA_STREAM_READER,
    hyperdriveTemplateFields.PARQUET_STREAM_WRITER,
    hyperdriveTemplateFields.HYPERCONFORMANCE_TRANSFORMER,
  ]),
  new HyperdriveFieldsModel(
    hyperdriveTypes.OFFLOAD_PUBLISH_TOPIC,
    [hyperdriveTemplateFields.KAFKA_STREAM_READER, hyperdriveTemplateFields.PARQUET_STREAM_WRITER],
    [hyperdriveTemplateFields.KAFKA_STREAM_WRITER, hyperdriveTemplateFields.HYPERCONFORMANCE_TRANSFORMER],
  ),
];
