# Testing

## Comandos

```bash
npm test
```

Corre toda la suite de tests.

```bash
npm run test:api
```

Corre solo los tests de endpoints en `tests/api`.

```bash
npm run test:watch
```

Corre Jest en modo watch durante desarrollo.

## Que cubre

- HTTP contract tests para los endpoints principales.
- No requiere PostgreSQL.
- No requiere Cohere API key.
- Usa mocks de repositories, services, auth y adaptadores externos.

Para mas detalle, ver `docs/testing-endpoints.md`.
