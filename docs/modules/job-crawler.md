## Job Crawler Module

### 1. Mục đích & phạm vi

- **Chức năng chính**:
  - Tự động crawl job từ các nguồn bên ngoài (hiện tại: **TopCV**, **LinkedIn (mock)**).
  - Chuẩn hóa dữ liệu job về dạng chuẩn (`NormalizedJobData`) để lưu vào bảng `jobs`.
  - Chống trùng (dedup) job giữa các lần crawl / giữa các nguồn.
  - Tôn trọng rate limit của nguồn bằng rate limiter & backoff.
  - Ghi lại thống kê crawl (số job tạo mới, update, skip, lỗi, thời gian chạy…).
  - Cung cấp API admin để:
    - Trigger crawl thủ công.
    - Test crawl theo URL.
    - Xem health/status của crawler.

- **Phụ thuộc chính**:
  - `JobsModule` / `JobsService`: tạo/cập nhật job chuẩn vào bảng `jobs`.
  - `TypeOrmModule.forFeature([CrawlerStats, Job])`: lưu thống kê & dùng cho dedup.
  - `Playwright + StealthPlugin + cheerio + DOMPurify`: crawl & parse HTML TopCV.
  - `JobNormalizationService`, `DeduplicationService`, `RateLimiterService`: xử lý nghiệp vụ lõi cho crawler.

---

### 2. Cấu hình `JobCrawlerModule`

- **File**: `src/modules/job-crawler/job-crawler.module.ts`

- **Logic**:
  - Import:
    - `JobsModule` (để dùng `JobsService`).
    - `TypeOrmModule.forFeature([CrawlerStats, Job])`.
  - Controllers:
    - `JobCrawlerController`: expose các API admin để trigger/test/health.
  - Providers:
    - `JobNormalizationService`
    - `DeduplicationService`
    - `RateLimiterService`
    - `JobCrawlerService` (orchestrator).
    - `TopCvCrawler`, `LinkedInCrawler` (chiến lược crawl từng nguồn).

---

### 3. Interface & kiểu dữ liệu crawler

- **File**: `src/modules/job-crawler/interfaces/job-crawler.interface.ts`

- **Raw dữ liệu theo nguồn**:
  - `RawLinkedInJob`: cấu trúc job trong mock LinkedIn (id, title, company, location, salaryRaw, description, source, url, postedAt).
  - `RawTopCVJob`: cấu trúc JSON-LD JobPosting trên TopCV (schema.org).

- **`OriginalJobData`**:
  - Lưu dữ liệu gốc (rawHtml/jsonLd) cho job (link tới trường `originalData` trong entity `Job`).

- **`NormalizedJobData`**:
  - Dạng chuẩn mà mọi crawler phải quy đổi về:
    - Thông tin chung: `externalId`, `title`, `company`, `location`, `source`, `url`, `postedAt`, `deadline`.
    - Lương: `salaryMin`, `salaryMax`, `currency`, `salary` (chuỗi gốc).
    - Nội dung: `description`, `requirements`, `benefits`.
    - Phân loại: `jobType`, `experienceLevel`, `level`, `education`, `city`, `industry`, `tags`, `categories`.
    - Thông tin bổ sung: `logoUrl`, `companyAddress`, `companySize`, `workingTime`, `quantity`, `gender`, `allowance`, `equipment`, `isBranded`, `isVerified`.
    - `skills: string[]` dùng cho matching AI.
    - `originalData?: OriginalJobData` để tra cứu nguồn gốc.

- **`CrawlResult`**:
  - Kết quả một lần crawl:
    - `jobsFound`, `jobsCreated`, `jobsUpdated`, `jobsSkipped`, `duplicatesSkipped`, `errors`.

- **`JobCrawlerStrategy`**:
  - Interface bắt buộc cho mọi crawler:
    - `name: string`.
    - `crawl(limit?: number): Promise<CrawlResult>`.
    - `crawlSpecificUrl?(url: string): Promise<void>` (optional).

---

### 4. Entity `CrawlerStats`

- **File**: `src/modules/job-crawler/entities/crawler-stats.entity.ts`
- **Bảng**: `crawler_stats`

