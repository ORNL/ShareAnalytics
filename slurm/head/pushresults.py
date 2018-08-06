#!/usr/bin/env python
import requests
import os
from time import sleep
import shutil

if __name__ == '__main__':

    fn = '/etc/slurm/pushlog.txt'
    tmp = '/tmp/newresults/'
    perm = '/tmp/results/'

    try:
        file = open(fn, 'r')
    except:
        file = open(fn, 'w')

    while True: #check temporary result directory for any new results that need to be processed
        sleep(10)
        f = open('/etc/slurm/log.txt','a')
        for val in os.listdir(tmp): #iterate through folders in the directory

            score = 0

            outputfiles = ""
            for fil in os.listdir(tmp + '/' + val + '/'): #iterate through files
                outputfiles += perm + val + '/' + fil + ',' #create comma delimited list of output files
                if fil == "score.txt": #need to collect score
                    with open(tmp + '/' + val + '/' + fil) as tmpfile:
                        score = float(tmpfile.readline())                    
            outputfiles = outputfiles[:-1]

            if 'floccinaucinihilitemp.txt' not in outputfiles: #this file indicates it is not finished yet - deleting it indicates job is finished
                r = requests.post('http://localhost:5000/returnresults', json={'filepaths': outputfiles, 'score':score, 'uuid': val}) #return results to web app through flask api

                f.write(str(r.status_code) + "," + str(r.reason) + ',' + outputfiles + ',' + val + '\n')
            
                shutil.move(os.path.join(tmp,val),os.path.join(perm,val)) #move from temporary to permanent directory

