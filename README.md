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
  
  3 - Run the containers
    
    docker compose up -d
   
  IMPORTANT You must have set up the enviroment variables correctly. the database is created based on your enviroment variables

## Running the frontend

To run the frontend for development you shoud cd into the frontend folder, install the dependencies and setup the env variables (refenrence the variables that start with VITE in the envExample.txt file)

    cd public
    npm i 
    npm run dev

## loading some data

Being on the root directory you can run this commant to load some dummy vendors and providers:

    npm run loadValues 
    
