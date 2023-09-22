FROM golang:1.21

WORKDIR /app

COPY go.mod .
COPY go.sum .
RUN go mod download

# LibreOfficeとUnoconvをインストール
RUN apt-get update && \
    apt-get install -y unoconv libreoffice-core && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/* 

# Unoconvの場所を確認するための一時的なコマンド
RUN which unoconv

COPY *.go .

RUN go build -o /main

EXPOSE 8080

CMD ["/main"]

# イメージにタグを指定
LABEL version="1.0"
