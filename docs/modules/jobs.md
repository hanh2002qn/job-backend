## Jobs Module

### 1. Mục đích & phạm vi

- **Chức năng chính**:
  - Lưu trữ và quản lý danh sách job được crawl từ nhiều nguồn (LinkedIn, TopCV, v.v.).
  - Cung cấp API tìm kiếm job (full-text search với PostgreSQL tsvector).
  - Cung cấp API xem chi tiết job.
  - Cho phép user **save/bookmark job** và quản lý danh sách job đã lưu.
  - Tự động đánh dấu job hết hạn qua cron job.
  - Cung cấp dữ liệu job gần đây cho AI matching.

- **Phụ thuộc**:
  - `TypeOrmModule.forFeature([Job, SavedJob])`: repository cho `Job` và `SavedJob`.
  - `ScheduleModule.forRoot()`: chạy cron job `markExpiredJobs`.
  - `CacheService` + Redis (qua `common/redis`): cache list & detail job.
  - Enum & interface từ:
    - `job.enums.ts` (JobType, JobLevel, City, Industry,...).
    - `OriginalJobData` từ `job-crawler.interfaces.ts` (dữ liệu thô từ crawler).

---

### 2. Cấu hình `JobsModule`

- **File**: `src/modules/jobs/jobs.module.ts`

- **Logic**:
  - Import:
    - `TypeOrmModule.forFeature([Job, SavedJob])`.
    - `ScheduleModule.forRoot()` để enable cron.
  - Controllers:
    - `JobsController`: expose API search, detail, saved jobs.
  - Providers:
    - `JobsService`: chứa toàn bộ logic tìm kiếm, cache, save job, cron,...
  - Exports:
    - `JobsService`: cho phép module khác (vd. matching, analytics, crawler) sử dụng.

---

### 3. Entity `Job`

- **File**: `src/modules/jobs/entities/job.entity.ts`
- **Bảng**: `jobs`

- **Trường chính**:
  - `id: string`:
    - UUID primary key.
  - `source: string`:
    - Nguồn job: ví dụ `'linkedin'`, `'topcv'`,...
  - `title: string`:
    - Tiêu đề job.
  - `company: string`:
    - Tên công ty.
  - `location: string`:
    - Địa điểm hiển thị (chuỗi gốc).
  - `logoUrl`, `companyAddress`, `companySize`, `workingTime`, `companyType`:
    - Thông tin phụ về công ty / môi trường làm việc.

- **Lương & loại công việc**:
  - `salaryMin`, `salaryMax: number | null`:
    - Giới hạn dưới/trên của mức lương (nếu parse được).
  - `currency: Currency` (enum):
    - Mặc định `Currency.VND`.
  - `salary: string | null`:
    - Chuỗi lương gốc (ví dụ: `"30-50 triệu"`, `"Thỏa thuận"`).
  - `jobType: JobType | null`:
    - Enum: Full-time, Part-time, Remote, Hybrid,...
  - `experienceLevel: JobLevel | null`:
    - Level: Junior, Senior,...
  - `level: string | null`:
    - Chuỗi tự do: Staff, Manager, Director,...

- **Phân loại & kỹ năng**:
  - `category: string | null`:
    - Ngành/nhóm job (text).
  - `categories: string[]`:
    - Mảng category (simple-array).
  - `education: Education | null`:
    - Yêu cầu học vấn.
  - `city: City | null`:
    - Thành phố chuẩn hóa (Hồ Chí Minh, Hà Nội,...).
  - `industry: Industry | null`:
    - Ngành nghề chuẩn hóa (IT, Finance,...).
  - `tags: string[]`:
    - Tag tuỳ ý, phục vụ filter hoặc hiển thị.
  - `skills: string[]`:
    - Danh sách kỹ năng đã extract từ job (phục vụ matching AI).

- **Thông tin thêm**:
  - `isBranded: boolean`:
    - Job có gắn brand đặc biệt hay không (ưu tiên hiển thị).
  - `quantity: number | null`:
    - Số lượng tuyển.
  - `gender: Gender | null`:
    - Yêu cầu giới tính (Nam/Nữ/Không yêu cầu).
  - `deadline: Date | null`:
    - Hạn nộp hồ sơ.
  - `allowance`, `equipment`:
    - Phúc lợi / trợ cấp / thiết bị.

