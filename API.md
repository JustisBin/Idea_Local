# 게시판 API
#### 각 게시판의 게시글의 작성, 수정, 삭제, 검색 로그 등의 게시판 기능관련 API
-----
<br> 

## 아이디어 게시판
+ URL : [GET] http://{IP}:{PORT}/idea
-----
### 1. 아이디어 등록
+ URL : [POST] http://{IP}:{PORT}/idea/new-idea
+ PARAM : 
    ``` 
    { 
        "idea-title" : "아이디어 제목",
        "idea-contents" : "아이디어 내용", 
    } 
    ```
+ 동작 : 아이디어 게시판에 아이디어 등록버튼 클릭 시 아이디어 게시물 업로드. 게시물의 로그도 서버에서 함께 저장합니다.
+ 응답 : 
    * Code : 201 [CREATE]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 2. 아이디어 수정
+ URL : [PATCH] http://{IP}:{PORT}/idea/patch-idea
+ PARAM : 
    ``` 
    { 
        "idea-title" : "아이디어 제목",
        "idea-contents" : "아이디어 내용", 
    } 
    ```
+ 동작 : 아이디어 게시판에 등록된 아이디어를 수정할 시 응답합니다. 본인의 게시물만 수정이 가능합니다.
+ 응답 : 
    * Code : 201 [CREATE]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 3. 아이디어 삭제
+ URL : [DELETE]] http://{IP}:{PORT}/idea/delete-idea
+ 동작 : 아이디어 게시판에 등록된 아이디어 삭제요청 시 응답합니다. 삭제 된 데이터는 로그에 기록됩니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
### 3-1. 아이디어 삭제(관리자)
+ URL : [DELETE]] http://{IP}:{PORT}/admin/idea/delete-idea
+ 동작 : 아이디어 게시판에 등록된 아이디어 삭제요청 시 응답합니다. 삭제 된 데이터는 로그에 기록됩니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
### 4. 아이디어 검색
+ URL : [GET] http://{IP}:{PORT}/idea/search-idea/{검색어}
+ PARAM : 
    ``` 
    { 
        "idea_title" = "검색내용",
        "idea_contents" =검색내용" 
    } 
    ```
+ 동작 : 아이디어 테이블에서 일치하는 제목, 내용을 찾아 포함되는 게시물들을 조회한다.
+ 응답 :
    * Code : 200[OK]
    <br>or
    * Code : 403 [NOT FOUND]
    * Contents : ``` { error : "해당하는 게시물을 찾을 수 없습니다." } ```
-----
### 4-1. 아이디어 검색(관리자)
+ URL : [GET] http://{IP}:{PORT}/admin/idea/search-idea/{검색어}
+ PARAM : 
    ``` 
    { 
        "idea_title" = "검색내용",
        "idea_contents" =검색내용" 
    } 
    ```
+ 동작 : 아이디어 테이블에서 일치하는 제목, 내용을 찾아 포함되는 게시물들을 조회한다.
+ 응답 :
    * Code : 200[OK]
    <br>or
    * Code : 403 [NOT FOUND]
    * Contents : ``` { error : "해당하는 게시물을 찾을 수 없습니다." } ```
-----
### 5. 아이디어 로그(관리자)
+ URL : [GET]] http://{IP}:{PORT}/admin/idea/log-idea
+ 동작 : 아이디어 게시판의 전체적인 로그를 확인하고 조회할 시 요청합니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
<br>

## 공고정보 게시판(관리자)
+ URL : [GET] http://{IP}:{PORT}/anno
-----
### 1. 공고정보 등록
+ URL : [POST]] http://{IP}:{PORT}/anno/new-anno
+ PARAM : 
    ``` 
    { 
        "anno-title" : "공고 제목",
        "anno-contents" : "공고 내용",
        "anno-img_path" : "이미지 경로"
    } 
    ```
