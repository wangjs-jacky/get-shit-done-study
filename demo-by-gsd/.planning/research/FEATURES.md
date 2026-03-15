# Feature Research

**Domain:** UI Style Gallery / Design Showcase
**Researched:** 2026-03-15
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Live Preview** | Users need to see how the style looks in action before selecting | MEDIUM | Instant visual feedback is standard in all UI library sites (MUI, Chakra, Ant Design) |
| **One-Click Copy** | The core value proposition requires frictionless copying | LOW | Standard pattern across all component libraries and prompt galleries |
| **Style Switching** | Gallery without switching is just a static list | MEDIUM | Expected behavior for any theme/style showcase |
| **Responsive Layout** | Developers may browse on different devices | MEDIUM | Mobile-friendly is table stakes for any modern web app |
| **Visual Feedback on Copy** | Users need confirmation that copy succeeded | LOW | Toast notification or button state change is expected |
| **Fast Loading** | Performance directly impacts user experience | MEDIUM | Static site generation for speed |
| **Clear Navigation** | Users need to understand the UI immediately | LOW | Intuitive layout with preview + list pattern |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Functional Demo App** | Real interactions (not static mockups) build confidence | HIGH | Most galleries show static components; interactive demos are rare |
| **Prompt-Optimized Output** | Copied content is ready for CLAUDE.md, not just CSS | MEDIUM | Unique to AI-assisted development workflows |
| **Style Preview Grid** | Quick scanning of multiple styles at once | LOW | Helps users compare options faster |
| **Dark/Light Mode Toggle** | Shows style versatility across themes | MEDIUM | Demonstrates style works in both modes |
| **Style Categories/Tags** | Helps users find similar aesthetics | LOW | Organized browsing vs. linear list |
| **Keyboard Navigation** | Power users can switch styles without mouse | MEDIUM | Accessibility and speed improvement |
| **Style Comparison Mode** | Side-by-side view of two styles | HIGH | Unique feature for decision-making |
| **Export History** | Remember which styles were copied | LOW | Useful for users trying multiple options |
| **Style Preview Screenshot** | Capture current preview for documentation | MEDIUM | Helps teams discuss options |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| **Real-time Code Generation** | Seems flexible and powerful | Adds complexity, latency, and maintenance burden. Breaks offline capability. | Pre-generate all styles at build time |
| **User Upload Custom Styles** | Community contribution seems valuable | Moderation burden, quality control, security risks, scope creep | Curate high-quality styles from frontend-design skill |
| **User Accounts/Saved Styles** | Personalization seems useful | Authentication complexity, data privacy, maintenance overhead | Browser localStorage for simple preferences |
| **Style Editor/Customizer** | Fine-tuning seems helpful | Complex UI, diverts from core "find and copy" workflow, increases scope significantly | Provide clear prompt text users can modify themselves |
| **Multi-language Support** | Wider audience appeal | Translation maintenance, i18n complexity for v1 | Start with Chinese (user's primary language), add later if needed |
| **Social Sharing** | Viral growth seems attractive | Adds dependencies, privacy concerns, scope creep | Focus on core utility; sharing comes from usefulness |
| **Rating/Review System** | Quality signals seem valuable | Requires user accounts, moderation, gaming prevention | Curate quality styles, don't crowdsource |

## Feature Dependencies

```
[Live Preview]
    └──requires──> [Style Data Extraction from frontend-design skill]
                       └──requires──> [Build-time Code Generation]

[One-Click Copy]
    └──requires──> [Prompt Template per Style]
    └──requires──> [Clipboard API Integration]

[Style Switching]
    └──requires──> [Client-side State Management]
    └──requires──> [CSS Variable Injection]

[Functional Demo App]
    └──requires──> [Multiple Pre-built Style Variants]
    └──enhances──> [Live Preview]

[Dark/Light Mode Toggle]
    └──requires──> [Style Data with Both Modes]
    └──conflicts──> [Single-theme Demo Apps]

[Keyboard Navigation] ──enhances──> [Style Switching]

[Style Comparison Mode] ──conflicts──> [Single Preview Layout]
```

### Dependency Notes

- **Live Preview requires Style Data Extraction:** All styles must be extracted from frontend-design skill before the site can preview them. This is a build-time dependency.
- **One-Click Copy requires Prompt Template:** Each style needs an associated prompt text that users will copy. Templates must be crafted per style.
- **Functional Demo App requires Multiple Pre-built Style Variants:** The demo app (e.g., pomodoro timer) must be built in each style variant. This increases build complexity but provides unique value.
- **Dark/Light Mode Toggle conflicts with Single-theme Demo Apps:** If demo apps are built with hardcoded themes, toggle won't work. Demo apps must use CSS variables.
- **Style Comparison Mode conflicts with Single Preview Layout:** Requires UI redesign to support side-by-side or overlay comparison. Increases layout complexity.

## MVP Definition

### Launch With (v1)

Minimum viable product - what's needed to validate the concept.

- [x] **Live Preview with Functional Demo App** - Core differentiator; shows real interactions not just static components
- [x] **Style List/Grid** - Users need to see available options
- [x] **Real-time Style Switching** - Click style -> preview updates instantly
- [x] **One-Click Copy Prompt** - Core value proposition
- [x] **Copy Success Feedback** - Toast or button state change
- [x] **Responsive Layout** - Mobile-friendly experience
- [x] **GitHub Pages Deployment** - Free hosting, simple setup

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] **Dark/Light Mode Toggle** - Once users request seeing styles in both modes
- [ ] **Style Categories/Tags** - Once style count grows (10+ styles)
- [ ] **Keyboard Navigation** - Power user request
- [ ] **Style Preview Grid View** - Alternative to list view
- [ ] **Local Storage for Last Selected Style** - Remember user preference

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] **Style Comparison Mode** - Requires significant UI redesign
- [ ] **Export History** - Needs storage strategy
- [ ] **Style Preview Screenshot** - Complex feature, unclear demand
- [ ] **Additional Demo Apps** - Expand beyond pomodoro timer

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Live Preview with Demo App | HIGH | HIGH | P1 |
| Style List/Grid | HIGH | LOW | P1 |
| Real-time Style Switching | HIGH | MEDIUM | P1 |
| One-Click Copy Prompt | HIGH | LOW | P1 |
| Copy Success Feedback | MEDIUM | LOW | P1 |
| Responsive Layout | MEDIUM | MEDIUM | P1 |
| GitHub Pages Deployment | HIGH | LOW | P1 |
| Dark/Light Mode Toggle | MEDIUM | MEDIUM | P2 |
| Style Categories/Tags | MEDIUM | LOW | P2 |
| Keyboard Navigation | LOW | MEDIUM | P2 |
| Style Comparison Mode | LOW | HIGH | P3 |
| Export History | LOW | LOW | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

