---
name: encore-bucket
description: Store unstructured files in Encore.ts using `Bucket` from `encore.dev/storage/objects` — uploads, images, documents, blobs.
when_to_use: >-
  User wants to upload, download, list, or delete files — profile pictures, avatars, document uploads, image storage, media assets, generated reports, blob data. Covers public vs private buckets, signed upload/download URLs, bucket references with permission types (Uploader, Downloader, Lister, Attrser, Remover), and operations like `upload()`, `download()`, `list()`, `signedUploadUrl()`. Trigger phrases: "object storage", "bucket", "S3", "GCS", "blob", "user uploads", "profile picture", "image upload", "store a file", "file storage".
---

# Encore Object Storage

## Instructions

A `Bucket` is a logical store for files. Encore provisions the underlying object storage (S3 on AWS, GCS on GCP, in-memory locally). Declare buckets at package level.

```typescript
import { Bucket } from "encore.dev/storage/objects";

// Private bucket (default)
export const uploads = new Bucket("user-uploads", {
  versioned: false,  // Set to true to keep multiple versions
});

// Public bucket — files accessible via public URL
export const publicAssets = new Bucket("public-assets", {
  public: true,
  versioned: false,
});
```

## Operations

```typescript
// Upload
const attrs = await uploads.upload("path/to/file.jpg", buffer, {
  contentType: "image/jpeg",
});

// Download
const data = await uploads.download("path/to/file.jpg");

// Existence check
const exists = await uploads.exists("path/to/file.jpg");

// Attributes (size, content type, ETag)
const meta = await uploads.attrs("path/to/file.jpg");

// Delete
await uploads.remove("path/to/file.jpg");

// List
for await (const entry of uploads.list({})) {
  console.log(entry.key, entry.size);
}

// Public URL (only for public buckets)
const url = publicAssets.publicUrl("image.jpg");
```

## Signed URLs

Generate temporary URLs so clients can upload/download directly without going through your service:

```typescript
const uploadUrl = await uploads.signedUploadUrl("user-uploads/avatar.jpg", { ttl: 7200 });
const downloadUrl = await uploads.signedDownloadUrl("documents/report.pdf", { ttl: 7200 });
```

## Bucket References

Pass bucket access to other code with a specific permission set:

```typescript
import { Uploader, Downloader } from "encore.dev/storage/objects";

const uploaderRef = uploads.ref<Uploader>();
const downloaderRef = uploads.ref<Downloader>();

// Permission types: Downloader, Uploader, Lister, Attrser, Remover,
// SignedDownloader, SignedUploader, ReadWriter
```

## Errors

- `ObjectNotFound` — object doesn't exist
- `PreconditionFailed` — upload preconditions not met (e.g. `setIfNotExists`)
- `ObjectsError` — base error type

## Guidelines

- Declare buckets at package level.
- Default to private buckets; opt into `public: true` only for assets meant for unauthenticated download.
- Use signed URLs for browser uploads/downloads instead of streaming through your service.
- Use bucket references when passing access to helpers — they encode the permission contract in the type system.
