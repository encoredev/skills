---
name: encore-go-database
description: Database queries and migrations with Encore Go.
---

# Encore Go Database Operations

## Instructions

### Database Setup

```go
package user

import "encore.dev/storage/sqldb"

var db = sqldb.NewDatabase("userdb", sqldb.DatabaseConfig{
    Migrations: "./migrations",
})
```

## Query Methods

Encore's database API mirrors Go's standard `database/sql` package. Use `.Scan()` to read query results into variables.

### `Query` - Multiple Rows

```go
type User struct {
    ID    string
    Email string
    Name  string
}

func listActiveUsers(ctx context.Context) ([]*User, error) {
    rows, err := db.Query(ctx, `
        SELECT id, email, name FROM users WHERE active = true
    `)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var users []*User
    for rows.Next() {
        var u User
        if err := rows.Scan(&u.ID, &u.Email, &u.Name); err != nil {
            return nil, err
        }
        users = append(users, &u)
    }
    return users, rows.Err()
}
```

### `QueryRow` - Single Row

```go
func getUser(ctx context.Context, id string) (*User, error) {
    var u User
    err := db.QueryRow(ctx, `
        SELECT id, email, name FROM users WHERE id = $1
    `, id).Scan(&u.ID, &u.Email, &u.Name)

    if errors.Is(err, sqldb.ErrNoRows) {
        return nil, &errs.Error{
            Code:    errs.NotFound,
            Message: "user not found",
        }
    }
    if err != nil {
        return nil, err
    }
    return &u, nil
}
```

### `Exec` - No Return Value

For INSERT, UPDATE, DELETE operations:

```go
func createUser(ctx context.Context, email, name string) error {
    _, err := db.Exec(ctx, `
        INSERT INTO users (id, email, name)
        VALUES ($1, $2, $3)
    `, generateID(), email, name)
    return err
}

func updateUser(ctx context.Context, id, name string) error {
    _, err := db.Exec(ctx, `
        UPDATE users SET name = $1 WHERE id = $2
    `, name, id)
    return err
}

func deleteUser(ctx context.Context, id string) error {
    _, err := db.Exec(ctx, `
        DELETE FROM users WHERE id = $1
    `, id)
    return err
}
```

## Migrations

### File Structure

```
user/
└── migrations/
    ├── 1_create_users.up.sql
    ├── 2_add_posts.up.sql
    └── 3_add_indexes.up.sql
```

### Naming Convention

- Start with a number (1, 2, etc.)
- Followed by underscore and description
- End with `.up.sql`
- Numbers must be sequential

### Example Migration

```sql
-- migrations/1_create_users.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
```

## Transactions

```go
func transferFunds(ctx context.Context, fromID, toID string, amount int) error {
    tx, err := db.Begin(ctx)
    if err != nil {
        return err
    }
    defer tx.Rollback()  // No-op if committed
    
    _, err = tx.Exec(ctx, `
        UPDATE accounts SET balance = balance - $1 WHERE id = $2
    `, amount, fromID)
    if err != nil {
        return err
    }
    
    _, err = tx.Exec(ctx, `
        UPDATE accounts SET balance = balance + $1 WHERE id = $2
    `, amount, toID)
    if err != nil {
        return err
    }
    
    return tx.Commit()
}
```

## Using Scan

The `Scan` method reads columns from query results into variables. Columns are mapped by position, not by name - the order of arguments to `Scan` must match the order of columns in your SELECT statement.

```go
type User struct {
    ID        string
    Email     string
    Name      string
    CreatedAt time.Time
}

// Single row with QueryRow
func getUser(ctx context.Context, id string) (*User, error) {
    var u User
    err := db.QueryRow(ctx, `
        SELECT id, email, name, created_at FROM users WHERE id = $1
    `, id).Scan(&u.ID, &u.Email, &u.Name, &u.CreatedAt)
    if err != nil {
        return nil, err
    }
    return &u, nil
}

// You can also scan into an inline struct
func getItem(ctx context.Context, id int64) error {
    var item struct {
        ID    int64
        Title string
        Done  bool
    }
    err := db.QueryRow(ctx, `
        SELECT id, title, done FROM items WHERE id = $1
    `, id).Scan(&item.ID, &item.Title, &item.Done)
    return err
}
```

## SQL Injection Protection

Always use parameterized queries:

```go
// SAFE - values are parameterized
var u User
err := db.QueryRow(ctx, `
    SELECT id, email, name FROM users WHERE email = $1
`, email).Scan(&u.ID, &u.Email, &u.Name)

// WRONG - SQL injection risk
query := fmt.Sprintf("SELECT * FROM users WHERE email = '%s'", email)
```

## Error Handling

```go
import (
    "errors"
    "encore.dev/storage/sqldb"
    "encore.dev/beta/errs"
)

func getUser(ctx context.Context, id string) (*User, error) {
    var u User
    err := db.QueryRow(ctx, `
        SELECT id, email, name FROM users WHERE id = $1
    `, id).Scan(&u.ID, &u.Email, &u.Name)

    if errors.Is(err, sqldb.ErrNoRows) {
        return nil, &errs.Error{
            Code:    errs.NotFound,
            Message: "user not found",
        }
    }
    if err != nil {
        return nil, err
    }
    return &u, nil
}
```

## Guidelines

- Always use parameterized queries (`$1`, `$2`, etc.)
- Use `Scan` to read query results - columns are mapped by position
- Check for `sqldb.ErrNoRows` when expecting a single row
- Migrations are applied automatically on startup
- Database names should be lowercase, descriptive
- Each service typically has its own database
- Use transactions for operations that must be atomic
