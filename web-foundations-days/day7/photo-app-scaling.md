
# Day 7 Assignment: Scaling a Photo-Sharing App

## 1. Assumptions

SnapShare is a photo-sharing application where users upload photos and scroll through a feed containing photos from people they follow.

The following assumptions are used for the calculations:

- Total registered users: 10,000,000.
- Daily active users (DAU): 10% of registered users.
- Each active user uploads 1 photo per day.
- Each active user views 50 feed pages per day.
- Average original photo size: 2 MB.
- Average thumbnail size: 50 KB.
- One day contains 86,400 seconds, and one year contains 365 days.
- Peak feed traffic is estimated at 5 times the average traffic.
- Storage estimates exclude database metadata, backups, replication, and storage overhead.
- All daily active users are assumed to upload and view the stated amounts each day.

### Daily active users

Daily active users are calculated as:

DAU = Total registered users × Daily activity rate

DAU = 10,000,000 × 0.10

**Daily active users = 1,000,000 users**

Therefore, SnapShare has approximately one million active users each day.

## 2. Traffic and storage calculations

### A. Photo uploads per second

Each daily active user uploads one photo.

Daily uploads = 1,000,000 × 1 = **1,000,000 photos per day**

Average uploads per second:

1,000,000 ÷ 86,400 = 11.57

**Average upload rate ≈ 11.57 photos per second.**

### B. Feed views per second

Each daily active user views 50 feed pages per day.

Daily feed views = 1,000,000 × 50

**Daily feed views = 50,000,000 pages**

Average feed views per second:

50,000,000 ÷ 86,400 = 578.70

**Average feed request rate ≈ 579 requests per second.**

Peak feed views per second, assuming a 5× peak factor:

578.70 × 5 = 2,893.52

**Peak feed request rate ≈ 2,894 requests per second.**

| Metric                        | Estimated value |
| ----------------------------- | --------------: |
| Daily active users            |       1,000,000 |
| Daily photo uploads           |       1,000,000 |
| Average uploads per second    |           11.57 |
| Daily feed views              |      50,000,000 |
| Average feed views per second |             579 |
| Peak feed views per second    |           2,894 |

These are average and estimated peak rates, not maximum possible traffic; actual traffic can vary by time of day and user activity.

### C. Photo storage per year

Original photos:

- Daily storage = 1,000,000 × 2 MB = 2,000,000 MB = 2 TB per day.
- Annual storage = 2 TB × 365 = **730 TB per year**.

Thumbnails:

- Daily storage = 1,000,000 × 50 KB = 50,000,000 KB = 50 GB per day.
- Annual storage = 50 GB × 365 = **18.25 TB per year**.

Total photo storage:

730 TB + 18.25 TB = **748.25 TB per year**.

This estimate uses decimal units: 1 TB = 1,000 GB. It assumes every uploaded photo and thumbnail is retained for the entire year.

## 3. Is SnapShare read-heavy or write-heavy?

SnapShare is a **read-heavy system** because users view 50 feed pages for every photo they upload. The workload generates about 50 million feed views daily compared with 1 million daily photo uploads.

This means the architecture should prioritize fast feed loading and efficient delivery of frequently accessed photos. A CDN and cache can reduce repeated work, while a database read replica can handle additional read traffic. Uploads and thumbnail generation can be processed asynchronously where appropriate so that photo processing does not slow down feed requests.

## 4. Why photos should not be stored inside the database

Photos should be stored in **object storage**, such as Amazon S3, Azure Blob Storage, or a compatible object-storage service, rather than directly inside the relational database.

Storing large image files in the database increases database size, backup and restore times, and storage costs. It can also compete with important database operations, such as retrieving user profiles and feed metadata.

The database should store the photo's metadata, including the photo ID, owner ID, caption, upload time, object-storage key, and thumbnail key. The actual image files should reside in object storage, where they can be stored durably and delivered efficiently through a CDN.

## 5. Architecture diagram

```text
                  +----------------------+
                  |      Users / App     |
                  +----------+-----------+
                             |
                   +---------v---------+
                   |        CDN        |
                   | Cached photos and |
                   | thumbnails        |
                   +---------+---------+
                             |
                      API / Feed requests
                             |
                   +---------v---------+
                   |   Load Balancer    |
                   +---------+---------+
                             |
                 +-----------+-----------+
                 |                       |
          +------v------+         +------v------+
          | App Server 1|         | App Server 2|
          +------+------+         +------+------+
                 |                       |
                 +-----------+-----------+
                             |
                +------------+------------+
                |                         |
         +------v------+           +------v------+
         | Cache       |           | Primary DB  |
         | Redis       |           | Metadata    |
         +-------------+           +------+------+
                                          |
                                   Replication
                                          |
                                   +------v------+
                                   | Read Replica|
                                   +-------------+

 PHOTO UPLOAD AND THUMBNAIL PROCESSING

          Users / App
               |
               v
          App Servers
               |
               v
       +----------------+
       | Object Storage |
       | Original photo |
       +-------+--------+
               |
               v
       +----------------+
       | Message Queue  |
       +-------+--------+
               |
               v
       +----------------+
       | Thumbnail      |
       | Worker         |
       +-------+--------+
               |
               v
       +----------------+
       | Object Storage |
       | Thumbnail      |
       +-------+--------+
               |
               v
              CDN
```

