# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15.4.6 application called "web-audit-pro" built with TypeScript and Tailwind CSS. It uses the App Router architecture and is bootstrapped from create-next-app.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production bundle
- `npm run start` - Start production server
- `npm run lint` - Run ESLint with Next.js and TypeScript rules

## Architecture

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS v4 with PostCSS
- **TypeScript**: Strict mode enabled with Next.js plugin
- **Fonts**: Geist Sans and Geist Mono from Google Fonts
- **Linting**: ESLint with Next.js core-web-vitals and TypeScript extensions

### Key Structure

- `app/` - Next.js App Router directory containing pages and layouts
  - `layout.tsx` - Root layout with font configuration and metadata
  - `page.tsx` - Homepage component
  - `globals.css` - Global styles
- Path aliases configured with `@/*` pointing to project root

## Code Style

- Uses TypeScript strict mode
- ESLint configured with Next.js recommended rules
- Tailwind CSS for styling with utility classes
- React 19 with Next.js optimized components (Image, etc.)

## Cost-Effectiveness Principles

**Priority: Minimize operational costs while maximizing functionality**

1. **API Strategy**: Prefer free/low-cost alternatives before paid APIs
   - Use MCP (Model Context Protocol) for data analysis when possible
   - Web scraping with rate limiting as primary method
   - Paid APIs only as premium features or fallbacks
   - Implement intelligent caching to reduce API calls

2. **MCP Integration**: Leverage Claude's built-in capabilities
   - Use MCP web fetch for site analysis instead of paid APIs
   - Process HTML/content analysis through Claude directly  
   - Generate insights from scraped data using Claude's analysis
   - Only use external APIs for data Claude cannot access/process

3. **Resource Optimization**:
   - Cache all external data with appropriate TTLs
   - Batch API requests where possible
   - Use SQLite for development, PostgreSQL only when needed
   - Implement request queuing to manage rate limits

4. **Feature Hierarchy**:
   - **Free Tier**: Web scraping + MCP analysis
   - **Pro Tier**: Limited API calls for enhanced accuracy  
   - **Enterprise**: Full API access with higher limits


Claude Rules File


1. First think through the problem, read the codebase for relevant files, and write a plan to tasks/todo.md.
2. The plan should have a list of todo items that you can check off as you complete them
3. Before you begin working, check in with me and I will verify the plan.
4. Then, begin working on the todo items, marking them as complete as you go.
5. Please every step of the way just give me a high level explanation of what changes you made
6. Make every task and code change you do as simple as possible. We want to avoid making any massive or complex changes. Every change should impact as little code as possible. Everything is about simplicity.

Please dont use mock data or create fall backs. I just want this app to use real world data.