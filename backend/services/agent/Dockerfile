FROM node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY services/agent/package*.json ./services/agent/
RUN cd services/agent && npm install

COPY shared ./shared/
COPY services/agent ./services/agent

WORKDIR /app/services/agent

EXPOSE 8003

CMD [ "npm" , "start"]
