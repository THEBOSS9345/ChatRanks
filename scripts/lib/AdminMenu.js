import { world } from "@minecraft/server";
import { ModalFormData, MessageFormData, ActionFormData } from "@minecraft/server-ui";
import Database from "../Extensions/Database";

export default function AdminMenu(player) {
    // Retrieve ChatRanksConfig from the database or set default values
    const data = Database.get('ChatRanksConfig') ?? { 
        itemId: 'minecraft:stick', 
        rankformat: { 
            prefix: 'rank:',
            ranklook: '§c[{rank}§c]§r', // Default rank look
            format: '{name}: {message}',
        }, 
        defaultRank: 'Member',
        EnableChatRanks: false
    };

    // Create and show the admin modal form
    new ModalFormData()
        .title('§6Admin Menu')
        .textField('§eItem ID for admin menu', 'Item ID', data.itemId)
        .textField('§ePlayer rank prefix', 'Rank Prefix', data.rankformat.prefix)
        .textField('§eDefault rank for players', 'Default Rank', data.defaultRank)
        .textField('§eRank look for chat', 'Rank Look', data.rankformat.ranklook) 
        .textField('§eRank format for chat. Include {rank}, {name}, {message}.', 'Rank Format', data.rankformat.format)
        .toggle('§eEnable Chat Ranks', data.EnableChatRanks)     
        .show(player).then((result) => {
            if (result.canceled) return;
        
            const [ItemID, RankPrefix, DefaultRank, RankLook, RankFormat, EnableChatRanks] = result.formValues;

            // Validate the inputs
            if (ItemID.trim().length === 0) return player.sendMessage('§cItem ID cannot be empty');
            if (RankPrefix.trim().length === 0) return player.sendMessage('§cRank Prefix cannot be empty');
            if (DefaultRank.trim().length === 0) return player.sendMessage('§cDefault Rank cannot be empty');
            if (RankLook.trim().length === 0 || !RankLook.includes('{rank}')) return player.sendMessage('§cRank Look must include {rank}');
            if (RankFormat.trim().length === 0 || !['{name}', '{message}'].every(value => RankFormat.includes(value)))
                return player.sendMessage('§cRank Format must include {name}, and {message}');

            // Confirmation form
            new ActionFormData()
                .title('§6Chat Ranks Config')
                .body(`§6Confirm Chat Ranks Update?\n\n§eItem ID§f: ${ItemID}\n§eRank Prefix§f: ${RankPrefix}\n§eDefault Rank§f: ${DefaultRank}\n§eRank Look§f: ${RankLook}\n§eRank Format§f: ${RankFormat}\n§eEnable Chat Ranks§f: ${EnableChatRanks ? '§aYes' : '§cNo'}`)
                .button('§aYes', 'textures/ui/check') // Confirm button
                .button('§cBack', 'textures/ui/cancel') // Back button
                .show(player)
                .then((confirmation) => {
                    if (confirmation.canceled) return player.sendMessage('§cAn error occurred. Please try again.'); // Inform the player if the confirmation is canceled
                    if (confirmation.selection === 1) return AdminMenu(player); // Reopen Admin Menu if "Back" is selected

                    // Update database with new configuration
                    Database.set('ChatRanksConfig', { 
                        itemId: ItemID,// Store the item ID 
                        rankformat: {  
                            prefix: RankPrefix, // Store the rank prefix
                            ranklook: RankLook, // Store the rank look
                            format: RankFormat // Store the rank format
                        }, // Store the rank format
                        defaultRank: DefaultRank, // Store the default rank
                        EnableChatRanks: EnableChatRanks // Store the chat ranks status
                    });

                    player.sendMessage('§aChat Ranks Config has been updated'); // Inform the player
                });
        })
        .catch((error) => {
            console.error('An error occurred while showing the admin menu:', error); // Log the error
            player.sendMessage('§cAn error occurred. Please try again.'); // Inform the player
        });
}
