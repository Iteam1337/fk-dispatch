FROM node:7.9

WORKDIR /app

ADD package.json /app/
RUN npm install --production

ADD lib /app/lib
ADD public /app/public

CMD npm start
