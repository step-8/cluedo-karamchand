#! /bin/bash

host_info='cookie: Sesssion=eyJ1c2VybmFtZSI6IkJhbmkiLCJ1c2VySWQiOjE2NjAwNDE2NzI1MTR9;path=/;httponly;Sesssion.sig=DqboOX6utU42UOAMl8i9HXHUwiI;path=/;httponly'
guest1_info='cookie: Sesssion=eyJ1c2VybmFtZSI6ImJhcm5hbGkiLCJ1c2VySWQiOjE2NjAxMDUxNDAyOTgsImdhbWVJZCI6IkhGUlhNIn0=;path=/;httponly;Sesssion.sig=NFxNV03_bdkCXEPGLZ27aqJ9W_k;path=/;httponly'

touch /tmp/response;

function getGameId(){
  local gameId=`grep 'Location' /tmp/response | cut -f2 -d: | cut -f3 -d/`;
  echo "${gameId:0:5}";
};

function host(){
  local numberOfPlayers=${1};
  curl -vvv localhost:8000/host -d 'maxPlayers='${numberOfPlayers} -H "${host_info}" &> /tmp/response;

  if [[ $? -ne 0 ]]; then
    echo 'Server is not running';
    exit;
  fi;
  
  local gameId=`getGameId`;
  echo ${gameId};
}

function addGuests(){
  local gameId=${1};
  local numberOfGuests=$(( ${2} - 2 ));

  local i=0;
  while [[ i -lt ${numberOfGuests} ]]
  do
    curl -vvv localhost:8000/join -d "room-id=${gameId}" -H "${guest1_info}" &> /dev/null;
    i=$(( ${i} + 1 ));
  done
}

function main(){

  local option=${1};

  local i=3;
  while [[ i -le 6 ]]
  do
    local gameId=`host ${i}`;
    if [[ ${option} == '-j' ]]; then
      addGuests ${gameId} ${i};
    fi;

    echo ${i} player game : ${gameId};
    i=$(( ${i} + 1 ));
  done
}

main ${1};