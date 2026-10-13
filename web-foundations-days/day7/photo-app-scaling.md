# Day 7 Assignment: Scaling a Photo-Sharing App


# SnapShare - Scaling Plan

## 1. Assumptions

- SnapShare has 10,000,000 registered users.
- 10% of registered users are active daily, giving 1,000,000 daily active users (DAU).
- Each daily active user uploads one photo per day.
- Each daily active user views 50 feed pages per day.
- Each original photo is approximately 2 MB.
- Each generated thumbnail is approximately 50 KB (0.05 MB).
- For this exercise, one day is approximated as 100,000 seconds.
- Peak traffic is estimated at 5 times the average traffic.
- Storage estimates use decimal units and assume photos and thumbnails are retained for one year.

## 2. Traffic and Storage Estimates

### Daily active users

10,000,000 registered users × 10% active daily = **1,000,000 DAU**.

### Photo uploads

1,000,000 uploads per day ÷ 100,000 seconds per day = approximately **10 uploads per second**.

Peak uploads:

10 × 5 = approximately **50 uploads per second**.

### Feed views

1,000,000 daily active users × 50 feed views per user = 50,000,000 feed views per day.

50,000,000 ÷ 100,000 = approximately **500 feed views per second**.

Peak feed views:

500 × 5 = approximately **2,500 feed views per second**.

### Annual storage

Each photo and thumbnail require approximately:

2 MB + 0.05 MB = 2.05 MB.

Daily storage:

1,000,000 × 2.05 MB = 2,050,000 MB, or approximately **2.05 TB per day**.

Annual storage:

2.05 TB × 365 = 748.25 TB, or approximately **750 TB per year**.

This estimate covers original photos and thumbnails only. It excludes metadata, backups, replicated copies, temporary files, and storage overhead. Actual storage requirements will depend on retention policies and image compression.

## 3. Is the System Read-Heavy or Write-Heavy?

SnapShare is a **read-heavy system** because it processes approximately 50 feed views for every photo upload.

The architecture should prioritize fast and efficient reads by using a content delivery network (CDN) for image delivery, a cache for frequently requested feed data, and database read replicas for read-intensive queries.

Uploads must also be reliable, but thumbnail generation and other time-consuming work can happen asynchronously so users do not have to wait for every processing step to finish.

## 4. Where Should Photos Be Stored?

Photo files should be stored in **object storage**, such as Amazon S3, rather than directly inside the relational database.

Storing hundreds of terabytes of image files in the database would increase database size, backup costs, and operational complexity. Object storage is designed to store large binary files durably and at scale.

The relational database should store structured metadata, such as:

- Photo ID
- Owner or user ID
- Caption
- Upload timestamp
- Original photo URL or object key
- Thumbnail URL or object key
- Processing status

Object storage holds the original images and thumbnails, while the database manages their metadata and relationships. A CDN can then deliver image files efficiently to users.

## 5. Architecture Diagram

```text
                    Mobile App / Browser
                             |
                 +-----------+-----------+
                 |                       |
             API Requests            Image Requests
                 |                       |
                 v                       v
           Load Balancer                 CDN
                 |                       |
        +--------+--------+              |
        |        |        |              v
        v        v        v        Object Storage
      App 1    App 2    App 3       (Originals and
        |        |        |          Thumbnails)
        +--------+--------+
                 |
        +--------+----------+
        |        |          |
        v        v          v
      Redis   Primary DB   Message Queue
      Cache      |              |
                 |              v
                 |       Thumbnail Worker
                 |              |
                 |              v
                 +------> Object Storage
                 |
                 v
            Read Replicas
```

The CDN delivers images from cache when possible and retrieves them from object storage when necessary. The application servers handle API requests, while the primary database stores authoritative metadata and replicates suitable read data to replicas.

The message queue and thumbnail worker process image transformations asynchronously.

## 6. Architecture Components

