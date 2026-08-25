const DAYS_ES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const DAYS_SHORT_ES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTHS_ES = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];
const MONTHS_SHORT_ES = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
];

/**
 * Formats date strictly in Spanish: "Sáb, 29 de Ago. de 2026"
 */
export function formatSpanishDate(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Fecha no definida";

  const dayName = DAYS_SHORT_ES[d.getDay()];
  const dayNum = String(d.getDate()).padStart(2, "0");
  const monthName = MONTHS_SHORT_ES[d.getMonth()];
  const year = d.getFullYear();

  return `${dayName}, ${dayNum} ${monthName}. ${year}`;
}

/**
 * Formats full date in Spanish: "29 de Agosto de 2026"
 */
export function formatSpanishDateFull(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Fecha no definida";

  const dayNum = d.getDate();
  const monthName = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();

  return `${dayNum} de ${monthName} de ${year}`;
}

/**
 * Formats date and time in 12h Spanish: "Sáb, 29 Ago 2026 • 04:30 PM"
 */
export function formatSpanishDateTime(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "Fecha no definida";

  const dayName = DAYS_SHORT_ES[d.getDay()];
  const dayNum = String(d.getDate()).padStart(2, "0");
  const monthName = MONTHS_SHORT_ES[d.getMonth()];
  const year = d.getFullYear();

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const strHours = String(hours).padStart(2, "0");

  return `${dayName}, ${dayNum} ${monthName} ${year} • ${strHours}:${minutes} ${ampm}`;
}

/**
 * Formats time only: "04:30 PM"
 */
export function formatSpanishTime(dateInput: Date | string | number): string {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const strHours = String(hours).padStart(2, "0");

  return `${strHours}:${minutes} ${ampm}`;
}
