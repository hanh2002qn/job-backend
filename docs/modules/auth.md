## Auth Module

### 1. Mục đích & phạm vi

- **Chức năng chính**:
  - Đăng ký, đăng nhập, đăng xuất người dùng.
  - Quản lý JWT access token / refresh token.
  - Xác minh email (hiện tại đang mock auto-verify cho MVP).
  - Đổi mật khẩu, quên mật khẩu, reset mật khẩu.
  - Đăng nhập qua OAuth Google & GitHub.

- **Phụ thuộc**:
  - `UsersModule` / `UsersService`: quản lý user, hash mật khẩu, các token phụ (verification, reset, refresh).
  - `MailModule` / `MailService`: gửi email reset mật khẩu.
  - `JwtModule` + `JwtService`: ký và verify JWT.
  - `PassportModule` + strategies:
    - `JwtStrategy`: xác thực Bearer token.
    - `GoogleStrategy`, `GithubStrategy`: tích hợp OAuth.
  - Guards dùng chung:
    - `JwtAuthGuard`: bảo vệ route cần login (dựa trên `JwtStrategy`).

---

### 2. Cấu hình `AuthModule`

- **File**: `src/modules/auth/auth.module.ts`
- **Logic**:
  - Import:
    - `UsersModule`
    - `MailModule`
    - `PassportModule`
    - `ConfigModule`
  - Đăng ký `JwtModule.registerAsync`:
    - Đọc `JWT_SECRET` từ config.
    - Đọc `JWT_EXPIRATION` (mặc định `'1d'`) làm `signOptions.expiresIn` cho `JwtService`.
  - Providers:
    - `AuthService`
    - `JwtStrategy`
    - `GoogleStrategy`
    - `GithubStrategy`
  - Exports:
    - `AuthService` (để module khác có thể dùng nếu cần).

---

### 3. JWT Strategy & Guard

- **File**: `src/modules/auth/jwt.strategy.ts`

- **Cấu hình strategy**:
  - Đọc token từ header `Authorization: Bearer <access_token>`.
  - Verify token bằng `JWT_SECRET` (đọc từ `ConfigService`).
  - Không bỏ qua hạn (`ignoreExpiration: false`).

- **Hàm `validate(payload: JwtPayload)`**:
  - Lấy `payload.sub` làm `userId`.
  - Gọi `UsersService.findOneById(userId)`.
  - Nếu không tìm thấy user → ném `UnauthorizedException`.
  - Nếu tìm thấy → trả về entity `User`, được gắn vào `req.user`.

- **Guard liên quan**:
  - `JwtAuthGuard` (ở `common/guards/jwt-auth.guard.ts`):
    - Dùng `@UseGuards(JwtAuthGuard)` trên route.
    - Khi guard pass, `req.user` là instance `User` đã được load từ DB.

---

### 4. DTO chính

- **`RegisterDto`**:
  - `email`: email hợp lệ.
  - `password`: bắt buộc, tối thiểu 6 ký tự.
- **`LoginDto`**:
  - `email`: email hợp lệ.
  - `password`: bắt buộc.
- **`RefreshTokenDto`**:
  - `refreshToken`: string, bắt buộc.
- **`ChangePasswordDto`**:
  - `oldPassword`: string, bắt buộc.
  - `newPassword`: string, bắt buộc, tối thiểu 6 ký tự.
- **`ForgotPasswordDto`**:
  - `email`: email hợp lệ.
- **`ResetPasswordDto`**:
  - `newPassword`: string, bắt buộc, tối thiểu 6 ký tự.
  - `token`: string reset password.
- **`VerifyEmailDto`**:
  - `token`: string verify email (hiện chủ yếu phục vụ cho tương lai khi bật gửi mail verify).

---

### 5. AuthService – Nghiệp vụ chi tiết

- **File**: `src/modules/auth/auth.service.ts`

#### 5.1 Đăng ký (`register`)

- **Input**: `RegisterDto { email, password }`.
- **Các bước**:
  1. Gọi `UsersService.findOneByEmail(email)`:
     - Nếu user tồn tại → `ConflictException('Email already exists')`.
  2. Sinh `salt` và hash mật khẩu bằng `bcrypt` → `passwordHash`.
  3. Hiện tại (MVP):
     - Không tạo `verificationToken`.
     - Log: `[MVP MOCK] Registration for <email> auto-verified.`.
     - Tạo user với:
       - `email`
       - `passwordHash`
       - `verificationToken: null`
       - `isVerified: true`
  4. Trả lại entity `User` vừa tạo.

