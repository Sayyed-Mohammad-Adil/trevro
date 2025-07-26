# Kubernetes deploy

## Deploy the manifests

### Create namespace
<code> kubectl create ns trevyro </code>

### Apply manifests
<code> kubectl apply -f .  </code>

**You need to define your own ingress or expose the service to access trevyro!!!**


Wait some seconds until the deployment is completed.

## Configure Elastic
Log into Trudesk and go to Settings > Elasticsearch and define the endpoint of the elastic service

- Server: http://elasticsearch.trevyro.svc.cluster.local
- Port: 9200
