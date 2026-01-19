# Advisory Board Questions

> **Total Questions:** 5
> **High Priority:** 1 | **Medium:** 3 | **Low:** 1

---

## Table of Contents

- [Business Alignment](#business-alignment)
- [Technology Decisions](#technology-decisions)
- [Platform Strategy](#platform-strategy)
- [Package Utilization](#package-utilization)

---

## Business Alignment

<a id="business-alignment"></a>

### 1. 🔴 Why don't we have analytics infrastructure, and how are we making data-driven product decisions?

**Context:** No analytics packages detected in the project

**Findings:**

- Missing analytics implementation

**Recommendations:**

- Implement analytics to track user behavior and feature adoption
- Set up conversion funnels and key metric tracking
- Enable A/B testing capabilities for product experiments

**Business Impact:** Lack of analytics limits ability to measure ROI and optimize user experience

---

### 2. 🟡 How is our testing strategy contributing to product quality and customer satisfaction?

**Context:** Testing infrastructure is in place

**Findings:**

- Testing tools available

**Recommendations:**

- Set coverage targets aligned with quality goals
- Implement testing in CI/CD for every release
- Track bugs-in-production as quality metric

**Business Impact:** Quality assurance directly affects customer satisfaction and support costs

---

## Technology Decisions

<a id="technology-decisions"></a>

### 1. 🟡 Is the monorepo structure providing expected benefits in code sharing and deployment coordination?

**Context:** Project uses monorepo with multiple workspaces

**Findings:**

- Monorepo with undefined packages
- Total 12 files managed

**Recommendations:**

- Assess if shared code is properly abstracted and reused
- Evaluate build caching and selective deployment strategies
- Consider workspace organization for scaling

**Business Impact:** Monorepo architecture affects team collaboration and deployment complexity

---

## Platform Strategy

<a id="platform-strategy"></a>

### 1. 🟡 Are our platform choices (Web) aligned with target market and growth plans?

**Context:** Currently deployed on Web

**Findings:**

- Supports Web platform

**Recommendations:**

- Validate platform coverage matches user demographics
- Assess cross-platform development efficiency
- Consider platform-specific optimization opportunities

**Business Impact:** Platform strategy determines market reach and development costs

---

## Package Utilization

<a id="package-utilization"></a>

### 1. 🟢 How are we leveraging our 7 Other packages to deliver business value?

**Context:** Other: @shopify/cli, @shopify/theme, dotenv-cli, +4 more

**Findings:**

- 7 packages in Other category
- Supports various application features

**Recommendations:**

- Review usage patterns for optimization
- Consider if functionality meets current needs

**Business Impact:** Supports various application features

---
