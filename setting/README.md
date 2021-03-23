## Node.js 설치하기
------------------
### 1. nodejs 설치
------------------
```
sudo apt update
sudo apt install nodejs
nodejs -version
```

### 2. NPM(Node Version Manager) 설치
---------------------
```
sudo curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.1/install.sh | bash
nvm ls
```

## Angular 설치하기
---------------------
### 1. Angular 설치
------------------------
```
npm install -g @angular/cli
ng --version
```

### 2. Angular 프로젝트 생성 및 실행 테스트
----------------------
```
ng new 프로젝트명
cd 프로젝트명
    1. ng serve
    2. ng serve --host IP주소 --port 포트번호
```

## mySQL 설치하기
-------------------------
### 1. 사전준비
---------------------
ubuntu server 20.04 환경 준비

### 2. mySQL 설치
----------------------
```
sudo apt-get update
sudo apt-get install mysql-server
```

### 3. mySQL Secure Installation 실행
----------------------
```
sudo mysql_secure_installation
sudo mysql -u root -p
```