#### 5.2 Xác minh email (`verifyEmail`)

- **Input**: `token` (lấy từ query `?token=...`).
- **Các bước**:
  1. `UsersService.findOneByVerificationToken(token)`:
     - Nếu không có → `NotFoundException('Invalid verification token')`.
  2. Nếu `user.isVerified` là true:
     - Trả `{ message: 'Email already verified' }`.
  3. Ngược lại:
     - Cập nhật user:
       - `isVerified: true`
       - `verificationToken: null`
     - Trả `{ message: 'Email verified successfully' }`.
- **Lưu ý**: hiện tại `register` đang auto-verify nên luồng này chưa dùng trong runtime bình thường, nhưng đã sẵn sàng để bật gửi mail verify trong tương lai.

#### 5.3 Validate user nội bộ (`validateUser`)

- **Input**: `email`, `pass`.
- **Các bước**:
  1. Tìm user theo email.
  2. Nếu user có `passwordHash` và `bcrypt.compare(pass, passwordHash)` trả true:
     - Bỏ `passwordHash` khỏi object và trả về phần còn lại.
  3. Nếu không → trả `null`.
- **Mục đích**: dùng làm bước xác thực credential cho `login`.

#### 5.4 Đăng nhập (`login`)

- **Input**: `LoginDto { email, password }`.
- **Các bước**:
  1. Gọi `validateUser(email, password)`.
     - Nếu trả `null` → `UnauthorizedException('Invalid credentials')`.
  2. Kiểm tra `user.isVerified`:
     - Nếu false → `UnauthorizedException('Please verify your email before logging in')`.
  3. Gọi `getTokens(user)`:
     - Sinh access token & refresh token.
     - Hash refresh token và lưu vào DB (trong `user.refreshTokenHash`).
  4. Trả về `{ accessToken, refreshToken, user }`.

#### 5.5 Đăng xuất (`logout`)

- **Input**: `userId`.
- **Các bước**:
  1. `UsersService.update(userId, { refreshTokenHash: null })`.
  2. Kết quả: mọi refresh token đã cấp trước đó bị vô hiệu hóa (vì không còn hash để so sánh).

#### 5.6 Refresh tokens (`refreshTokens`, `refreshTokensWithDecode`)

- **`refreshTokens(userId, refreshToken)`**:
  1. Lấy user bằng `userId`.
     - Nếu không có hoặc `user.refreshTokenHash` null → `UnauthorizedException('Access Denied')`.
  2. So sánh `refreshToken` từ client với `user.refreshTokenHash` bằng `bcrypt.compare`.
     - Nếu sai → `UnauthorizedException('Access Denied')`.
  3. Nếu đúng → gọi `getTokens(user)` để sinh cặp token mới, đồng thời cập nhật hash mới.

- **`refreshTokensWithDecode(refreshToken)`** (được controller dùng trực tiếp):
  1. Dùng `jwtService.verify<JwtPayload>(refreshToken, { ignoreExpiration: false })`.
     - Nếu verify lỗi (invalid/expired) → `UnauthorizedException('Invalid or expired refresh token')`.
  2. Lấy `userId = payload.sub`.
  3. Gọi `refreshTokens(userId, refreshToken)` như trên.

- **Ý nghĩa bảo mật**:
  - Refresh token phải:
    - Còn hạn (JWT hợp lệ).
    - Trùng với hash đang lưu trên DB (chỉ giữ 1 refresh token active gần nhất / mỗi lần refresh sẽ thay hash).

#### 5.7 Đổi mật khẩu (`changePassword`)

- **Input**: `userId`, `ChangePasswordDto { oldPassword, newPassword }`.
- **Các bước**:
  1. Tìm user theo id.
     - Nếu không có → `UnauthorizedException('User not found')`.
  2. Nếu user **không có `passwordHash`** (tài khoản tạo bằng OAuth-only):
     - `UnauthorizedException('Cannot change password for OAuth-only accounts')`.
  3. So sánh `oldPassword` với `user.passwordHash` bằng `bcrypt.compare`.
     - Nếu sai → `UnauthorizedException('Old password incorrect')`.
  4. Hash `newPassword` với bcrypt, cập nhật `passwordHash`.
  5. Trả `{ message: 'Password changed successfully' }`.

