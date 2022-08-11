#! /bin/bash

PORT=8000;

touch /tmp/response;

function getGameId(){
  local gameId=`grep 'Location' /tmp/response | cut -f2 -d: | cut -f3 -d/`;
  echo "${gameId:0:5}";
};

function getSession(){
  local session=`grep 'Set-Cookie: Sesssion' /tmp/response | cut -f2 -d: | tr '\n\r' ';'`
  echo ${session};
}

function login(){
  curl -vvv localhost:${PORT}/login -d 'username=Guest' &> /tmp/response;
  echo `getSession`;
}

function host(){
  local numberOfPlayers=${1};
  local session=`login`;
  curl -vvv localhost:${PORT}/host -d 'maxPlayers='${numberOfPlayers} -H "cookie:${session}" &> /tmp/response;

  if [[ $? -ne 0 ]]; then
    echo 'Server is not running';
    return 1;
  fi;
  
  local gameId=`getGameId`;
  echo ${gameId};
}

function addGuests(){
  local gameId=${1};
  local numberOfGuests=$(( ${2} - 2 ));
  local session=`login`;

  local i=0;
  while [[ i -lt ${numberOfGuests} ]]
  do
    curl -vvv localhost:${PORT}/join -d "room-id=${gameId}" -H "cookie: ${session}" &> /dev/null;
    i=$(( ${i} + 1 ));
  done
}

function main(){

  local option=${1};

  local i=3;
  while [[ i -le 6 ]]
  do
    local gameId=`host ${i}`;
    [[ ${option} == '-j' ]] && addGuests ${gameId} ${i};

    echo ${i} player game : ${gameId};
    i=$(( ${i} + 1 ));
  done
}

main ${1};