- **Nguồn dữ liệu & trạng thái**:
  - `originalData: OriginalJobData | null`:
    - JSON đầy đủ từ crawler (select: false).
  - `expired: boolean`:
    - Đã hết hạn hay chưa.
  - `externalId: string | null`:
    - ID job bên hệ thống nguồn (dùng chống trùng & sync).
  - `url: string | null`:
    - Link gốc đến trang job của nguồn.
  - `postedAt: Date | null`:
    - Thời điểm job được đăng trên nguồn.
  - `isVerified: boolean`:
    - Job đã được verify nội bộ hay chưa (chất lượng/nguồn).
  - `isAlertSent: boolean`:
    - Đã gửi job alert cho job này hay chưa.

- **Search & expiration**:
  - `searchVector: string | null`:
    - Trường `tsvector` dùng cho full-text search (select: false).
  - `expiresAt: Date | null`:
    - Thời điểm job hết hạn (dùng cho cron & filter).
  - `contentHash: string | null`:
    - Hash (SHA256) của `title + company + location`.
    - Dùng cho deduplication ở crawler.

- **Metadata**:
  - `createdAt: Date` – ngày insert vào DB.
  - `updatedAt: Date` – tự cập nhật khi update.

---

### 4. Entity `SavedJob`

- **File**: `src/modules/jobs/entities/saved-job.entity.ts`
- **Bảng**: `saved_jobs`

- **Mục đích**:
  - Lưu job mà user đã **save/bookmark**.
  - Mỗi dòng tương ứng với 1 user – 1 job.

- **Fields**:
  - `id: string`:
    - UUID primary key.
  - `userId: string`:
    - UUID, foreign key đến `User`.
    - Có `@Index(['userId'])` để query nhanh theo user.
  - `jobId: string`:
    - UUID, foreign key đến `Job`.
  - `@Unique(['userId', 'jobId'])`:
    - Một user không thể save cùng một job 2 lần.
  - `user: User`:
    - `ManyToOne` đến `User` (onDelete CASCADE).
  - `job: Job`:
    - `ManyToOne` đến `Job` (onDelete CASCADE).
  - `savedAt: Date`:
    - `@CreateDateColumn()`: thời điểm user save job.

---

### 5. DTO `JobSearchDto` & enums

- **File**: `src/modules/jobs/dto/job-search.dto.ts`

- **Kế thừa**: `BaseSearchDto` (chứa `page`, `limit`, `sortOrder`).

- **Fields filter**:
  - `keyword?: string`:
    - Dùng cho full-text search (tsvector + ILIKE trên title, company).
  - `location?: string`:
    - Chuỗi location tự do.
  - `city?: City`:
    - Enum (Hồ Chí Minh, Hà Nội, Đà Nẵng, v.v.).
  - `experienceLevel?: JobLevel`:
    - Enum (Intern, Fresher, Junior,...).
  - `level?: string`:
    - Chuỗi cấp bậc (Staff/Manager/Director,...).
  - `source?: string`:
    - Lọc theo nguồn crawler.
  - `industry?: Industry`:
    - Enum ngành nghề.
  - `category?: string`:
    - Chuỗi category tự do (ILike).
  - `minSalary?: number`:
    - Lọc `salaryMin >= minSalary`.
  - `maxSalary?: number`:
    - Lọc `salaryMax <= maxSalary`.
  - `jobType?: JobType`:
    - Enum loại hình công việc.

- **Sort**:
  - Enum `JobSortBy`:
    - `CREATED_AT`, `POSTED_AT`, `SALARY_MAX`, `DEADLINE`.
  - `sortBy?: JobSortBy`:
    - Mặc định `JobSortBy.POSTED_AT`.
  - `sortOrder` từ `BaseSearchDto` (ASC/DESC).

---

### 6. JobsService – Logic chi tiết

- **File**: `src/modules/jobs/jobs.service.ts`

#### 6.1 Tạo job (`create`)

- **Input**: `Partial<Job>` (thường đến từ job crawler / admin).
- **Flow**:
  1. Nếu `jobData.expiresAt` không có:
     - Nếu có `jobData.deadline` → `expiresAt = deadline`.
     - Ngược lại → `expiresAt = now + 30 ngày`.
  2. `jobsRepository.create(jobData)` và `save`.
  3. Gọi `updateSearchVector(savedJob.id)` để cập nhật `searchVector`.
  4. Invalidate cache list:
     - `delByPattern(CACHE_KEYS.JOBS_LIST:* )`.
  5. Trả về entity `Job` mới.

#### 6.2 Tìm kiếm job (`findAll`)

