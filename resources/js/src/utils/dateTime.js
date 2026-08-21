const WALL_FORMATTER_CACHE = {};

function getWallFormatter(timeZone) {
    if (WALL_FORMATTER_CACHE[timeZone]) return WALL_FORMATTER_CACHE[timeZone];
    const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    });
    WALL_FORMATTER_CACHE[timeZone] = formatter;
    return formatter;
}

/**
 * Convert a UTC ISO instant into the wall-clock value expected by an
 * <input type="datetime-local"> for the given IANA timezone.
 * Returns "YYYY-MM-DDTHH:mm" or null when iso is empty.
 */
export function utcToZonedInput(iso, timeZone) {
    if (!iso) return null;
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return null;

    const map = {};
    for (const part of getWallFormatter(timeZone || "UTC").formatToParts(date)) {
        if (part.type !== "literal") {
            map[part.type] = part.value;
        }
    }

    return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}`;
}