+ 동작 : 공고정보 게시판에 공고글을 작성 시 응답한다. 이 때, 관리자이메일, 번호, 출처링크를 함께 저장할 수 있도록 한다.
+ 응답 : 
    * Code : 201 [CREATE]
    <br>or
    * Code : 400[Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다." } ```
-----
### 2. 공고정보 수정
+ URL : [PATCH] http://{IP}:{PORT}/anno/patch-anno
+ PARAM : 
    ``` 
    { 
        "anno-title" : "공고 제목",
        "anno-contents" : "공고 내용",
        "anno-image-path" : "이미지 경로"
    } 
    ```
+ 동작 : 공고정보 게시판의 게시물 수정을 요청합니다.
+ 응답 : 
    * Code : 201 [CREATE]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 3. 공고정보 게시물 이미지
+ URL : [GET] http://{IP}:{PORT}/anno/image-anno
+ 동작 : 공고정보 해당 게시물에 해당하는 이미지 테이블에 저장된 이미지를 요청합니다.
+ 응답 : 
    * Code : 200 [OK] 
    <br>or
    * Code : 404 [Not Found]
    * Contents : ``` { error : "해당하는 이미지를 찾을 수 없습니다" } ```
-----
### 4. 공고정보 게시물 삭제
+ URL : [DELETE] http://{IP}:{PORT}/anno/delete-anno
+ 동작 : 업로드 된 공고정보 게시글을 삭제할 시 응답합니다. 이 때, 공고로그 테이블로 데이터가 이동합니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 5. 공고정보 검색하기(회원)
+ URL : [GET] http://{IP}:{PORT}/anno/search-anno/{검색어}
+ PARAM : 
    ``` 
    { 
        "anno_title" = "검색내용",
        "anno_contents" =검색내용" 
    } 
    ```
+ 동작 : 공고정보 테이블에서 일치하는 제목, 내용을 찾아 포함되는 게시물들을 조회한다.
+ 응답 :
    * Code : 200[OK]
    <br>or
    * Code : 403 [NOT FOUND]
    * Contents : ``` { error : "해당하는 게시물을 찾을 수 없습니다." } ```
-----
### 6. 공고 정보 로그 조회
+ URL : [GET] http://{IP}:{PORT}/anno/log-anno
+ 동작 : 공고 게시판에 올려진 게시물과 삭제된 게시물을 볼 수 있습니다. 삭제 게시물의 수정일, 수정 전 내용, 공고를 작성한 관리자 등 모든 정보를 포함합니다.
+ 응답 : 
    * Code : 200 [OK] 
    <br>or
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
<br>

## 공지사항 게시판(관리자)
+ URL : [POST] http://{IP}:{PORT}/notice
-----
### 1. 공지사항 등록
+ URL : [POST]] http://{IP}:{PORT}/notice/new-notice
+ PARAM : 
    ``` 
    { 
        "notice-title" : "공지 제목",
        "notice-contents" : "공지 내용",
        "notice-file-path" : "첨부 파일 경로"
    } 
    ```
+ 동작 : 공지사항 게시판에 게시물을 작성할 때 응답합니다. 이 때, 게시한 관리자의 정보를 로그에 함께 저장합니다.
+ 응답 : 
    * Code : 201 [CREATE]
    <br>or
    * Code : 400[Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다." } ```
-----
### 2. 공지사항 수정
+ URL : [PATCH] http://{IP}:{PORT}/notice/patch-notice
+ PARAM :
    ``` 
    { 
        "notice-title" : "공지 제목",
        "notice-contents" : "공지 내용" ,
        "notice-file-path" : "첨부 파일 경로"
    } 
    ```
+ 동작 : 게시물 수정 요청 시 응답합니다.
+ 응답 : 
    * Code : 201 [CREATE]
    or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 3. 공지사항 게시물 파일
+ URL : [GET] http://{IP}:{PORT}/notice/file-notice
+ 동작 : 공지사항 해당 게시물에 해당하는 파일 테이블에 저장된 파일을 요청합니다.
+ 응답 : 
    * Code : 200 [OK] 
    <br>or
    * Code : 404 [Not Found]
    * Contents : ``` { error : "해당하는 파일을 찾을 수 없습니다" } ```
-----
### 4. 공지사항 게시물 삭제
+ URL : [DELETE]] http://{IP}:{PORT}/notice/delete-notice
+ 동작 : 공지 게시판에 등록된 공지 삭제요청 시 응답합니다. 삭제 된 데이터는 로그에 기록됩니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
### 5. 공지사항 검색하기(회원)
+ URL : [GET] http://{IP}:{PORT}/notice/search-notice/{검색어}
+ PARAM : 
    ``` 
    { 
        "notice_title" = "검색내용",
        "notice_contents" =검색내용" 
    } 
    ```
