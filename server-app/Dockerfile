
FROM golang:1.21

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download
RUN apt-get update && apt-get install -y unoconv


COPY *.go .

RUN go build -o /main

EXPOSE 8080

CMD ["/main"]