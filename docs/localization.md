# Avolve Documentation Localization Guide

This guide outlines the structure and process for maintaining multi-language documentation for the Avolve platform.

## Localization Structure

The Avolve documentation follows a language-based directory structure to support multiple languages:

```
docs/
├── en/                 # English (default)
│   ├── user-guide.md
│   ├── developer-guide.md
│   ├── database.md
│   ├── api.md
│   └── ...
├── es/                 # Spanish
│   ├── user-guide.md
│   ├── developer-guide.md
│   └── ...
├── fr/                 # French
│   ├── user-guide.md
│   └── ...
├── de/                 # German
│   └── ...
├── zh/                 # Chinese
│   └── ...
├── ja/                 # Japanese
│   └── ...
└── index.md            # Language selector
```

## Implementation Plan

### Phase 1: Structure Setup (Current)

1. Create the base directory structure for English documentation
2. Migrate existing documentation to the `/en/` directory
3. Create a language selector on the main documentation page

### Phase 2: Initial Translations

1. Prioritize translation of core user-facing documents:
   - User Guide
   - FAQ
   - Quick Start Guide
2. Start with Spanish (es) as the first additional language
3. Add language selector to each page

### Phase 3: Expanded Language Support

1. Add French (fr) and German (de) translations
2. Implement translation workflow for documentation updates
3. Add community contribution guidelines for translations

## Translation Workflow

1. **Content Creation**: All content is first created in English
2. **Extraction**: Content is extracted for translation
3. **Translation**: Content is translated by language specialists
4. **Review**: Translations are reviewed by native speakers
5. **Integration**: Approved translations are integrated into the documentation
6. **Maintenance**: Updates to English content trigger translation updates

## Language Selection

The language selector will be implemented as a dropdown in the documentation header. Users can select their preferred language, and the selection will be stored in local storage for future visits.

## URL Structure

Documentation URLs will include the language code:

- English: `https://docs.avolve.io/en/user-guide`
- Spanish: `https://docs.avolve.io/es/user-guide`

The default language (English) will also be accessible without the language prefix:

- `https://docs.avolve.io/user-guide` (redirects to `/en/user-guide`)

## Translation Management

### Translation Memory

A translation memory system will be used to:
- Store previously translated segments
- Ensure consistency across documents
- Reduce translation costs for repeated content

### Terminology Management

A terminology database will be maintained to ensure consistent translation of:
- Platform-specific terms (e.g., token names)
- Technical terms
- Brand terminology

## Community Contributions

Community members can contribute to translations through:
1. GitHub pull requests
2. Translation suggestion forms
3. Documentation issue reports

## Implementation Example

### Language Selector Component

```html
<div class="language-selector">
  <select id="language-select" onchange="changeLanguage(this.value)">
    <option value="en">English</option>
    <option value="es">Español</option>
    <option value="fr">Français</option>
    <option value="de">Deutsch</option>
    <option value="zh">中文</option>
    <option value="ja">日本語</option>
  </select>
</div>

<script>
  function changeLanguage(lang) {
    // Get current path without language prefix
    const path = window.location.pathname.replace(/^\/[a-z]{2}\//, '/');
    // Redirect to the same page in the selected language
    window.location.href = `/${lang}${path}`;
    // Store preference
    localStorage.setItem('preferredLanguage', lang);
  }
  
  // Set initial selection based on current URL or stored preference
  document.addEventListener('DOMContentLoaded', () => {
    const currentLang = window.location.pathname.match(/^\/([a-z]{2})\//)?.[1] || 'en';
    document.getElementById('language-select').value = currentLang;
  });
</script>
```

## Next Steps

1. Create the directory structure for English documentation
2. Migrate existing documentation to the new structure
3. Implement the language selector on the main documentation page
4. Prepare the user guide for translation to Spanish
5. Establish translation workflow and guidelines

## Resources

- [MDN Localization Guide](https://developer.mozilla.org/en-US/docs/MDN/Guidelines/Localization)
- [GitHub Localization Tools](https://github.com/features/actions)
- [Crowdin Translation Management](https://crowdin.com/)
- [Transifex Translation Platform](https://www.transifex.com/)
