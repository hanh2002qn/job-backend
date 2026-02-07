## Users Module

### 1. Mục đích & phạm vi

- **Chức năng chính**:
  - Quản lý entity `User` trong hệ thống.
  - Cung cấp service dùng cho các module khác, đặc biệt là `AuthModule` và các module liên quan profile, CV, tracker, job-alert,...
  - Cung cấp endpoint cơ bản cho frontend lấy thông tin user hiện tại (`/users/me`).

- **Phụ thuộc**:
  - `TypeOrmModule.forFeature([User])`: cấu hình repository cho entity `User`.
  - Dùng chung `JwtAuthGuard` và decorator `@CurrentUser` (định nghĩa ở `common`) trong controller.

---

### 2. Cấu hình `UsersModule`

- **File**: `src/modules/users/users.module.ts`

- **Logic**:
  - Import `TypeOrmModule.forFeature([User])` để inject `Repository<User>`.
  - Providers:
    - `UsersService`: chứa toàn bộ nghiệp vụ CRUD & helper cho user.
  - Controllers:
    - `UsersController`: endpoint `/users/me`.
  - Exports:
    - `UsersService`: cho phép module khác (ví dụ `AuthModule`) inject và sử dụng.

---

### 3. Entity `User`

- **File**: `src/modules/users/entities/user.entity.ts`

- **Bảng**: `users`

- **Fields chính**:
  - `id: string`:
    - `@PrimaryGeneratedColumn('uuid')`.
  - `email: string`:
    - `@Column({ unique: true })`.
    - Email là định danh chính cho user (ngoài các ID OAuth).
  - `passwordHash: string | null`:
    - Hash mật khẩu bằng bcrypt.
    - `nullable: true` để hỗ trợ tài khoản OAuth-only (không có mật khẩu).
  - `refreshTokenHash: string | null`:
    - Lưu bcrypt-hash của refresh token hiện tại (phục vụ logout/refresh).
  - `isVerified: boolean`:
    - Mặc định `false`.
    - Được set `true`:
      - Khi đăng ký (hệ thống hiện auto-verify cho MVP).
      - Hoặc khi user xác minh email.
  - `verificationToken: string | null`:
    - Token xác thực email.
  - `resetPasswordToken: string | null`:
    - Token dùng cho luồng quên mật khẩu.
  - `resetPasswordExpires: Date | null`:
    - Thời điểm hết hạn của reset token.
  - `role: UserRole`:
    - Enum:
      - `USER = 'user'`
      - `ADMIN = 'admin'`
    - Mặc định `UserRole.USER`.

- **Trường OAuth**:
  - `googleId: string | null`:
    - Unique, nullable.
    - Dùng để liên kết tài khoản Google OAuth.
  - `githubId: string | null`:
    - Unique, nullable.
    - Dùng để liên kết tài khoản GitHub OAuth.
  - `avatarUrl: string | null`:
    - Ảnh đại diện lấy từ OAuth provider (hoặc cập nhật sau này).

- **Metadata chung**:
  - `createdAt: Date`:
    - `@CreateDateColumn()`
  - `updatedAt: Date`:
    - `@UpdateDateColumn()`

- **Quan hệ với các module khác**:
  - `@OneToOne(() => Profile, profile => profile.user)`:
    - Mỗi user có một `Profile` chi tiết (thông tin cá nhân, kỹ năng...).
  - `@OneToMany(() => JobTracker, tracker => tracker.user)`:
    - Nhiều bản ghi theo dõi job (job tracker) thuộc về một user.
  - `@OneToMany(() => CV, cv => cv.user)`:
    - Nhiều bản ghi CV thuộc về một user.
  - `@OneToMany(() => CoverLetter, cl => cl.user)`:
    - Nhiều cover letter thuộc về một user.
  - `@OneToMany(() => SkillRoadmap, roadmap => roadmap.user)`:
    - Lộ trình kỹ năng cho một user.
  - `@OneToOne(() => JobAlert, alert => alert.user)`:
    - Cấu hình job alert của user (email notification, tần suất,...).

---

### 4. UsersService – Nghiệp vụ & helper

- **File**: `src/modules/users/users.service.ts`