#### 5.8 Quên mật khẩu (`forgotPassword`)

- **Input**: `email`.
- **Các bước**:
  1. Tìm user theo email.
     - Nếu không có:
       - Không throw, trả luôn:
         - `{ message: 'If this email exists, a password reset link has been sent.' }`
       - Tránh lộ thông tin email có tồn tại.
  2. Nếu có user:
     - Sinh `resetToken = crypto.randomBytes(32).toString('hex')`.
     - `resetPasswordExpires = now + 1h`.
     - Cập nhật user:
       - `resetPasswordToken: resetToken`.
       - `resetPasswordExpires`.
     - Gọi `mailService.sendPasswordResetEmail(user.email, resetToken)`.
  3. Luôn trả cùng một message cho client.

#### 5.9 Reset mật khẩu (`resetPassword`)

- **Input**: `ResetPasswordDto { newPassword, token }`.
- **Các bước**:
  1. Gọi `UsersService.findOneByResetToken(token)`.
     - Nếu không có user → `UnauthorizedException('Invalid or expired reset token')`.
  2. Kiểm tra hạn:
     - Nếu `user.resetPasswordExpires` tồn tại và `now > resetPasswordExpires` → `UnauthorizedException('Invalid or expired reset token')`.
  3. Hash `newPassword` bằng bcrypt, cập nhật `passwordHash`.
  4. Xóa token reset:
     - `resetPasswordToken: null`.
     - `resetPasswordExpires: null`.
  5. Trả `{ message: 'Password has been reset successfully' }`.

#### 5.10 Sinh & lưu token (`getTokens`)

- **Input**: `user` (object user đã bỏ `passwordHash`).
- **Các bước**:
  1. Tạo payload: `{ email: user.email, sub: user.id, role: user.role }`.
  2. Sinh:
     - `accessToken = jwtService.sign(payload, { expiresIn: '15m' })`.
     - `refreshToken = jwtService.sign(payload, { expiresIn: '7d' })`.
  3. Hash `refreshToken` bằng bcrypt → `refreshTokenHash`.
  4. Cập nhật user trong DB: `refreshTokenHash`.
  5. Trả `{ accessToken, refreshToken, user }`.

#### 5.11 OAuth login (`handleOAuthLogin`)

- **Input**: entity `User` (đã được tạo/cập nhật từ profile OAuth).
- **Các bước**:
  1. Nếu `!user` → `UnauthorizedException('OAuth login failed')`.
  2. Nếu có user → gọi `getTokens(user)` và trả `{ accessToken, refreshToken, user }`.

---

### 6. AuthController – Endpoint & flow

- **File**: `src/modules/auth/auth.controller.ts`

#### 6.1 `POST /auth/register`

- **Body**: `RegisterDto`.
- **Flow**:
  - Gọi `authService.register(registerDto)` (theo 5.1).
- **Rate limit**: tối đa 10 request / 60 giây trên route này.

#### 6.2 `GET /auth/verify?token=...`

- **Query**: `token`.
- **Flow**:
  - Gọi `authService.verifyEmail(token)`.

#### 6.3 `POST /auth/login`

- **Body**: `LoginDto`.
- **Flow**:
  - Gọi `authService.login(loginDto)`.
  - Trả về `{ accessToken, refreshToken, user }`.
- **Rate limit**: 5 request / 60 giây.

#### 6.4 `POST /auth/logout`

- **Headers**: `Authorization: Bearer <access_token>`.
- **Guard**: `@UseGuards(JwtAuthGuard)`.
- **Flow**:
  - Lấy `@CurrentUser() user`.
  - Gọi `authService.logout(user.id)`.

#### 6.5 `POST /auth/refresh`

- **Body**: `RefreshTokenDto { refreshToken }`.
- **Flow**:
  - Gọi `authService.refreshTokensWithDecode(refreshToken)`.
  - Trả về cặp **accessToken** và **refreshToken** mới + user.
- **Không cần** access token; client chỉ gửi refresh token.

#### 6.6 `POST /auth/change-password`

- **Headers**: `Authorization: Bearer <access_token>`.
- **Body**: `ChangePasswordDto { oldPassword, newPassword }`.
- **Flow**:
  - Dùng `JwtAuthGuard` để lấy `@CurrentUser() user`.
  - Gọi `authService.changePassword(user.id, changeDto)`.

#### 6.7 `POST /auth/forgot-password`

