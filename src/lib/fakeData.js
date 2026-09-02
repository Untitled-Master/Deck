// Centralized realistic fake data — used as offline fallback when not connected to Postgres
// All tables share consistent IDs and foreign keys so the app feels like a real app

export const FAKE_USERS = [
  { _id: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", name: "Alice Johnson", email: "alice.johnson@example.com", role: "admin", createdAt: "2024-03-12T09:12:33.000Z", premiumStatus: "active", premiumCode: "ALICE-2024", avatar: "https://i.pravatar.cc/150?img=5" },
  { _id: "usr_02H8K9Q3B4G6H7J8K9L0M1N3A", name: "Bob Smith", email: "bob.smith@example.com", role: "member", createdAt: "2024-03-15T14:22:10.000Z", premiumStatus: "inactive", premiumCode: null, avatar: "https://i.pravatar.cc/150?img=8" },
  { _id: "usr_03H8K9Q4C5H7I8J9K9L0M1N4B", name: "Carol Williams", email: "carol.williams@example.com", role: "member", createdAt: "2024-04-02T11:05:44.000Z", premiumStatus: "active", premiumCode: "CAROL-PLUS", avatar: "https://i.pravatar.cc/150?img=9" },
  { _id: "usr_04H8K9Q5D6I8J9K9L0M1N5C", name: "David Brown", email: "david.brown@example.com", role: "editor", createdAt: "2024-04-18T16:33:21.000Z", premiumStatus: "trialing", premiumCode: "DAVID-TRIAL", avatar: "https://i.pravatar.cc/150?img=12" },
  { _id: "usr_05H8K9Q6E7J9K9L0M1N6D", name: "Emma Davis", email: "emma.davis@example.com", role: "member", createdAt: "2024-05-06T10:26:59.000Z", premiumStatus: "active", premiumCode: "EMMA-2024", avatar: "https://i.pravatar.cc/150?img=16" },
  { _id: "usr_06H8K9Q7F8K9L0M1N7E", name: "Frank Miller", email: "frank.miller@example.com", role: "member", createdAt: "2024-05-20T08:41:12.000Z", premiumStatus: "inactive", premiumCode: null, avatar: "https://i.pravatar.cc/150?img=15" },
]

export const FAKE_PRODUCTS = [
  { id: 1, name: "Deck Pro License", price: "99.00", stock: 124, category: "license", createdAt: "2024-01-10T10:00:00.000Z" },
  { id: 2, name: "Deck Team (5 seats)", price: "299.00", stock: 56, category: "license", createdAt: "2024-01-15T10:00:00.000Z" },
  { id: 3, name: "MacBook Pro 16\" M3", price: "2499.00", stock: 8, category: "hardware", createdAt: "2024-02-01T09:00:00.000Z" },
  { id: 4, name: "iPhone 15 Pro", price: "999.00", stock: 24, category: "hardware", createdAt: "2024-02-10T09:00:00.000Z" },
  { id: 5, name: "AirPods Pro (2nd gen)", price: "249.00", stock: 42, category: "hardware", createdAt: "2024-02-12T09:00:00.000Z" },
  { id: 6, name: "Kindle Paperwhite", price: "149.00", stock: 30, category: "hardware", createdAt: "2024-02-20T09:00:00.000Z" },
  { id: 7, name: "Support Plan — Priority", price: "49.00", stock: 999, category: "service", createdAt: "2024-03-01T10:00:00.000Z" },
  { id: 8, name: "Sony WH-1000XM5", price: "399.00", stock: 18, category: "hardware", createdAt: "2024-03-05T09:00:00.000Z" },
]

export const FAKE_ORDERS = [
  { id: 101, user_id: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", product_id: 1, quantity: 1, total: "99.00", status: "completed", createdAt: "2024-05-20T10:12:00.000Z" },
  { id: 102, user_id: "usr_05H8K9Q6E7J9K9L0M1N6D", product_id: 3, quantity: 1, total: "2499.00", status: "completed", createdAt: "2024-05-21T14:22:00.000Z" },
  { id: 103, user_id: "usr_03H8K9Q4C5H7I8J9K9L0M1N4B", product_id: 5, quantity: 1, total: "249.00", status: "shipped", createdAt: "2024-05-22T09:05:00.000Z" },
  { id: 104, user_id: "usr_02H8K9Q3B4G6H7J8K9L0M1N3A", product_id: 2, quantity: 1, total: "299.00", status: "completed", createdAt: "2024-05-23T11:30:00.000Z" },
  { id: 105, user_id: "usr_04H8K9Q5D6I8J9K9L0M1N5C", product_id: 8, quantity: 1, total: "399.00", status: "processing", createdAt: "2024-05-24T16:45:00.000Z" },
  { id: 106, user_id: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", product_id: 7, quantity: 1, total: "49.00", status: "completed", createdAt: "2024-05-25T08:20:00.000Z" },
  { id: 107, user_id: "usr_06H8K9Q7F8K9L0M1N7E", product_id: 4, quantity: 1, total: "999.00", status: "completed", createdAt: "2024-05-26T19:10:00.000Z" },
  { id: 108, user_id: "usr_05H8K9Q6E7J9K9L0M1N6D", product_id: 6, quantity: 2, total: "298.00", status: "shipped", createdAt: "2024-05-27T12:00:00.000Z" },
]

export const FAKE_FAVORITES = [
  { _id: "fav_01H8K9A1B2C3D4E5F6G7H8I9J0", userId: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", tmdbId: 680, title: "Pulp Fiction", mediaType: "movie", posterPath: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", addedAt: "2024-05-08T19:59:34.000Z", _creationTime: 1715183974000 },
  { _id: "fav_02H8K9B2C3D4E5F6G7H8I9J1K", userId: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", tmdbId: 64688, title: "21 Jump Street", mediaType: "movie", posterPath: "/8v3Sqv9UcIUC4ebmpM2a3P9W0s2.jpg", addedAt: "2024-05-08T19:48:55.000Z", _creationTime: 1715183935000 },
  { _id: "fav_03H8K9C3D4E5F6G7H8I9J2K1", userId: "usr_03H8K9Q4C5H7I8J9K9L0M1N4B", tmdbId: 27205, title: "Inception", mediaType: "movie", posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", addedAt: "2024-05-07T20:08:26.000Z", _creationTime: 1715096906000 },
  { _id: "fav_04H8K9D4E5F6G7H8I9J3K2M", userId: "usr_03H8K9Q4C5H7I8J9K9L0M1N4B", tmdbId: 603, title: "The Matrix", mediaType: "movie", posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", addedAt: "2024-05-07T18:12:00.000Z", _creationTime: 1715090000000 },
  { _id: "fav_05H8K9E5F6G7H8I9J4K3N4", userId: "usr_05H8K9Q6E7J9K9L0M1N6D", tmdbId: 37680, title: "Suits", mediaType: "tv", posterPath: "/vQWk5YBFWF4bZaofA8v3Y3xR1.jpg", addedAt: "2024-05-06T22:57:53.000Z", _creationTime: 1715021873000 },
  { _id: "fav_06H8K9F6G7H8I9J5K4L5M6", userId: "usr_05H8K9Q6E7J9K9L0M1N6D", tmdbId: 1399, title: "Game of Thrones", mediaType: "tv", posterPath: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg", addedAt: "2024-05-06T22:46:14.000Z", _creationTime: 1715021174000 },
  { _id: "fav_07H8K9G7H8I9J6K5L6M7N8", userId: "usr_02H8K9Q3B4G6H7J8K9L0M1N3A", tmdbId: 155, title: "The Dark Knight", mediaType: "movie", posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", addedAt: "2024-05-05T14:22:10.000Z", _creationTime: 1714914130000 },
  { _id: "fav_08H8K9H8I9J7K6L7M8N9O0", userId: "usr_04H8K9Q5D6I8J9K9L0M1N5C", tmdbId: 120, title: "The Lord of the Rings: The Fellowship of the Ring", mediaType: "movie", posterPath: "/6oom5QYQ2yQTMJIbnvbkBL9cHo6.jpg", addedAt: "2024-05-04T09:10:00.000Z", _creationTime: 1714810000000 },
]

export const FAKE_WATCH_HISTORY = [
  { _id: "wh_01H8K9A1B2C3D4E5F6G7H8I9J0", userId: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", tmdbId: 680, title: "Pulp Fiction", mediaType: "movie", progress: 100, duration: 154, watchedAt: "2024-05-18T21:30:00.000Z", status: "completed" },
  { _id: "wh_02H8K9B2C3D4E5F6G7H8I9J1K", userId: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", tmdbId: 27205, title: "Inception", mediaType: "movie", progress: 45, duration: 148, watchedAt: "2024-05-19T20:10:00.000Z", status: "watching" },
  { _id: "wh_03H8K9C3D4E5F6G7H8I9J2K1", userId: "usr_05H8K9Q6E7J9K9L0M1N6D", tmdbId: 37680, title: "Suits", mediaType: "tv", progress: 78, duration: 42, season: 1, episode: 5, watchedAt: "2024-05-20T19:00:00.000Z", status: "watching" },
  { _id: "wh_04H8K9D4E5F6G7H8I9J3K2M", userId: "usr_03H8K9Q4C5H7I8J9K9L0M1N4B", tmdbId: 1399, title: "Game of Thrones", mediaType: "tv", progress: 100, duration: 57, season: 3, episode: 9, watchedAt: "2024-05-21T22:15:00.000Z", status: "completed" },
  { _id: "wh_05H8K9E5F6G7H8I9J4K3N4", userId: "usr_02H8K9Q3B4G6H7J8K9L0M1N3A", tmdbId: 155, title: "The Dark Knight", mediaType: "movie", progress: 100, duration: 152, watchedAt: "2024-05-22T21:00:00.000Z", status: "completed" },
]

export const FAKE_WATCHLISTS = [
  { _id: "wl_01H8K9A1B2C3D4E5F6G7H8I9J0", userId: "usr_01H8K9Q2A3F5D6G7J8K9L0M1N2", tmdbId: 27205, title: "Inception", mediaType: "movie", posterPath: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg", status: "planned", addedAt: "2024-05-10T10:00:00.000Z" },
  { _id: "wl_02H8K9B2C3D4E5F6G7H8I9J1K", userId: "usr_03H8K9Q4C5H7I8J9K9L0M1N4B", tmdbId: 603, title: "The Matrix", mediaType: "movie", posterPath: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", status: "planned", addedAt: "2024-05-11T10:00:00.000Z" },
  { _id: "wl_03H8K9C3D4E5F6G7H8I9J2K1", userId: "usr_05H8K9Q6E7J9K9L0M1N6D", tmdbId: 155, title: "The Dark Knight", mediaType: "movie", posterPath: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", status: "watching", addedAt: "2024-05-12T10:00:00.000Z" },
]

export const FAKE_TEST = [
  { id: 1, name: "alpha", value: 100, description: "Baseline sample", createdAt: "2024-01-01T08:00:00.000Z" },
  { id: 2, name: "beta", value: 210, description: "Second sample", createdAt: "2024-01-02T08:00:00.000Z" },
  { id: 3, name: "gamma", value: 333, description: "Stress sample", createdAt: "2024-01-03T08:00:00.000Z" },
  { id: 4, name: "delta", value: 480, description: "Final sample", createdAt: "2024-01-04T08:00:00.000Z" },
]

// Mapped for DataGrid
export const FAKE_ROWS = {
  users: FAKE_USERS,
  favorites: FAKE_FAVORITES,
  watchHistory: FAKE_WATCH_HISTORY,
  watchlists: FAKE_WATCHLISTS,
  products: FAKE_PRODUCTS,
  orders: FAKE_ORDERS,
  test: FAKE_TEST,
}

// For Sidebar / tables list
export const FAKE_TABLES = [
  { name: "favorites", rows: FAKE_FAVORITES.length, type: "table" },
  { name: "orders", rows: FAKE_ORDERS.length, type: "table" },
  { name: "products", rows: FAKE_PRODUCTS.length, type: "table" },
  { name: "test", rows: FAKE_TEST.length, type: "table" },
  { name: "users", rows: FAKE_USERS.length, type: "table" },
  { name: "watchHistory", rows: FAKE_WATCH_HISTORY.length, type: "table" },
  { name: "watchlists", rows: FAKE_WATCHLISTS.length, type: "table" },
]

// For useApiTables hook
export const FAKE_API_TABLES = [
  { name: "favorites", columns: ["_id", "userId", "tmdbId", "title", "mediaType", "posterPath", "addedAt"] },
  { name: "orders", columns: ["id", "user_id", "product_id", "quantity", "total", "status", "createdAt"] },
  { name: "products", columns: ["id", "name", "price", "stock", "category", "createdAt"] },
  { name: "test", columns: ["id", "name", "value", "description", "createdAt"] },
  { name: "users", columns: ["_id", "name", "email", "role", "createdAt", "premiumStatus"] },
  { name: "watchHistory", columns: ["_id", "userId", "tmdbId", "title", "mediaType", "progress", "watchedAt"] },
  { name: "watchlists", columns: ["_id", "userId", "tmdbId", "title", "mediaType", "status", "addedAt"] },
]

// For StructureView
export const FAKE_STRUCTURE = {
  favorites: [
    { column: "_id", type: "text", isPrimary: true, nullable: false },
    { column: "userId", type: "text", isPrimary: false, nullable: false, isForeign: true, foreignTable: "users", foreignColumn: "_id" },
    { column: "tmdbId", type: "integer", isPrimary: false, nullable: false },
    { column: "title", type: "text", isPrimary: false, nullable: false },
    { column: "mediaType", type: "text", isPrimary: false, nullable: false },
    { column: "posterPath", type: "text", isPrimary: false, nullable: true },
    { column: "addedAt", type: "timestamptz", isPrimary: false, nullable: false },
    { column: "_creationTime", type: "bigint", isPrimary: false, nullable: false },
  ],
  users: [
    { column: "_id", type: "text", isPrimary: true, nullable: false },
    { column: "name", type: "text", isPrimary: false, nullable: false },
    { column: "email", type: "text", isPrimary: false, nullable: false, isUnique: true },
    { column: "role", type: "text", isPrimary: false, nullable: false },
    { column: "createdAt", type: "timestamptz", isPrimary: false, nullable: false },
    { column: "premiumStatus", type: "text", isPrimary: false, nullable: true },
    { column: "premiumCode", type: "text", isPrimary: false, nullable: true },
    { column: "avatar", type: "text", isPrimary: false, nullable: true },
  ],
  watchHistory: [
    { column: "_id", type: "text", isPrimary: true, nullable: false },
    { column: "userId", type: "text", isPrimary: false, nullable: false, isForeign: true, foreignTable: "users", foreignColumn: "_id" },
    { column: "tmdbId", type: "integer", isPrimary: false, nullable: false },
    { column: "title", type: "text", isPrimary: false, nullable: false },
    { column: "mediaType", type: "text", isPrimary: false, nullable: false },
    { column: "progress", type: "integer", isPrimary: false, nullable: false },
    { column: "duration", type: "integer", isPrimary: false, nullable: true },
    { column: "watchedAt", type: "timestamptz", isPrimary: false, nullable: false },
    { column: "status", type: "text", isPrimary: false, nullable: false },
  ],
  watchlists: [
    { column: "_id", type: "text", isPrimary: true, nullable: false },
    { column: "userId", type: "text", isPrimary: false, nullable: false, isForeign: true, foreignTable: "users", foreignColumn: "_id" },
    { column: "tmdbId", type: "integer", isPrimary: false, nullable: false },
    { column: "title", type: "text", isPrimary: false, nullable: false },
    { column: "mediaType", type: "text", isPrimary: false, nullable: false },
    { column: "posterPath", type: "text", isPrimary: false, nullable: true },
    { column: "status", type: "text", isPrimary: false, nullable: false },
    { column: "addedAt", type: "timestamptz", isPrimary: false, nullable: false },
  ],
  products: [
    { column: "id", type: "integer", isPrimary: true, nullable: false },
    { column: "name", type: "text", isPrimary: false, nullable: false },
    { column: "price", type: "numeric", isPrimary: false, nullable: false },
    { column: "stock", type: "integer", isPrimary: false, nullable: false },
    { column: "category", type: "text", isPrimary: false, nullable: false },
    { column: "createdAt", type: "timestamptz", isPrimary: false, nullable: false },
  ],
  orders: [
    { column: "id", type: "integer", isPrimary: true, nullable: false },
    { column: "user_id", type: "text", isPrimary: false, nullable: false, isForeign: true, foreignTable: "users", foreignColumn: "_id" },
    { column: "product_id", type: "integer", isPrimary: false, nullable: false, isForeign: true, foreignTable: "products", foreignColumn: "id" },
    { column: "quantity", type: "integer", isPrimary: false, nullable: false },
    { column: "total", type: "numeric", isPrimary: false, nullable: false },
    { column: "status", type: "text", isPrimary: false, nullable: false },
    { column: "createdAt", type: "timestamptz", isPrimary: false, nullable: false },
  ],
  test: [
    { column: "id", type: "integer", isPrimary: true, nullable: false },
    { column: "name", type: "text", isPrimary: false, nullable: false },
    { column: "value", type: "integer", isPrimary: false, nullable: false },
    { column: "description", type: "text", isPrimary: false, nullable: true },
    { column: "createdAt", type: "timestamptz", isPrimary: false, nullable: false },
  ],
}

// For RelationsView
export const FAKE_RELATIONS = {
  favorites: { outgoing: [{ column: "userId", foreignTable: "users", foreignColumn: "_id", constraintName: "favorites_userId_fkey" }], incoming: [] },
  watchHistory: { outgoing: [{ column: "userId", foreignTable: "users", foreignColumn: "_id", constraintName: "watchHistory_userId_fkey" }], incoming: [] },
  watchlists: { outgoing: [{ column: "userId", foreignTable: "users", foreignColumn: "_id", constraintName: "watchlists_userId_fkey" }], incoming: [] },
  users: { outgoing: [], incoming: [{ table: "favorites", column: "userId", foreignColumn: "_id", constraintName: "favorites_userId_fkey" }, { table: "watchHistory", column: "userId", foreignColumn: "_id", constraintName: "watchHistory_userId_fkey" }, { table: "watchlists", column: "userId", foreignColumn: "_id", constraintName: "watchlists_userId_fkey" }, { table: "orders", column: "user_id", foreignColumn: "_id", constraintName: "orders_user_id_fkey" }] },
  products: { outgoing: [], incoming: [{ table: "orders", column: "product_id", foreignColumn: "id", constraintName: "orders_product_id_fkey" }] },
  orders: { outgoing: [{ column: "user_id", foreignTable: "users", foreignColumn: "_id", constraintName: "orders_user_id_fkey" }, { column: "product_id", foreignTable: "products", foreignColumn: "id", constraintName: "orders_product_id_fkey" }], incoming: [] },
  test: { outgoing: [], incoming: [] },
}

// For SqlEditor hover
export const FAKE_HOVER_SCHEMAS = [
  { name: "favorites", columns: FAKE_STRUCTURE.favorites.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, isFK: !!c.isForeign })) },
  { name: "users", columns: FAKE_STRUCTURE.users.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, isUnique: !!c.isUnique, isFK: !!c.isForeign })) },
  { name: "watchHistory", columns: FAKE_STRUCTURE.watchHistory.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, isFK: !!c.isForeign })) },
  { name: "watchlists", columns: FAKE_STRUCTURE.watchlists.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, isFK: !!c.isForeign })) },
  { name: "orders", columns: FAKE_STRUCTURE.orders.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, foreignKey: c.isForeign ? { foreign_table: c.foreignTable, foreign_column: c.foreignColumn } : null })) },
  { name: "products", columns: FAKE_STRUCTURE.products.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary })) },
  { name: "test", columns: FAKE_STRUCTURE.test.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary })) },
]

