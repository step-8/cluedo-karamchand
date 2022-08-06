#! /bin/bash

touch TODO.md;

echo '==>Installing npm packages';
npm install &> /dev/null;

echo -e '==>Configuring git';
git config --local commit.template .github/commit_template;
git config --local core.hookspath .github/hooks 

echo 'Setup done';