- **Body**: `ForgotPasswordDto { email }`.
- **Flow**:
  - Gọi `authService.forgotPassword(email)`.
- **Rate limit**: 5 request / 60 giây.

#### 6.8 `POST /auth/reset-password`

- **Body**: `ResetPasswordDto { newPassword, token }`.
- **Flow**:
  - Gọi `authService.resetPassword(resetDto)`.
- **Rate limit**: 5 request / 60 giây.

---

### 7. OAuth Google – Flow & tích hợp web

- **Strategy**: `GoogleStrategy` (`src/modules/auth/strategies/google.strategy.ts`)
  - Config:
    - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_CALLBACK_URL`.
    - Scope: `['email', 'profile']`.
  - Hàm `validate`:
    - Map `Profile` từ Google → `GoogleProfile { googleId, email, firstName, lastName, avatarUrl }`.
    - Gọi `done(null, userProfile)` → `req.user` là `GoogleProfile`.

- **Guard**: `GoogleAuthGuard` (`src/modules/auth/guards/google-auth.guard.ts`)
  - `extends AuthGuard('google')`.
  - `handleRequest`:
    - Nếu có lỗi hoặc không có user → ném lỗi `'Google authentication failed'`.
    - Ngược lại → trả về `userProfile`.

- **Endpoints**:
  - `GET /auth/google`:
    - `@UseGuards(GoogleAuthGuard)`.
    - Không có logic trong handler; guard redirect đến trang login Google.
  - `GET /auth/google/callback`:
    - `@UseGuards(GoogleAuthGuard)`.
    - Flow:
      1. Sau khi user chấp nhận trên Google, Google redirect về `GOOGLE_CALLBACK_URL` (map đến route này).
      2. Guard đã chạy, `req.user` là `GoogleProfile`.
      3. Controller gọi `usersService.findOrCreateOAuthUser(...)` để:
         - Tạo mới hoặc lấy user tương ứng với `googleId`/`email`.
      4. Gọi `authService.handleOAuthLogin(user)` → sinh `accessToken`, `refreshToken`.
      5. Lấy `FRONTEND_URL` từ config (mặc định `'http://localhost:3001'`).
      6. Redirect:
         - `res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`)`.

---

### 8. OAuth GitHub – Flow & tích hợp web

