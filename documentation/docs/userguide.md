# User Guide

This guide is meant as a high level overview of the functions of each of the platform features. For more details on each component please see the [WebApp](webapp.md), [HPC Cluster](cluster.md) and [Dashboard](dash.md) pages.

## Normal Workflow

* Define location type
* Create dashboard for a location of that type
* Upload a dataset relevant to that location
* Upload an analytic relevant to that location
* Run the analytic against the dataset and link the result to the dashboard

## Dashboards

A dashboard displays statistics for a specific location. It displays the results of all analytics run against that location and the current score based on the latest results. 

## Location Types

A location type defines the equation used to calculate to the facility characterization score for that location. It specifies which analytics that have been uploaded contribute to the score and the percentage of the total score that they constitute. 

## Datasets

Datasets can be uploaded from the user's computer or from InfluxDB. Once uploaded, analytics can be run against them and, if desired, linked to an existing dashboard. However, it is not necessary to link the results to a dashboard to perform the analysis. There is a separate results page where all results can be viewed. 

## Analytics

Analytics can be uploaded from the user's computer and can then be run against any dataset that is in the appropriate format. To be able to link the analytic to the dashboard, every analytic must return a 'score.txt' file with a single line containing only a floating point reperesentaiton of the final score (assuming the analytic is intended to be used to assess whether a location fits a given type) - otherwise '0' will be returned. If an analytic is linked to a dashboard for which its result is not part of the location equation, the score will simply be listed in a table at the bottom of the page. 

## Analyze

The analyze page allows the user to run analytics against datasets on the HPC cluster and, if desired, link the results to a dashboard. The results page underneath the 'Analyze' tab can be used to view all results. 

## Grafana Streaming Dashboard

By clicking on 'Live Analytics' on the top menu the user can utilize the Grafana platform for analyzing streaming data. 

## User Management

There are two roles - 'user' and 'admin'. Administrators can edit users via the 'Manage Users' button in the top menu. This option is not available to regular users. 