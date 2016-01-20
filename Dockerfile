FROM node:4.2.1-onbuild

RUN npm install -g supervisor

EXPOSE 80