+ 동작 : 공지 테이블에서 일치하는 제목, 내용을 찾아 포함되는 게시물들을 조회 시 응답합니다.
+ 응답 :
    * Code : 200[OK]
    <br>or
    * Code : 403 [NOT FOUND]
    * Contents : ``` { error : "해당하는 게시물을 찾을 수 없습니다." } ```
-----
### 6. 공지사항 게시물 로그 조회
+ URL : [GET] http://{IP}:{PORT}/notice/log-notice
+ 동작 : 공지사항 게시물에 대한 모든 로그 정보를 조회요청 시 응답합니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
<br>

## 문의게시판
+ URL : [POST] http://{IP}:{PORT}/cs
-----
### 1. 문의게시글 문의
+ URL : [POST] http://{IP}:{PORT}/cs/new-cs
+ PARAM : 
    ``` 
    { 
        "cs-title" : "문의 제목",
        "cs-contents" : "문의 내용",
        "cs-private" : "체크여부",
        "cs-file-path" : "첨부파일"
    } 
    ```
+ 동작 : 문의 게시판에 글을 등록할 시 응답하는 API입니다. 서버에서는 작성일, 번호 등의 로그를 저장합니다.
+ 응답 : 
    * Code : 201 [CREATE] <br>
    or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 2. 문의게시글 수정
+ URL : [PATCH] http://{IP}:{PORT}/cs/patch-cs
+ PARAM : 
    ``` 
    { 
        "cs-title" : "문의 제목",
        "cs-contents" : "문의 내용",
        "cs-private" : "체크여부",
        "cs-file-path" : "첨부파일"
    } 
    ```
+ 동작 : 문의 게시판에 등록된 아이디어를 수정할 시 응답합니다. 본인의 게시물만 수정이 가능합니다.
+ 응답 : 
    * Code : 201 [CREATE] <br>
    or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 3. 문의사항 게시물 파일
+ URL : [GET] http://{IP}:{PORT}/cs/cs-notice
+ 동작 : 문의사항 해당 게시물에 해당하는 파일 테이블에 저장된 파일을 요청합니다.
+ 응답 : 
    * Code : 200 [OK] 
    <br>or
    * Code : 404 [Not Found]
    * Contents : ``` { error : "해당하는 파일을 찾을 수 없습니다" } ```
-----
### 4. 문의 게시글 삭제
+ URL : [DELETE]] http://{IP}:{PORT}/cs/delete-cs
+ 동작 : 문의 게시판에 등록된 게시물 삭제요청 시 응답합니다. 삭제 된 데이터는 로그에 기록됩니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
### 4-1. 문의 게시글 삭제(관리자)
+ URL : [DELETE]] http://{IP}:{PORT}/admin/cs/delete-cs
+ 동작 : 문의 게시판에 등록된 게시물 삭제요청 시 응답합니다. 삭제 된 데이터는 로그에 기록됩니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
### 5. 문의 게시글 검색
+ URL : [GET] http://{IP}:{PORT}/cs/search-cs/{검색어}
+ PARAM : 
    ``` 
    { 
        "cs_title" = "검색내용",
        "cs_contents" =검색내용" 
    } 
    ```
