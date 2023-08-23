#build environment 

FROM node:14.17.1-alpine as builder
WORKDIR /app
COPY package.json /app/package.json
#COPY package-lock.json /app/package-lock.json
#COPY yarn.lock /app/yarn.lock
RUN yarn install --network-timeout 2000000
COPY . .
RUN yarn run build:staging
#RUN timeout 1800s sh -c 'yarn run build:staging || kill -9 0'
FROM node:14.17.1-alpine
RUN yarn global add serve
WORKDIR /app
COPY --from=builder /app/build .
CMD ["serve", "-p", "80", "-s", "."]

# production environment
# FROM nginx:alpine as production-stage
# COPY --from=build-stage /app/build /usr/share/nginx/html