- **Trường**:
  - `id`: UUID primary key.
  - `source: string`:
    - Tên nguồn (ví dụ: `topcv`, `linkedin`).
  - `runAt: Date`:
    - `@CreateDateColumn()` – thời gian chạy.
  - Counters:
    - `jobsFound`, `jobsCreated`, `jobsUpdated`, `jobsSkipped`, `duplicatesSkipped`, `errors`.
  - `durationMs: number`:
    - Thời gian chạy crawl cho 1 nguồn (ms).
  - `status: CrawlerStatus`:
    - `'success' | 'partial' | 'failed'`.
  - `errorMessage: string | null`:
    - Message lỗi nếu lần crawl fail.
  - Index:
    - `@Index(['source', 'runAt'])` để query nhanh theo nguồn & thời gian.

---

### 5. DeduplicationService – Chống trùng job

- **File**: `src/modules/job-crawler/services/deduplication.service.ts`

- **Mục tiêu**:
  - Phát hiện job trùng lặp giữa các lần crawl / các nguồn.
  - Hạn chế lưu duplicate gây rác & sai thống kê.

- **Hàm chính**:

#### 5.1 `generateContentHash(title, company, location)`

- Tạo SHA256 hash từ chuỗi chuẩn hoá `title|company|location`.
- Lưu vào trường `contentHash` của entity `Job`.
- Dùng cho match nhanh theo nội dung.

#### 5.2 `checkDuplicate(title, company, location, externalId?)`

- Trả về `DuplicateCheckResult`:
  - `isDuplicate: boolean`
  - `existingJobId: string | null`
  - `matchType: 'exact_hash' | 'external_id' | 'fuzzy_title' | 'none'`
  - `similarity?: number`

- Chiến lược:
  1. **Theo `externalId`**:
     - Nếu `externalId` có trong DB → duplicate (`matchType: 'external_id'`).
  2. **Theo `contentHash`**:
     - Tạo hash từ `title/company/location`.
     - Tìm job có `contentHash` giống → duplicate (`'exact_hash'`).
  3. **Fuzzy title (Levenshtein)**:
     - Lấy các job cùng `company` trong 30 ngày gần nhất.
     - Tính similarity bằng Levenshtein (0–1).
     - Nếu similarity > 0.9 → duplicate (`'fuzzy_title'`) kèm `similarity`.
  4. Không trùng → `matchType: 'none'`.

#### 5.3 `findExistingJob(externalId?, contentHash?)`

- Mục đích:
  - Tìm job hiện có để **update** (khi crawler muốn update thay vì skip).
- Logic:
  1. Nếu có `externalId`, ưu tiên tìm theo `externalId`.
  2. Nếu không thấy, thử theo `contentHash`.

#### 5.4 `calculateSimilarity(str1, str2)`

- Dùng Levenshtein distance.
- Trả số trong khoảng 0–1 (1 = giống hệt).

---

### 6. JobNormalizationService – Chuẩn hóa dữ liệu

- **File**: `src/modules/job-crawler/services/job-normalization.service.ts`

- **Chức năng**:
  - Chuyển dữ liệu text tự do từ nguồn (TopCV, LinkedIn,...) thành enum chuẩn (`JobType`, `JobLevel`, `City`, `Education`, `Industry`, `Gender`, `Currency`).
  - Làm sạch HTML mô tả, yêu cầu, phúc lợi.

- **Một số hàm chính**:

#### 6.1 `normalizeJobType(type: string | undefined): JobType`

- Map từ text (tiếng Việt/Anh) sang enum:
  - Nhận biết `"Toàn thời gian"`, `"full-time"`, `"bán thời gian"`, `"thực tập"`, `"freelance"`, `"remote"`, `"hybrid"`,...
  - Mặc định `JobType.FULL_TIME`.

#### 6.2 `normalizeExperienceLevel(level?: string): JobLevel`

- Map nội dung như `"2 năm kinh nghiệm"`, `"Senior"`, `"Junior"`, `"Lead"`, `"Manager"`,... sang `JobLevel`.
- Nếu không xác định → `JobLevel.NOT_SPECIFIED`.

#### 6.3 `parseSalary(salaryStr?: string)`

- Trả `{ min, max, currency }`:
  - Nhận diện:
    - `"thỏa thuận"` / `"negotiable"` → min/max = 0.
    - Tiền tệ: VND, USD, EUR, JPY qua từ khóa & ký hiệu.
  - Extract số từ chuỗi (dùng regex), xử lý:
    - Khoảng lương `10–20` → min/max.
    - Chỉ min hoặc chỉ max.
  - Xử lý đơn vị triệu (`triệu`, `tr`) cho VND → nhân 1.000.000 nếu cần.

