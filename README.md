# ASD
To run this project first you must get a googleOAUTH client ID and optionally a aws iam acces key with permissions to edit a s3 bucket instance

To set up the development enviroment you must have the next dependencies installed:
  
  - npm
  - postgreSQL / Docker

# Setup
## Steps

  1 - Clone the repo

    git clone https://github.com/Sixela33/ASD
    
  
  2 - Set up the enviroment
    Use the envExample.txt file as a guide for your .env file  

  4 -  install the project dependencies

    cd ASD
    npm i
  
  5 - Set up the database
    If you have postgreSQL downlaoded in your pc and want to host the database from there you can just put the connection info in the .env file
    If not I have set up a docker-compose file to easily get the database up and running. just run
    
    docker compose up -d
   
  IMPORTANT You must have set up the enviroment variables correctly. the database is created based on your enviroment variables

  6 - Load the database architecture
      
    npm run makemigrations

Now you can run the backend with 
    
    npm run start

## Running the frontend

To run the frontend for development you shoud cd into the frontend folder, install the dependencies and setup the env variables (refenrence the variables that start with VITE in the envExample.txt file)

    cd public
    npm i 
    npm run dev

## loading some data

Being on the root directory you can run this commant to load some dummy vendors and providers:

    npm run loadValues 
    