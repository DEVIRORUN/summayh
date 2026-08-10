-- CreateEnum
CREATE TYPE "PurchaseType" AS ENUM ('FULL_COURSE', 'SESSION_RANGE');

-- CreateEnum
CREATE TYPE "OvertimeStatus" AS ENUM ('PENDING', 'APPROVED', 'DECLINED');

-- CreateTable
CREATE TABLE "GigCourse" (
    "id" TEXT NOT NULL,
    "gigId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GigCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GigTopic" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "GigTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GigSessionUnit" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "globalIndex" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,

    CONSTRAINT "GigSessionUnit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseEnrollment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "buyerId" TEXT NOT NULL,
    "purchaseType" "PurchaseType" NOT NULL,
    "startIndex" INTEGER,
    "endIndex" INTEGER,
    "sessionsPerDayPref" INTEGER,
    "totalSesssionsPurchased" INTEGER NOT NULL,
    "sessionsCompleted" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CourseEnrollment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SessionOvertimeRequest" (
    "id" TEXT NOT NULL,
    "callSessionId" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "extraMinutes" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "OvertimeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),

    CONSTRAINT "SessionOvertimeRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GigCourse_gigId_key" ON "GigCourse"("gigId");

-- CreateIndex
CREATE UNIQUE INDEX "GigTopic_courseId_order_key" ON "GigTopic"("courseId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "GigSessionUnit_courseId_globalIndex_key" ON "GigSessionUnit"("courseId", "globalIndex");

-- CreateIndex
CREATE UNIQUE INDEX "CourseEnrollment_orderId_key" ON "CourseEnrollment"("orderId");

-- AddForeignKey
ALTER TABLE "GigCourse" ADD CONSTRAINT "GigCourse_gigId_fkey" FOREIGN KEY ("gigId") REFERENCES "Gig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigTopic" ADD CONSTRAINT "GigTopic_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GigCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigSessionUnit" ADD CONSTRAINT "GigSessionUnit_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "GigTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GigSessionUnit" ADD CONSTRAINT "GigSessionUnit_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GigCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "GigCourse"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEnrollment" ADD CONSTRAINT "CourseEnrollment_buyerId_fkey" FOREIGN KEY ("buyerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SessionOvertimeRequest" ADD CONSTRAINT "SessionOvertimeRequest_callSessionId_fkey" FOREIGN KEY ("callSessionId") REFERENCES "CallSession"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
