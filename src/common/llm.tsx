export const CurrentDate = () => {
  const date = new Date();

  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const weekday = weekdays[date.getDay()];

  const month = (date.getMonth() + 1).toString().padStart(2, "0"); // months are 0-based in JS
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${weekday}, ${month}/${day}/${year} ${hours}:${minutes}`;
};

export function ChangePromptSystem(str: string) {
  const currentDateTime = new Date();
  const year = currentDateTime.getFullYear();
  const month = String(currentDateTime.getMonth() + 1).padStart(2, "0");
  const day = String(currentDateTime.getDate()).padStart(2, "0");
  const hours = String(currentDateTime.getHours()).padStart(2, "0");
  const minutes = String(currentDateTime.getMinutes()).padStart(2, "0");
  const seconds = String(currentDateTime.getSeconds()).padStart(2, "0");
  const s = str;

  return s.replace(/{{-CURRENT_DATETIME-}}/g, `${year}/${month}/${day}, ${hours}:${minutes}:${seconds}`);

  return s;
}

export function ClearImportModel(str: string): string {
  const s = str;

  s.replace(/openai-/g, "openai__");

  return s;
}

export function ClearImportModelTemperature(str: string, base: string): string {
  if (str === "low") {
    return "0.2";
  } else if (str === "medium") {
    return "0.7";
  } else if (str === "maximum") {
    return "1.0";
  }

  return base;
}
