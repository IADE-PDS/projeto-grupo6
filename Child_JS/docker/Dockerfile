# Tell the container what platform is should simulate. I'm telling it to run linux ubuntu bionic.
FROM ubuntu:bionic 

# This is where you tell the container what files you want to put inside
# I just copy my entire "Build_Linux" folder into the base directory "." of the container
COPY ./Build_Linux/ .

# I'm running my game server on port *port*. You have to tell docker what ports you plan to use
EXPOSE 7777
# What command should it run when you start the container? 
# This is just a linux command that runs "build.x86_64" in the root directory "."
# Change that to whatever you named your exported build
RUN chmod +x test.x86_64
CMD ./test.x86_64  