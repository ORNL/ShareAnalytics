## References

* [Slurm](https://slurm.schedmd.com/)
* [Munge](https://dun.github.io/munge/)
* [Docker Networks](https://docs.docker.com/network/)
* [Slurm Commands](http://ecs.rutgers.edu/slurm_commands.html)<br />
* [Fixing Slurm Issues](https://www.eidos.ic.i.u-tokyo.ac.jp/~tau/lecture/parallel_distributed/2016/html/fix_broken_slurm.html)

## Setup on Existing HPC Cluster

If you already have an existing slurm cluster, run head/pushresults.py and head/flask_startup.py on the head node
of the slurm cluster. Then, modify the hostname in meanapp/modules/slurm/server/controllers/slurm.server.controller.js 
to match network configuration. Also, in head/flask_startup.py change web:3000 to the correct hostname and port for 
the existing network configuration. SSH port forwarding can be used from the host machine to the head node of the existing slurm cluster if necessary. 

The web application and slurm head node will also need to have a shared network directory for dataset, analytic and result files as things are configured. One option if using an existing slurm cluster is to modify build.sh and docker-compose to only build
the head node, which can then be configured in slurm.conf to talk to existing cluster nodes.

## Useful Commands

curl -H "Content-Type: application/json" -X POST -d '{"title":"foo","dataset":"theset","analytic":"thatanalytic","userid":"theuser","description":"a run result foo"}' http://localhost:5000/submitjob

curl -H "Content-Type: application/json" -X POST -d '{"filepaths":"xyz","uuid":"0814c38a-5bda-4d82-86db-60817b4b29da"}' http://localhost:5000/returnresults

## Project layout

    docker-compose.yml                  # docker compose file
    rebuildhead.sh                      # quickly rebuild head node after changes to web server
    buildSLURM.sh                       # build docker images for base/compute/head nodes
    base/
        Dockerfile                      # Custom Dockerfile for base image
        slurm.conf                      # Slurm configuration file
        mungefixtmpfsdirs.service       # Recreate /var/log/munge - lost due to being tmpfs
        slurmctldfixtmpfsdirs.service   # Recreate /var/spool/slurm - lost due to being tmpfs
    compute/
        Dockerfile                      # Relies on base image
    head/
        Dockerfile                      # Relies on base image
        flask_startup.py                # Flask web server that receives from webapp and speaks to slurm
        pushresults.py                  # Watches for slurm results, processes them and sends them to web server
        flaskwebservice.service         # Systemd service for flask web server
        pushresults.service             # Systemd service for script to push results
    testfiles/
        test.csv                        # Simple csv file to test datasets feature
        test.py                         # Simple python analytic that returns score of 93
        test.script                     # Simple script to verify analytic is run on all nodes
        test3.py                        # Simple python analytic that returns random score 50-100