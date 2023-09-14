# react-vite-app/Dockerfile
FROM node:16

# 作業ディレクトリを設定
WORKDIR /app

# 依存関係をコピーし、npmパッケージをインストール
COPY package.json .
COPY package-lock.json .
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# ポート番号を公開
EXPOSE 3000

# アプリケーションを起動
CMD ["npm", "start"]
