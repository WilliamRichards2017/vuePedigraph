#!/bin/bash

# build vue app
if [[ $1 == "prod" ]]; then
  echo "** Building prod **"
  NODE_ENV=production npm run build
else
  echo "** Building dev **"
  npm run build
fi

# link to files needed for static page

# upload to cloudfront
echo "** Uploaded to stage s3 bucket **"
aws s3 cp ./server/views/index.html s3://static.iobio.io/prod/pedigree.iobio.io/
aws s3 cp ./client/dist/build.js s3://static.iobio.io/prod/pedigree.iobio.io/dist/

aws s3 cp ./  s3://static.iobio.io/prod/pedigree.iobio.io/ --exclude "node_modules/*" --recursive

echo "** Renew cloudfrount cache **"
aws cloudfront create-invalidation --distribution-id E1LEVW3LS06XCX --paths /
