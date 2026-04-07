

  # Citizen-Politician Communication App

 I've been thinking about this for a while now.

Every election season, politicians make promises. Citizens raise problems. And somewhere between the rally speeches and the bureaucratic paperwork — the actual conversation never happens.

That's the gap we're trying to close with CitizenConnect.

Vercel: https://citizen-connect-alpha.vercel.app/

Github: https://github.com/LunoXD/CitizenConnect
The Problem Nobody Talks About

Democracy isn't broken. But the communication layer of democracy is.

Think about it. When was the last time you, as a regular citizen, had a direct line to your elected representative? Not a petition. Not a tweet into the void. An actual structured, trackable conversation where someone on the other end was accountable to respond?

Most people haven't. And that's the problem.
What We Built

CitizenConnect is a civic engagement platform built for India — for every state, every language, every citizen.

Here's how it works:

🟠 Citizens can report local issues, submit feedback, and receive updates directly from their representatives — in their own language.

🟢 Politicians get a dashboard to respond to constituent concerns, post announcements, and track what their people actually care about.

🔵 Moderators keep the space respectful and constructive — because good democracy needs good discourse.

⚙️ Admins oversee the full ecosystem — analytics, user management, platform health.

Four roles. One platform. One goal.


Why India. Why Now.

India is the world's largest democracy — 1.4 billion people, 22 official languages, 543 parliamentary constituencies.

And yet most civic tech is built in English, for English speakers, with Western UX assumptions.

We built CitizenConnect with the Indian citizen in mind:

    🇮🇳 10 Indian languages — Hindi, Telugu, Tamil, Kannada, Malayalam, Bengali, Marathi, Gujarati, Punjabi, and English — switchable from the navbar, changing every single word on the platform instantly
    🟠 Saffron, White, and Green — the UI breathes the Indian flag
    🏛️ Government of India branding — because trust matters in civic tech
    📱 Built for Bharat — fast, accessible, works on any device


  ## Local Development

  ### Frontend

  ```bash
  npm install
  cp .env.example .env
  npm run dev
  ```

  ### Backend (Spring Boot)

  ```bash
  cd backend
  mvn spring-boot:run
  ```

  Backend base URL: `http://localhost:8080`
  Backend health endpoint: `GET /api/health`


