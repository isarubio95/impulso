-- CreateTable
CREATE TABLE "public"."Treatment" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "desc" TEXT NOT NULL,
    "longDesc" TEXT,
    "imageUrl" TEXT,
    "imageAlt" TEXT,
    "composition" JSONB,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);
