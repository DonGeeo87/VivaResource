# Guía de Contribución - Viva Resource Foundation

¡Gracias por interesarte en contribuir!

## 🤝 Cómo Contribuir

1. **Fork** el repo
2. **Branch**: `feature/nombre-descriptivo` o `fix/issue-num`
3. **Commit** convencional: `feat: add hero animation` / `fix: resolve form validation`
4. **PR** a `main`

## 🎨 Convenciones

### Commits
```
type(scope): description

[optional body]

[optional footer]
```
Tipos: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Branches
- `feature/hero-section`
- `fix/form-bug`
- `hotfix/security`

### Code Style
- ESLint/Prettier (ejecutar `npm run lint`)
- TS strict
- Componentes: PascalCase, 1 responsabilidad
- Hooks: `use*`

## 🧪 Testing

**Unit (Vitest)**:
```bash
npm test
npm test:watch
npm test:ui
```

**E2E (Playwright)**:
```bash
npm run test:e2e
npm run test:e2e:ui
```

Todo PR debe pasar tests + lint.

## 🚀 Desarrollo Local

Ver README.md

### Pull Request Template
```
## Cambios
- ...

## Testing
- [ ] Unit
- [ ] E2E  
- [ ] Manual

## Issues
Fixes #123
```

## 🙌 Agradecimientos
¡Tu ayuda construye impacto real!
