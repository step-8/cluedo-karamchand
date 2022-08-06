#! /bin/bash

touch TODO.md;

echo '==>Installing npm packages';
npm install &> /dev/null;

echo -e '==>Setting git commit template locally';
git config --local commit.template .github/commit_template;

echo -e "==>Configuring environment variables"
echo -e "ENV=\"PRODUCTION\"" > .env

echo 'Setup done';