## Competitor Feature Analysis

| Feature | UIPrompt.site | MUI/Chakra Docs | Ant Design | Our Approach |
|---------|---------------|-----------------|------------|--------------|
| **Live Preview** | Static screenshots | Interactive components | Interactive with theme switcher | Functional demo app with real interactions |
| **Copy Function** | Copy prompt button | Copy code snippet | Copy code snippet | Copy prompt optimized for CLAUDE.md |
| **Style Switching** | Browse gallery | Theme switcher | Theme editor with presets | Instant style switch on preview |
| **Demo Content** | Component examples | Individual components | Component library | Complete functional app (pomodoro) |
| **Target User** | AI prompt users | React developers | Enterprise developers | Developers using Claude Code |
| **Unique Value** | Prompt templates | Production-ready components | Enterprise design system | Style prompts for AI-assisted dev |

### Key Differentiation Strategy

Unlike component library documentation (MUI, Chakra, Ant Design) which focuses on individual components, our gallery shows **complete functional applications** styled in different aesthetics. This helps users see how a style translates across an entire app, not just isolated components.

Unlike UIPrompt.site which provides static screenshots, our gallery offers **interactive previews** where users can click, interact, and experience the style's feel before committing.

The core differentiator is **prompt-optimized output** - users don't copy CSS code, they copy natural language prompts designed for AI tools like Claude Code. This is unique in the current ecosystem.

## Sources

### Component Library Sites Analyzed
- [MUI (Material UI)](https://mui.com/) - Component library with interactive demos, code snippets, theme customization
- [Chakra UI](https://chakra-ui.com/) - Accessible React components with design system focus
- [Ant Design](https://ant.design/) - Enterprise UI with theme customization and AI theme generation
- [MagicUI](https://magicui.design/blog/component-library-examples) - Animated component library comparison

### Theme/Style Gallery Tools
- [UIPrompt.site](https://www.uiprompt.site/) - UI prompt gallery with one-click copy
- [UIPrompt.art](https://uiprompt.art/) - UI style explorer with diverse aesthetics
- [The Component Gallery](https://component.gallery/) - Design system component repository
- [Design Systems Repo](https://designsystemsrepo.com/design-systems/) - Curated design systems list

### Theme Switcher & Preview Tools
- [Telerik ThemeBuilder](https://www.telerik.com/themebuilder) - Live preview theme customization
- [Shadcn/ui Palette Generator](https://next.jqueryscript.net/shadcn-ui/palette-theme-generator/) - Live CSS variable modification
- [Flowbite Copy to Clipboard](https://flowbite.com/docs/components/clipboard/) - Clipboard component patterns

### Documentation Best Practices
- [Zeroheight + StackBlitz](https://www.zeroheight.com/blog/live-code-examples-in-your-design-system-with-stackblitz/) - Live code examples in design systems
- [Carbon Design System Code Snippet](https://carbondesignsystem.com/components/code-snippet/usage/) - Code snippet component with copy functionality
- [Justice Design System Copy Button](https://design-patterns.service.justice.gov.uk/components/copy-button/) - UK government design patterns

---
*Feature research for: UI Style Gallery / Design Showcase*
*Researched: 2026-03-15*
