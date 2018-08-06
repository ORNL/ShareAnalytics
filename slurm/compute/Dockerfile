FROM mcrslurm/base

# Install MCR Dependencies
ARG MCR_VER=R2016a
RUN yum -y install wget unzip libXext libXt libXrandr
RUN cd `mktemp -d` && \
	wget https://www.mathworks.com/supportfiles/downloads/${MCR_VER}/deployment_files/${MCR_VER}/installers/glnxa64/MCR_${MCR_VER}_glnxa64_installer.zip && \
	unzip MCR_${MCR_VER}_glnxa64_installer.zip && \
	chmod +x install && \
	./install -mode silent -agreeToLicense yes

RUN systemctl enable munge

# Enable compute daemon
RUN systemctl enable slurmd

# Cleanup
RUN yum -y remove wget unzip && yum -y autoremove
