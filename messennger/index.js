import Handlebars from "handlebars";
import chatItemTpl from "./src/components/chat-item/chat-item.hbs?raw";
import sidebarTpl from "./src/components/layouts/sidebar.hbs?raw";
import { chats } from "./src/mock/chats.js";

Handlebars.registerPartial("chat-item", chatItemTpl);

document.body.innerHTML = Handlebars.compile(sidebarTpl)({ chats }); 