package org.apache.spark.deploy

object SparkHadoopUtilInternal {
  lazy val conf = SparkHadoopUtil.get.conf
}