- **Input**: `JobSearchDto`.
- **Flow**:
  1. Build `cacheKey` từ `CACHE_KEYS.JOBS_LIST` + `JSON.stringify(searchDto)`.
  2. Dùng `cacheService.wrap(cacheKey, async () => { ... }, CACHE_TTL.JOBS_LIST)`:
     - Nếu đã có cache → trả từ cache.
     - Nếu chưa → chạy logic query DB rồi set cache.
  3. Trong callback:
     - Lấy các field filter và paging từ `searchDto`.
     - Tạo `query = jobsRepository.createQueryBuilder('job')`.
     - Áp dụng filter:
       - `keyword`:
         - `searchVector @@ plainto_tsquery('english', :keyword)` OR
         - `title ILIKE :likeKeyword` OR `company ILIKE :likeKeyword`.
         - Thêm select `search_rank = ts_rank(...)` để sort theo relevance.
       - `location`: ILIKE `%location%`.
       - `city`, `experienceLevel`, `source`, `industry`, `jobType`: so sánh bằng (=).
       - `level`, `category`: ILIKE `%value%`.
       - `minSalary`: `salaryMin >= :minSalary`.
       - `maxSalary`: `salaryMax <= :maxSalary`.
     - Luôn filter `expired = false`.
     - Sort:
       - Nếu có `keyword`:
         - `orderBy search_rank DESC`, sau đó `addOrderBy job.<sortBy> <sortOrder>`.
       - Nếu không có `keyword`:
         - `orderBy job.<sortBy> <sortOrder>`.
     - Pagination:
       - `skip = (page - 1) * limit`.
       - `take = limit`.
     - Lấy `[items, total] = query.getManyAndCount()`.
     - Trả `{ data: items, meta: { total, page, limit, totalPages } }`.

#### 6.3 Lấy chi tiết job (`findOne`)

- **Input**: `id: string`.
- **Flow**:
  1. Tạo `cacheKey = buildKey(CACHE_KEYS.JOB_DETAIL, id)`.
  2. Dùng `cacheService.wrap(cacheKey, () => findOne({ where: { id } }), CACHE_TTL.JOB_DETAIL)`.
  3. Trả về `Job | null`.

#### 6.4 Cập nhật / xóa job (`update`, `remove`)

- `update(id, jobData)`:
  - `jobsRepository.update(id, jobData)`.
  - Gọi `updateSearchVector(id)` để cập nhật tsvector.
  - Invalidate cache:
    - Detail: `CACHE_KEYS.JOB_DETAIL`.
    - List: `CACHE_KEYS.JOBS_LIST:*`.

- `remove(id)`:
  - `jobsRepository.delete(id)`.
  - Invalidate tương tự.

#### 6.5 Hỗ trợ crawler (`findByExternalId`)

- **Input**: `externalId: string`.
- **Flow**:
  - `jobsRepository.findOne({ where: { externalId } })`.
- **Mục đích**:
  - Crawler dùng để kiểm tra job đã tồn tại hay chưa (update thay vì insert).

#### 6.6 Cập nhật search vector (`updateSearchVector`)

- **Private method**.
- **Flow**:
  - Chạy query raw Postgres:
    - `searchVector =` kết hợp (`||`) nhiều `setweight(to_tsvector(...))`:
      - Title (weight A).
      - Company (weight B).
      - Description (weight C).
      - Skills (weight B).
  - Chỉ update dòng có `id = jobId`.
- **Tác dụng**:
  - Hỗ trợ full-text search nhanh và sắp xếp theo relevance trong `findAll`.

#### 6.7 Save / Unsave job (`saveJob`, `unsaveJob`, `getSavedJobs`, `isJobSaved`)

- `saveJob(userId, jobId)`:
  1. `findOne(jobId)`:
     - Nếu không tồn tại → `NotFoundException('Job not found')`.
  2. `savedJobsRepository.findOne({ where: { userId, jobId } })`:
     - Nếu đã tồn tại → `ConflictException('Job already saved')`.
  3. Tạo entity `SavedJob` với `{ userId, jobId }` và save.

- `unsaveJob(userId, jobId)`:
  1. `delete({ userId, jobId })`.
  2. Nếu `result.affected === 0` → `NotFoundException('Saved job not found')`.

