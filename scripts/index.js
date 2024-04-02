import { world, Player } from "@minecraft/server";
import AdminMenu from "./lib/AdminMenu.js";
import Database from "./Extensions/Database.js";
import './Hanlder/index.js'

world.afterEvents.itemUse.subscribe((data) => {// Listen for item use event
    const itemId = Database.get('ChatRanksConfig')?.itemId ?? 'minecraft:stick' // Default to stick if not set

    if (data.source.hasTag('Admin') && data.itemStack.typeId === itemId && data.source instanceof Player) { // Check if the player is an admin and the item used is the admin item
        AdminMenu(data.source) // Open the admin menu
    }
})

