# cubesigner-demo

## 環境設定ガイド

### 1. nvm のインストール

Mac の場合

```
$ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

Windows の場合
以下の URL の Assets からインストーラー(nvm-setup.exe)をダウンロード
https://github.com/coreybutler/nvm-windows/releases/tag/1.1.12

参考
https://www.freecodecamp.org/news/node-version-manager-nvm-install-guide/

### 2. node と yarn のインストール

```
$ nvm install 18.17.0
$ nvm use 18.17.0

// node バージョンの確認、バージョンが表示されればOK
$ node --version

$ npm install -g yarn
```

## Run

```bash
$ yarn install
$ yarn build
$ yarn start
```
