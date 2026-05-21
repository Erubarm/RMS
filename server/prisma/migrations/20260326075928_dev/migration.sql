-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'TEACHER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('EXHIBITION', 'NEWS', 'LECTURE', 'WORKSHOP');

-- CreateEnum
CREATE TYPE "RequestStatus" AS ENUM ('PENDING', 'REVIEWING', 'CONFIRMED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "vkId" INTEGER NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "notifyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exposition" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "schedule" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Exposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Excursion" (
    "id" SERIAL NOT NULL,
    "expositionId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "maxGroupSize" INTEGER NOT NULL DEFAULT 30,
    "durationMin" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Excursion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" SERIAL NOT NULL,
    "excursionId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "time" TEXT NOT NULL,
    "availableSpots" INTEGER NOT NULL,

    CONSTRAINT "TimeSlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "timeSlotId" INTEGER NOT NULL,
    "peopleCount" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "eventDate" TIMESTAMP(3),
    "type" "EventType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeacherRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "school" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "studentsCount" INTEGER NOT NULL,
    "expositionId" INTEGER NOT NULL,
    "preferredDate" DATE NOT NULL,
    "phone" TEXT NOT NULL,
    "status" "RequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeacherRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Faq" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_vkId_key" ON "User"("vkId");

-- CreateIndex
CREATE INDEX "User_vkId_idx" ON "User"("vkId");

-- CreateIndex
CREATE INDEX "Excursion_expositionId_idx" ON "Excursion"("expositionId");

-- CreateIndex
CREATE INDEX "TimeSlot_excursionId_date_idx" ON "TimeSlot"("excursionId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_code_key" ON "Booking"("code");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");

-- CreateIndex
CREATE INDEX "Booking_timeSlotId_idx" ON "Booking"("timeSlotId");

-- CreateIndex
CREATE INDEX "Booking_status_idx" ON "Booking"("status");

-- CreateIndex
CREATE INDEX "Event_type_idx" ON "Event"("type");

-- CreateIndex
CREATE INDEX "TeacherRequest_userId_idx" ON "TeacherRequest"("userId");

-- CreateIndex
CREATE INDEX "TeacherRequest_status_idx" ON "TeacherRequest"("status");

-- AddForeignKey
ALTER TABLE "Excursion" ADD CONSTRAINT "Excursion_expositionId_fkey" FOREIGN KEY ("expositionId") REFERENCES "Exposition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeSlot" ADD CONSTRAINT "TimeSlot_excursionId_fkey" FOREIGN KEY ("excursionId") REFERENCES "Excursion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES "TimeSlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeacherRequest" ADD CONSTRAINT "TeacherRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
