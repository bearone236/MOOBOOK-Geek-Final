FROM golang:1.21

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download

# UnoconvとLibreOfficeをインストール
RUN apt-get update && \
    apt-get install -y unoconv libreoffice && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY *.go .

RUN go build -o /main

EXPOSE 8080

CMD ["/main"]

# イメージにタグを指定
LABEL version="1.0"
