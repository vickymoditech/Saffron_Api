# Saffron 

- yo angular-fullstack:endpoint Endpoint-name

####certificate Add
- https://engineering.circle.com/https-authorized-certs-with-node-js-315e548354a2

###Tutorial about the Docker.
- https://github.com/sacredMonster/fast-tutorials


#Live Mongo Db on server for linux
###Step - 1
- Install the mongodb on sever using service. 
###Step - 2 
- sudo nano /etc/mangod.conf - mongodb configuration code.

###Create user 
``` 
    > use admin
    > db.createUser({
      user: "gygadmin",
      pwd: "gyg123",
      roles: [
                { role: "userAdminAnyDatabase", db: "admin" },
                { role: "readWriteAnyDatabase", db: "admin" },
                { role: "dbAdminAnyDatabase",   db: "admin" }
             ]
  });
  ```
  
###Step - 3
- ``` sudo nano /etc/init.d/mongod ``` (if you want mongodb run as an authentication). - service code. 
add --auth in command field. 

###Mongoose Connection string change
- uri: 'mongodb://{userName}:{password}@{host}:{port}/{DBname}?authSource={dbname}'
- uri: 'mongodb://gygadmin:gyg123@dev.driveby.guzmanygomez.com:27017/UberEatsMenu_dev?authSource=admin'
