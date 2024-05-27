FROM node:20-alpine

WORKDIR /asd

COPY package*.json ./

RUN npm i

COPY . .

EXPOSE 8080

CMD ["node", "index.js"]