- `getSavedJobs(userId, pagination)`:
  1. Tính `skip` từ `page`, `limit`.
  2. `findAndCount` trên `savedJobsRepository`:
     - `where: { userId }`.
     - `relations: ['job']` để load job.
     - `order: { savedAt: 'DESC' }`.
  3. Trả về:
     - `data`: map mỗi `SavedJob` thành `{ ...saved.job, savedAt: saved.savedAt }`.
     - `meta`: giống các list khác.

- `isJobSaved(userId, jobId)`:
  - `findOne({ where: { userId, jobId } })`, trả `true/false`.
- **Dùng cho frontend**:
  - Biết job đã được save hay chưa (để hiển thị icon bookmark).

#### 6.8 Quản lý hết hạn job (`markExpiredJobs` – Cron)

- **Annotation**: `@Cron(CronExpression.EVERY_DAY_AT_2AM)`.
- **Flow**:
  1. Lấy `now = new Date()`.
  2. Update:
     - Những job `expired = false` và `expiresAt < now` → set `expired = true`.
     - Những job `expired = false` và `deadline < now` → set `expired = true`.
  3. Invalidate cache list: `delByPattern(CACHE_KEYS.JOBS_LIST:* )`.
- **Ý nghĩa**:
  - Job tự động bị ẩn khỏi kết quả search (vì filter `expired = false`).

#### 6.9 Job gần đây cho AI (`getRecentJobs`)

- **Input**: `limit: number = 50`.
- **Flow**:
  - `find({ where: { expired: false }, order: { postedAt: 'DESC' }, take: limit })`.
- **Use case**:
  - Module AI matching sử dụng để lấy top N job mới nhất phục vụ gợi ý.

---

### 7. JobsController – Endpoint & flow

- **File**: `src/modules/jobs/jobs.controller.ts`

#### 7.1 `GET /jobs/search`

- **Mục đích**: Tìm kiếm job với nhiều filter + full-text search.
- **Query params**: `JobSearchDto` + `BaseSearchDto`:
  - `keyword`, `location`, `city`, `experienceLevel`, `level`, `source`, `industry`, `category`, `minSalary`, `maxSalary`, `jobType`, `sortBy`, `sortOrder`, `page`, `limit`.
- **Auth**:
  - **Không yêu cầu login** – client ẩn danh cũng dùng được.
- **Flow**:
  - Gọi `jobsService.findAll(query)`.
  - Trả về `{ data: Job[], meta }`.

#### 7.2 `GET /jobs/:id`

- **Mục đích**: Lấy chi tiết 1 job.
- **Path param**: `id` (UUID).
- **Auth**:
  - Không yêu cầu login.
- **Flow**:
  - Gọi `jobsService.findOne(id)`.
  - Nếu không có → trả `null` (tuỳ chỗ dùng có thể bọc thêm NotFound từ chỗ gọi).

#### 7.3 `GET /jobs/saved`

- **Mục đích**: Lấy danh sách job mà user đã save/bookmark.
- **Auth**:
  - `@ApiBearerAuth()`, `@UseGuards(JwtAuthGuard)`.
  - Yêu cầu access token hợp lệ.
- **Query**: `PaginationDto { page, limit }`.
- **Flow**:
  - Lấy `@CurrentUser() user`.
  - Gọi `jobsService.getSavedJobs(user.id, pagination)`.
  - Trả `{ data: JobWithSavedAt[], meta }`.

#### 7.4 `POST /jobs/:id/save`

- **Mục đích**: Save/bookmark một job.
- **Auth**:
  - Yêu cầu Bearer token.
- **Flow**:
  1. Lấy `@CurrentUser() user`.
  2. Gọi `jobsService.saveJob(user.id, id)`.
     - Ném `NotFoundException` nếu job không tồn tại.
     - Ném `ConflictException` nếu job đã được save trước đó.
  3. Trả lại entity `SavedJob` (hoặc có thể dùng để xác nhận).

#### 7.5 `DELETE /jobs/:id/save`

- **Mục đích**: Bỏ save/unsave job.
- **Auth**:
  - Yêu cầu Bearer token.
- **Flow**:
  1. Lấy `@CurrentUser() user`.
  2. Gọi `jobsService.unsaveJob(user.id, id)`.
     - Nếu không tìm thấy record → `NotFoundException('Saved job not found')`.
  3. Trả HTTP 204 No Content.

---

### 8. Cách web/frontend tích hợp với Jobs Module

#### 8.1 Tìm kiếm job (`GET /jobs/search`)

