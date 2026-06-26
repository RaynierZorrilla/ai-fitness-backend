# Tests de endpoints sin base de datos real

## Resumen

Se agrego una suite de tests HTTP para los endpoints principales de la API usando Jest y Supertest. La suite prueba las rutas de Express desde `createApp()`, pero reemplaza las dependencias que normalmente llegan a la base de datos por mocks.

Esto permite validar el contrato HTTP de los endpoints sin inicializar `AppDataSource`, sin conectarse a PostgreSQL y sin depender de datos reales.

## Archivos agregados o modificados

- `package.json`
  - Se cambio el script `test` a:
    ```bash
    jest --runInBand
    ```
  - Se agregaron dependencias de desarrollo para testing:
    - `jest`
    - `ts-jest`
    - `supertest`
    - `@types/jest`
    - `@types/supertest`

- `package-lock.json`
  - Se actualizo automaticamente al instalar las dependencias.

- `jest.config.js`
  - Configura Jest para correr tests TypeScript.
  - Define `testEnvironment: "node"`.
  - Busca tests dentro de `tests/**/*.test.ts`.
  - Mapea los alias del proyecto, por ejemplo:
    - `@api/*`
    - `@config/*`
    - `@domain/*`
    - `@infrastructure/*`
    - `@shared/*`
    - `application/*`

- `tsconfig.spec.json`
  - Extiende el `tsconfig.json` principal.
  - Incluye `src` y `tests`.
  - Agrega tipos de Jest y Node.

- `tests/api/endpoints.test.ts`
  - Contiene la suite de endpoints.
  - Usa `supertest` contra `createApp()`.
  - Mockea servicios, repositorios, seguridad y adaptadores externos.

## Estrategia para no usar la base de datos real

Los controladores del proyecto crean servicios y repositorios al importar los modulos. Muchos repositorios usan `AppDataSource.getRepository(...)`, lo que podria tocar TypeORM si no se intercepta.

Para evitar eso, los tests mockean estas capas antes de importar `createApp()`:

- Repositorios:
  - `UserRepository`
  - `ProfileRepository`
  - `RoutineRepository`
  - `WorkoutSessionRepository`
  - `ProgressEntryRepository`
  - `FitnessAnalyticsRepository`

- Servicios:
  - `AuthService`
  - `ProfileService`
  - `RoutineService`
  - `WorkoutSessionService`
  - `ProgressEntryService`
  - `FitnessAnalyticsService`
  - `RoutineAiService`

- Seguridad e integraciones:
  - `JwtProvider`
  - `PasswordHasher`
  - `CohereRoutineAdapter`

De esta forma los tests ejercitan rutas, middleware, controladores y forma de respuesta HTTP, pero las operaciones de negocio y persistencia quedan reemplazadas por valores controlados.

## Autenticacion en tests

El `JwtProvider` esta mockeado para aceptar solamente este token:

```http
Authorization: Bearer valid-token
```

Cuando el token es valido, el middleware recibe este usuario:

```ts
{
  sub: "user-1",
  email: "user@example.com"
}
```

Tambien hay un test que valida que un endpoint protegido responde `401` si no recibe un bearer token.

## Endpoints cubiertos

La suite cubre 19 casos:

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/routines/generate`
- `GET /api/routines/current`
- `POST /api/routines/adjust`
- `GET /api/routines/history`
- `GET /api/routines/:id`
- `POST /api/workouts/sessions`
- `GET /api/workouts/summary`
- `GET /api/workouts/history`
- `POST /api/progress`
- `GET /api/progress/history`
- `GET /api/progress/latest`
- `GET /api/analytics/fitness-overview`
- Caso `401` para ruta protegida sin token

## Que validan los tests

Los tests validan principalmente:

- Codigo HTTP esperado (`200`, `201`, `401`).
- Forma del JSON de respuesta.
- Que cada controlador llama al servicio correcto.
- Que el `userId` autenticado se pasa como `"user-1"`.
- Que los payloads enviados por HTTP llegan completos al servicio.
- Que las rutas protegidas pasan por el middleware de autenticacion.

## Comandos usados para verificar

```bash
npm test
```

Resultado:

```text
Test Suites: 1 passed, 1 total
Tests:       19 passed, 19 total
```

Tambien se verifico la compilacion:

```bash
npm run build
```

Resultado:

```text
tsc
```

Sin errores.

## Nota sobre el sandbox

Al correr `npm test` dentro del sandbox, Supertest intento abrir un puerto local efimero y el entorno devolvio `EPERM`. Al ejecutar los tests con permisos fuera del sandbox, la suite paso correctamente.

Esto no implica que los tests usen la base de datos. El puerto local lo usa Supertest internamente para simular requests HTTP contra la app de Express.

## Nota sobre vulnerabilidades npm

Durante la instalacion de dependencias, `npm install` reporto vulnerabilidades existentes en el arbol de dependencias. No se ejecuto `npm audit fix` porque podria actualizar paquetes fuera del alcance de esta tarea.