The diagram is a simplified logical architecture. In a production implementation, the queue may receive a storage event or a job message after a successful upload, and the application records the relevant object keys in the database.

## 6. What each component does

1. **Users / App:** Allows users to upload photos, follow other users, and browse their photo feeds.
2. **CDN:** Delivers cached photos and thumbnails from locations closer to users, reducing latency and load on the origin storage.
3. **Load Balancer:** Distributes incoming API requests across available application servers to prevent a single server from becoming a bottleneck.
4. **App Servers:** Authenticate users, validate requests, manage uploads, retrieve feed data, and coordinate interactions with the database and other services.
5. **Cache (Redis):** Stores frequently requested feed data and metadata to reduce repeated database queries and improve response times.
6. **Primary Database:** Stores authoritative application data, including users, follows, photo metadata, captions, and object-storage keys.
7. **Database Read Replica:** Handles suitable read queries to reduce read load on the primary database, while the primary remains responsible for writes.
8. **Object Storage:** Stores the original photos and generated thumbnails durably without filling the relational database with large binary files.
9. **Message Queue:** Holds thumbnail-generation jobs so that photo processing can happen asynchronously and be retried when necessary.
10. **Thumbnail Worker:** Consumes queued jobs, resizes uploaded originals into smaller thumbnails, and stores the resulting files in object storage.

## 7. Step-by-step photo upload flow

1. **User selects a photo:** The user chooses a photo and submits it through the SnapShare application.
2. **Request reaches an app server:** The load balancer routes the request to an available application server.
3. **Authentication and validation:** The server checks the user's identity, upload permissions, file type, file size, and other applicable restrictions.
4. **Prepare the upload:** The application creates a photo record or pending-upload record and provides a secure, time-limited upload URL for object storage.
5. **Upload the original:** The application sends the photo directly to object storage using the upload URL, avoiding the need to route the entire file through the app server.
6. **Confirm the upload:** After the original photo is stored successfully, the application updates the photo metadata and records the object's storage key.
7. **Queue thumbnail generation:** A thumbnail-generation job is added to the message queue, identifying the uploaded photo and its storage location.
8. **Process the job:** A worker retrieves the job, reads the original photo, generates a 50 KB thumbnail target, and saves the thumbnail in object storage. The actual output size may vary depending on the image and compression settings.
9. **Update photo status:** The worker or application updates the metadata to indicate that the thumbnail is ready, allowing the feed to use it.
10. **Deliver the photo:** The CDN serves the thumbnail or original photo when requested. If a requested image is not cached, the CDN retrieves it from object storage and may cache it for later requests.

The queue allows the user to finish uploading without waiting for thumbnail processing to complete. The application should also handle failed uploads and thumbnail jobs through retries and clear status reporting.

## 8. Trade-offs

### Trade-off 1: CDN caching versus freshness

**Benefit:** Caching photos and thumbnails reduces latency, bandwidth costs, and requests reaching object storage.

**Cost:** Cached content can become stale or remain available after a photo is updated or deleted unless the system uses cache invalidation, versioned URLs, and suitable cache policies.

### Trade-off 2: Database read replicas versus consistency

**Benefit:** Read replicas can serve feed and metadata queries, allowing the primary database to focus on writes.

**Cost:** Replication can lag behind the primary database. A newly uploaded photo or recently changed caption might not appear immediately in queries served by a replica. Critical read-after-write requests may need to use the primary database.

### Trade-off 3: Asynchronous thumbnail generation versus immediate availability

**Benefit:** A queue and worker prevent image resizing from slowing down the upload request and allow processing to scale independently.

**Cost:** Thumbnails are not immediately available after an upload, and jobs may fail or be delayed. The application needs retries, monitoring, and a temporary placeholder or original-image fallback.

### Trade-off 4: Direct object-storage uploads versus implementation complexity

**Benefit:** Uploading directly to object storage reduces bandwidth and processing pressure on application servers.

**Cost:** Secure upload URLs, upload confirmation, incomplete-upload cleanup, and error handling add implementation complexity.

## 9. Conclusion

SnapShare has one million daily active users, approximately 11.57 photo uploads per second on average, 579 feed views per second on average, and an estimated peak of 2,894 feed views per second. Original photos and thumbnails require approximately 748.25 TB of additional storage per year under the stated assumptions.

Because the system is read-heavy, the design prioritizes CDN delivery, caching, load balancing, and database read replicas. Object storage handles the large image files, while a queue and thumbnail worker process images asynchronously. This architecture supports independent scaling of photo delivery, metadata access, uploads, and image processing.