- **Interface phụ**:
  - `OAuthUserData`:
    - `email: string`
    - `googleId?: string`
    - `githubId?: string`
    - `avatarUrl?: string`
    - `fullName?: string`

#### 4.1 Tạo user (`create`)

- **Input**: `Partial<User>` (thông thường được chuẩn hoá sẵn ở AuthService hoặc seed script).
- **Flow**:
  1. `this.usersRepository.create(userData)` để tạo instance.
  2. `this.usersRepository.save(newUser)` để lưu vào DB.
- **Dùng bởi**:
  - `AuthService.register`.
  - Các luồng khác có thể tạo user trực tiếp (seed, admin...).

#### 4.2 Lấy danh sách user (`findAll`)

- **Input**: `PaginationDto`:
  - `page` (mặc định 1).
  - `limit` (mặc định 10).
- **Flow**:
  1. Tính `skip = (page - 1) * limit`.
  2. `findAndCount` với:
     - `skip`, `take: limit`.
     - `order: { createdAt: 'DESC' }`.
  3. Trả về:
     - `data`: mảng user.
     - `meta`:
       - `total`, `page`, `limit`, `totalPages`.
- **Ghi chú**:
  - Hiện tại chưa có controller public cho endpoint này, nhưng service đã sẵn sàng để dùng trong admin module hoặc nơi khác.

#### 4.3 Tìm user theo email / id / token

- `findOneByEmail(email: string)`:
  - Dùng trong:
    - `AuthService.register`, `login`, `forgotPassword`, OAuth link-by-email.
- `findOneById(id: string)`:
  - Dùng trong:
    - `JwtStrategy.validate` (load `req.user`).
    - `AuthService.refreshTokens`, `changePassword`,... khi cần kiểm tra user.
- `findOneByVerificationToken(token: string)`:
  - Dùng trong:
    - `AuthService.verifyEmail`.
- `findOneByResetToken(token: string)`:
  - Dùng trong:
    - `AuthService.resetPassword`.

#### 4.4 Cập nhật user (`update`)

- **Input**: `id: string`, `updateData: DeepPartial<User>`.
- **Flow**:
  - Gọi `usersRepository.update(id, updateData)`.
- **Dùng cho**:
  - Cập nhật `passwordHash`, `refreshTokenHash`, `verificationToken`, `resetPasswordToken`,...
  - Thường được gọi từ `AuthService`.

#### 4.5 Hỗ trợ OAuth (`findByGoogleId`, `findByGithubId`, `findOrCreateOAuthUser`)

- `findByGoogleId(googleId: string)`:
  - Tìm user có `googleId` tương ứng.
- `findByGithubId(githubId: string)`:
  - Tìm user có `githubId` tương ứng.

- `findOrCreateOAuthUser(oauthData: OAuthUserData)`:
  - **Mục tiêu**: lấy hoặc tạo user tương ứng với profile OAuth (Google/GitHub).
  - **Flow chi tiết**:
    1. **Tìm theo provider ID**:
       - Nếu `oauthData.googleId` tồn tại:
         - Gọi `findByGoogleId`:
           - Nếu có user → trả luôn user đó (đã liên kết Google trước đó).
       - Tương tự nếu có `oauthData.githubId` → `findByGithubId`.
    2. **Nếu chưa có user theo provider ID, tìm theo email**:
       - `existingByEmail = findOneByEmail(oauthData.email)`.
       - Nếu tìm thấy:
         - Liên kết provider ID vào user hiện có:
           - `existingByEmail.googleId = oauthData.googleId` (nếu có).
           - `existingByEmail.githubId = oauthData.githubId` (nếu có).
         - Cập nhật `avatarUrl` nếu user chưa có avatar:
           - `existingByEmail.avatarUrl = oauthData.avatarUrl` (nếu còn trống).
         - `save(existingByEmail)` và trả về.
    3. **Nếu cũng không tìm thấy theo email → tạo user mới**:
       - Tạo user với:
         - `email: oauthData.email`.
         - `googleId` hoặc `githubId` tương ứng.
         - `avatarUrl`.
         - `isVerified: true` (user OAuth được coi là verified).
         - `passwordHash: null` (OAuth-only, không có mật khẩu).
       - Lưu và trả về user mới.

