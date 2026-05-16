#!/bin/bash
echo "Deploying backend..."
gcloud run deploy ait-backend --source . --region europe-west1
echo "Deployment completed successfully!"