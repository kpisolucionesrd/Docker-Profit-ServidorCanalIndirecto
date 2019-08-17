FROM node
WORKDIR /Servidor
COPY package.json .
COPY servidor_CanalIndirecto.js .
COPY ConexionDB.js .
COPY ModelosDatos ModelosDatos
RUN npm install
EXPOSE 80
CMD ["node","servidor_CanalIndirecto.js"]

