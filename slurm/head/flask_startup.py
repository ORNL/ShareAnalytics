from flask import Flask
from flask import json
from flask import request
import requests
from subprocess import Popen # run commands in terminal async
import os
import uuid
from datetime import datetime
from flask import Response

# default http://0.0.0.0:5000/

app = Flask(__name__)

metadataDict = {}

# Directory Configuration
datasetDirectory = "/tmp/datasets/"
analyticDirectory = "/tmp/analytics/"

@app.route('/returnresults',methods=['POST'])
def return_results(meta=metadataDict):

    j = request.get_json()
    uid = j['uuid']
    score = j['score']

    dat = {
        "start":meta[uid]['start'],
        "finish":str(datetime.now()),
        "title":meta[uid]['title'],
        "description":meta[uid]['description'],
        "filepaths":j['filepaths'],
        "analytic":meta[uid]['analytic'],
        "dashboard":meta[uid]['dashboard'],
        "dataset":meta[uid]['dataset'],
        "score": score,
        "user":meta[uid]['user'],
        "uuid": uid
    }

    # If not using the provided docker project, will need to replace 'web' in url with resolvable hostname or ip
    r = requests.post("http://web:3000/api/postresult", data=dat)

    response = app.response_class(
    response=r,
    status=r.status_code,
    mimetype='application/json'
    )

    return response

@app.route('/submitjob',methods=['POST'])
def sbatch(meta=metadataDict):
    try:
        uid = str(uuid.uuid4())
        j = request.get_json()
        for val in j:
            if uid in meta:
                meta[uid][val] = j[val]
            else:
                meta[uid] = { val: j[val] }
        meta[uid]['start'] = str(datetime.now())
        os.makedirs('/tmp/newresults/' + uid)

        #tmp file that will be wiped when process finished
        #indicates to the watcher whether or not the results are ready
        file = open('/tmp/newresults/' + uid + '/floccinaucinihilitemp.txt','w')
        file.close()
        #bash script that executes necessary code
        #this runs in same directory where output files will go 
        #executed scripts should drop all output files in current working directory
        file = open('/tmp/newresults/' + uid + '/temp.sh','w')
        file.write('#!/bin/sh\n')
        #extension = os.path.splitext(meta[uid]['analyticpath'])[1]
        analytictype = meta[uid]['analytictype']
        if analytictype == 'python':
            file.write('python ' + analyticDirectory + meta[uid]['analyticpath'] + ' ' + datasetDirectory + meta[uid]['datasetpath'] + '\n')
        elif analytictype == 'matlab':
            MATLAB_ROOT='/usr/local/MATLAB/MATLAB_Runtime/v901'
            file.write(analyticDirectory + meta[uid]['analyticpath'] + ' ' + MATLAB_ROOT + ' \'-i ' + datasetDirectory + meta[uid]['datasetpath'] + ' -c 1 -d 60 -to 0 -f 1001 -b 1 -ti TitleExample -o matlabresult\'\n')
        elif analytictype == 'bash':
            file.write('bash ' + analyticDirectory + meta[uid]['analyticpath'] + '\n')
        elif analytictype == 'executable':
            file.write('chmod +x ' + analyticDirectory + meta[uid]['analyticpath'] + '\n')
            file.write(analyticDirectory + meta[uid]['analyticpath'] + '\n')
        file.write('rm -f /tmp/newresults/' + uid + '/floccinaucinihilitemp.txt\n')
        file.close()
        Popen(["sbatch","-n4","--parsable","-o","log.out","temp.sh"], cwd='/tmp/newresults/' + uid + '/')
        return json.dumps({'success':True,'returnval':str(meta)}), 200, {'ContentType':'application/json'}
    except OSError:
        return json.dumps({'success':False}), 400, {'ContentType':'application/json'} 

#DISABLE DEBUG BEFORE DEPLOYMENT
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')