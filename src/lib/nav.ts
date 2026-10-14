/**
 * Fuente única de los enlaces de navegación.
 * Vive en su propio módulo para evitar dependencias circulares
 * entre `Nav` y `CommandPalette`.
 */
export interface NavLink {
  href: string;
  label: string;
}

export const NAV_LINKS: NavLink[] = [
  { href: "/", label: "Inicio" },
  { href: "/proyectos", label: "Proyectos" },
  { href: "/servicios", label: "Servicios" },
  { href: "/automatizaciones", label: "Automatizaciones" },
  { href: "/sobre-mi", label: "Sobre mí" },
  { href: "/marca", label: "Marca" },
  { href: "/contacto", label: "Contacto" },
];

/** ¿Está la ruta actual dentro de esta sección? */
export function isNavLinkActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}
