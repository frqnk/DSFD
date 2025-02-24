FROM instrumentisto/flutter AS builder
COPY . .
WORKDIR /
RUN flutter pub get
RUN flutter build web --release --wasm

FROM nginx:alpine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
COPY --from=builder build/web /usr/share/nginx/html