+ 동작 : 문의 테이블에서 일치하는 제목, 내용을 찾아 포함되는 게시물들을 조회한다.
+ 응답 :
    * Code : 200[OK]
    <br>or
    * Code : 403 [NOT FOUND]
    * Contents : ``` { error : "해당하는 게시물을 찾을 수 없습니다." } ```
-----
### 5-1. 문의 게시글 검색(관리자)
+ URL : [GET] http://{IP}:{PORT}/admin/cs/search-cs/{검색어}
+ PARAM : 
    ``` 
    { 
        "cs_title" = "검색내용",
        "cs_contents" =검색내용" 
    } 
    ```
+ 동작 : 문의 테이블에서 일치하는 제목, 내용을 찾아 포함되는 게시물들을 조회한다.
+ 응답 :
    * Code : 200[OK]
    <br>or
    * Code : 403 [NOT FOUND]
    * Contents : ``` { error : "해당하는 게시물을 찾을 수 없습니다." } ```
-----
### 6. 문의 게시물 로그 조회(관리자)
+ URL : [GET] http://{IP}:{PORT}/cs/log-cs
+ 동작 : 문의 게시물의 로그 정보들을 조회요청 시 응답합니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "접근권한이 없습니다." } ```
-----
<br>

## 고객센터
+ URL : [POST] http://{IP}:{PORT}/contact
-----
### 1. 고객센터 문의
+ URL : [POST] http://{IP}:{PORT}/contact/new-contact
+ PARAM : 
    ``` 
    { 
        "contact-email" : "이메일",
        "contact-title" : "제목",
        "contact-contents" : "문의내용"
    } 
    ```
+ 동작 : 고객 센터에 글을 등록할 시 응답하는 API입니다. 서버에서는 작성일, 번호 등의 로그를 저장합니다.
+ 응답 : 
    * Code : 201 [CREATE] <br>
    or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 2. 고객센터 로그(관리자)
+ URL : [GET] http://{IP}:{PORT}/contact/log-contact
+ 동작 : 고객센터에 문의 글들을 조회하고, 로그를 요청 시 응답합니다. 문의자의 정보와 시간을 포함하고 있습니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or<br>
    * Code : 404 [NOT FOUND]
    * Contents : ``` { error : "찾을 수 없습니다." } ```

# 회원관련 API
#### 회원 가입, 정보 등과 같은 회원과 관련된 API
-----
### 1. 중복 확인
+ URL : [GET] http://{IP}:{PORT}/member/check-email
+ PARAM : ``` { "member-email" : "이메일" } ```
+ 동작 : 확인할 email과 중복되는 email이 있는지 member테이블을 확인한다. 이때 탈퇴 사용자의 테이블도 함께 검색한다.
+ 응답 : 
    * Code : 200 [OK] </br>or</br>
    * Code : 404 [Not Found]
    * Contents : ``` { error : "중복된 이메일이 없습니다." } ```
-----
### 2. 회원 가입
+ URL : [POST] http://{IP}:{PORT}/member/signup
+ PARAM : 
    ``` 
    { 
        "member-email" : "이메일",
        "member-pw" : "비밀번호",
        "member-name" : "이름", 
        "member-birth" : "생년월일", 
        "member-phone" : "핸드폰번호",  
        "member-state" : "거주지",
        "member-sex" : "성별", 
        "member-company" : "소속",
        "member-ban" : 0
        "member-" : "약관동의여부"
    }
    ```
+ 동작 : PARAMETER를 입력받아 회원 가입에 필요한 정보를 모두 받았다면 생성한다. 회원의 정보들은 각 테이블에 저장된다. 이때 약관동의 여부는 전 페이지에서 선택한 내용에 따라 스크립트 내에서 넘겨준다.
+ 응답 :
    * Code : 201 [CREATED]<br>or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수 정보가 부족합니다" } ```
-----
### 3. 회원 로그인
+ URL : [POST] http://{IP}:{PORT}/member/signin
+ PARAM :
    ```
    {
        "member-email" : "이메일",
        "member-pw" : "비밀번호"
    }
    ```
