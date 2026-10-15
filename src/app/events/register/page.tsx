import { redirect } from "next/navigation";

/**
 * La ruta base /events/register no corresponde a ningun evento: la pantalla real
 * de registro es /events/register/[id]. Antes este archivo era una copia del
 * dinamico que leia `params.id` (siempre undefined), mostraba un formulario
 * vacio y no permitia registrarse. Redirigimos a la lista de eventos, donde se
 * elige uno para registrarse.
 */
export default function EventRegistrationIndexPage(): never {
  redirect("/events");
}
