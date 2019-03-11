import DRP from "discord-rich-presence";
import APP_VERSION from "../renderer/scripts/constants/app_version";

const client = DRP("554245594332528651");
const START_TIME = Date.now();

client.updatePresence({
    state: process.env.NODE_ENV === "development" ? "Developing new features..." : "Coding add-ons...",
    startTimestamp: START_TIME,
    largeImageKey: "big_icon",
    largeImageText: "bridge. | " + APP_VERSION + (process.env.NODE_ENV === "development" ? "-dev" : ""),
    instance: true,
});