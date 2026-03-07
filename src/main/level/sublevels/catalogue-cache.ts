import { db } from "../level";
import { levelKeys } from "./keys";

export const catalogueCacheSublevel = db.sublevel<string, any>(
    levelKeys.catalogueCache,
    {
        valueEncoding: "json",
    }
);
