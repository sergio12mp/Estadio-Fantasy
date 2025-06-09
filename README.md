This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Sistema de sobres

Se añadió una API para abrir sobres con "pitty" acumulable. Existen tres tipos de sobres:
- **jugador**: cinco cartas de jugador.
- **objeto**: cinco cartas de objeto.
- **normal**: garantiza al menos tres jugadores y un objeto.

Cada sobre entrega cinco cartas con probabilidad base de 30% común, 40% rara, 20% épica y 10% legendaria. Por cada sobre abierto sin obtener una carta legendaria, la probabilidad de legendaria aumenta hasta un máximo asegurado tras diez sobres.

Los costes son:
- Sobre normal: 100 balones o 10 de oro.
- Sobre concreto (jugador u objeto): 150 balones o 15 de oro.

La ruta `POST /api/sobres/abrir` recibe `managerId` y `tipo` y devuelve las cartas obtenidas junto con el nuevo contador de pitty.

## Nuevas páginas

- **/sobres**: permite al usuario abrir sobres y ver las cartas obtenidas.
- **/album**: muestra todas las cartas del usuario con filtros por tipo, rareza, equipo y buscador.
- En el panel de administración se añadió una sección para añadir oro y balones a los managers mediante la ruta `/api/currency`.
- La barra de navegación y la página *Mi Perfil* muestran ahora el oro y los balones actuales del usuario.
