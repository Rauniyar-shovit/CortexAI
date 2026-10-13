FROM node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY ./services/auth/package*.json ./services/auth/
RUN cd services/auth && npm install

COPY shared ./shared
COPY services/auth ./services/auth

WORKDIR /app/services/auth

EXPOSE 8001


CMD [ "npm", "start" ]
