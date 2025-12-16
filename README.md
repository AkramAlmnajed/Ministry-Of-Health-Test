# Admin Dashboard – Product Management System

A modern admin dashboard built with **React + TypeScript**, designed to demonstrate authentication handling, product management (CRUD), and clean UI/UX practices using contemporary frontend tools.

---

## Overview

This project is a frontend admin dashboard that includes:

- Secure authentication flow with protected routes
- Full product management (Create, Read, Update, Delete)
- Responsive layout with sidebar navigation and modal dialogs
- Integration with public REST APIs
- Clean, scalable project structure

The application is built as part of a frontend technical assessment.

---

## Tech Stack

- **React + TypeScript**
- **Vite**
- **Tailwind CSS**
- **React Query (TanStack Query)** – data fetching & caching
- **React Hook Form + Zod** – form handling & validation
- **Context API** – authentication state management
- **Framer Motion** – animations & transitions
- **Axios** – HTTP requests

---

## Features

### Authentication
- Login using ReqRes API
- Token stored in localStorage
- Protected routes
- Logout functionality

### Product Management
- Products list with pagination and search
- Add product (modal form)
- Edit product (modal form)
- Delete product (confirmation dialog)
- Product details page with image gallery
- Optimistic UI updates
- Toast notifications for success and error states

---

## Project Structure

src/
├── app/
│ └── queryClient.ts
├── components/
│ └── toast/
├── features/
│ ├── auth/
│ └── products/
├── layouts/
├── App.tsx
├── main.tsx


---

## Getting Started

### Install dependencies
```bash
yarn install

yarn dev

## API References

Authentication: https://reqres.in/

Products: https://dummyjson.com/docs/products


================ Notes ================

This project uses mock/public APIs only.

No backend or database is included.

Designed to showcase frontend architecture, state management, and UI quality.