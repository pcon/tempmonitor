import os
import sys
import json
import base64
import urllib2
import datetime

QUEUE_URL = 'https://%s/1/projects/%s/queues/%s/messages?n=100' % (os.environ.get('IRONMQ_HOST'), os.environ.get('IRONMQ_PROJECT'), os.environ.get('IRONMQ_QUEUE'))
DELETE_URL = 'https://%s/1/projects/%s/queues/%s/messages' % (os.environ.get('IRONMQ_HOST'), os.environ.get('IRONMQ_PROJECT'), os.environ.get('IRONMQ_QUEUE'))
CLOUDANT_URL = 'https://%s/%s/_bulk_docs' % (os.environ.get('COUCHDB_HOST'), os.environ.get('COUCHDB_DATABASE'))

cloudant_auth = (os.environ.get('COUCHDB_USERNAME'), os.environ.get('COUCHDB_PASSWORD'))
base64string = base64.encodestring('%s:%s' % cloudant_auth).replace('\n','')
cloudant_headers = {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": "Basic %s" % base64string
}

ironmq_get_headers = {
    "Accept": "application/json",
    "Authorization": "OAuth %s" % os.environ.get('IRONMQ_TOKEN')
}

ironmq_delete_headers = {
    "Content-Type": "application/json",
    "Authorization": "OAuth %s" % os.environ.get('IRONMQ_TOKEN')
}

request = urllib2.Request(QUEUE_URL, headers=ironmq_get_headers)
f = urllib2.urlopen(request)
response = f.read()
f.close()

data = json.loads(response)

ids = []
records = {}
records['docs'] = []

if 'messages' in data:
    print len(data['messages'])
    if len(data['messages']) != 0:
        for message in data['messages']:
            print message['body']
            (temp, timestamp) = message['body'].split(':', 2)
            dt =  datetime.datetime.fromtimestamp(float(timestamp));

            doc = {}
            doc['temp'] = float(temp)
            doc['timestamp'] = dt.isoformat()
            doc['location'] = os.environ.get('IRONMQ_QUEUE')
            records['docs'].append(doc)

            ids.append(message['id'])

        data = {}
        data['ids'] = ids

        opener = urllib2.build_opener(urllib2.HTTPHandler)
        req = urllib2.Request(DELETE_URL, json.dumps(data), ironmq_delete_headers)
        req.get_method = lambda: 'DELETE'
        f = urllib2.urlopen(req)
        response = f.read()
        f.close()

if len(records['docs']) > 0:
    records_string = json.dumps(records)
    request = urllib2.Request(CLOUDANT_URL, records_string, headers = cloudant_headers)
    f = urllib2.urlopen(request)
    response = f.read()
    f.close()