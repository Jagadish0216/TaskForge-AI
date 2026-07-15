# TaskForge AI — Brand, Product Strategy & Design System Index

Welcome to the central product identity, brand strategy, and design engineering documentation for **TaskForge AI**.

This collection of documents defines the vision, user experience architecture, visual tokens, component standards, and roadmap guiding the evolution of TaskForge AI into a flagship 2026 AI-powered SaaS product.

---

## 📚 Brand & Strategy Documentation Index

| # | Document | Overview & Purpose |
| :-: | :--- | :--- |
| **01** | **[BrandGuide.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/BrandGuide.md)** | Core mission, vision, brand values, voice/tone rules, positioning statement, elevator pitch, and 10 taglines. |
| **02** | **[ProductVision.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/ProductVision.md)** | Product core purpose, problem space, matrix comparison vs Jira/Notion, short-term & long-term ecosystem vision. |
| **03** | **[UserPersonas.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/UserPersonas.md)** | 6 realistic profiles (Capstone Team, Startup Founder, Flow Developer, Agile PM, Solo Freelancer, Lab Instructor). |
| **04** | **[UXPrinciples.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/UXPrinciples.md)** | 7 UX architectural guidelines (Speed as a Feature, Intentional Subtraction, Keyboard-First `⌘K`, Ambient AI). |
| **05** | **[LogoConcept.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/LogoConcept.md)** | Symbol geometry, emblem variations, safe margins, favicon standards, and dark/light print rules. |
| **06** | **[ColorSystem.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/ColorSystem.md)** | Electric blue & indigo brand palette, dark/light surface tokens, semantic status/priority dots, glass gradients. |
| **07** | **[Typography.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/Typography.md)** | Font hierarchy (Inter & JetBrains Mono), line-height scales, micro-code tracking rules, and typography tables. |
| **08** | **[DesignTokens.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/DesignTokens.md)** | Standardized 8px spatial grid, radiuses (`rounded-xl`/`2xl`), depth shadows, animation timing, and breakpoints. |
| **09** | **[ComponentGuidelines.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/ComponentGuidelines.md)** | Usage standards, variants, state feedback, and Do's & Don'ts for Buttons, Cards, Badges, Modals, and Skeletons. |
| **10** | **[MotionGuidelines.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/MotionGuidelines.md)** | Framer Motion parameters, spring physics curves, gesture feedback rules (`whileHover`), and route transitions. |
| **11** | **[Roadmap.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/Roadmap.md)** | Version 1.0 (Current Baseline), Version 2.0 (AI Backlog & Webhooks), and Version 3.0 (Autonomous Co-Pilot Engine). |
| **12** | **[ProductIdentity.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/ProductIdentity.md)** | 10 taglines, 10 hero headlines, 10 subtitles, 10 onboarding prompts, and 10 system welcome messages. |
| **13** | **[FeaturePhilosophy.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/FeaturePhilosophy.md)** | Strategic rationale, operational capabilities, and future evolution plan for all 8 core application modules. |

---

## 🛠️ Guidelines for Future Development
1. **Design System Adherence**: All newly developed UI components must consume tokens from [DesignTokens.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/DesignTokens.md) and colors from [ColorSystem.md](file:///c:/Users/shankar/TaskForge-AI/docs/brand/ColorSystem.md).
2. **Speed & Latency**: UI changes must retain sub-50ms reactive response times using client optimistic updates.
3. **Dark Mode First**: Ensure every screen looks crisp in both dark navy (`slate-950`) and light (`slate-50`) surface modes.
4. **Backend Contract Preservation**: Keep Spring Boot REST APIs, controllers, DTO contracts, and database logic strictly synchronized.
