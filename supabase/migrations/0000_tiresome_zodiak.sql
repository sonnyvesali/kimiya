CREATE TABLE "class_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" uuid NOT NULL,
	"token_hash" text NOT NULL,
	"code_hash" text NOT NULL,
	"expires_at" timestamp with time zone,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "class_invites" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "class_memberships" (
	"class_id" uuid NOT NULL,
	"student_id" uuid NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_memberships_class_id_student_id_pk" PRIMARY KEY("class_id","student_id")
);
--> statement-breakpoint
ALTER TABLE "class_memberships" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "classes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"educator_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "classes_name_length" CHECK (length(trim("classes"."name")) BETWEEN 1 AND 120)
);
--> statement-breakpoint
ALTER TABLE "classes" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_metadata_object" CHECK (jsonb_typeof("users"."metadata") = 'object'),
	CONSTRAINT "users_metadata_role" CHECK (NOT ("users"."metadata" ? 'role') OR ("users"."metadata"->>'role' IS NOT NULL AND "users"."metadata"->>'role' IN ('educator', 'student')))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "class_invites" ADD CONSTRAINT "class_invites_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_memberships" ADD CONSTRAINT "class_memberships_class_id_classes_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."classes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "class_memberships" ADD CONSTRAINT "class_memberships_student_id_users_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "classes" ADD CONSTRAINT "classes_educator_id_users_id_fk" FOREIGN KEY ("educator_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "class_invites_token_unique" ON "class_invites" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "class_invites_code_unique" ON "class_invites" USING btree ("code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "class_invites_one_active" ON "class_invites" USING btree ("class_id") WHERE "class_invites"."revoked_at" IS NULL;