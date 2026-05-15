---
name: encore-go-bucket
description: Store unstructured files in Encore Go using `objects.NewBucket` from `encore.dev/storage/objects` — uploads, images, documents, blobs.
when_to_use: >-
  User wants to upload, download, list, or delete files from an Encore Go service — profile pictures, avatars, document uploads, image storage, media assets, generated reports, blob data. Covers public vs private buckets, signed upload/download URLs, bucket references with permission types (Uploader, Downloader, Lister, Attrser, Remover), and operations like `Upload`, `Download`, `List`, `SignedUploadURL`. Trigger phrases: "object storage", "bucket", "S3", "GCS", "blob", "user uploads", "profile picture", "image upload", "store a file", "file storage".
---

# Encore Go Object Storage

## Instructions

A `Bucket` is a logical store for files. Encore provisions the underlying object storage (S3 on AWS, GCS on GCP, in-memory locally). Declare buckets as package-level variables.

```go
package uploads

import "encore.dev/storage/objects"

// Private bucket (default)
var Uploads = objects.NewBucket("user-uploads", objects.BucketConfig{})

// Public bucket — files accessible via public URL
var PublicAssets = objects.NewBucket("public-assets", objects.BucketConfig{
    Public: true,
})
```

## Operations

```go
import (
    "fmt"
    "io"
)

// Upload (streaming pattern)
writer := Uploads.Upload(ctx, "path/to/file.jpg")
_, err := io.Copy(writer, dataReader)
if err != nil {
    writer.Abort()
    return err
}
err = writer.Close()

// Download
reader := Uploads.Download(ctx, "path/to/file.jpg")
if err := reader.Err(); err != nil {
    return err
}
defer reader.Close()
data, _ := io.ReadAll(reader)

// Existence check
exists, err := Uploads.Exists(ctx, "path/to/file.jpg")

// Attributes (size, content type, ETag)
attrs, err := Uploads.Attrs(ctx, "path/to/file.jpg")

// List
for err, entry := range Uploads.List(ctx, &objects.Query{}) {
    if err != nil {
        return err
    }
    fmt.Println(entry.Key, entry.Size)
}

// Delete
err := Uploads.Remove(ctx, "path/to/file.jpg")

// Public URL (only for public buckets)
url := PublicAssets.PublicURL("image.jpg")
```

## Signed URLs

Generate temporary URLs so clients can upload/download directly without going through your service:

```go
import "time"

// Signed upload URL (expires in 2 hours)
url, err := Uploads.SignedUploadURL(ctx, "user-uploads/avatar.jpg",
    objects.WithTTL(time.Duration(7200)*time.Second))

// Signed download URL
url, err := Uploads.SignedDownloadURL(ctx, "documents/report.pdf",
    objects.WithTTL(time.Duration(7200)*time.Second))
```

## Bucket References

Pass bucket access to library code with a specific permission set:

```go
// Create a reference with download permission only
ref := objects.BucketRef[objects.Downloader](Uploads)

// Combine permissions via an interface
type myPerms interface {
    objects.Downloader
    objects.Uploader
}
ref := objects.BucketRef[myPerms](Uploads)

// Permission types: Downloader, Uploader, Lister, Attrser, Remover,
// SignedDownloader, SignedUploader, ReadWriter
```

## Guidelines

- Declare buckets as package-level variables.
- Default to private buckets; opt into `Public: true` only for assets meant for unauthenticated download.
- Use signed URLs for browser uploads/downloads instead of streaming through your service.
- Use bucket references when passing access to helpers — they encode the permission contract in the type system.