- **CDN:** Delivers original photos and thumbnails from locations closer to users, reducing latency and application-server load.
- **Object storage:** Stores original photos and thumbnails durably and scales independently of the application and database servers.
- **Load balancer:** Distributes incoming API requests across healthy application servers.
- **Application servers:** Handle authentication, upload coordination, feed requests, and other business logic; they remain stateless so additional servers can be added as traffic grows.
- **Redis cache:** Keeps frequently requested feed data and other suitable results in memory to reduce repeated database queries.
- **Primary database:** Stores authoritative user, follow, photo metadata, and processing-status records.
- **Read replicas:** Serve suitable read-heavy database queries, reducing pressure on the primary database.
- **Message queue:** Holds thumbnail-generation jobs until workers can process them and supports retries when jobs fail.
- **Thumbnail worker:** Generates smaller versions of uploaded photos in the background and stores them in object storage.

## 7. Step-by-Step Photo Upload Flow

1. The user selects a photo in the mobile app or browser.
2. The application authenticates the user and validates the file type, size, and upload permissions.
3. The application creates an upload record or obtains a secure, time-limited upload URL.
4. The client uploads the original photo to object storage. Direct uploads reduce the amount of image data passing through application servers.
5. The application confirms the upload and records the photo metadata and processing status in the primary database.
6. The application publishes a thumbnail-generation job to the message queue.
7. The API returns a successful response, such as `201 Created`, once the original upload and metadata have been safely recorded. The thumbnail may still be processing.
8. A thumbnail worker retrieves the job, generates a thumbnail, and saves it to object storage.
9. The worker updates the photo record with the thumbnail location and marks processing as complete.
10. The application updates or invalidates relevant cached feeds so followers can see the new photo.
11. The CDN serves the original image and thumbnail when users view the photo.

If an upload or processing step fails, the system should retry safely where appropriate, record the error, and clean up incomplete or orphaned objects. Idempotent job handling prevents retries from creating duplicate records or unnecessary duplicate work.

## 8. Trade-Offs

### 1. Speed versus freshness

Caching feed data improves response times and reduces database load. However, a newly uploaded photo may not appear immediately in every cached feed.

**Decision:** Use cache invalidation or short expiration times to balance performance with acceptable feed freshness.

### 2. Fast uploads versus immediate thumbnail availability

Generating thumbnails synchronously would make the user wait for image processing. Asynchronous processing returns a response sooner but means a thumbnail might not be ready immediately.

**Decision:** Process thumbnails through a queue and display a placeholder until processing finishes.

### 3. Database read performance versus consistency

Read replicas reduce pressure on the primary database, but replication delay can mean a recent update is not immediately visible on a replica.

**Decision:** Use replicas for suitable feed reads and the primary database for operations that require the latest authoritative data.

### 4. Delivery performance versus infrastructure cost

A CDN reduces latency and repeated requests to object storage, but CDN delivery and cache invalidation introduce costs and operational complexity.

**Decision:** Cache frequently accessed images and measure cache-hit rates to manage cost and performance.

### 5. Reliable uploads versus implementation complexity

Direct uploads to object storage reduce application-server bandwidth, but require secure upload URLs, upload confirmation, error handling, and cleanup of incomplete files.

**Decision:** Use time-limited upload URLs, validate uploaded objects, and implement safe retries and cleanup procedures.

## 9. Conclusion

SnapShare has an estimated 1,000,000 daily active users, approximately 10 photo uploads per second on average, and approximately 500 feed views per second on average. At a peak factor of five, the system should plan for about 50 uploads per second and 2,500 feed views per second.

Original photos and thumbnails require approximately 2.05 TB of new storage per day, or about 748.25 TB per year under the stated assumptions.

Because SnapShare is read-heavy and stores large image files, its architecture separates image storage from structured metadata. Object storage and a CDN handle image delivery, Redis accelerates frequent reads, and database read replicas support feed queries. A message queue and thumbnail workers move image processing out of the immediate upload request.

This design supports independent scaling, responsive feed delivery, reliable uploads, and background processing as the application grows.