+ 동작 : 이메일과 비밀번호를 비교하여 일치하면 로그인, 일치하지 않으면 Code403으로 응답한다.
+ 응답 : 
    * Code : 201 [CREATE]
    * Contents :
        ```
        {
            "member-email" : "이메일",
            "member-pw" : "비밀번호"
        }
        ``` 
    or <br>
    * Code : 404 [NOT FOUND]]
    * Contents : ``` { error : "이메일 / 비밀번호가 일치하지 않습니다." } ```
-----
### 4. 회원 로그아웃
+ URL : [DELETE] http://{IP}:{PORT}/member/logout
+ 동작 : 로그아웃 시, 홈 url로 이동한다. 로그인에 관한 세션들을 삭제하고 홈화면으로 돌아간다. 프론트 내에서 sessionStorage.clear(); 를 통해 세션삭제가 가능하다.
+ 응답 :
    * Code 200 [OK]
    * Contents :
        ```
        {
            Link : <http://{IP}:{PORT}/home>; rel="next"
        }
        ```
-----
### 5. 회원정보 수정
+ URL : [PATCH] http://{IP}:{PORT}/member/mypage/resetmypage
+ PARAM : ``` { "member-pw" : "비밀번호: } ```
+ 동작 : 비밀번호 재입력을 통해 비밀번호 대조 후, 일치한다면 회원정보 수정 가능을, 일치하지 않는다면 CODE 403으로 응답한다.
+ 응답 : 
    * Code 201 [CREATE]
    * Contents : 
        ```
        {
            "member-name" : "이름", 
            "member-pw" : "비밀번호",
            "member-sex" : "성별", 
            "member-birth" : "생년월일", 
            "member-phone" : "핸드폰번호",  
            "member-company" : "소속",
            "member-state" : "거주지"
        }
        ```
    or <br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 6. 비밀번호 찾기
+ URL : [POST] http://{IP}:{PORT}/member/mypage/findpassword
+ PARAM :  ``` { "member-email" : "이메일" } ```
+ 동작 : 입력한 이메일과 중복되는 이메일을 검색하여 확인한 뒤, 비밀번호 재설정 URL을 사용자의 이메일을 통해 전송한다. 이때 이메일과 대칭되는 해시 암호화된 이메일 인증 키와 대칭하여 인증 여부를 확인한다.
+ 응답 :
    * Code : 200 [OK]
    <br>or<br>
    * Code : 404 [Not Found]
    * Contents : ``` { error : "정보를 찾을 수 없습니다." } ```
-----
### 7. 비밀번호 재설정
+ URL : [PATCH] http://{IP}:{PORT}/member/resetpassword/{KEY}
+ PARAM :  ``` { "member-pw" : "비밀번호" } ```
+ 동작 : 이메일 경로를 통해 들어와 비밀번호를 재설정할 수 있도록 한다. 새로운 비밀번호와 비밀번호 재입력이 같은 값이어야 한다. 이때 KEY는 비밀번호 재설정 테이블의 KEY값과 일치하여야만 하며 URL의 유효기간이 있다.
+ 응답 :
    * Code : 201 [CREATE]
        ```
        {
            "member-pw" : "비밀번호"
        }
        ```
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 8. 포인트현황 조회
+ URL : [GET] http://{IP}:{PORT}/member/mypage/point
+ 동작 : 회원 테이블에 있는 회원의 순위, 현재포인트, 누적포인트, 사용포인트를 조회합니다.
    * return : 포인트 순위, 현재포인트, 누적포인트, 사용포인트
+ 응답 : 
    * Code : 200 [OK]<br>
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 9. 포인트 사용
+ URL : [PATCH] http://{IP}:{PORT}/member/mypage/use-point
+ PARAM : 
    ```
    {
        "use-point" = "사용포인트",
        "use-contents" = "사용내역"
    }
    ```