- **Trên UI**:
  - Màn hình list job có:
    - Ô search keyword.
    - Bộ lọc: thành phố (`city`), mức kinh nghiệm (`experienceLevel`), loại job (`jobType`), industry, min/max lương,...
    - Sắp xếp theo: mới đăng (`postedAt`), lương cao nhất (`salaryMax`), deadline,...

- **Cách gọi API**:
  - Ví dụ:
    - `GET /jobs/search?keyword=backend+node&city=HO_CHI_MINH&jobType=REMOTE&page=1&limit=20&sortBy=POSTED_AT&sortOrder=DESC`.
  - Không cần header auth, cả user ẩn danh và đã login đều dùng được.

- **Xử lý kết quả**:
  - Dùng `data` để render list job.
  - Dùng `meta.total`, `meta.page`, `meta.totalPages` để phân trang.

#### 8.2 Xem chi tiết job (`GET /jobs/:id`)

- **Trên UI**:
  - Khi user click 1 job trên list:
    - Frontend điều hướng tới `/jobs/:id` (route front).
    - Gọi `GET /jobs/:id` để lấy đầy đủ description, requirements, benefits, skills,...

- **Cách gọi API**:
  - `GET /jobs/<jobId>`.
  - Không cần auth.

- **Dùng `url`**:
  - Hiển thị nút “Xem trên trang gốc” / “Apply tại nguồn” dùng field `url`.

#### 8.3 Save / Unsave job

- **Frontend logic**:
  - Chỉ hiển thị nút **Save**/**Unsave** nếu user đã đăng nhập (dựa vào state auth).
  - Cần `accessToken` cho mọi request `/jobs/saved` và `/jobs/:id/save`.

- **Save job**:
  - Khi user click icon bookmark:
    - Gửi `POST /jobs/:id/save`:
      - Header: `Authorization: Bearer <accessToken>`.
    - Nếu 201/200:
      - Cập nhật state local: mark job là `saved = true`.
    - Nếu 409 (đã save trước đó):
      - Có thể coi như idempotent, cập nhật UI tương ứng.

- **Unsave job**:
  - Khi user bỏ bookmark:
    - Gửi `DELETE /jobs/:id/save` với Bearer token.
    - Nếu 204:
      - Xoá khỏi danh sách saved ở UI hoặc set `saved = false`.

- **Danh sách job đã save**:
  - Trang riêng `/saved-jobs`:
    - Gọi `GET /jobs/saved?page=1&limit=20` với Bearer token.
    - Hiển thị `data` (job + `savedAt`) và phân trang theo `meta`.

- **Kiểm tra trạng thái đã save hay chưa**:
  - Cách 1 (không thêm API):
    - Gọi `/jobs/saved` và so sánh ID trên client.
  - Cách 2 (nếu cần tối ưu):
    - Có thể dùng API `isJobSaved` trong tương lai (hiện tại chỉ có method service, chưa expose controller).

#### 8.4 Tích hợp với AI matching / gợi ý CV

- **Use case**:
  - Trang “Gợi ý job cho bạn”:
    - Backend (AI module) gọi `JobsService.getRecentJobs()` để lấy N job mới nhất chưa expired.
    - Chạy mô hình match với CV / profile của user.
  - Frontend:
    - Gọi endpoint từ AI module (không trực tiếp gọi `getRecentJobs`).
    - Jobs module đóng vai trò nguồn dữ liệu chuẩn hoá.

#### 8.5 Tương tác với job-crawler

- **Ở tầng backend** (không phải frontend):
  - Job crawler gọi `JobsService.create` hoặc `update`, `findByExternalId`, và sử dụng `contentHash`.
  - Frontend chỉ hưởng lợi từ dữ liệu đã được chuẩn hoá & deduplicate.

---

### 9. Tóm tắt nhanh

- Jobs module:
  - Lưu job từ nhiều nguồn, hỗ trợ full-text search, filter đa chiều, cache và đánh dấu hết hạn tự động.
  - Cho phép user save/unsave job, xem danh sách job đã lưu, và cung cấp job gần đây cho AI.
- Frontend tích hợp:
  - Dùng `GET /jobs/search` & `GET /jobs/:id` cho trang list & detail công khai.
  - Dùng `POST /jobs/:id/save`, `DELETE /jobs/:id/save`, `GET /jobs/saved` với Bearer token cho tính năng bookmark.
  - Dùng dữ liệu `url`, `skills`, `industry`, `salaryMin/Max`,... để tối ưu giao diện và trải nghiệm người dùng.
