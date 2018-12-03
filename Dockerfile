FROM node:alpine
WORKDIR app
ADD . .

RUN apk add --no-cache --virtual .gyp \
    python \
    make \
    g++ \
    git

RUN npm install -g node-gyp node-pre-gyp
RUN npm install
RUN npm rebuild


EXPOSE 3000

CMD node index
