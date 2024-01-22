#! /bin/bash
#
# Copyright 2018 ABSA Group Limited
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

RECIPIENTS=$1
RETENTION_DAYS=$2
ENV=$3

if [[ -n "$RECIPIENTS" && -n "$RETENTION_DAYS" && -n "$ENV" ]]; then
  echo "Starting runs clean up with retention days: $RETENTION_DAYS, env: $ENV and recipients: $RECIPIENTS"
else
  echo "Incorrect input. Exiting the program."
  exit 1
fi

config_file="../../application.properties"

db_url=$(grep '^db.url=' "$config_file" | awk -F'jdbc:postgresql://' '{print $2}' | awk -F'\\?' '{print $1}')
db_user=$(grep '^db.user=' "$config_file" | awk -F'=' '{print $2}')
db_password=$(grep '^db.password=' "$config_file" | awk -F'=' '{print $2}')
connection_url="postgresql://$db_user:$db_password@$db_url"

obtain_lock_response=$(psql -X $connection_url -c "UPDATE housekeepinglock SET locked = 'true', started_at = now() WHERE locked = false AND started_at is null;" 2>&1)

if [[ $obtain_lock_response == "UPDATE 1" ]]; then
  echo "Exclusive lock for running runs clean up job obtained."

  archive_dag_instances_response=$(psql -X $connection_url -c "CALL archive_dag_instances(i_to_ts => (now() - '$RETENTION_DAYS days'::interval)::timestamp without time zone);" 2>&1)
  release_lock_response=$(psql -X $connection_url -c "UPDATE housekeepinglock SET locked = 'false', started_at = null;" 2>&1)

  message=""
  subject=""
  if [[ $archive_dag_instances_response == *"ERROR"* ]]; then
    subject="Hyperdrive Notifications - $ENV - Runs clean up succeeded"
    message+="Runs clean up job failed with following output:"
  else
    subject="Hyperdrive Notifications - $ENV - Runs clean up failed!"
    message+="Runs clean up job succeeded with following output:"
  fi
  message+="\n$archive_dag_instances_response"

  if [[ $release_lock_response == "UPDATE 1" ]]; then
    message+="\n\nLock for running runs clean job was successfully released"
  else
    message+="\n\nLock for running runs clean job was not released!"
  fi
  echo -e "$message"
  echo -e "$message" | mailx -s "$subject" -r "noreply@absa.co.za" "$RECIPIENTS"

else
  obtain_lock_time_response=$(psql -X $connection_url -c "SELECT started_at FROM housekeepinglock;" 2>&1)

  timestamp_string=$(echo "$obtain_lock_time_response" | grep -oE '[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}')
  timestamp_unix=$(date -jf "%Y-%m-%d %H:%M:%S" "$timestamp_string" +%s)
  current_unix=$(date +%s)
  time_difference=$((current_unix - timestamp_unix))
  days_difference=$((time_difference / 86400))

  if [ "$days_difference" -gt "29" ]; then
    message="Runs clean up has been running for more than 30 days."
    echo -e "$message"
    echo -e "$message" | mailx -s "Hyperdrive Notifications - $ENV - Runs clean up locked" -r "noreply@absa.co.za" "$RECIPIENTS"
  else
    echo "Runs clean up is running on different machine."
  fi
fi
