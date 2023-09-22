FROM node:16

WORKDIR /app

COPY package.json .
COPY package-lock.json .
COPY /src/components/hand_landmarker_2.task .
RUN npm install

COPY . .
EXPOSE 3000
CMD ["npm", "start"]