#### 6.4 `sanitizeHtml(html?: string): string`

- Dùng `isomorphic-dompurify`:
  - Loại bỏ tag nguy hiểm (`script`, `style`, `iframe`, `form`, `input`...).
  - Loại bỏ attributes on\* (onclick, onerror,...).
  - Trả lại HTML sạch để lưu & render frontend an toàn.

#### 6.5 `normalizeCity(location?: string): City`

- Map location text (`"Hồ Chí Minh"`, `"HCM"`, `"Sài Gòn"`, `"HN"`, `"Đà Nẵng"`,...) sang enum `City`.
  - Nếu không match → `City.OTHER` hoặc `City.NATIONWIDE`.

#### 6.6 `normalizeEducation`, `normalizeGender`, `normalizeIndustry`

- Map mô tả text sang enum tương ứng (Trung cấp/Cao đẳng/Đại học/...; Nam/Nữ/Không yêu cầu; IT, Finance, Manufacturing, Education, Healthcare, Retail, Logistics, Construction...).

---

### 7. RateLimiterService – Tôn trọng rate limit

- **File**: `src/modules/job-crawler/services/rate-limiter.service.ts`

- **Mục đích**:
  - Hạn chế số request tới từng nguồn theo phút.
  - Bảo vệ khỏi bị chặn / block bằng backoff khi lỗi liên tiếp.

- **Config mặc định (`DEFAULT_CONFIGS`)**:
  - `topcv`:
    - `requestsPerMinute: 30`
    - `minDelayMs: 2000`
    - `backoffMultiplier: 2`
    - `maxBackoffMs: 60000`
  - `linkedin`:
    - `requestsPerMinute: 10`
    - `minDelayMs: 5000`
    - `backoffMultiplier: 3`
    - `maxBackoffMs: 120000`

- **State cho mỗi source** (`SourceState`):
  - `lastRequestTime`
  - `currentDelay` (delay hiện tại giữa các request, tăng/giảm động).
  - `requestCount` + `windowStart` (đếm theo 1 phút).
  - `consecutiveErrors` (số lỗi liên tiếp).

- **Hàm chính**:
  - `throttle(source)`:
    - Nếu vượt `requestsPerMinute` trong 1 phút → sleep tới khi đủ 1 phút.
    - Đảm bảo khoảng cách giữa 2 request >= `currentDelay`.
  - `recordSuccess(source)`:
    - Reset `consecutiveErrors = 0`.
    - Giảm dần `currentDelay` về `minDelayMs`.
  - `recordError(source)`:
    - Tăng `consecutiveErrors`.
    - `currentDelay = min(currentDelay * backoffMultiplier, maxBackoffMs)`.
  - `getStatus(source)`:
    - Trả về `{ currentDelay, consecutiveErrors, requestsInWindow }` dùng trong health API.

---

### 8. LinkedInCrawler – Nguồn LinkedIn (Mock)

- **File**: `src/modules/job-crawler/strategies/linkedin.crawler.ts`
- **Triển khai `JobCrawlerStrategy`**:
  - `name = 'LinkedIn'`.
  - Hiện thực `crawl()` – **mock** (chưa live crawl).

- **Flow `crawl()`**:
  1. Log bắt đầu crawl LinkedIn (mock).
  2. Tạo `CrawlResult` mặc định.
  3. Tạo danh sách job mock (`RawLinkedInJob`).
  4. Với mỗi job:
     - `rateLimiter.throttle('linkedin')`.
     - Gọi `deduplicationService.checkDuplicate(...)`.
       - Nếu duplicate (trừ trường hợp matchType `'external_id'`) → log & tăng `duplicatesSkipped`, `continue`.
     - Normalize:
       - `normalizeJobData(raw)`:
         - Parse salary, sanitize description, chuẩn hoá jobType & experienceLevel,...
     - Tính `contentHash` và gán vào normalized.
     - Kiểm tra `jobsService.findByExternalId(externalId)`:
       - Nếu tồn tại → `jobsService.update` + `jobsUpdated++`.
       - Nếu không → `jobsService.create` + `jobsCreated++`.
     - `rateLimiter.recordSuccess('linkedin')`.
  5. Catch lỗi từng job:
     - `recordError('linkedin')`, `errors++`, log chi tiết.
  6. Trả `CrawlResult`.

