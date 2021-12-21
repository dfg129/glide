import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from "path";
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as ecr from 'aws-cdk-lib/aws-ecr';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';
import * as eventsources from 'aws-cdk-lib/aws-lambda-event-sources';


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

    const dockerdir = path.join(__dirname, '..');
    const entryfile = path.join(__dirname, 'handlers/index.ts');

    const fn = new NodejsFunction(this, 'S3EventHandler', {
	    bundling: {
		    forceDockerBundling: true,
		    dockerImage: cdk.DockerImage.fromBuild(dockerdir),
	    },
	    entry: entryfile,
	    handler: 'handler',
	    architecture: lambda.Architecture.ARM_64,
	    runtime: lambda.Runtime.NODEJS_14_X,
    });

    bucket.grantRead(fn);
    fn.addEventSource(
	new eventsources.S3EventSource(bucket, {
	      events: [s3.EventType.OBJECT_CREATED], 
        }),
    );

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