// For SchemaPage
export const FAKE_SCHEMA = {
  tables: [
    {
      name: "favorites",
      columns: FAKE_STRUCTURE.favorites.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary })),
      indexes: ["by_user: userId, _creationTime", "by_user_media: userId, tmdbId"],
      pos: { x: 760, y: 260 },
    },
    {
      name: "orders",
      columns: FAKE_STRUCTURE.orders.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, isFK: !!c.isForeign })),
      indexes: ["by_user: user_id, createdAt"],
      pos: { x: 280, y: 40 },
    },
    {
      name: "products",
      columns: FAKE_STRUCTURE.products.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary })),
      indexes: ["by_category: category"],
      pos: { x: 520, y: 40 },
    },
    {
      name: "test",
      columns: FAKE_STRUCTURE.test.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary })),
      indexes: [],
      pos: { x: 100, y: 100 },
    },
    {
      name: "users",
      columns: FAKE_STRUCTURE.users.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary })),
      indexes: ["by_email: email", "by_role: role"],
      pos: { x: 520, y: 520 },
    },
    {
      name: "watchHistory",
      columns: FAKE_STRUCTURE.watchHistory.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, isFK: !!c.isForeign })),
      indexes: ["by_user: userId, watchedAt", "by_status: status"],
      pos: { x: 520, y: 40 },
    },
    {
      name: "watchlists",
      columns: FAKE_STRUCTURE.watchlists.map(c => ({ column: c.column, type: c.type, isPrimary: !!c.isPrimary, isFK: !!c.isForeign })),
      indexes: ["by_user: userId, addedAt", "by_user_status: userId, status"],
      pos: { x: 280, y: 220 },
    },
  ],
  relations: [
    { from: "favorites", fromCol: "userId", to: "users", toCol: "_id" },
    { from: "watchHistory", fromCol: "userId", to: "users", toCol: "_id" },
    { from: "watchlists", fromCol: "userId", to: "users", toCol: "_id" },
    { from: "orders", fromCol: "user_id", to: "users", toCol: "_id" },
    { from: "orders", fromCol: "product_id", to: "products", toCol: "id" },
  ],
}

// Helper for SqlPage/EditorPage mock results
export function getMockRowsForTable(table) {
  return FAKE_ROWS[table] ?? FAKE_ROWS.favorites
}
export function getMockStructureForTable(table) {
  return FAKE_STRUCTURE[table] ?? FAKE_STRUCTURE.favorites
}