---

### 5. UsersController – Endpoint & flow

- **File**: `src/modules/users/users.controller.ts`

- **Guard & auth**:
  - `@UseGuards(JwtAuthGuard)` ở cấp controller:
    - Mọi route trong controller yêu cầu access token hợp lệ.
  - `@ApiBearerAuth()`:
    - Cho swagger biết cần Bearer token.

#### 5.1 `GET /users/me`

- **Mục đích**: lấy thông tin user hiện tại (profile cơ bản).
- **Flow**:
  1. `JwtAuthGuard` chạy `JwtStrategy` để validate access token.
  2. `@CurrentUser()` lấy entity `User` từ `req.user`.
  3. Handler:
     - Bóc tách `passwordHash` khỏi `user`:
       - `const { passwordHash: _passwordHash, ...result } = user;`
     - Trả về `result` (user không có trường `passwordHash`).

- **Dữ liệu trả về**:
  - `id`, `email`, `role`, `isVerified`, `avatarUrl`, các metadata `createdAt`, `updatedAt`,... và các trường public khác (trừ `passwordHash`).

---

### 6. Cách web/frontend tích hợp với Users Module

#### 6.1 Lấy thông tin user hiện tại (`/users/me`)

- **Điều kiện**:
  - User đã đăng nhập và frontend đang giữ `accessToken`.

- **Cách gọi từ frontend**:
  - Gửi `GET /users/me` với header:
    - `Authorization: Bearer <accessToken>`.
  - Backend:
    - Dùng `JwtAuthGuard` + `JwtStrategy` để xác thực.
    - Gắn entity `User` vào `req.user`.
    - Trả về thông tin user (không bao gồm `passwordHash`).

- **Use case typical**:
  - Sau khi login (từ `/auth/login` hoặc OAuth callback), frontend có token:
    1. Gọi `GET /users/me` để lấy:
       - Email, role, trạng thái verify, avatar,...
    2. Lưu dữ liệu này vào state (Redux/Context/Zustand,...) để hiển thị:
       - Avatar, tên (nếu kèm profile).
       - Quyền ADMIN/USER (điều khiển hiển thị UI & route).

#### 6.2 Flow khởi động ứng dụng (bootstrap session)

- **Kịch bản**:
  - User reload trang (F5).
  - Frontend vẫn giữ `accessToken`/`refreshToken` (tuỳ cách lưu).

- **Chiến lược frontend**:
  1. Khi app load:
     - Nếu có `accessToken`:
       - Thử gọi `GET /users/me`.
       - Nếu được → set user vào state, coi như session vẫn còn.
       - Nếu 401 → thử dùng `refreshToken` gọi `/auth/refresh` rồi retry `/users/me`.
  2. Nếu không có token hoặc refresh thất bại:
     - Chuyển sang trạng thái “chưa đăng nhập”, điều hướng về `/login`.

#### 6.3 Mối quan hệ với các module khác trên frontend

- **Profiles, CV, Job Tracker, Job Alert, Skill Roadmap,...**:
  - Các module này đều gắn quan hệ với user:
    - Thường filter dữ liệu theo `user.id` từ access token.
  - Frontend có thể:
    - Gọi `/users/me` để lấy `id`.
    - Dùng `id` đó làm key khi hiển thị hoặc gửi các request khác (nếu API cần).
  - Nhiều API ở các module khác có thể chỉ dựa vào JWT (không cần truyền `userId` trong body), nhưng `users/me` vẫn là endpoint chuẩn để đồng bộ client state với server.

---

### 7. Tóm tắt nhanh

- Users module:
  - Định nghĩa entity `User` (email, mật khẩu, token phụ, role, OAuth ID, avatar, quan hệ tới các module khác).
  - Cung cấp `UsersService` cho `AuthModule` và các module khác.
  - Expose endpoint `GET /users/me` trả về thông tin user hiện tại (không có `passwordHash`).
- Frontend:
  - Sử dụng `GET /users/me` sau login hoặc khi reload trang để lấy lại thông tin session.
  - Dùng thông tin từ đây để quyết định UI (role, avatar, verify,... ) và các API call khác gắn với user.
