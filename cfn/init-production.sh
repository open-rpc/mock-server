#!/bin/bash

aws cloudformation create-stack \
    --stack-name open-rpc-mock-server-production-beanstalk-stack \
    --template-body file://cfn/open-rpc-mock-server.cfn.json \
    --parameters file://cfn/production-launch-params.json \
    --capabilities CAPABILITY_IAM \
    --disable-rollback \
    --region us-west-2 || true

aws cloudformation wait stack-create-complete \
    --stack-name open-rpc-mock-server-production-beanstalk-stack \
    --region us-west-2 || true
