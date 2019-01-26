const serverless = require('serverless-http');
const express = require('express');
const aws = require('aws-sdk');

const accessKeyId = process.env.ACCESS_KEY_ID;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;
const roleId = process.env.ROLE_ID;
const roleName = process.env.ROLE_NAME;
const Bucket = process.env.BUCKET;

const stsParams = {
  RoleArn: `arn:aws:iam::${roleId}:role/${roleName}`,
  RoleSessionName: `session_${roleName}`,
};

const s3Params = ({ Key, ContentType }) => ({
  Bucket,
  Key,
  ContentType,
  Conditions: [['content-length-range', 0, 10000000], { acl: 'public-read-write' }],
});

const sts = new aws.STS({
  accessKeyId,
  secretAccessKey,
});

const app = express();

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/', (req, res) => {
  const {
    query: { filename, mimetype },
  } = req;

  sts.assumeRole(stsParams, (error, data) => {
    if (error) {
      console.log({ data, error });
      return;
    }
    const {
      Credentials: { AccessKeyId, SecretAccessKey, SessionToken },
    } = data;
    const s3 = new aws.S3({
      accessKeyId: AccessKeyId,
      secretAccessKey: SecretAccessKey,
      sessionToken: SessionToken,
    });
    const url = s3.getSignedUrl('putObject', s3Params({ Key: filename, ContentType: mimetype }));
    res.send({ url, bucket: Bucket });
  });
});

module.exports.handler = serverless(app);
