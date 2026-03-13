# IRIS CRM Lite

A lightweight CRM application built with Next.js 14, TypeScript, Tailwind CSS, and Prisma.

## Features

- **Prospects Management** — Track leads and contacts with full CRUD operations
- **Activity Timeline** — Log calls, emails, meetings, and notes per prospect
- **Task Management** — Create and track follow-up tasks with due dates
- **Dashboard** — Overview stats: total prospects, open tasks, recent activities
- **Google Sheets Import** — Import prospect data directly from Google Sheets

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database ORM**: Prisma
- **Database**: SQLite (dev) / PostgreSQL (prod)

## Getting Started

```bash
npm install
npx prisma migrate dev
npm run dev
```

Copy `.env.example` to `.env.local` and fill in your environment variables.

## Project Structure

```
src/
  app/
    api/          # API routes (prospects, activities, tasks, dashboard, import)
    dashboard/    # Dashboard page
  components/     # Shared UI components
  lib/            # Database client, utilities, import helpers
  types/          # TypeScript type definitions
prisma/
  schema.prisma   # Database schema
  seed.ts         # Seed data
```