+ 동작 : 회원이 포인트를 상품으로 교환할 시 사용포인트에 추가 및 현재포인트 차감, 사용 내역 저장으로 응답합니다. 이때 포인트가 부족할 시 code 400으로 응답합니다.
+ 응답 : 
    * Code : 201 [CREATE]<br>
    or<br>
    * Code : 400 [Be Request]
    * Contents : ``` { error : "포인트 부족합니다." } ```
-----
### 10. 내 아이디어 조회
+ URL : [GET] http://{IP}:{PORT}/member/idea
+ 동작 : 회원이 작성한 아이디어 리스트를 조회합니다.
    * return : idea-title, idea-date
+ 응답 : 
    * Code : 200 [OK]<br>
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 11. 관심사업 조회
+ URL : [GET] http://{IP}:{PORT}/member/marked
+ 동작 : 회원이 추가한 관심사업 내역을 조회합니다.
    * return : anno-id, anno-title, anno-date
+ 응답 : 
    * Code : 200 [OK]<br>
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 12. 관심사업 등록
+ URL : [POST] http://{IP}:{PORT}/member/check
+ 동작 : 회원이 공고게시판의 공고 중 관심버튼 클릭 시 회원의 관심목록에 추가합니다.
+ 응답 : 
    * Code : 201 [CREATE]<br>
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 13. 회원탈퇴
+ URL : [DELETE] http://{IP}:{PORT}/member/deletemember
+ 동작 : 회원이 탈퇴버튼 클릭 시 회원정보를 탈퇴테이블로 이동시키며 회원과 관련된 정보 모두를 삭제합니다.
+ 응답 : 
    * Code : 200 [OK]<br>
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----
### 14. 개인정보수집 동의
+ URL : [GET] http://{IP}:{PORT}/member/agreemember
+ 동작 : 회원의 개인정보 수집 동의체크 여부를 확인 후 회원가입 정보 입력페이지로 이동한다.
+ 응답 : 
    * Code : 200 [OK]<br>
    or<br>
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "필수항목에 동의하지 않았습니다." } ```
-----
### 14. 관심사업 해제
+ URL : [DELETE] http://{IP}:{PORT}/member/deletecheck
+ 동작 : 회원이 저장한 관심사업을 해제할 때 응답합니다.
+ 응답 : 
    * Code : 200 [OK]<br>
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```
-----

# 관리자 API
#### 관리자 권한에 관한 API 이외 게시물 삭제, 로그등의 권한모두 부여
+ URL : [GET] http://{IP}:{PORT}/admin
-----
### 1. 관리자 로그인
+ ULR : [POST] http://{IP}:{PORT}/admin/signin
+ PARAM : 
    ```
    {
        "admin-email" : "이메일",
        "admin-pw" : "비밀번호"
    }
    ```
+ 동작 : 관리자페이지의 로그인 화면에서 이메일과 비밀번호를 입력받아 값 비교 후 로그인을 합니다.
+ 응답 : 
    * Code : 201 [CREATE]
    * Contents :
        ```
        {
            "member-email" : "이메일",
            "member-pw" : "비밀번호"
        }
        ``` 
    or <br>
    * Code : 404 [NOT FOUND]
    * Contents : ``` { error : "등록되지 않은 이메일입니다." } ```
-----
### 2. 회원정보 조회
+ URL : [GET] http://{IP}:{PORT}/admin/get-member
+ PARAM : 
    ```
    {
        "member-email" : "이메일"
    }
    ```
+ 동작 : 회원의 이메일 정보를 받아 일치하는 이메일이 있다면 로그 정보를 조회하여 응답합니다. 
        <br>return : 회원정보, 가입일자, 최근로그인 시간, 로그인시간
+ 응답 :
    * Code : 200 [OK]
    <br>or<br>
    * Code : 404 [NOT FOUND]
    * Contents : ``` { error : "등록되지 않은 이메일입니다." } ```
