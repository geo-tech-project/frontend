# Nodejs Base image
FROM node:12.16.3
WORKDIR /app
ENV PATH /app/node_modules/.bin:$PATH
# install and app dependencies
COPY package.json /app/package.json
RUN npm install --force
RUN npm install -g @angular/cli
# add app
COPY . /app

EXPOSE 4200
# start app
CMD ng serve --host 0.0.0.0