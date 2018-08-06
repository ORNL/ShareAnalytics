# Overview

ShareAL provides a flexible platform for interacting with streaming data from IoT sensors and smart meters. Its intended area of
application is in the realm of Non-intrusive load monitoring (NILM) in the energy sector. However, it can be used in any domain
to do the following:

- Characterize facilities via NILM through the scoring of analytic products
- Ask interesting questions of streaming data using data visualization tools and custom analytics
- Run analytics in local HPC environment with minimal configuration and map results back to the web interface 

## Background

In Nonintrusive Load Monitoring (NILM) a Nonintrusive Appliance Load Monitor (NALM) can monitor power usage of multiple devices on a single circuit without having to be directly connected to each device. The NALM performs an analysis of the current and voltage waveforms of the total load and garners from this information the type of loads drawing power and how much each load is drawing. Previous work has investigated using NILM to enhance electricity audits of commercial buildings and to understand domestic energy consumption. 

Law enforcement has used raw energy usage to identify clandestine methamphetamine laboratories for some time. NILM offers a way of analyzing energy usage in a more refined manner by both identifying what types of devices are being run and understanding how much energy each device consumes using NALMs. These energy signatures could then be used to identify whether a building is strictly residential or whether it is being used for other purposes. And all of this analysis could be achieved with minimal intrusion. But what is needed is a way of amalgamating the NILM data, generating custom analytics and scoring individual facilities. 

ShareAL provides a lightweight extensible platform for data analytics that meets the need of NILM facility characterization. It consists of three core components: a full stack web application based on the MEANJS project, a grafana dashboard for analyzing streaming data and a High Performance Computing (HPC) cluster running slurm for performing real time analysis. ShareAL allows users to create dashboards for each facility of interest, score them via custom analytic products and to share the results of analyses performed on local HPC slurm clusters. The entire framework is Dockerized for ease of deployment and can be launched via a single script once dependencies are installed. 