- **Ghi chú**:
  - Hiện LinkedIn crawler chỉ là mock, có thể mở rộng sau để crawl thật.

---

### 9. TopCvCrawler – Nguồn TopCV (Headless)

- **File**: `src/modules/job-crawler/strategies/topcv.crawler.ts`

- **Công nghệ**:
  - `playwright-extra` + `StealthPlugin`: fake trình duyệt con người.
  - `cheerio`: parse DOM HTML.
  - `DOMPurify`: sanitize HTML đoạn mô tả.

#### 9.1 `crawlSpecificUrl(url)`

- **Mục đích**:
  - Dùng để test crawl 1 job cụ thể (admin).
- **Flow**:
  1. Launch headless Chromium.
  2. Tạo context + page.
  3. Gọi `fetchTopCVDetail(page, url)` để scrape chi tiết job.
  4. Derive `externalId` từ URL (`jxxxx`).
  5. Gọi `normalizeJobData` để chuyển sang `NormalizedJobData`.
  6. `jobsService.create(jobData)`.
  7. Đóng browser.

#### 9.2 `crawl(limit = 9999)`

- **Mục đích**:
  - Crawl **nhiều trang** danh sách job mới nhất trên TopCV.

- **Flow tổng quan**:
  1. Log "Starting Headless TopCV Crawl".
  2. Launch headless Chromium.
  3. Tạo context + page.
  4. Xác định `baseUrl = 'https://www.topcv.vn/tim-viec-lam-moi-nhat?sba=1'`.
  5. Với `currentPage` từ 1 đến `totalPages` (và <= `limit`):
     - Gọi `rateLimiter.throttle('topcv')`.
     - `page.goto(baseUrl + '&page=' + currentPage)`.
     - Nếu là trang đầu:
       - Đọc `#job-listing-paginate-text` để tính `totalPages`.
     - Lấy tất cả link job trên trang:
       - `$('.job-item-search-result h3.title a') -> href`.
       - Cộng `jobsFound`.
     - Với từng `jobUrl`:
       1. Sinh `externalId` từ URL.
       2. `rateLimiter.throttle('topcv')`.
       3. `fetchTopCVDetail(page, jobUrl)` để lấy `TopCvDetailData`.
       4. `normalizeJobData(detail + externalId + source/url)` → `jobData`.
       5. Nếu thiếu `title` hoặc `company` → log & tăng `jobsSkipped`.
       6. Gọi `deduplicationService.checkDuplicate(title, company, location, externalId)`:
          - Nếu duplicate (không phải `'external_id'`) → `duplicatesSkipped++`, `continue`.
       7. Tính `contentHash` và gán vào `jobData`.
       8. Kiểm tra `existing = jobsService.findByExternalId(externalId)`:
          - Nếu có → `jobsService.update(existing.id, jobData)` + `jobsUpdated++`.
          - Nếu không → `jobsService.create(jobData)` + `jobsCreated++`.
       9. `rateLimiter.recordSuccess('topcv')`.
     - Tăng `currentPage++` và tiếp tục.
  6. Mọi lỗi được catch:
     - `recordError('topcv')`, `errors++`, log chi tiết.
  7. Đóng browser, trả `CrawlResult`.

#### 9.3 `fetchTopCVDetail(page, url)` – Scrape chi tiết TopCV

- **Các bước chính**:
  1. `page.goto(url, { waitUntil: 'load', timeout: 30000 })`.
  2. `waitForTimeout(2000)` để chờ content động.
  3. Lấy HTML `content = page.content()` rồi load với `cheerio`.
  4. Cố gắng đọc JSON-LD `JobPosting` từ `<script type="application/ld+json">`:
     - Dùng `parseJsonLd` + `isJobPosting` để tìm object có `@type = "JobPosting"`.
  5. Tách nội dung mô tả, yêu cầu, phúc lợi từ các block `.job-description__item` (và fallback).
  6. Dùng hàm `findGeneralInfo(labelKey)` để đọc các thông tin chung (dùng nhiều selector):
     - Hình thức làm việc, Cấp bậc, Giới tính, Số lượng tuyển, Kinh nghiệm, Học vấn, Lĩnh vực, Phụ cấp, Thiết bị làm việc, Thời gian làm việc,...
  7. Thu thập `tags` & `categories` từ breadcrumb, tags trên trang.
  8. Làm “smart fallback”:
     - Nếu thiếu experience/education → thử suy luận từ `tags`.
  9. Xác định `isVerified` dựa trên `.icon-verified-employer-tooltip`/`.icon-verified`.
  10. Parse `deadline` từ text `Hạn nộp` (dd/MM/yyyy).
  11. Lấy `logoUrl`, `companyAddress`, `companySize`, `title`, `company`, `salaryRaw`.
  12. Sanitize HTML description/requirements/benefits bằng `DOMPurify`.
  13. Trả về `TopCvDetailData` đầy đủ.

