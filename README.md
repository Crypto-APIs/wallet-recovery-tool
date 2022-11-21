![Crypto APIs](./src/resources/images/logo.svg?raw=true)

# Crypto APIs Wallet Recovery tool

#### Tool for recovering private key from wallet recovery data

***

## Table of Contents

- [Installing](#installing)
  - [First Method](#first-method)
  - [Second Method](#second-method)
- [Usage](#usage)
- [Building executable files](#building-executable-files)
    - [With docker](#with-docker)
    - [Without docker](#without-docker)
    - [Packages](#packages)
- [Screenshots](#screenshots)
- [License](#license)

## Installing

#### First Method

First you need to clone the repository.

Then you need to have `npm` package manager installed.

To install and start the application you need to run these two commands.

```bash
npm i -D
npm run start
```

#### Second Method

You can also use the application by installing it on your local OS by downloading and running one of the installation files published in the [releases](https://github.com/Crypto-APIs/wallet-recovery-tool/releases) section of this repository.

## Usage

This Open Source Tool will help you back up and then recover your Crypto APIs Wallet in case of an emergency. It should be used together with the WaaS Backup and Recover feature in your Crypto APIs 2.0 Dashboard [here](https://my.cryptoapis.io/wallets).
To backup your Wallet simply follow the steps bellow:

1. Open our Open Source Recovery Tool.
2. You would need to first generate a RSA key pair of public and private keys. For this purpose you require a password. It can be of your choosing, or you can generate a random and complex password by navigating to the “Generate Random Password” menu section.
3. Use the selected password in the "Generate RSA key pairs" menu section. The result will be one public key and one private key. Keep that password safe as it will be needed to recover your Wallet.
4. Navigate to your Crypto APIs 2.0 Dashboard [here](https://my.cryptoapis.io/wallets). If you don’t have a Wallet yet, you can create one. If you have already created your Wallet, then click on the “Back up Wallet” button. Use the public key you’ve just generated in our Open Source Recovery Tool in the two fields for the RSA key.
5. The private key needs to be stored in a safe location, as it will be required for the recovery process of your Wallet!
6. In the Crypto APIs 2.0 Dashboard complete the backup of your Wallet. The PDF file downloaded will have more information on the Recovery process.

## Building executable files

### With docker

You need to have `docker` installed on your machine.

Building executable files can be done with this command (script):

```bash
./bin/build.sh
```

Choose the OS you want to have an executable for by giving the script a parameter with the name of the OS.

```bash
./bin/build.sh linux
./bin/build.sh windows
./bin/build.sh mac
```

> **_NOTE:_** Building executable files for macOS can be done only if the machine you are executing the script from is on macOS.

### Without docker

Using the following command will build the files for the OS you are executing it from

```bash
npm run build
```

If you want to build files for a specific OS you can use either of these scripts

```bash
npm run dist:linux
npm run dist:windows
npm run dist:mac
```

> **_NOTE:_** Building executable files without docker requires for the machine to be on the same OS or to have the necessary packages installed.

### Packages

Packages are located in `dist` folder

The file types that you get are as follows:
- For `linux` you will get `.AppImage` file
- For `windows` you will get `.exe` file
- For `macOS` you will get `.dmg` file

## Screenshots

#### *Homepage*
![Homepage](./screenshots/screenshot-recovery-tool-home.png?raw=true)

#### *Generate password*
![Generate password](./screenshots/screenshot-recovery-tool-generate-random-password.png?raw=true)

#### *Generate rsa key*
![Generate rsa key](./screenshots/screenshot-recovery-tool-rsa-private-key.png?raw=true)

#### *Recover xPriv*
![Recover xPriv](./screenshots/screenshot-recovery-tool-recover-xpriv.png?raw=true)

## License

MIT