FROM registry-ice.ng.bluemix.net/ibmnode:latest
RUN apt-get -y --fix-missing update
RUN DEBIAN_FRONTEND=noninteractive apt-get -y install git sed bc vim ssh imagemagick

ENV DOCKER true
ENV CONTEXT bluemix
ENV PORT 8080
ENV DB_CONN_STR DUMMY

WORKDIR /
RUN mkdir -p /app
ADD dist /app
ADD package.json /app/


WORKDIR /app
RUN npm install -d --production 
EXPOSE 8080
CMD ["node", "backend/index.js"]