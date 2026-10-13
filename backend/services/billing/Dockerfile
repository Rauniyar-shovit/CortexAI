FROM node

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY services/billing/package*.json ./services/billing/
RUN cd services/billing && npm install

COPY shared ./shared/
COPY services/billing ./services/billing/

WORKDIR /app/services/billing

EXPOSE 8004

CMD [ "npm", "start" ]