#### 9.4 `normalizeJobData(raw: TopCvDetailData)`

- Dùng `JobNormalizationService` để:
  - Parse salary (`parseSalary`).
  - Sanitize description/requirements/benefits.
  - Normalize jobType, experienceLevel, education, gender, industry, city.
  - Chuẩn hoá workingTime, tags, categories, isBranded, isVerified.
  - Parse skills từ JSON-LD + tags (`parseSkills`).
  - Gói vào object chuẩn (kèm `originalData.jsonLd`).
  - `contentHash` sẽ set sau (bởi crawler).

---

### 10. JobCrawlerService – Orchestrator & Health

- **File**: `src/modules/job-crawler/job-crawler.service.ts`

- **Khởi tạo**:
  - Giữ danh sách `strategies: JobCrawlerStrategy[] = [TopCvCrawler, LinkedInCrawler]`.

#### 10.1 `handleCron()`

- **Mục đích**:
  - Hàm trung tâm để chạy crawl cho mọi nguồn (được:
    - Gọi bởi **worker scheduler** (module `worker`).
    - Hoặc trigger thủ công từ API `/crawler/trigger`).

- **Flow**:
  1. Log `Starting job crawl...`.
  2. Với từng `strategy` trong `strategies`:
     - Ghi `startTime`.
     - Khởi tạo `status = 'success'`, `errorMessage = null`, `result = CrawlResult default`.
     - `try`:
       - Log `Executing strategy: ${strategy.name}`.
       - `result = await strategy.crawl()`.
       - Nếu `result.errors > 0` và `result.jobsCreated > 0` → `status = 'partial'`.
     - `catch error`:
       - Log error.
       - `status = 'failed'`, `errorMessage = error.message`.
       - `result.errors++`.
     - Lưu `CrawlerStats`:
       - `source = strategy.name.toLowerCase()`.
       - Các trường jobs\*, errors, durationMs.
       - `status`, `errorMessage`.
  3. Log `Job crawl finished.`.

#### 10.2 `crawlSpecificUrl(url)`

- **Mục đích**:
  - Dùng cho endpoint `/crawler/test` để crawl 1 URL cụ thể.
- **Hiện tại**:
  - Nếu URL chứa `"topcv"` → gọi `topCvCrawler.crawlSpecificUrl(url)`.
  - Có thể mở rộng thêm cho LinkedIn hoặc nguồn khác.

#### 10.3 `getHealth()`

- **Mục đích**:
  - Cho admin xem **sức khỏe** của hệ thống crawler trong 24h gần nhất.

- **Flow**:
  1. Tính `oneDayAgo = now - 1 ngày`.
  2. `recentStats = statsRepository.find`:
     - `where: runAt > oneDayAgo`.
     - `order: runAt DESC`.
     - `take: 20`.
  3. Với mỗi `source` (`'topcv'`, `'linkedin'`):
     - Lọc `sourceStats`.
     - `lastStat = sourceStats[0]`.
     - Build object:
       - `lastRun`: thời điểm chạy gần nhất.
       - `lastStatus`: `'success' | 'partial' | 'failed'`.
       - `totalJobsLast24h`: tổng `jobsCreated`.
       - `errorsLast24h`: tổng `errors`.
       - `avgDurationMs`: trung bình `durationMs`.
       - `rateLimitStatus`: từ `rateLimiter.getStatus(source)`.
  4. Tính `status` tổng:
     - Nếu có bất kỳ nguồn `lastStatus = 'failed'` → `'unhealthy'`.
     - Hoặc `partial` hoặc tổng lỗi > 10 → `'degraded'`.
     - Ngược lại → `'healthy'`.
  5. Trả về:
     - `status` (overall).
     - `sources` (map theo nguồn).
     - `recentRuns` (top 5 lần chạy gần nhất).

---

### 11. JobCrawlerController – API Admin

- **File**: `src/modules/job-crawler/job-crawler.controller.ts`

