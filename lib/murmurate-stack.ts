import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from "path";
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';


export class MurmurateStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'MurmurationBucket', {
	    versioned: false,
	    removalPolicy: cdk.RemovalPolicy.DESTROY,
	    autoDeleteObjects: true,
	    enforceSSL: true,
    });

    const name = ssm.StringParameter.fromStringParameterAttributes(this, 'AssetName', {
	    parameterName: 'StarlingName',
   }).stringValue;   

    const assethash = ssm.StringParameter.fromStringParameterAttributes(this, 'AssetHash', {
	    parameterName: 'StarlingHash',
   }).stringValue;   

    const repo = ecr.Repository.fromRepositoryName(this, 'RepositoryName', name);

    const entryfile = path.join(__dirname, 'handlers/handler.ts');

    const fn = new NodejsFunction(this, 'S3EventHandler', {
	    bundling: {
		    forceDockerBundling: true,
		    dockerImage: cdk.DockerImage.fromBuild(__dirname),
	    },
	    handler: 'run',
	    entry: entryfile,
	    architecture: lambda.Architecture.ARM_64,
	    runtime: lambda.Runtime.NODEJS_14_X,
    });


    bucket.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(fn));
    
    new cdk.CfnOutput(this, 'FromRepositoryName', {
	    value: repo.repositoryName,
	    description: 'Repository Name',
	    exportName: 'FromRepositoryName',
    });

    new cdk.CfnOutput(this, 'FromRepositoryHash', {
	    value: assethash,
	    description: 'Repository Hash',
	    exportName: 'FromRepositoryHash',
    });



  }
}
