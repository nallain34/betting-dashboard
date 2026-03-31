# Betting Dashboard

A mobile-first web app for tracking and grading sports bets. Built with Node.js on Vercel, reading/writing a Google Sheets betting ledger via the Sheets API.

## Stack
- Node.js (Vercel serverless functions)
- Vanilla HTML/CSS/JS frontend (no framework)
- Google Sheets API (service account auth)
- iOS PWA (add to home screen)

## Environment Variables
- GOOGLE_CREDENTIALS: Google service account JSON
- SHEET_ID: Google Sheets ID
- GEMINI_API_KEY: Gemini Vision API key

## Sheet Structure
- Straights tab: cols A-AB, result in col W (col 23)
- Parlays/Other tab: cols A-Y, result in col T (col 20)
- Futures tab: cols A-W, result in col R (col 18), settle date in col D (col 4)
- Daily Results_L30 tab: row 1=L7, row 2=L30, row 3=All Time, rows 5+ daily data
- Columns are 1-indexed. Data starts at row 3 (two header rows).
