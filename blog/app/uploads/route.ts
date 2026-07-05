import { NextResponse, type NextRequest } from "next/server";

export function GET(request: NextRequest) {
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const canonicalUrl = `${protocol}://${host}/uploads`;

  return new NextResponse(
    `<!doctype html>
<html lang="fr">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Medias Bono Trading</title>
    <meta name="description" content="Espace technique des medias publics de Bono Trading.">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
    <style>
      :root {
        color-scheme: light;
        background: #f7f8f3;
        color: #101512;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      body {
        margin: 0;
        min-height: 100svh;
        display: grid;
        place-items: center;
        padding: 24px;
      }

      main {
        width: min(100%, 640px);
      }

      p {
        color: #506159;
        line-height: 1.7;
      }

      a {
        color: #087f54;
        font-weight: 800;
      }
    </style>
  </head>
  <body>
    <main>
      <p>Medias</p>
      <h1>Cette adresse sert les medias publics du site.</h1>
      <p>Les fichiers envoyes par l'administration sont accessibles avec leur chemin complet. Pour consulter les contenus publics, utilise les liens principaux.</p>
      <p><a href="/">Retour accueil</a> · <a href="/blog">Lire le blog</a></p>
    </main>
  </body>
</html>`,
    {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=3600",
      },
    },
  );
}
