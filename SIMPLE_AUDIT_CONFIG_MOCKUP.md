# Simple Audit Configuration - Visual Mockup

## UI Design

```
┌──────────────────────────────────────────────────────────────────────┐
│  Audit Configuration                                                 │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ☑ Technical SEO                                                     │
│    H1 tags, meta titles, descriptions, structured data, title length│
│                                                                      │
│  ☑ Internal Linking                                                 │
│    Orphaned pages, weak links, broken links                         │
│                                                                      │
│  ☑ Performance Metrics                                              │
│    Core Web Vitals, page speed                                      │
│                                                                      │
│  ☑ Security & Redirects                                             │
│    HTTPS, HSTS, 301/302 redirects, 4XX errors                       │
│                                                                      │
│  ☑ Content Quality                                                  │
│    Text-to-HTML ratio, content depth                                │
│                                                                      │
│  ☑ Image Optimization                                               │
│    Large images, legacy formats, missing alt tags                   │
│                                                                      │
│  ☐ Accessibility Analysis                                           │
│    WCAG compliance, color contrast, keyboard navigation             │
│                                                                      │
│  ☐ Viewport Analysis                                                │
│    Mobile/tablet/desktop rendering                                  │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘
```

## Default State

**6 out of 8 checks enabled by default:**
- ✅ Technical SEO
- ✅ Internal Linking
- ✅ Performance Metrics
- ✅ Security & Redirects
- ✅ Content Quality
- ✅ Image Optimization
- ❌ Accessibility Analysis (disabled - expensive)
- ❌ Viewport Analysis (disabled - expensive)

## Features

### ✅ Included
- Simple checkbox list
- Category names
- Brief descriptions
- Hover states
- Click anywhere on row to toggle

### ❌ Not Included
- No preset profiles
- No time estimates
- No info icons
- No expandable details
- No "custom" indicators
- No complexity

## Styling

- **Box:** White background, gray border, rounded corners, subtle shadow
- **Checkboxes:** Blue when checked (#3B82F6), gray when unchecked
- **Labels:** Bold, dark gray
- **Descriptions:** Smaller text, light gray
- **Hover:** Light gray background (#F9FAFB)
- **Padding:** Comfortable spacing between items