- **Strategy**: `GithubStrategy` (`src/modules/auth/strategies/github.strategy.ts`)
  - Config:
    - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GITHUB_CALLBACK_URL`.
    - Scope: `['user:email']`.
  - `validate`:
    - Map profile GitHub → `GithubProfile { githubId, email, username, displayName, avatarUrl }`.
    - `done(null, userProfile)` → `req.user` là `GithubProfile`.

- **Guard**: `GithubAuthGuard` (`src/modules/auth/guards/github-auth.guard.ts`)
  - `extends AuthGuard('github')`.
  - `handleRequest` giống Google:
    - Nếu lỗi / không user → ném `'GitHub authentication failed'`.
    - Ngược lại → trả lại profile.

- **Endpoints**:
  - `GET /auth/github`:
    - Guard redirect user tới GitHub OAuth.
  - `GET /auth/github/callback`:
    - Guard nhận callback từ GitHub, gán `req.user` là `GithubProfile`.
    - Controller:
      1. Gọi `usersService.findOrCreateOAuthUser(...)`.
      2. `authService.handleOAuthLogin(user)` để lấy tokens.
      3. Redirect về `${FRONTEND_URL}/auth/callback?accessToken=...&refreshToken=...`.

---

### 9. Cách web/frontend tích hợp với Auth Module

#### 9.1 Đăng ký & đăng nhập (email/password)

- **Đăng ký**:
  - Gửi `POST /auth/register`:
    - Body JSON: `{ "email": "...", "password": "..." }`.
  - Frontend có thể:
    - Sau khi đăng ký thành công → chuyển sang trang login.
    - Hoặc auto-login bằng cách gọi tiếp `/auth/login`.

- **Đăng nhập**:
  - Gửi `POST /auth/login` với `LoginDto`.
  - Response: `{ accessToken, refreshToken, user }`.
  - **Lưu trữ trên frontend**:
    - Khuyến nghị:
      - `accessToken`: lưu tạm thời (memory, hoặc `sessionStorage`).
      - `refreshToken`: nếu phải lưu, thì nên lưu ở nơi ít bị JS truy cập (HttpOnly cookie nếu front-back cùng domain) hoặc có chiến lược bảo mật riêng.

- **Gọi API bảo vệ**:
  - Với các route yêu cầu auth (guard `JwtAuthGuard`), frontend thêm header:
    - `Authorization: Bearer <accessToken>`.
  - Khi access token hết hạn, backend trả `401` → frontend nên tự động gọi `/auth/refresh`.

#### 9.2 Refresh token

- **Flow frontend**:
  1. Khi nhận `401 Unauthorized` do token hết hạn:
     - Gửi `POST /auth/refresh` với body: `{ "refreshToken": "<refresh_token>" }`.
  2. Nếu thành công:
     - Cập nhật `accessToken` và `refreshToken` mới vào nơi lưu trữ.
     - Retry lại request cũ với access token mới.
  3. Nếu `/auth/refresh` trả 401:
     - Xem như phiên đăng nhập đã hết hạn hoàn toàn → chuyển user về trang login.

#### 9.3 Đăng xuất

- **Flow frontend**:
  1. Gửi `POST /auth/logout` với header `Authorization: Bearer <accessToken>`.
  2. Backend xóa `refreshTokenHash` trong DB.
  3. Frontend xóa tất cả token trong local (`accessToken` & `refreshToken`).
  4. Chuyển hướng user về trang login / landing.

#### 9.4 Đổi mật khẩu

- **Flow frontend**:
  1. Ở trang đổi mật khẩu, yêu cầu user nhập `oldPassword`, `newPassword`.
  2. Gửi `POST /auth/change-password`:
     - Header: `Authorization: Bearer <accessToken>`.
     - Body: `{ "oldPassword": "...", "newPassword": "..." }`.
  3. Nếu trả message thành công, hiển thị thông báo và (tuỳ policy) có thể yêu cầu login lại.

#### 9.5 Quên mật khẩu & reset mật khẩu

- **Quên mật khẩu (request reset)**:
  1. User nhập email vào form.
  2. Frontend gửi `POST /auth/forgot-password` với body `{ "email": "..." }`.
  3. Backend luôn trả cùng một message, frontend hiển thị thông báo “Nếu email tồn tại, link reset đã được gửi”.

- **Reset mật khẩu (từ link trong email)**:
  1. Email chứa URL dạng: `https://frontend-url/reset-password?token=<reset_token>`.
  2. Frontend đọc `token` từ query string.
  3. User nhập mật khẩu mới, frontend gửi `POST /auth/reset-password`:
     - Body: `{ "newPassword": "...", "token": "<reset_token>" }`.
  4. Nếu thành công → thông báo và chuyển user về trang login.

#### 9.6 OAuth Google / GitHub

- **Bắt đầu login OAuth**:
  - Frontend có thể:
    - Mở `window.location.href = BACKEND_URL + '/auth/google'` hoặc `/auth/github`.
    - Hoặc mở popup/redirect.

- **Callback từ backend về frontend**:
  1. User hoàn thành login trên Google/GitHub.
  2. Provider redirect về backend (`/auth/google/callback` hoặc `/auth/github/callback`).
  3. Backend tạo / tìm user tương ứng, sinh JWT, rồi **redirect sang frontend**:
     - `FRONTEND_URL/auth/callback?accessToken=...&refreshToken=...`.
  4. Ở route `/auth/callback` phía frontend:
     - Đọc `accessToken` và `refreshToken` từ query.
     - Lưu token như luồng login thường.
     - Điều hướng user vào trong app (trang dashboard,…).

- **Bảo mật phía frontend**:
  - Nên:
    - Xoá query `accessToken` và `refreshToken` khỏi URL sau khi đọc (để tránh bị lưu trong lịch sử / log).
    - Cân nhắc dùng `window.history.replaceState`.

---

### 10. Tóm tắt nhanh

- Auth module cung cấp:
  - Đăng ký, đăng nhập, quản lý JWT access/refresh.
  - Đổi mật khẩu, quên mật khẩu, reset mật khẩu.
  - Login OAuth Google & GitHub với redirect về frontend kèm tokens.
- Frontend tích hợp bằng:
  - Gửi request JSON theo DTO tương ứng.
  - Lưu `accessToken`/`refreshToken`, thêm header `Authorization` khi call API protected.
  - Xử lý luồng redirect `/auth/callback` để nhận token sau khi login OAuth.
