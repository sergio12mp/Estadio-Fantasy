/**
 * Genera un slug estable a partir del nombre del jugador.
 * El slug es independiente del idJugador de la BD, por lo que sobrevive
 * reimportaciones de CSV. Se usa como clave de imagen en Cloudinary.
 */
export function slugifyPlayerName(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')  // quitar tildes y diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Construye la URL de la imagen del jugador en Cloudinary.
 * Prioriza el slug; si no existe, usa idFallback (compatibilidad hacia atrás).
 * Devuelve null si no hay cloud name ni clave disponible.
 */
export function getPlayerImageUrl(
  slug: string | null | undefined,
  size: number = 120,
  idFallback?: number
): string | null {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloudName) return null;
  const key = slug || (idFallback != null ? String(idFallback) : null);
  if (!key) return null;
  return `https://res.cloudinary.com/${cloudName}/image/upload/w_${size},h_${size},c_fill,f_auto,q_auto/estadio-fantasy/jugadores/${key}.jpg`;
}