- **Bảo vệ**:
  - `@UseGuards(JwtAuthGuard, RolesGuard)`.
  - `@Roles(UserRole.ADMIN)` trên mọi endpoint.
  - Chỉ **ADMIN** đã đăng nhập mới gọi được.

#### 11.1 `GET /crawler/health`

- **Mục đích**: xem health của crawler.
- **Auth**:
  - Bearer token + role ADMIN.
- **Flow**:
  - Gọi `crawlerService.getHealth()`.
  - Trả về cấu trúc health tổng + theo nguồn + recentRuns.
- **Frontend sử dụng**:
  - Dashboard admin để monitor:
    - Lần crawl gần nhất.
    - Số job tạo trong 24h.
    - Số lỗi và trạng thái rate limit.

#### 11.2 `POST /crawler/trigger`

- **Mục đích**: trigger crawl thủ công (background).
- **Auth**:
  - Bearer token + ADMIN.
- **Flow**:
  - Gọi `void crawlerService.handleCron()` (không chờ xong).
  - Trả `{ message: 'Crawler triggered in background' }`.
- **Frontend**:
  - Nút “Chạy lại crawler” trên admin UI, sau đó có thể refresh `health`.

#### 11.3 `POST /crawler/test`

- **Mục đích**: test crawl 1 URL cụ thể (hiện chủ yếu cho TopCV).
- **Body**: `{ url: string }`.
- **Auth**:
  - Bearer token + ADMIN.
- **Flow**:
  - `crawlerService.crawlSpecificUrl(url)`.
  - Trả `{ message: 'Test crawl executed' }` (không trả job chi tiết).
- **Frontend**:
  - Form nhỏ cho admin dán URL TopCV → nhấn “Test crawl” để đưa job vào DB nhanh.

---

### 12. Cách web/frontend (admin) tích hợp với Job Crawler

> Các API crawler chỉ dành cho **admin**, không dùng cho user cuối.

#### 12.1 Dashboard health crawler

- **UI**:
  - Trang admin “Crawler Health”.
  - Hiển thị:
    - Overall status (`healthy`/`degraded`/`unhealthy`) với màu.
    - Bảng theo nguồn (`topcv`, `linkedin`):
      - Lần chạy gần nhất (`lastRun`).
      - Trạng thái chạy gần nhất (`lastStatus`).
      - Tổng job tạo trong 24h (`totalJobsLast24h`).
      - Số lỗi trong 24h (`errorsLast24h`).
      - `avgDurationMs`.
      - `currentDelay`, `consecutiveErrors`, `requestsInWindow`.

- **API call**:
  - `GET /crawler/health` với header `Authorization: Bearer <adminAccessToken>`.

#### 12.2 Nút trigger crawl thủ công

- **UI**:
  - Nút “Trigger Crawl” trên trang admin.
- **Flow frontend**:
  1. Gửi `POST /crawler/trigger` với Bearer token admin.
  2. Nhận `{ message: 'Crawler triggered in background' }`.
  3. Sau vài phút, frontend có thể tự động gọi lại `/crawler/health` để xem kết quả mới.

#### 12.3 Test crawl 1 URL

- **UI**:
  - Form: input URL TopCV.
  - Nút “Test Crawl”.
- **Flow frontend**:
  1. Gửi `POST /crawler/test`:
     - Body: `{ "url": "<linkTopCV>" }`.
     - Header: Bearer admin token.
  2. Nhận `{ message: 'Test crawl executed' }`.
  3. Sau đó, admin có thể search job đó trong hệ thống (qua `/jobs/search` hoặc tìm theo `externalId` nếu có UI hỗ trợ).

---

### 13. Tóm tắt nhanh

- Job Crawler module:
  - Định nghĩa **chiến lược crawl** cho từng nguồn, **chuẩn hóa dữ liệu**, **chống trùng**, **tôn trọng rate limit**, và **ghi log thống kê**.
  - Orchestrator `JobCrawlerService.handleCron` chạy lần lượt từng strategy, lưu `CrawlerStats`.
  - Cung cấp API admin để xem health, trigger crawling, và test crawl theo URL.
- Frontend (admin):
  - Tích hợp qua các endpoint `/crawler/health`, `/crawler/trigger`, `/crawler/test` (yêu cầu admin với JWT).
  - Dùng dữ liệu này để monitoring & vận hành hệ thống crawl job.
