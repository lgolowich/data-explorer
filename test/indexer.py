"""For convenience, load test data into Elasticsearch index "insurance_data".

For real datasets, one would use one of the indexers in
https://github.com/DataBiosphere/data-explorer-indexers/, or from somewhere
else. The ElasticSearch index would exist before running the servers in this
repo. For convenience, create a test index so one can easily try out Data
explorer with test data.

Input must be JSON, not CSV. Unlike JSON, CSV values don't have types, so
numbers would be indexed as strings. (And there is no easy way in Python to
detect the type of a string.)

Unfortunately there's no easy way to index a JSON file using curl. (See
https://stackoverflow.com/questions/23798433/json-bulk-import-to-elasticstearch.)
So write a Python script.
"""

import json
import time

from elasticsearch import Elasticsearch
from elasticsearch import helpers


INDEX_NAME = 'insurance_data'


def init_elasticsearch():
  # Wait for Elasticsearch to come up.
  # I had trouble getting wait_for_status to work, so just use sleep. See
  # https://discuss.elastic.co/t/cant-get-python-client-wait-for-status-to-work/123163
  time.sleep(15)

  # This script is invoked from docker-compose, so use service name.
  # If running this script directly on host, change to "localhost:9200".
  es = Elasticsearch(["elasticsearch:9200"])
  print('Deleting %s index.' % INDEX_NAME)
  try:
    es.indices.delete(index=INDEX_NAME)
  except Exception as e:
    # Sometimes delete fails even though index exists. Add logging to help
    # debug.
    print('Deleting %s index failed: %s' % (INDEX_NAME, e))
    # Ignore 404: index not found
    index = es.indices.get(index=INDEX_NAME, ignore=404)
    print('es.indices.get(index=%s): %s' % (INDEX_NAME, index))
    pass
  print('Creating %s index.' % INDEX_NAME)
  es.indices.create(index=INDEX_NAME, body={})
  return es


def main():
  es = init_elasticsearch()
  actions = []
  with open('test.json') as f:
    records = json.load(f)
    for record in records:
      action = {
        '_index': INDEX_NAME,
        # type will go away in future versions of Elasticsearch. Just use any string
        # here.
        '_type' : 'type',
        '_source': record,
      }
      actions.append(action)
  helpers.bulk(es, actions)


if __name__ == '__main__':
  main()
