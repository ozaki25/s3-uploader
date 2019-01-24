const serverless = require('serverless-http');
const express = require('express');
const aws = require('aws-sdk');

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const roleName = 's3Upload';

const app = express();

const param = {
  RoleArn: `arn:aws:iam::[ユーザの12桁ID]:role/${roleName}`,
  RoleSessionName: `session_${roleName}`,
};

const sts = new aws.STS({
  accessKeyId,
  secretAccessKey,
});

const s3 = new aws.S3({
  accessKeyId,
  secretAccessKey,
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});

module.exports.handler = serverless(app);
