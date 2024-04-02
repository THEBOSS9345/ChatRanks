import { world, Player } from "@minecraft/server";
import Database from "../Extensions/Database";

world.beforeEvents.chatSend.subscribe((data) => {
     // Retrieve ChatRanksConfig from the database or set default values
    const rankData = Database.get('ChatRanksConfig') ?? {
        itemId: 'minecraft:stick',
        rankformat: { 
            prefix: 'rank:', 
            ranklook: '§c[{rank}§c]§r', // Default rank look
            format: '{name}: {message}' 
        },
        defaultRank: 'Member',
        EnableChatRanks: false
    };

    if (!rankData.EnableChatRanks) return; // Do nothing if Chat Ranks are disabled

    data.cancel = true; // Cancel the original chat message

    // Retrieve ranks for the player
    const ranks = getRanks(data.sender);
    /**
     * @type {string} The formatted message with rank look and ranks.
     */
    const formattedMessage = `${ranks.length > 0 ? ranks.map(rank => rankData.rankformat.ranklook.replace('{rank}', rank)).join(' ') : rankData.rankformat.ranklook.replace('{rank}', rankData.defaultRank)} ${rankData.rankformat.format.replace('{name}', data.sender.name).replace('{message}', data.message)}`;

    // Send the formatted message
    world.sendMessage(formattedMessage);
});

/**
 * Retrieves ranks for the player based on the prefix defined in ChatRanksConfig.
 * @param {Player} player The player for whom to retrieve ranks.
 * @returns {string[]} Array of ranks.
 */
function getRanks(player) {
    // Retrieve rank prefix from ChatRanksConfig or use default value
    const rankPrefix = Database.get('ChatRanksConfig')?.rankformat?.prefix ?? 'rank:';
    // Filter player tags based on rank prefix and remove prefix from tags
    return player.getTags().filter((tag) => tag.startsWith(rankPrefix)).map((tag) => tag.replace(rankPrefix, ''));
}
