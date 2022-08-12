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
  
  echo `getGameId`;
}

function addGuests(){
  local gameId=${1};
  local numberOfGuests=${2};

  for (( j=0; j < ${numberOfGuests} ; j++ ))
  do
    local session=`login`;
    curl -vvv localhost:${PORT}/join -d "room-id=${gameId}" -H "cookie: ${session}" &> /dev/null;
  done
  return 0;
}

function hostGames(){
  local option=${1};

  for (( i=3; i <= 6 ; i++ ))
  do
    local gameId=`host ${i}`;
    local guests=$(($i - 2));
    [[ ${option} == '-j' ]] && addGuests ${gameId} ${guests};

    echo ${i} player game : ${gameId};
  done
}

function main(){

  local option=${1};
  local id=${2};

  [[ ${option} -eq '-j' && ${id} ]] && addGuests ${id} 5 && return;

  hostGames ${option};
}

main ${1} ${2};
