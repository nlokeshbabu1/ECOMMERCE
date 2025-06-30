#We are using the node alpine with stage
FROM node:23-alpine3.21 as stage

#This is the working Directory
WORKDIR /app

#Copy the file from host to container
COPY package.json .
COPY package-lock.json .

#Install the dependency
RUN npm install

#Copy the Index , css and main files
COPY . .

#Build the application 
RUN npm run build

#production and the main dockerfile
FROM nginx:alpine

#Copy the nginx.conf file
COPY nginx.conf /etc/nginx/conf.d/default.conf

#Copy the build from stage to production
COPY --from=stage /app/dist /usr/share/nginx/html

#Expose the port number 80
EXPOSE 80

#Now start the nginx
CMD ["nginx", "-g", "daemon off;"]
