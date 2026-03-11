# AI Sustainability Platform

This project implements AI-powered modules to enhance an e-commerce platform with automated cataloging, B2B proposal generation, impact reporting, and customer support. It is built using Node.js, TypeScript, Express, Prisma (PostgreSQL), and the OpenAI API.

## Project Setup Guide

### 1. Prerequisites

- Node.js installed
- A PostgreSQL database (e.g., local installation, Supabase, or Neon)
- An OpenAI API Key

### 2. Installation

Clone the repository, navigate to the `ai-sustainability-platform` folder, and install the dependencies:

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and add your connection strings and API keys:

```env
DATABASE_URL="postgresql://your-username:your-password@localhost:5432/your_db_name?schema=public"
OPENAI_API_KEY="your_openai_api_key_here"
PORT=3000
```

> **Note:** If you are testing without OpenAI credits, the AI Service has a fallback mechanism that returns mock JSON data to ensure the application continues running seamlessly.

### 4. Database Setup

Push the Prisma schema to your database to create the required tables:

```bash
npx prisma db push
```

Then, generate the Prisma client:

```bash
npx prisma generate
```

### 5. Start the Backend Server

Start the development server using:

```bash
npm run dev
```

The server will start running at `http://localhost:3000`.

## Architecture Overview

This platform follows a distinct separation-of-concerns architecture designed for production AI systems:

1.  **API Layer (Express Routes):** Handles incoming HTTP requests and responses.
2.  **Controller Layer:** Validates incoming payloads and orchestrates the flow of data between the database and the AI service.
3.  **Data Validation & Business Logic:** Pure mathematical operations and deterministic business rules (like calculating carbon impact) are performed _before_ calling the AI. This prevents LLM hallucinations on factual/math data.
4.  **AI Service Layer:** A centralized wrapper around the OpenAI SDK. It enforces structured JSON outputs using strict system prompts and handles API errors or rate-limit fallbacks gracefully without crashing the application.
5.  **Database Layer (Prisma + PostgreSQL):** Stores the raw input, the exact AI output, and the final structured object, allowing for full traceability and analytics over time.

---

## AI Prompt Design Strategy

The prompts used in the `aiService.ts` layer are designed using the following best practices:

1.  **Role Designation:** Every system prompt begins by assigning a specific expert role to the LLM (e.g., "You are an AI product catalog expert specializing in sustainable and eco-friendly products" or "You are a sustainability communications expert"). This significantly improves the quality and tone of the response.
2.  **Strict Output Formatting:** We use OpenAI's `response_format: { type: 'json_object' }` configuration. The system prompt explicitly defines the exact JSON schema expected, including data types and predefined lists for categorization. This guarantees that the AI output can be seamlessly inserted into our PostgreSQL database without fragile string parsing.
3.  **Context Injection:** We separate the instructions (System Prompt) from the actual variable data (User Prompt). The User Prompt explicitly lists the required context (e.g., specific plastic/carbon kg amounts) ensuring the LLM relies only on the provided facts rather than its own training data.
4.  **Low Temperature:** The AI generation temperature is set to `0.1` to promote highly predictable, deterministic, and factual responses, reducing creative hallucinations which are undesirable for robust data processing pipelines.

---

## Implemented Modules (Active)

### Module 1: AI Auto-Category & Tag Generator

**Description:** Automatically assigns primary categories, sub-categories, SEO tags, and sustainability tags (like plastic-free, compostable, vegan) to a product based on its name and description using an LLM. The output is structured JSON stored in the database.

**How to Run Locally (Test via PowerShell):**
Make sure the server is running (`npm run dev`), then open a new PowerShell terminal and run:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/products/categorize" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"name": "Bamboo Toothbrush", "description": "A 100% biodegradable bamboo toothbrush with soft charcoal bristles."}' | ConvertTo-Json -Depth 5
```

Alternatively, view any locally processed products in your browser at: `http://localhost:3000/api/products`

**How to Run Live Deployment (Test via PowerShell):**
If testing against the live Render server, run:

```powershell
Invoke-RestMethod -Uri "https://ai-sustainable-system.onrender.com/api/products/categorize" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"name": "Organic Cotton T-Shirt", "description": "A 100% organic cotton graphic t-shirt made with eco-friendly dyes."}' | ConvertTo-Json -Depth 5
```

Alternatively, view any live processed products in your browser at: `https://ai-sustainable-system.onrender.com/api/products`

### Module 3: AI Impact Reporting Generator

**Description:** Calculates the estimated plastic saved and carbon emissions avoided based on the order's items. It handles complex business logic mathematically and uses the AI purely to draft an inspiring, human-readable impact statement that can be sent to customers.

**How to Run Locally (Test via PowerShell):**
With the server running, open a new PowerShell terminal and execute:

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/impact/generate" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"orderId": "ORD-12345", "items": [{"id": 1}, {"id": 2}], "isLocalSourced": true}' | ConvertTo-Json -Depth 5
```

Alternatively, view any locally generated impact reports in your browser at: `http://localhost:3000/api/impact`

**How to Run Live Deployment (Test via PowerShell):**
If testing against the live Render server, execute:

```powershell
Invoke-RestMethod -Uri "https://ai-sustainable-system.onrender.com/api/impact/generate" -Method Post -Headers @{"Content-Type"="application/json"} -Body '{"orderId": "LIVE-ORD-12345", "items": [{"id": 1}, {"id": 2}], "isLocalSourced": true}' | ConvertTo-Json -Depth 5
```

Alternatively, view any live generated impact reports in your browser at: `https://ai-sustainable-system.onrender.com/api/impact`

---

## Future Modules (Architecture Prepared)

### Module 2: AI B2B Proposal Generator

**Outline:** Designed to dynamically suggest a sustainable product mix fitting within a specified budget. It queries the database for qualifying green inventory, and then uses the latest AI to draft a structured JSON proposal containing a cost breakdown and impact positioning summary for B2B clients.

### Module 4: AI WhatsApp Support Bot

**Outline:** Intended to directly integrate with the Meta WhatsApp API via webhooks. It classifies customer intent to instantly answer real-time order status queries from the database, handle standard return policy questions, or smoothly escalate high-priority issues to a human agent, all while logging conversation history.
