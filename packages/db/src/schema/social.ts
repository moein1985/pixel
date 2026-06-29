import { pgTable, uuid, varchar, text, integer, boolean, timestamp, date, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./users";
import { categories } from "./locations";

export const adTypeEnum = pgEnum("ad_type", ["banner", "sidebar", "inline", "popup"]);
export const adPlacementEnum = pgEnum("ad_placement", ["home_top", "home_sidebar", "market_top", "article_inline", "all_pages"]);

export const advertisements = pgTable("advertisements", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: varchar("title", { length: 200 }).notNull(),
  type: adTypeEnum("type"),
  placement: adPlacementEnum("placement"),
  imageUrl: text("image_url"),
  targetUrl: text("target_url").notNull(),
  advertiserId: uuid("advertiser_id").references(() => users.id, { onDelete: "set null" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const networkTypeEnum = pgEnum("network_type", ["regional", "crop_based", "cooperative", "general"]);
export const networkMemberRoleEnum = pgEnum("network_member_role", ["admin", "moderator", "member"]);

export const farmerNetworks = pgTable("farmer_networks", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  networkType: networkTypeEnum("network_type"),
  province: varchar("province", { length: 50 }),
  categoryId: integer("category_id").references(() => categories.id),
  creatorId: uuid("creator_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  memberCount: integer("member_count").default(0),
  isPrivate: boolean("is_private").default(false),
  coverImageUrl: text("cover_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const networkMembers = pgTable("network_members", {
  id: uuid("id").primaryKey().defaultRandom(),
  networkId: uuid("network_id").notNull().references(() => farmerNetworks.id, { onDelete: "cascade" }),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: networkMemberRoleEnum("role").default("member"),
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
});

export const networkPosts = pgTable("network_posts", {
  id: uuid("id").primaryKey().defaultRandom(),
  networkId: uuid("network_id").notNull().references(() => farmerNetworks.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  images: text("images").array(),
  likeCount: integer("like_count").default(0),
  commentCount: integer("comment_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const networkComments = pgTable("network_comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  postId: uuid("post_id").notNull().references(() => networkPosts.id, { onDelete: "cascade" }),
  authorId: uuid("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  parentId: uuid("parent_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const inquiryTypeEnum = pgEnum("inquiry_type", ["cooperation", "inquiry", "complaint", "suggestion"]);
export const inquiryStatusEnum = pgEnum("inquiry_status", ["new", "reviewed", "responded", "closed"]);

export const inquiries = pgTable("inquiries", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: inquiryTypeEnum("type"),
  name: varchar("name", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 11 }).notNull(),
  email: varchar("email", { length: 100 }),
  subject: varchar("subject", { length: 200 }).notNull(),
  message: text("message").notNull(),
  attachments: text("attachments").array(),
  status: inquiryStatusEnum("status").default("new"),
  assignedTo: uuid("assigned_to").references(() => users.id, { onDelete: "set null" }),
  response: text("response"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const creditScoreHistory = pgTable("credit_score_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  score: integer("score").notNull(),
  factors: text("factors"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
