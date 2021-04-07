## 진행현황 ##
```
{
    member : 24/24
    admin : 12/13
    idea&cs : 5/10
    anno_notice : 0/10
    contact : 0/5
}
```
-----
### 2021.04.07 ###
> 크롤링 테스트 중..... 크롤링 모듈화 완성 <br>
> ecu-kr -> utf-8 로 변환 과정 중 지속적으로 한글이 깨지는 현상 발생
> 전체 진행률 57% 이상

### 2021.04.05 ###
> idea 게시판, admin 완료 <br>
> member rank 구현 완료 및 axios, cheerio를 이용한 크롤링 테스트중 <br>
> 게시판 페이징 구현, 첨부파일 관련 구현 테스트중 <br>
> 전체 진행률 55% 이상

### 2021.04.01 ###
> idea 수정 완료 <br>
> idea 게시물 조회, 상세조회, 검색
> member, admin api완료. 전체진행률 38% 이상

### 2021.03.30 ###
> admin 관련 api 작성 중 <br>
> idea 관련 api 작성 중 <br>
> 게시물 삭제 -> admin만 가능하도록 구현 수정 중 <br>
> idea 수정 시 member_email error처리 구현 중 <br>
> 전체 진행률 35% 이상

### 2021.03 29 ###
> node-express 구조 설계 및 이동 작업 완료 <br>
> member관련 api작성 완료   <br>
> admin 등록, 로그인, 탈퇴, 회원상세정보, 로그조회 완료 <br>
> 전체 진행률 30% 이상


### 2021.03.26 ###
> node-express 구조 설계 및 이동 작업   <br>
> 전체 진행률 25% 이상 <br>
> 디렉터리 구조
```
.
├── bin   
│   └── www                    
├── docs   
│   ├── api.md  
│   ├── framework.md  
│   ├── readme.md  
│   └── resfulapi.md              
├── public                  
│   ├── images                            
│   ├── javascripts       
│   └── stylesheets 
│       └── style.css      
├── routes
│   ├── index.js                            
│   ├── members.js       
│   ├── admin.js   
│   └── idea.js 
│── views
│   ├── error.pug                           
│   ├── index.pug       
│   └── layout.pug
│── app.js
└── readme.md
```

### 2021.03.25 ###
> 아이디어 등록, 수정, 조회 <br>
> 전체 진행률 25% 이상  

### 2021.03.24 ###
> 포인트 적립내역 조회, 포인트 사용내역 조회, 관심사업 등록, 관심사업 해제, 회원탈퇴    <br>
> 관리자 등록, 관리자 로그인    <br>
> 전체진행률 약 20% 이상

### 2021.03.23 ###
> 비밀번호 재설정, 포인트현황조회, 포인트사용, 내 아이디어 조회, 내 관심사업 조회   <br>
> 전체 진행률 약 15% 이상

### ~ 2021.03.22 ###
> 이용약관동의, 이메일 중복확인, 이메일 전송, 이메일 인증확인, 회원 가입, 회원 로그인, 회원 로그아웃,   <br>
> 비밀번호 재확인, 회원정보수정, 비밀번호찾기, 비밀번호재설정 토큰확인  <br>
> 전체 진행률 약 10% 이상
