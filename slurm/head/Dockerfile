FROM mcrslurm/base

# Install MariaDB
# RUN yum -y install mariadb-server

# Kick off slurm server
# COPY test.script /etc/slurm/
RUN yum -y install python-pip && \
    yum -y install gcc python-devel && \
    pip install flask && \
    pip install requests && \
    pip install uuid
    
RUN export FLASK_APP=/etc/slurm/server.py

RUN systemctl enable munge

# Enable control daemon
RUN systemctl enable slurmctld

# Cleanup
RUN yum -y autoremove && yum -y clean all

COPY flask_startup.py /usr/local/bin/
COPY pushresults.py /usr/local/bin/
COPY pushresults.service /etc/systemd/system/
COPY flaskwebservice.service /etc/systemd/system/
RUN systemctl enable flaskwebservice
RUN systemctl enable pushresults
