FROM centos/systemd

# Create Users / Groups
# IDs must be identical across all nodes to facilitate shared storage and SLURM tasking
ARG MUNGE_ID=991
RUN groupadd -g $MUNGE_ID munge && \
    useradd -c "MUNGE authentication service" -d "/etc/munge" -u $MUNGE_ID -g $MUNGE_ID -s /sbin/nologin -r munge
    
ARG SLURM_ID=992
RUN groupadd -g $SLURM_ID slurm && \
    useradd -m -c "Account for SLURM" -u $SLURM_ID -g $SLURM_ID -s /bin/bash -r slurm


# Enable EPEL repo and wget to download various packages (e.g. SLURM, MATLAB MCR)
RUN yum -y install epel-release wget

# Install Munge
# munge.key needs to be the same across the cluster for SLURM tasking
RUN yum -y install munge munge-libs && \
	dd if=/dev/urandom bs=1 count=1024 > /etc/munge/munge.key && \
	chown munge:munge /etc/munge/munge.key && \
	chmod og-rwx /etc/munge/munge.key

# Install SLURM
# SLURM isn't in the usual CentOS repos, so we build manually, remove if said packages are ever added
ARG SLURM_VER=17.02.11
ARG SLURM_RUN_DEPS='openssl hwloc munge munge-libs numactl hwloc lua libibmad libibumad perl-Switch'
ARG SLURM_BUILD_DEVEL='gcc rpm-build man2html readline-devel openssl-devel munge-devel pam-devel perl-ExtUtils-MakeMaker mariadb-devel numactl-devel hwloc-devel lua-devel readline-devel rrdtool-devel ncurses-devel'
RUN yum -y install ${SLURM_RUN_DEPS} ${SLURM_BUILD_DEVEL} && \ 
    cd `mktemp -d` && \
	wget http://www.schedmd.com/download/latest/slurm-${SLURM_VER}.tar.bz2 && \
	mkdir -p build/{BUILD,SRPM,RPM,SPECS,SOURCES} && \
	rpmbuild --define "_topdir `pwd`/build" -tb slurm-${SLURM_VER}.tar.bz2 && \
	yum -y remove ${SLURM_BUILD_DEVEL} && \
	yum -y localinstall build/RPMS/x86_64/*.rpm
COPY slurm.conf /etc/slurm/


# Cleanup
# Do not add YUM commands after the cleanup line
RUN yum -y autoremove && yum -y clean all

# Cleanup TMP folders
RUN find /tmp -type d -name 'tmp.*' -exec rm -rf {} +


# Create folders on startup that are lost due to them being tmpfs
# See:  https://bugzilla.redhat.com/show_bug.cgi?id=1194542
# /var/log/munge
# TODO:  Override systemd unit file to use the --syslog argument instead
COPY mungefixtmpfsdirs.service /etc/systemd/system/

# /var/spool/slurm
COPY slurmctldfixtmpfsdirs.service /etc/systemd/system/

# Enable Services
RUN systemctl enable slurmctldfixtmpfsdirs && \
    systemctl enable mungefixtmpfsdirs && \
    systemctl enable munge
    