-----
### 3. 회원 정지
+ URL : [PATCH] http://{IP}:{PORT}/admin/ban-member
+ PARAM : ``` { "email" : "member-email" } ```
+ 동작 : 사용자의 이메일과 일치하는 이메일을 찾아 ban을 1로 변경하여 정지시키며 사유를 입력한다.
+ 응답 :
    * Code : 201 [CREATE]
    * Contents : 
        ``` 
        { 
            "member-ban" : 1,
            "member-ban-reason" : "내용"
        } 
        ```
    or
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "이미 정지된 사용자입니다." } ```
-----
### 4. 아이디어 포인트 부여
+ URL : [PATCH] http://{IP}:{PORT}/admin/idea/give-point
+ PARAM : ``` { "add-point" : (INT)포인트 } ```
+ 동작 : 해당하는 아이디어에 포인트를 부여요청 시 응답합니다. 이 때 부여한 관리자의 이메일, 적립 날짜도 함께 저장합니다. 또한 회원의 누적, 현재 포인트, 적립 내역 등을 함께 업데이트 합니다.
+ 응답 : 
    * Code : 200 [OK]
    * Contents : 
    ```
        {
            "add-point" = "포인트",
            "member-point" = member-point + "포인트",
            "save_point" = save-point + "포인트"
        }
    ```
    or<br>
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "이미 부여된 게시글입니다." } ```
-----
### 5. 아이디어 포인트 회수
+ URL : [PATCH] http://{IP}:{PORT}/admin/idea/take-point
+ PARAM : ``` { "use-point" : (INT)포인트 } ```
+ 동작 : 해당하는 아이디어에 대한 포인트를 회수요청 시 응답합니다.. 이때 사용포인트에 로그가 남게되며 사용자의 현재포인트, 사용 포인트가 함께 업데이트 됩니다.
+ 응답 : 
    * Code : 200 [OK]
    * Contents : 
    ```
        {
            "use-point" = "포인트",
            "member-point" = member-point - "포인트",
            "use-contents" = "포인트 회수"
        }
    ```
    or<br>
    * Code : 400 [Bad Request]
    * Contents : ``` { error : "회수할 포인트가 없습니다." } ```
-----
### 6. 포인트 로그 확인
+ URL : [GET] http://{IP}:{PORT}/admin/point-log
+ 동작 : 사용자의 포인트 로그를 요청 시 응답합니다. 포인트 사용 날짜와 내역이 포함되어있습니다.
+ 응답 :
    * Code : 200 [OK]
    <br>or<br>
    * Code : 404 [NOT FOUND]
    * Contents : ``` { error : 사용자의 내역이 없습니다. } ```
-----
### 7. 제외 관리자 관리
+ URL : [GET] http://{IP}:{PORT}/admin/signoutadmin
+ 동작 : 권한이 해제되거나 탈퇴한 관리자들의 정보를 요청 시 응답합니다. 탈퇴 관리자의 정보들을 가지고 있습니다.
+ 응답 : 
    * Code : 200 [OK]
    <br>or<br>
    * Code : 404 [NOT FOUND]
    * Contents : ``` { error : 제외 관리자가 없습니다. } ```
-----
### 8. 관리자 등록
+ URL : [POST] http://{IP}:{PORT}/admin/new-admin
+ PARAM : 
    ```
    {
        "admin-email" = "이메일",
        "admin_name" = "이름",
        "admin_sex" = "성별",
        "admin_birth" = "생년월일",
        "admin_state" = "거주지",
        "admin_pw" = "비밀번호",
        "admin_phone" = "핸드폰번호"
    }
    ```
+ 동작 : 관리자 등록 시 응답합니다. 이는 상위 관리자가 만들어 보급합니다.
+ 응답 :
    * Code : 201 [CREATE]
    * Contents :
        ```
        {
            "admin-email" = "이메일",
            "admin_name" = "이름",
            "admin_sex" = "성별",
            "admin_birth" = "생년월일",
            "admin_state" = "거주지",
            "admin_pw" = "비밀번호",
            "admin_phone" = "핸드폰번호"
        }
        ```
    or<br>
    * Code : 403 [Forbidden]
    * Contents : ``` { error : "잘못된 접근입니다." } ```