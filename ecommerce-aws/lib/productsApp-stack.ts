import * as lambdaNodeJs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as cdk from 'aws-cdk-lib';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import * as lambda from 'aws-cdk-lib/aws-lambda';

interface ProductAppStackProps extends cdk.StackProps {
  eventsDdb: dynamodb.Table;
}

export class ProductsAppStack extends cdk.Stack {
  public readonly productsFetchHandler: lambdaNodeJs.NodejsFunction;
  public readonly productsAdminHandler: lambdaNodeJs.NodejsFunction;
  public readonly productsDynamoDb: dynamodb.Table;

  constructor(scope: Construct, id: string, props: ProductAppStackProps) {
    super(scope, id, props);

    this.productsDynamoDb = new dynamodb.Table(this, 'ProductsDynamoDb', {
      tableName: 'products',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'id',
        type: dynamodb.AttributeType.STRING,
      },
      billingMode: dynamodb.BillingMode.PROVISIONED,
      readCapacity: 1,
      writeCapacity: 1,
    });

    const productsLayerArn = ssm.StringParameter.valueForStringParameter(this, 'ProductsLayerArn');
    const productsLayer = lambda.LayerVersion.fromLayerVersionArn(this, 'ProductsLayerVersionArn', productsLayerArn);

    const productEventsHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductEventsFunction', {
      functionName: 'ProductEventsFunction',
      entry: 'lambda/products/productEventsFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(2),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        EVENTS_DDB: props.eventsDdb.tableName,
      },
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    });

    props.eventsDdb.grantWriteData(productEventsHandler);

    this.productsFetchHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductsFetchFunction', {
      functionName: 'ProductsFetchFunction',
      entry: 'lambda/products/productsFetchFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        PRODUCTS_TABLE_NAME: this.productsDynamoDb.tableName,
      },
      layers: [productsLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    });

    this.productsDynamoDb.grantReadData(this.productsFetchHandler);

    this.productsAdminHandler = new lambdaNodeJs.NodejsFunction(this, 'ProductsAdminFunction', {
      functionName: 'ProductsAdminFunction',
      entry: 'lambda/products/productsAdminFunction.ts',
      handler: 'handler',
      memorySize: 128,
      timeout: cdk.Duration.seconds(5),
      bundling: {
        minify: true,
        sourceMap: false,
      },
      environment: {
        PRODUCTS_TABLE_NAME: this.productsDynamoDb.tableName,
        PRODUCT_EVENTS_FUNCTION_NAME: productEventsHandler.functionName,
      },
      layers: [productsLayer],
      tracing: lambda.Tracing.ACTIVE,
      insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_119_0,
    });

    this.productsDynamoDb.grantWriteData(this.productsAdminHandler);
    productEventsHandler.grantInvoke(this.productsAdminHandler);
  }
}
